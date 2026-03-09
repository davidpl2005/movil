import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',

})
export class DashboardCardComponent {
  @Input() titulo: string = '';
  @Input() monto: number = 0;
  @Input() tipo: 'ingreso' | 'gasto' | 'saldo' = 'saldo';
  @Input() icono: string = 'cash';
}

