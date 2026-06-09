import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TransaccionService } from '../../core/services/transaccion.service';
import { Transaccion } from '../../core/models/transaccion.model';
import { TransactionFormComponent } from '../../shared/components/transaction-form/transaction-form.component';

@Component({
  standalone: false,
  selector: 'app-lista-transacciones',
  templateUrl: './lista-transacciones.page.html',
  styleUrls: ['./lista-transacciones.page.scss']
})
export class ListaTransaccionesPage implements OnInit, OnDestroy {
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  categoriasDisponibles: string[] = [];
  tipoFiltro: string = 'todos';
  categoriaFiltro: string = 'todas';
  textoBusqueda: string = '';
  criterioOrden: string = 'fecha';
  ordenAscendente: boolean = false;
  private sub!: Subscription;

  constructor(
    private transaccionService: TransaccionService,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.sub = this.transaccionService.transacciones$.subscribe(t => {
      this.transacciones = t;
      this.actualizarCategoriasDisponibles();
      this.aplicarFiltrosYOrden();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  ionViewWillEnter() {
    this.actualizarCategoriasDisponibles();
    this.aplicarFiltrosYOrden();
  }

  async refrescar(event?: RefresherCustomEvent) {
    try {
      await this.transaccionService.refrescar();
      this.actualizarCategoriasDisponibles();
      this.aplicarFiltrosYOrden();
    } finally {
      event?.target.complete();
    }
  }

  actualizarCategoriasDisponibles() {
    this.categoriasDisponibles = Array.from(new Set(
      this.transacciones
        .map(t => (t.categoria || '').trim())
        .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'es'));

    if (this.categoriaFiltro !== 'todas' && !this.categoriasDisponibles.includes(this.categoriaFiltro)) {
      this.categoriaFiltro = 'todas';
    }
  }

  aplicarFiltrosYOrden() {
    let result = [...this.transacciones];

    if (this.tipoFiltro !== 'todos') {
      result = result.filter(t => t.tipo === this.tipoFiltro);
    }
    if (this.categoriaFiltro !== 'todas') {
      result = result.filter(t => t.categoria === this.categoriaFiltro);
    }
    if (this.textoBusqueda.trim()) {
      const lower = this.textoBusqueda.toLowerCase();
      result = result.filter(t =>
        t.descripcion?.toLowerCase().includes(lower) ||
        t.categoria.toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) => {
      let diff = 0;
      if (this.criterioOrden === 'fecha') {
        diff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (this.criterioOrden === 'monto') {
        diff = a.monto - b.monto;
      } else if (this.criterioOrden === 'categoria') {
        diff = a.categoria.localeCompare(b.categoria, 'es');
      }
      return this.ordenAscendente ? diff : -diff;
    });

    this.transaccionesFiltradas = result;
  }

  toggleOrden() {
    this.ordenAscendente = !this.ordenAscendente;
    this.aplicarFiltrosYOrden();
  }

  aplicarOrden() {
    this.aplicarFiltrosYOrden();
  }

  verDetalle(id: string) {
    this.router.navigate(['/tabs/transacciones/detalle', id]);
  }

  async eliminarSwipe(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar',
      message: '¿Estás seguro de eliminar esta transacción?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.transaccionService.eliminar(id);
            const toast = await this.toastCtrl.create({
              message: 'Transacción eliminada',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
          }
        }
      ]
    });
    await alert.present();
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
          const toast = await this.toastCtrl.create({
            message: 'Transacción agregada correctamente',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        }
      }
    });

    await modal.present();
  }
}
