import { Pipe, PipeTransform } from '@angular/core';
import { Transaccion } from '../../core/models/transaccion.model';

@Pipe({
  standalone: false, name: 'searchByText' })
export class SearchByTextPipe implements PipeTransform {
  transform(transacciones: Transaccion[], texto: string): Transaccion[] {
    if (!texto || texto.trim() === '') return transacciones;
    const lower = texto.toLowerCase();
    return transacciones.filter(t =>
      t.descripcion?.toLowerCase().includes(lower) ||
      t.categoria.toLowerCase().includes(lower)
    );
  }
}

