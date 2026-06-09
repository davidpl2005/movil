import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
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
    private actionSheetCtrl: ActionSheetController
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

    await this.firestoreService.set('users', usuarioActualizado.id, this.limpiarUsuarioParaFirestore(usuarioActualizado));
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
    const passwordActual = this.form.get('passwordActual')?.value;

    if (!passwordActual) {
      await this.mostrarToast('Debes ingresar tu contraseña actual para guardar los cambios', 'warning', 3000);
      this.form.get('passwordActual')?.markAsTouched();
      return;
    }

    if (passwordActual !== this.usuario?.password) {
      await this.mostrarToast('La contraseña actual es incorrecta', 'danger');
      return;
    }

    if (this.form.get('nombre')?.invalid || this.form.get('username')?.invalid) {
      this.form.markAllAsTouched();
      await this.mostrarToast('Revisa tu nombre y usuario antes de guardar', 'warning');
      return;
    }

    const passwordNueva = this.form.get('passwordNueva')?.value;

    if (passwordNueva && passwordNueva.length < 6) {
      await this.mostrarToast('La nueva contraseña debe tener mínimo 6 caracteres', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando...'
    });

    await loading.present();

    try {
      const { nombre, username } = this.form.value;
      const usernameNormalizado = username.trim().toLowerCase();
      const usernameActual = this.usuario?.username?.trim().toLowerCase();

      if (usernameNormalizado !== usernameActual) {
        const disponible = await this.authService.usernameDisponible(
          usernameNormalizado,
          this.usuario?.id
        );

        if (!disponible) {
          await loading.dismiss();
          await this.mostrarToast('Ese nombre de usuario ya está en uso', 'danger');
          return;
        }
      }

      const usuarioActualizado: User = {
        ...this.usuario!,
        nombre: nombre.trim(),
        username: usernameNormalizado,
        password: passwordNueva && passwordNueva.length >= 6
          ? passwordNueva
          : this.usuario!.password,
        fotoPerfil: this.usuario?.fotoPerfil ?? null
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
    await this.authService.logout();
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