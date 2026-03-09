import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',

})
export class EmptyStateComponent {
  @Input() mensaje: string = 'No hay datos disponibles';
  @Input() icono: string = 'documents-outline';
  @Input() accion: string = '';
  @Output() onAccion = new EventEmitter<void>();
}

