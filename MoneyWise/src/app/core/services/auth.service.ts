import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { FirestoreService } from './firestore.service';
import { StorageService } from './storage.service';

// Clave para guardar la sesión activa en el dispositivo
const SESSION_KEY = 'moneywise_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private firestoreService: FirestoreService,
    private storageService: StorageService,
    private router: Router
  ) {}

  // Al iniciar la app, recupera la sesión guardada en el dispositivo
  async init(): Promise<void> {
    const session = await this.storageService.get(SESSION_KEY);
    if (session) {
      this.currentUserSubject.next(session);
    }
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async login(username: string, password: string): Promise<boolean> {
    if (!username || !password) return false;

    const usernameNormalizado = username.trim().toLowerCase();

    // Busca el usuario en Firestore por username
    const usuarios = await this.firestoreService.query(
      'users',
      'username',
      usernameNormalizado
    );

    const usuario = usuarios.find(u => u.password === password);
    if (!usuario) return false;

    // Guarda la sesión en el dispositivo para no pedir login cada vez
    await this.storageService.set(SESSION_KEY, usuario);
    this.currentUserSubject.next(usuario);
    return true;
  }

  async register(
    username: string,
    password: string,
    nombre: string
  ): Promise<boolean> {
    if (!username || !password || !nombre) return false;

    const usernameNormalizado = username.trim().toLowerCase();

    // Verifica que el username no esté ya registrado
    const existente = await this.firestoreService.query(
      'users',
      'username',
      usernameNormalizado
    );
    if (existente.length > 0) return false;

    const nuevoUsuario: User = {
      id: Date.now().toString(),
      username: usernameNormalizado,
      password,
      nombre: nombre.trim(),
      fechaRegistro: new Date()
    };

    // Guarda en Firestore y en sesión local
    await this.firestoreService.set('users', nuevoUsuario.id, nuevoUsuario);
    await this.storageService.set(SESSION_KEY, nuevoUsuario);
    this.currentUserSubject.next(nuevoUsuario);
    return true;
  }

  async usernameDisponible(username: string, userIdActual?: string): Promise<boolean> {
    if (!username) return false;

    const usernameNormalizado = username.trim().toLowerCase();
    const usuarios = await this.firestoreService.query('users', 'username', usernameNormalizado);
    return usuarios.every(usuario => usuario.id === userIdActual);
  }

  async actualizarUsuarioSesion(usuario: User): Promise<void> {
    await this.storageService.set(SESSION_KEY, usuario);
    this.currentUserSubject.next(usuario);
  }

  async logout(): Promise<void> {
    await this.storageService.remove(SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
