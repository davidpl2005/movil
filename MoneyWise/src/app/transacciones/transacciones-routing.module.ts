import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaTransaccionesPage } from './lista/lista-transacciones.page';
import { DetalleTransaccionPage } from './detalle/detalle-transaccion.page';

const routes: Routes = [
  { path: '', component: ListaTransaccionesPage },
  { path: 'detalle/:id', component: DetalleTransaccionPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransaccionesRoutingModule {}

