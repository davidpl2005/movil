import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { BiometricAuthService } from '../../core/services/biometric-auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  form: FormGroup;
  mostrarBiometria = false;
  biometricLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private biometricAuthService: BiometricAuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ionViewWillEnter() {
    this.mostrarBiometria = await this.biometricAuthService.shouldShowLoginButton();
  }

  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...' });
    await loading.present();

    const { username, password } = this.form.value;
    const ok = await this.authService.login(username, password);
    await loading.dismiss();

    if (ok) {
      this.router.navigate(['/tabs'], { replaceUrl: true });
    } else {
      await this.mostrarToast('Usuario o contraseña incorrectos', 'danger');
    }
  }

  async loginConBiometria() {
    if (this.biometricLoading) return;

    this.biometricLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Validando biometría...' });
    await loading.present();

    try {
      const credentials = await this.biometricAuthService.getSavedCredentials();
      const ok = await this.authService.login(credentials.username, credentials.password);

      await loading.dismiss();

      if (ok) {
        this.router.navigate(['/tabs'], { replaceUrl: true });
      } else {
        await this.mostrarToast('Las credenciales guardadas ya no son válidas. Inicia sesión manualmente y vuelve a activar biometría.', 'warning', 3500);
      }
    } catch {
      await loading.dismiss();
      await this.mostrarToast('No se pudo iniciar con biometría.', 'danger');
    } finally {
      this.biometricLoading = false;
      this.mostrarBiometria = await this.biometricAuthService.shouldShowLoginButton();
    }
  }

  irARegistro() {
    this.router.navigate(['/auth/register']);
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
