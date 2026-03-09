import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ResumenFinanciero } from '../../core/models/resumen-financiero.model';
import { User } from '../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',

})
export class DashboardPage implements OnInit, OnDestroy {
  resumen: ResumenFinanciero = {
    saldoActual: 0,
    totalGastosMes: 0,
    totalIngresosMes: 0,
    gastosPorCategoria: []
  };
  usuario: User | null = null;
  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private transaccionService: TransaccionService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.currentUser;
    this.sub = this.transaccionService.transacciones$.subscribe(transacciones => {
      this.resumen = this.analyticsService.calcularResumen(transacciones);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }
}

