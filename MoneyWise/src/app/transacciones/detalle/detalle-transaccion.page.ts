import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { TransaccionService } from '../../core/services/transaccion.service';
import { Transaccion } from '../../core/models/transaccion.model';
import { TransactionFormComponent } from '../../shared/components/transaction-form/transaction-form.component';
import { PhotoGalleryModalComponent } from '../../shared/components/photo-gallery-modal/photo-gallery-modal.component';

@Component({
  standalone: false,
  selector: 'app-detalle-transaccion',
  templateUrl: './detalle-transaccion.page.html',
  styleUrls: ['./detalle-transaccion.page.scss']
})
export class DetalleTransaccionPage implements OnInit {
  transaccion: Transaccion | undefined;
  private transaccionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transaccionService: TransaccionService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.transaccionId = this.route.snapshot.paramMap.get('id');
    this.cargarDetalle();
  }

  async refrescar(event?: RefresherCustomEvent) {
    try {
      await this.transaccionService.refrescar();
      this.cargarDetalle();
    } finally {
      event?.target.complete();
    }
  }

  private cargarDetalle() {
    if (this.transaccionId) {
      this.transaccion = this.transaccionService.getById(this.transaccionId);
    }
  }

  async verComprobante() {
    if (!this.transaccion?.comprobante) return;
    const modal = await this.modalCtrl.create({
      component: PhotoGalleryModalComponent,
      componentProps: {
        fotos: [this.transaccion.comprobante],
        fotoInicial: 0
      }
    });
    await modal.present();
  }

  async editar() {
    const modal = await this.modalCtrl.create({
      component: TransactionFormComponent,
      componentProps: { transaccion: this.transaccion }
    });

    modal.onDidDismiss().then(async ({ data }) => {
      if (data && this.transaccion) {
        await this.transaccionService.editar(this.transaccion.id, data);
        this.cargarDetalle();
      }
    });

    await modal.present();
  }

  async eliminar() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar',
      message: '¿Estás seguro de eliminar esta transacción?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.transaccionService.eliminar(this.transaccion!.id);
            const toast = await this.toastCtrl.create({
              message: 'Transacción eliminada',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
            this.router.navigate(['/tabs/transacciones'], { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }
}
