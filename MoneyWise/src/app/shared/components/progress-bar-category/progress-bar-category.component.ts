import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-progress-bar-category',
  templateUrl: './progress-bar-category.component.html',

})
export class ProgressBarCategoryComponent {
  @Input() categoria: string = '';
  @Input() porcentaje: number = 0;
  @Input() color: string = '#000';
  @Input() monto: number = 0;
}

