import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORIAS } from '../../core/constants/app.constants';

@Pipe({
  standalone: false, name: 'categoryColor' })
export class CategoryColorPipe implements PipeTransform {
  transform(categoriaId: string): string {
    const cat = CATEGORIAS.find(c => c.id === categoriaId);
    return cat ? cat.color : '#999999';
  }
}

