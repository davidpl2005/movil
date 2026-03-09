import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

const USERS_KEY = 'moneywise_users';
const CURRENT_USER_KEY = 'moneywise_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private storageService: StorageService, private router: Router) {}

  async init(): Promise<void> {
    const user = await this.storageService.get(CURRENT_USER_KEY);
    if (user) this.currentUserSubject.next(user);
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<boolean> {
    if (!email || !password) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const users: User[] = (await this.storageService.get(USERS_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return false;

    await this.storageService.set(CURRENT_USER_KEY, user);
    this.currentUserSubject.next(user);
    return true;
  }

  async register(email: string, password: string, nombre: string): Promise<boolean> {
    if (!email || !password || !nombre) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const users: User[] = (await this.storageService.get(USERS_KEY)) || [];
    if (users.find(u => u.email === email)) return false;

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      nombre,
      fechaRegistro: new Date()
    };

    users.push(newUser);
    await this.storageService.set(USERS_KEY, users);
    await this.storageService.set(CURRENT_USER_KEY, newUser);
    this.currentUserSubject.next(newUser);
    return true;
  }

  async logout(): Promise<void> {
    await this.storageService.remove(CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}

