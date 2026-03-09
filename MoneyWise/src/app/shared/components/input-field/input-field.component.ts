import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',

})
export class InputFieldComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() value: any = '';
  @Input() error: string = '';
  @Input() disabled: boolean = false;
  @Output() onChange = new EventEmitter<any>();
}

