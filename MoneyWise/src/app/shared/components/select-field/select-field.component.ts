import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',

})
export class SelectFieldComponent {
  @Input() label: string = '';
  @Input() options: { id: string; nombre: string }[] = [];
  @Input() value: any = '';
  @Input() error: string = '';
  @Output() onChange = new EventEmitter<any>();
}

