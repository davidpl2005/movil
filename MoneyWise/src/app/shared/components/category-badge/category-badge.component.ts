import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-category-badge',
  templateUrl: './category-badge.component.html',

})
export class CategoryBadgeComponent {
  @Input() categoria: string = '';
  @Input() mostrarIcono: boolean = true;
}

