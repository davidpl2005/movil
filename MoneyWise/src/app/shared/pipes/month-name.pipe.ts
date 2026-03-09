import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false, name: 'monthName' })
export class MonthNamePipe implements PipeTransform {
  private meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  transform(mes: number): string {
    return this.meses[mes - 1] || '';
  }
}

