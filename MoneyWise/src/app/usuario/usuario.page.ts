import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../core/services/auth.service';
import { BiometricAuthService } from '../core/services/biometric-auth.service';
import { FirestoreService } from '../core/services/firestore.service';
import { ThemeService } from '../core/services/theme.service';
import { User } from '../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss']
})
export class UsuarioPage implements OnInit {
  usuario: User | null = null;
  form!: FormGroup;
  biometriaActiva = false;
  biometriaDisponible = false;
  biometricLoading = false;
  mostrarPasswordNueva = false;
  mostrarPasswordActual = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private biometricAuthService: BiometricAuthService,
    private firestoreService: FirestoreService,
    public themeService: ThemeService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.usuario = this.authService.currentUser;
    this.buildForm();
    await this.cargarEstadoBiometria();
  }

  async ionViewWillEnter() {
    this.usuario = this.authService.currentUser;
    this.buildForm();
    await this.cargarEstadoBiometria();
  }

  buildForm() {
    this.form = this.fb.group({
      nombre: [this.usuario?.nombre || '', Validators.required],
      username: [
        this.usuario?.username || '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,24}$/)]
      ],
      passwordActual: [''],
      passwordNueva: ['', Validators.minLength(6)]
    });
  }

  toggleTema() {
    this.themeService.toggle();
  }

  togglePasswordNuevaVisibility() {
    this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
  }

  togglePasswordActualVisibility() {
    this.mostrarPasswordActual = !this.mostrarPasswordActual;
  }

  async cambiarFotoPerfil() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de perfil',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => this.seleccionarFoto(CameraSource.Camera)
        },
        {
          text: 'Elegir de galería',
          icon: 'image-outline',
          handler: () => this.seleccionarFoto(CameraSource.Photos)
        },
        {
          text: 'Usar icono por defecto',
          icon: 'person-circle-outline',
          role: 'destructive',
          handler: () => this.quitarFotoPerfil()
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async seleccionarFoto(source: CameraSource) {
    if (!this.usuario) return;

    try {
      const image = await Camera.getPhoto({
        quality: 72,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source,
        width: 512,
        height: 512,
        promptLabelHeader: 'Foto de perfil',
        promptLabelPhoto: 'Elegir de galería',
        promptLabelPicture: 'Tomar foto'
      });

      if (!image.dataUrl) return;

      await this.actualizarFotoPerfil(image.dataUrl);
      await this.mostrarToast('Foto de perfil actualizada', 'success');
    } catch (error) {
      console.warn('Selección de foto cancelada o no disponible', error);
    }
  }

  async quitarFotoPerfil() {
    if (!this.usuario) return;

    await this.actualizarFotoPerfil(null);
    await this.mostrarToast('Se restauró el icono por defecto', 'success');
  }

  private async actualizarFotoPerfil(fotoPerfil: string | null) {
    if (!this.usuario) return;

    const usuarioActualizado: User = {
      ...this.usuario,
      fotoPerfil: fotoPerfil ?? null
    };

    await this.firestoreService.set(
      'users',
      usuarioActualizado.id,
      this.limpiarUsuarioParaFirestore(usuarioActualizado)
    );

    await this.authService.actualizarUsuarioSesion(usuarioActualizado);
    this.usuario = usuarioActualizado;
  }

  async toggleBiometria(event: CustomEvent) {
    const activar = !!event.detail.checked;

    if (this.biometricLoading) return;
    this.biometricLoading = true;

    const loading = await this.loadingCtrl.create({
      message: activar ? 'Activando biometría...' : 'Desactivando biometría...'
    });

    await loading.present();

    const result = activar
      ? await this.biometricAuthService.enableForUser(this.usuario)
      : await this.biometricAuthService.disable();

    await loading.dismiss();
    this.biometricLoading = false;

    await this.cargarEstadoBiometria();

    if (!result.ok) {
      this.biometriaActiva = false;
    }

    await this.mostrarToast(
      result.message,
      result.ok ? 'success' : 'warning',
      result.ok ? 2200 : 3500
    );
  }

  async guardar() {
    if (!this.usuario) {
      await this.mostrarToast('No se encontró una sesión activa', 'danger');
      return;
    }

    if (this.form.get('nombre')?.invalid || this.form.get('username')?.invalid) {
      this.form.markAllAsTouched();
      await this.mostrarToast('Revisa tu nombre y usuario antes de guardar', 'warning');
      return;
    }

    const nombre = this.form.get('nombre')?.value?.trim();
    const username = this.form.get('username')?.value?.trim();
    const passwordActual = this.form.get('passwordActual')?.value;
    const passwordNueva = this.form.get('passwordNueva')?.value;

    const usernameNormalizado = username.toLowerCase();
    const usernameActual = this.usuario.username?.trim().toLowerCase();

    const cambioUsuario = usernameNormalizado !== usernameActual;
    const cambioPassword = !!passwordNueva;
    const requierePasswordActual = cambioUsuario || cambioPassword;

    if (passwordNueva && passwordNueva.length < 6) {
      await this.mostrarToast('La nueva contraseña debe tener mínimo 6 caracteres', 'danger');
      return;
    }

    /*
      Ahora la contraseña actual solo se pide para cambios sensibles:
      - cambiar usuario de acceso
      - cambiar contraseña

      Para cambios normales como nombre, foto, tema o biometría,
      ya no se exige contraseña cada vez.
    */
    if (requierePasswordActual && !passwordActual) {
      await this.mostrarToast(
        'Ingresa tu contraseña actual solo para cambiar usuario o contraseña',
        'warning',
        3200
      );

      this.form.get('passwordActual')?.markAsTouched();
      return;
    }

    if (requierePasswordActual && passwordActual !== this.usuario.password) {
      await this.mostrarToast('La contraseña actual es incorrecta', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando...'
    });

    await loading.present();

    try {
      if (cambioUsuario) {
        const disponible = await this.authService.usernameDisponible(
          usernameNormalizado,
          this.usuario.id
        );

        if (!disponible) {
          await loading.dismiss();
          await this.mostrarToast('Ese nombre de usuario ya está en uso', 'danger');
          return;
        }
      }

      const usuarioActualizado: User = {
        ...this.usuario,
        nombre,
        username: usernameNormalizado,
        password: cambioPassword ? passwordNueva : this.usuario.password,
        fotoPerfil: this.usuario.fotoPerfil ?? null
      };

      await this.firestoreService.set(
        'users',
        usuarioActualizado.id,
        this.limpiarUsuarioParaFirestore(usuarioActualizado)
      );

      await this.authService.actualizarUsuarioSesion(usuarioActualizado);
      this.usuario = usuarioActualizado;

      if (this.biometriaActiva) {
        await this.biometricAuthService.enableForUser(usuarioActualizado);
      }

      await loading.dismiss();

      await this.mostrarToast('Perfil actualizado correctamente', 'success');

      this.form.get('passwordActual')?.reset();
      this.form.get('passwordNueva')?.reset();

      await this.cargarEstadoBiometria();
    } catch (error) {
      await loading.dismiss();
      console.error('Error al guardar perfil', error);
      await this.mostrarToast('No se pudo guardar el perfil. Intenta nuevamente.', 'danger');
    }
  }

  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            await this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  private async cargarEstadoBiometria() {
    this.biometriaDisponible = await this.biometricAuthService.isAvailable();
    this.biometriaActiva = await this.biometricAuthService.shouldShowLoginButton();
  }

  private limpiarUsuarioParaFirestore(usuario: User): User {
    return {
      ...usuario,
      nombre: usuario.nombre ?? '',
      username: usuario.username ?? '',
      password: usuario.password ?? '',
      fotoPerfil: usuario.fotoPerfil ?? null
    };
  }

  private async mostrarToast(
    message: string,
    color: 'success' | 'warning' | 'danger',
    duration = 2500
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'top'
    });

    await toast.present();
  }
}