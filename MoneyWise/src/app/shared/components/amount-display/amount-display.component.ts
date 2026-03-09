import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-amount-display',
  templateUrl: './amount-display.component.html',

})
export class AmountDisplayComponent {
  @Input() monto: number = 0;
  @Input() tipo: 'ingreso' | 'gasto' | 'neutral' = 'neutral';
  @Input() tamano: 'small' | 'medium' | 'large' = 'medium';
}

