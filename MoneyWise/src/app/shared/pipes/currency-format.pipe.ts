import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false, name: 'currencyFormat' })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null) return '$0.00';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(value);
  }
}

