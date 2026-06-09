import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ResumenFinanciero } from '../../core/models/resumen-financiero.model';
import { User } from '../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
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
    private analyticsService: AnalyticsService,
    private alertCtrl: AlertController,
    private router: Router
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

  irATransacciones() {
    this.router.navigate(['/tabs/transacciones']);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar Sesión', role: 'destructive', handler: () => this.authService.logout() }
      ]
    });
    await alert.present();
  }
}
