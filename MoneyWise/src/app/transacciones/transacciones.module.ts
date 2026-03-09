import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TransaccionesRoutingModule } from './transacciones-routing.module';
import { ListaTransaccionesPage } from './lista/lista-transacciones.page';
import { DetalleTransaccionPage } from './detalle/detalle-transaccion.page';

@NgModule({
  declarations: [ListaTransaccionesPage, DetalleTransaccionPage],
  imports: [SharedModule, TransaccionesRoutingModule]
})
export class TransaccionesModule {}

