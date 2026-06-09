import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORIAS } from '../../core/constants/app.constants';

@Pipe({
  standalone: false,
  name: 'categoryColor'
})
export class CategoryColorPipe implements PipeTransform {
  private readonly fallbackColors = ['#0f766e', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

  transform(categoria: string): string {
    const normalizada = (categoria || '').trim().toLowerCase();
    const cat = CATEGORIAS.find(c => c.id.toLowerCase() === normalizada || c.nombre.toLowerCase() === normalizada);

    if (cat) {
      return cat.color;
    }

    const hash = Array.from(normalizada || 'categoria').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.fallbackColors[hash % this.fallbackColors.length];
  }
}
