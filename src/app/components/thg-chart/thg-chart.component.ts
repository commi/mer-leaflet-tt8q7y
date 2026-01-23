import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {CHART_CONFIGS} from '../../models/chart-config.model';

@Component({
  selector: 'app-thg-chart',
  standalone: false,
  templateUrl: './thg-chart.component.html', styles: `
    :host {
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ThgChartComponent extends BaseChartComponent {
  chartConfig = CHART_CONFIGS[2]; // THG config
  protected override useSizeClassFilter = false; // THG has no size classes
}
