import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {BestandKostenRow} from '../../models/data.model';
import bestandData from '../../../data/Bestand.json';

@Component({
  selector: 'app-bestand-chart',
  standalone: false,
  templateUrl: './bestand-chart.component.html',
  styles: `
    :host {
      display: contents;
    }
    .chart-node {
      grid-area: var(--chart-area);
      page-break-inside: avoid;
    }
    .legend-node {
      grid-area: var(--legend-area);
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class BestandChartComponent extends BaseChartComponent {
  readonly dataSource = bestandData as BestandKostenRow[];
  readonly dataKey = 'Bestand' as const;
  readonly title = 'Bestand';
  readonly unitDivisor = 1000;
  readonly unitLabel = 'in Tsd. Fahrzeuge';

  protected getSeriesOrder(seriesName: string): number {
    // Order for stacking: BEV (0, bottom) → FCEV (1) → OL (2) → BWS (3) → Diesel (4, top)
    const baseName = seriesName.split('_')[0].trim();
    if (baseName.includes('OL-BEV')) return 2;
    if (baseName.includes('BWS-BEV') || baseName.includes('BWS')) return 3;
    if (baseName.includes('BEV')) return 0;
    if (baseName.includes('FCEV') || baseName.includes('H2')) return 1;
    if (baseName.includes('Diesel')) return 4;
    return 999;
  }

  protected getLegendOrder(seriesName: string): number {
    // Order for legend grouping: Diesel (0) → BWS (1) → BEV (2) → OL (3) → FCEV (4)
    if (seriesName.includes('OL-BEV')) return 3;
    if (seriesName.includes('BWS-BEV') || seriesName.includes('BWS')) return 2;
    if (seriesName.includes('BEV')) return 1;
    if (seriesName.includes('FCEV') || seriesName.includes('H2')) return 4;
    if (seriesName.includes('Diesel')) return 0;
    return 999;
  }
}
