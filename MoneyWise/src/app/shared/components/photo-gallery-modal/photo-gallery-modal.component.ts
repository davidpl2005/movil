import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-photo-gallery-modal',
  templateUrl: './photo-gallery-modal.component.html',

})
export class PhotoGalleryModalComponent {
  @Input() fotos: string[] = [];
  @Input() fotoInicial: number = 0;
  fotoActiva: number = 0;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.fotoActiva = this.fotoInicial;
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}

