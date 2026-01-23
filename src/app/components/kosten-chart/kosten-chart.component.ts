import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {BestandKostenRow} from '../../models/data.model';
import kostenData from '../../../data/Kosten.json';
import {getBestandKostenLegendOrder, getBestandKostenStackOrder} from '../../utils/color.util';

@Component({
  selector: 'app-kosten-chart',
  standalone: false,
  templateUrl: './kosten-chart.component.html', styles: `
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
export class KostenChartComponent extends BaseChartComponent {
  readonly dataSource = kostenData as BestandKostenRow[];
  readonly dataKey = 'Kosten' as const;
  readonly title = 'Kosten';
  readonly unitDivisor = 1000000000;
  readonly unitLabel = 'in Mrd. €';

  protected getSeriesOrder(seriesName: string): number {
    return getBestandKostenStackOrder(seriesName);
  }

  protected getLegendOrder(seriesName: string): number {
    return getBestandKostenLegendOrder(seriesName);
  }
}
