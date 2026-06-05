import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private storageService: StorageService,
    public themeService: ThemeService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.usuario = this.authService.currentUser;
    this.buildForm();
  }

  ionViewWillEnter() {
    this.usuario = this.authService.currentUser;
    this.buildForm();
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

  async guardar() {
    const passwordActual = this.form.get('passwordActual')?.value;

    if (!passwordActual) {
      const toast = await this.toastCtrl.create({
        message: 'Debes ingresar tu contraseña actual para guardar los cambios',
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      this.form.get('passwordActual')?.markAsTouched();
      return;
    }

    if (passwordActual !== this.usuario?.password) {
      const toast = await this.toastCtrl.create({
        message: 'La contraseña actual es incorrecta',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    if (this.form.get('nombre')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const passwordNueva = this.form.get('passwordNueva')?.value;
    if (passwordNueva && passwordNueva.length < 6) {
      const toast = await this.toastCtrl.create({
        message: 'La nueva contraseña debe tener mínimo 6 caracteres',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const { nombre } = this.form.value;

    // Actualiza en Firestore
    const usuarioActualizado: User = {
      ...this.usuario!,
      nombre: nombre.trim(),
      password: passwordNueva && passwordNueva.length >= 6
        ? passwordNueva
        : this.usuario!.password
    };

    await this.firestoreService.set('users', usuarioActualizado.id, usuarioActualizado);

    // Actualiza la sesión local
    await this.storageService.set(SESSION_KEY, usuarioActualizado);
    (this.authService as any).currentUserSubject.next(usuarioActualizado);
    this.usuario = usuarioActualizado;

    await loading.dismiss();

    const toast = await this.toastCtrl.create({
      message: 'Perfil actualizado correctamente',
      duration: 2500,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    this.form.get('passwordActual')?.reset();
    this.form.get('passwordNueva')?.reset();
  }
}