import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';

@NgModule({
  declarations: [LoginPage, RegisterPage],
  imports: [SharedModule, AuthRoutingModule]
})
export class AuthModule {}

