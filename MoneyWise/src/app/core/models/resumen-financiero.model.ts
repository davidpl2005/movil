export interface ResumenFinanciero {
  saldoActual: number;
  totalGastosMes: number;
  totalIngresosMes: number;
  gastosPorCategoria: GastoPorCategoria[];
}

export interface GastoPorCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
  color: string;
}

