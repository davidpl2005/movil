import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CATEGORIAS } from '../../../core/constants/app.constants';

@Component({
  standalone: false,
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',

})
export class FilterBarComponent {
  @Input() tipoSeleccionado: string = 'todos';
  @Input() categoriaSeleccionada: string = 'todas';
  @Output() onTipoChange = new EventEmitter<string>();
  @Output() onCategoriaChange = new EventEmitter<string>();
  @Output() onBuscarChange = new EventEmitter<string>();

  categorias = CATEGORIAS;
}

