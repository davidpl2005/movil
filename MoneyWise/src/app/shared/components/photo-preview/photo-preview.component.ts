import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-photo-preview',
  templateUrl: './photo-preview.component.html',

})
export class PhotoPreviewComponent {
  @Input() src: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() onClick = new EventEmitter<void>();
}

