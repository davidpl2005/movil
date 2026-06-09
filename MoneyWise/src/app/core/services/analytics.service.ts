import { Injectable } from '@angular/core';
import { Transaccion } from '../models/transaccion.model';
import { ResumenFinanciero, GastoPorCategoria } from '../models/resumen-financiero.model';
import { CATEGORIAS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly fallbackColors = ['#0f766e', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

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

    const gastosPorCategoriaMap = new Map<string, number>();
    delMes
      .filter(t => t.tipo === 'gasto')
      .forEach(t => {
        const categoria = this.normalizarCategoria(t.categoria);
        gastosPorCategoriaMap.set(categoria, (gastosPorCategoriaMap.get(categoria) || 0) + t.monto);
      });

    const gastosPorCategoria: GastoPorCategoria[] = Array.from(gastosPorCategoriaMap.entries())
      .map(([categoria, monto]) => ({
        categoria,
        monto,
        porcentaje: totalGastosMes > 0 ? (monto / totalGastosMes) * 100 : 0,
        color: this.colorCategoria(categoria)
      }))
      .sort((a, b) => b.monto - a.monto);

    return { saldoActual, totalGastosMes, totalIngresosMes, gastosPorCategoria };
  }

  private normalizarCategoria(categoria: string): string {
    return (categoria || 'Sin categoría').trim() || 'Sin categoría';
  }

  private colorCategoria(categoria: string): string {
    const normalizada = categoria.toLowerCase();
    const predefinida = CATEGORIAS.find(c =>
      c.id.toLowerCase() === normalizada || c.nombre.toLowerCase() === normalizada
    );

    if (predefinida) {
      return predefinida.color;
    }

    const hash = Array.from(normalizada).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.fallbackColors[hash % this.fallbackColors.length];
  }
}
