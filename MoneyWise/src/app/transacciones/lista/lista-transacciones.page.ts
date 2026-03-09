import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TransaccionService } from '../../core/services/transaccion.service';
import { Transaccion } from '../../core/models/transaccion.model';
import { TransactionFormComponent } from '../../shared/components/transaction-form/transaction-form.component';

@Component({
  standalone: false,
  selector: 'app-lista-transacciones',
  templateUrl: './lista-transacciones.page.html'
})
export class ListaTransaccionesPage implements OnInit, OnDestroy {
  transacciones: Transaccion[] = [];
  tipoFiltro: string = 'todos';
  categoriaFiltro: string = 'todas';
  textoBusqueda: string = '';
  private sub!: Subscription;

  constructor(
    private transaccionService: TransaccionService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.sub = this.transaccionService.transacciones$.subscribe(t => {
      this.transacciones = t.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  verDetalle(id: string) {
    this.router.navigate(['/tabs/transacciones/detalle', id]);
  }

  async abrirFormulario(transaccion?: Transaccion) {
    const modal = await this.modalCtrl.create({
      component: TransactionFormComponent,
      componentProps: { transaccion: transaccion || null }
    });

    modal.onDidDismiss().then(async ({ data }) => {
      if (data) {
        if (transaccion) {
          await this.transaccionService.editar(transaccion.id, data);
        } else {
          await this.transaccionService.agregar(data);
        }
      }
    });

    await modal.present();
  }
}

