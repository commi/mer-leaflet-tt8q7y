import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {CHART_CONFIGS} from '../../models/chart-config.model';

@Component({
  selector: 'app-bestand-chart',
  standalone: false,
  templateUrl: './bestand-chart.component.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class BestandChartComponent extends BaseChartComponent {
  chartConfig = CHART_CONFIGS[0]; // Bestand config
}
