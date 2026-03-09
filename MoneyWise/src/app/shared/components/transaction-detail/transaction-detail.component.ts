import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Transaccion } from '../../../core/models/transaccion.model';

@Component({
  standalone: false,
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',

})
export class TransactionDetailComponent {
  @Input() transaccion!: Transaccion;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
}

