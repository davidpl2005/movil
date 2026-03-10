import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Transaccion } from '../../../core/models/transaccion.model';
import { CATEGORIAS, TIPOS_TRANSACCION } from '../../../core/constants/app.constants';

@Component({
  standalone: false,
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
})
export class TransactionFormComponent implements OnInit {
  @Input() transaccion: Transaccion | null = null;
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  form!: FormGroup;
  categorias = CATEGORIAS;
  tipos = TIPOS_TRANSACCION;
  fotoActual: string = '';

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      tipo:        [this.transaccion?.tipo || 'gasto', Validators.required],
      categoria:   [this.transaccion?.categoria || '', Validators.required],
      fecha:       [this.transaccion?.fecha ? new Date(this.transaccion.fecha).toISOString() : new Date().toISOString(), Validators.required],
      monto:       [this.transaccion?.monto || null, [Validators.required, Validators.min(0.01)]],
      descripcion: [this.transaccion?.descripcion || '']
    });
    this.fotoActual = this.transaccion?.comprobante || '';
  }

  onFotoSeleccionada(foto: string) { this.fotoActual = foto; }
  onFotoEliminada() { this.fotoActual = ''; }

  async guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const datos = { ...this.form.value, comprobante: this.fotoActual };
    await this.modalCtrl.dismiss(datos);
  }

  async cancelar() {
    await this.modalCtrl.dismiss(null);
  }
}
