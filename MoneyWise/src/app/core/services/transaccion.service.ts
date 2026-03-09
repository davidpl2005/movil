import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

const TRANSACCIONES_KEY = 'moneywise_transacciones';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);
  public transacciones$ = this.transaccionesSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  async init(): Promise<void> {
    await this.cargarTransacciones();
  }

  private async cargarTransacciones(): Promise<void> {
    const todas: Transaccion[] = (await this.storageService.get(TRANSACCIONES_KEY)) || [];
    const userId = this.authService.currentUser?.id;
    const mias = todas.filter(t => t.usuarioId === userId);
    this.transaccionesSubject.next(mias);
  }

  async agregar(transaccion: Omit<Transaccion, 'id' | 'fechaCreacion' | 'usuarioId'>): Promise<void> {
    const todas: Transaccion[] = (await this.storageService.get(TRANSACCIONES_KEY)) || [];
    const nueva: Transaccion = {
      ...transaccion,
      id: Date.now().toString(),
      usuarioId: this.authService.currentUser!.id,
      fechaCreacion: new Date()
    };
    todas.push(nueva);
    await this.storageService.set(TRANSACCIONES_KEY, todas);
    await this.cargarTransacciones();
  }

  async editar(id: string, cambios: Partial<Transaccion>): Promise<void> {
    const todas: Transaccion[] = (await this.storageService.get(TRANSACCIONES_KEY)) || [];
    const idx = todas.findIndex(t => t.id === id);
    if (idx !== -1) {
      todas[idx] = { ...todas[idx], ...cambios };
      await this.storageService.set(TRANSACCIONES_KEY, todas);
      await this.cargarTransacciones();
    }
  }

  async eliminar(id: string): Promise<void> {
    const todas: Transaccion[] = (await this.storageService.get(TRANSACCIONES_KEY)) || [];
    const filtradas = todas.filter(t => t.id !== id);
    await this.storageService.set(TRANSACCIONES_KEY, filtradas);
    await this.cargarTransacciones();
  }

  getById(id: string): Transaccion | undefined {
    return this.transaccionesSubject.value.find(t => t.id === id);
  }
}

