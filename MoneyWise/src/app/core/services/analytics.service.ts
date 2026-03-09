import { Injectable } from '@angular/core';
import { Transaccion } from '../models/transaccion.model';
import { ResumenFinanciero, GastoPorCategoria } from '../models/resumen-financiero.model';
import { CATEGORIAS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  calcularResumen(transacciones: Transaccion[]): ResumenFinanciero {
    const ahora = new Date();
    const delMes = transacciones.filter(t => {
      const fecha = new Date(t.fecha);
      return fecha.getMonth() === ahora.getMonth() &&
             fecha.getFullYear() === ahora.getFullYear();
    });

    const totalIngresosMes = delMes
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastosMes = delMes
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const saldoActual = transacciones
      .reduce((sum, t) => t.tipo === 'ingreso' ? sum + t.monto : sum - t.monto, 0);

    const gastosPorCategoria: GastoPorCategoria[] = CATEGORIAS.map(cat => {
      const monto = delMes
        .filter(t => t.tipo === 'gasto' && t.categoria === cat.id)
        .reduce((sum, t) => sum + t.monto, 0);
      return {
        categoria: cat.nombre,
        monto,
        porcentaje: totalGastosMes > 0 ? (monto / totalGastosMes) * 100 : 0,
        color: cat.color
      };
    }).filter(g => g.monto > 0);

    return { saldoActual, totalGastosMes, totalIngresosMes, gastosPorCategoria };
  }
}

