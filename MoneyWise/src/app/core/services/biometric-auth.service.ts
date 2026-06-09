import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccessControl, NativeBiometric } from '@capgo/capacitor-native-biometric';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

const BIOMETRIC_ENABLED_KEY = 'moneywise_biometric_enabled';
const BIOMETRIC_SERVER = 'moneywise.local.auth';

export interface BiometricActionResult {
  ok: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BiometricAuthService {
  private enabledSubject = new BehaviorSubject<boolean>(false);
  public enabled$ = this.enabledSubject.asObservable();

  constructor(private storageService: StorageService) {}

  async init(): Promise<void> {
    const enabled = await this.storageService.get(BIOMETRIC_ENABLED_KEY);
    this.enabledSubject.next(enabled === true);
  }

  get isEnabled(): boolean {
    return this.enabledSubject.value;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      return !!result.isAvailable;
    } catch {
      return false;
    }
  }

  async shouldShowLoginButton(): Promise<boolean> {
    try {
      const enabled = await this.storageService.get(BIOMETRIC_ENABLED_KEY);
      if (enabled !== true) return false;

      const available = await this.isAvailable();
      if (!available) return false;

      const saved = await NativeBiometric.isCredentialsSaved({
        server: BIOMETRIC_SERVER
      });

      return !!saved.isSaved;
    } catch {
      return false;
    }
  }

  async enableForUser(user: User | null): Promise<BiometricActionResult> {
    if (!user?.username || !user?.password) {
      return {
        ok: false,
        message: 'No se pudo activar la biometría porque no hay una sesión válida.'
      };
    }

    const available = await this.isAvailable();
    if (!available) {
      return {
        ok: false,
        message: 'Este dispositivo no tiene biometría disponible o no tiene huella/PIN configurado.'
      };
    }

    try {
      await NativeBiometric.setCredentials({
        username: user.username,
        password: user.password,
        server: BIOMETRIC_SERVER,
        accessControl: AccessControl.BIOMETRY_ANY
      });

      await this.storageService.set(BIOMETRIC_ENABLED_KEY, true);
      this.enabledSubject.next(true);

      return {
        ok: true,
        message: 'Inicio con biometría activado correctamente.'
      };
    } catch {
      await this.storageService.set(BIOMETRIC_ENABLED_KEY, false);
      this.enabledSubject.next(false);

      return {
        ok: false,
        message: 'No se pudo activar la biometría. Revisa que tengas huella o bloqueo de pantalla configurado.'
      };
    }
  }

  async disable(): Promise<BiometricActionResult> {
    try {
      await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
    } catch {
      // Si no hay credenciales guardadas, igual limpiamos el estado local.
    }

    await this.storageService.set(BIOMETRIC_ENABLED_KEY, false);
    this.enabledSubject.next(false);

    return {
      ok: true,
      message: 'Inicio con biometría desactivado.'
    };
  }

  async getSavedCredentials(): Promise<{ username: string; password: string }> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Biometría no disponible');
    }

    return NativeBiometric.getSecureCredentials({
      server: BIOMETRIC_SERVER,
      reason: 'Usa tu huella o método de bloqueo del dispositivo para entrar a MoneyWise.',
      title: 'Entrar con biometría',
      subtitle: 'MoneyWise',
      description: 'Confirma tu identidad para iniciar sesión.',
      negativeButtonText: 'Cancelar'
    });
  }
}
