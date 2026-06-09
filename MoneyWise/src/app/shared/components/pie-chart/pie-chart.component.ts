import {
  Component, Input, OnChanges, ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import { GastoPorCategoria } from '../../../core/models/resumen-financiero.model';
import {
  Chart, ArcElement, DoughnutController, Legend, Tooltip, Plugin
} from 'chart.js';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

@Component({
  standalone: false,
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges, OnDestroy {
  @Input() datos: GastoPorCategoria[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private chart: Chart | null = null;
  private observer: MutationObserver | null = null;

  ngOnChanges() {
    setTimeout(() => this.renderChart(), 120);
  }

  ngOnDestroy() {
    this.chart?.destroy();
    this.observer?.disconnect();
  }

  private getTextColor(): string {
    const dark = document.body.getAttribute('color-theme') === 'dark'
      || document.body.getAttribute('color-theme') === null;
    return dark ? 'rgba(248,250,252,0.75)' : 'rgba(15,23,42,0.65)';
  }

  private getBorderColor(): string {
    const dark = document.body.getAttribute('color-theme') === 'dark'
      || document.body.getAttribute('color-theme') === null;
    return dark ? '#0B1B2B' : '#FFFFFF';
  }

  private renderChart() {
    if (!this.chartCanvas || this.datos.length === 0) return;

    this.chart?.destroy();
    this.chart = null;

    const textColor = this.getTextColor();
    const borderColor = this.getBorderColor();

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
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.55)';
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
          borderWidth: 3,
          borderColor
        }]
      },
      options: {
        responsive: true,
        cutout: '48%',
        animation: {
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: { size: 12, family: 'system-ui, sans-serif' },
              padding: 16,
              usePointStyle: true,
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                const total = (dataset.data as number[]).reduce((a, b) => a + (b as number), 0);
                return (chart.data.labels as string[]).map((label, i) => {
                  const value = dataset.data[i] as number;
                  const pct = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label}  ${pct}%`,
                    fillStyle: (dataset.backgroundColor as string[])[i],
                    strokeStyle: (dataset.backgroundColor as string[])[i],
                    pointStyle: 'circle' as const,
                    index: i,
                    hidden: false,
                    lineWidth: 0,
                    fontColor: textColor
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
                return `  $${val.toLocaleString('es-CO')} (${pct}%)`;
              }
            }
          }
        }
      },
      plugins: [labelPlugin]
    });

    // Rerender cuando cambia el tema
    this.observer?.disconnect();
    this.observer = new MutationObserver(() => {
      if (this.chart) {
        const tc = this.getTextColor();
        const bc = this.getBorderColor();
        if (this.chart.options.plugins?.legend?.labels) {
          (this.chart.options.plugins.legend.labels as any).color = tc;
        }
        if (this.chart.data.datasets[0]) {
          this.chart.data.datasets[0].borderColor = bc;
        }
        this.chart.update();
      }
    });
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['color-theme'] });
  }
}