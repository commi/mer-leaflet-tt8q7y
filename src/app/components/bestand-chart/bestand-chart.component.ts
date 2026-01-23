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
}
