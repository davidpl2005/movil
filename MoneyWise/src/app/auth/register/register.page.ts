import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']

})
export class RegisterPage {
  form: FormGroup;

  constructor(
    
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.form = this.fb.group({
      nombre:   ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async registrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const loading = await this.loadingCtrl.create({ message: 'Creando cuenta...' });
    await loading.present();

    const { nombre, email, password } = this.form.value;
    const ok = await this.authService.register(email, password, nombre);
    await loading.dismiss();

    if (ok) {
    this.router.navigate(['/tabs'], { replaceUrl: true });
    } else {
      const toast = await this.toastCtrl.create({
        message: 'El email ya está registrado',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  irALogin() {
    this.router.navigate(['/auth/login']);
  }
}

