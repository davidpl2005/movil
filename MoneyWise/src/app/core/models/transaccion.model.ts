export type TipoTransaccion = 'gasto' | 'ingreso';

export interface Transaccion {
  id: string;
  tipo: TipoTransaccion;
  categoria: string;
  fecha: Date;
  monto: number;
  descripcion?: string;
  comprobante?: string; 
  usuarioId: string;
  fechaCreacion: Date;
}

