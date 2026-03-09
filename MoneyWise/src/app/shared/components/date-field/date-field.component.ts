import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',

})
export class DateFieldComponent {
  @Input() label: string = '';
  @Input() value: any = '';
  @Input() error: string = '';
  @Output() onChange = new EventEmitter<any>();
}

