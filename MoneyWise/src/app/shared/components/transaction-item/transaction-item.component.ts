import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Transaccion } from '../../../core/models/transaccion.model';

@Component({
  standalone: false,
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',

})
export class TransactionItemComponent {
  @Input() transaccion!: Transaccion;
  @Output() onClick = new EventEmitter<void>();
}

