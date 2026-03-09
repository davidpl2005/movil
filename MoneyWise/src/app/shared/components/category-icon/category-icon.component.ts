import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-category-icon',
  templateUrl: './category-icon.component.html',

})
export class CategoryIconComponent {
  @Input() categoria: string = '';
  @Input() tamano: 'small' | 'medium' = 'medium';
}

