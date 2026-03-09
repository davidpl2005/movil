import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORIAS } from '../../core/constants/app.constants';

@Pipe({
  standalone: false, name: 'categoryIcon' })
export class CategoryIconPipe implements PipeTransform {
  transform(categoriaId: string): string {
    const cat = CATEGORIAS.find(c => c.id === categoriaId);
    return cat ? cat.icono : 'help-circle';
  }
}

