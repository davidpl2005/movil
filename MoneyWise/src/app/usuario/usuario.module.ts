import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { UsuarioPage } from './usuario.page';

@NgModule({
  declarations: [UsuarioPage],
  imports: [SharedModule, UsuarioRoutingModule]
})
export class UsuarioModule {}