import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';

import { StorageService } from './core/services/storage.service';
import { AuthService } from './core/services/auth.service';
import { TransaccionService } from './core/services/transaccion.service';
import { ThemeService } from './core/services/theme.service';

export function initializeApp(
  storageService: StorageService,
  authService: AuthService,
  transaccionService: TransaccionService,
  themeService: ThemeService
) {
  return async () => {
    // Primero el storage (local), luego auth (necesita storage),
    // luego transacciones (necesita auth), luego tema
    await storageService.init();
    await authService.init();
    await transaccionService.init();
    await themeService.init();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    CoreModule,
    AppRoutingModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [StorageService, AuthService, TransaccionService, ThemeService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
