import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);
  public transacciones$ = this.transaccionesSubject.asObservable();

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  async init(): Promise<void> {
    await this.cargarTransacciones();
  }

  private async cargarTransacciones(): Promise<void> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      this.transaccionesSubject.next([]);
      return;
    }

    const todas = await this.firestoreService.query(
      'transacciones',
      'usuarioId',
      userId
    );

    // Firestore guarda fechas como Timestamp, las convertimos a Date
    const parseadas: Transaccion[] = todas.map(t => ({
      ...t,
      fecha: t.fecha?.toDate ? t.fecha.toDate() : new Date(t.fecha),
      fechaCreacion: t.fechaCreacion?.toDate
        ? t.fechaCreacion.toDate()
        : new Date(t.fechaCreacion)
    }));

    // Ordena de más reciente a más antigua
    parseadas.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    this.transaccionesSubject.next(parseadas);
  }

  async agregar(
    transaccion: Omit<Transaccion, 'id' | 'fechaCreacion' | 'usuarioId'>
  ): Promise<void> {
    const nueva: Transaccion = {
      ...transaccion,
      id: Date.now().toString(),
      usuarioId: this.authService.currentUser!.id,
      fechaCreacion: new Date()
    };
    await this.firestoreService.set('transacciones', nueva.id, nueva);
    await this.cargarTransacciones();
  }

  async editar(id: string, cambios: Partial<Transaccion>): Promise<void> {
    const actual = this.transaccionesSubject.value.find(t => t.id === id);
    if (!actual) return;
    const actualizado = { ...actual, ...cambios };
    await this.firestoreService.set('transacciones', id, actualizado);
    await this.cargarTransacciones();
  }

  async eliminar(id: string): Promise<void> {
    await this.firestoreService.delete('transacciones', id);
    await this.cargarTransacciones();
  }

  getById(id: string): Transaccion | undefined {
    return this.transaccionesSubject.value.find(t => t.id === id);
  }
}

