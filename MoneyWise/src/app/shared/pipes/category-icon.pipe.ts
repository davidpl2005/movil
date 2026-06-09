import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORIAS } from '../../core/constants/app.constants';

@Pipe({
  standalone: false,
  name: 'categoryIcon'
})
export class CategoryIconPipe implements PipeTransform {
  transform(categoria: string): string {
    const normalizada = (categoria || '').trim().toLowerCase();
    const cat = CATEGORIAS.find(c => c.id.toLowerCase() === normalizada || c.nombre.toLowerCase() === normalizada);
    return cat ? cat.icono : 'pricetag-outline';
  }
}
