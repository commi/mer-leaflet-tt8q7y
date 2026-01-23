import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {THGRow} from '../../models/data.model';
import thgData from '../../../data/THG.json';
import {getThgSeriesOrder} from '../../utils/color.util';

@Component({
  selector: 'app-thg-chart',
  standalone: false,
  templateUrl: './thg-chart.component.html', styles: `
    :host {
      display: contents;
    }
    .chart-node {
      grid-area: var(--chart-area);
      page-break-inside: avoid;
    }
    .legend-node {
      grid-area: var(--legend-area);
      margin-block-end: 26px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ThgChartComponent extends BaseChartComponent {
  readonly dataSource = thgData as THGRow[];
  readonly dataKey = 'THG' as const;
  readonly title = 'THG-Emissionen';
  readonly unitDivisor = 1;
  readonly unitLabel = 'in Mt CO2äq';
  protected override useSizeClassFilter = false; // THG has no size classes

  protected getSeriesOrder(seriesName: string): number {
    return getThgSeriesOrder(seriesName);
  }

  protected getLegendOrder(seriesName: string): number {
    // Same order as series for THG (legend gets reversed in base-chart)
    return getThgSeriesOrder(seriesName);
  }
}
