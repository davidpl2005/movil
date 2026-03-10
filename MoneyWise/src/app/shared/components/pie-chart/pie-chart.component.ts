import { Component, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { GastoPorCategoria } from '../../../core/models/resumen-financiero.model';
import {
  Chart, ArcElement, DoughnutController, Legend, Tooltip, Plugin
} from 'chart.js';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

@Component({
  standalone: false,
  selector: 'app-pie-chart',
  template: `
    <div style="position: relative; width: 100%; max-width: 280px; margin: 0 auto; padding: 16px 0;">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class PieChartComponent implements OnChanges {
  @Input() datos: GastoPorCategoria[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private chart: Chart | null = null;

  ngOnChanges() {
    setTimeout(() => this.renderChart(), 100);
  }

  private renderChart() {
    if (!this.chartCanvas || this.datos.length === 0) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const labelPlugin: Plugin<'doughnut'> = {
      id: 'doughnutLabels',
      afterDatasetDraw(chart) {
        const { ctx, data } = chart;
        const dataset = data.datasets[0];
        const total = (dataset.data as number[]).reduce((a, b) => a + (b as number), 0);
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((arc: any, i: number) => {
          const value = dataset.data[i] as number;
          const pct = ((value / total) * 100).toFixed(1);

          if (parseFloat(pct) < 5) return;

          const { x, y } = arc.tooltipPosition();

          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 4;
          ctx.fillText(`${pct}%`, x, y);
          ctx.restore();
        });
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.datos.map(d => d.categoria),
        datasets: [{
          data: this.datos.map(d => d.monto),
          backgroundColor: this.datos.map(d => d.color),
          borderWidth: 2,
          borderColor: '#0d1117'
        }]
      },
      options: {
        responsive: true,
        cutout: '45%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255,255,255,0.7)',
              font: { size: 12 },
              padding: 16,
              usePointStyle: true,
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                const total = (dataset.data as number[]).reduce((a, b) => a + (b as number), 0);
                return (chart.data.labels as string[]).map((label, i) => {
                  const value = dataset.data[i] as number;
                  const pct = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} — ${pct}%`,
                    fillStyle: (dataset.backgroundColor as string[])[i],
                    strokeStyle: (dataset.backgroundColor as string[])[i],
                    pointStyle: 'circle',
                    index: i,
                    hidden: false,
                    lineWidth: 0,
                    fontColor: 'rgba(255,255,255,0.7)'
                  };
                });
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed;
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = ((val / total) * 100).toFixed(1);
                return ` $${val.toLocaleString('es-CO')} (${pct}%)`;
              }
            }
          }
        }
      },
      plugins: [labelPlugin]
    });
  }
}