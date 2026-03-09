import { Pipe, PipeTransform } from '@angular/core';
import { Transaccion } from '../../core/models/transaccion.model';

@Pipe({
  standalone: false, name: 'filterByCategory' })
export class FilterByCategoryPipe implements PipeTransform {
  transform(transacciones: Transaccion[], categoria: string): Transaccion[] {
    if (!categoria || categoria === 'todas') return transacciones;
    return transacciones.filter(t => t.categoria === categoria);
  }
}

