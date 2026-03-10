import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-photo-gallery-modal',
  templateUrl: './photo-gallery-modal.component.html',
})
export class PhotoGalleryModalComponent implements OnInit {
  @Input() fotos: string[] = [];
  @Input() fotoInicial: number = 0;
  fotoActiva: number = 0;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.fotoActiva = this.fotoInicial;
  }

  anterior() {
    if (this.fotoActiva > 0) this.fotoActiva--;
  }

  siguiente() {
    if (this.fotoActiva < this.fotos.length - 1) this.fotoActiva++;
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
