import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
import { BiometricAuthService } from '../core/services/biometric-auth.service';
import { FirestoreService } from '../core/services/firestore.service';
import { StorageService } from '../core/services/storage.service';
import { ThemeService } from '../core/services/theme.service';
import { User } from '../core/models/user.model';

const SESSION_KEY = 'moneywise_session';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private biometricAuthService: BiometricAuthService,
    private firestoreService: FirestoreService,
    private storageService: StorageService,
    public themeService: ThemeService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
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
      nombre:         [this.usuario?.nombre || '', Validators.required],
      passwordActual: [''],
      passwordNueva:  ['', Validators.minLength(6)]
    });
  }

  toggleTema() {
    this.themeService.toggle();
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

    await this.mostrarToast(result.message, result.ok ? 'success' : 'warning', result.ok ? 2200 : 3500);
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

    if (this.form.get('nombre')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const passwordNueva = this.form.get('passwordNueva')?.value;
    if (passwordNueva && passwordNueva.length < 6) {
      await this.mostrarToast('La nueva contraseña debe tener mínimo 6 caracteres', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const { nombre } = this.form.value;

    const usuarioActualizado: User = {
      ...this.usuario!,
      nombre: nombre.trim(),
      password: passwordNueva && passwordNueva.length >= 6
        ? passwordNueva
        : this.usuario!.password
    };

    await this.firestoreService.set('users', usuarioActualizado.id, usuarioActualizado);
    await this.storageService.set(SESSION_KEY, usuarioActualizado);
    (this.authService as any).currentUserSubject.next(usuarioActualizado);
    this.usuario = usuarioActualizado;

    if (this.biometriaActiva) {
      await this.biometricAuthService.enableForUser(usuarioActualizado);
    }

    await loading.dismiss();

    await this.mostrarToast('Perfil actualizado correctamente', 'success');

    this.form.get('passwordActual')?.reset();
    this.form.get('passwordNueva')?.reset();
    await this.cargarEstadoBiometria();
  }

  private async cargarEstadoBiometria() {
    this.biometriaDisponible = await this.biometricAuthService.isAvailable();
    this.biometriaActiva = await this.biometricAuthService.shouldShowLoginButton();
  }

  private async mostrarToast(message: string, color: 'success' | 'warning' | 'danger', duration = 2500) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
