import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false, name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';
    const date = new Date(value);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) return 'Hoy';
    if (date.toDateString() === ayer.toDateString()) return 'Ayer';

    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

