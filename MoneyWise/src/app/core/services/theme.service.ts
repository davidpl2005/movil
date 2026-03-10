import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

const THEME_KEY = 'moneywise_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = true;

  constructor(private storageService: StorageService) {}

  async init(): Promise<void> {
    const saved = await this.storageService.get(THEME_KEY);
    this.isDark = saved !== null ? saved : true;
    this.aplicar();
  }

  get esModoOscuro(): boolean {
    return this.isDark;
  }

  async toggle(): Promise<void> {
    this.isDark = !this.isDark;
    await this.storageService.set(THEME_KEY, this.isDark);
    this.aplicar();
  }

  private aplicar(): void {
    const body = document.body;
    const html = document.documentElement;

    if (this.isDark) {
      body.setAttribute('color-theme', 'dark');
      html.classList.remove('ion-palette-light');
      html.classList.add('ion-palette-dark');
    } else {
      body.setAttribute('color-theme', 'light');
      html.classList.remove('ion-palette-dark');
      html.classList.add('ion-palette-light');
    }
  }
}