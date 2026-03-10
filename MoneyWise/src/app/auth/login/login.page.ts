import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...' });
    await loading.present();

    const { email, password } = this.form.value;
    const ok = await this.authService.login(email, password);
    await loading.dismiss();

    if (ok) {
      this.router.navigate(['/tabs'], { replaceUrl: true });
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Email o contraseña incorrectos',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  irARegistro() {
    this.router.navigate(['/auth/register']);
  }
}
