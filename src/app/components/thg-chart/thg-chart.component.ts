import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {THGRow} from '../../models/data.model';
import thgData from '../../../data/THG.json';

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
  readonly dataSource = thgData as THGRow[];
  readonly dataKey = 'THG' as const;
  readonly title = 'THG-Emissionen';
  readonly unitDivisor = 1;
  readonly unitLabel = 'in Mt CO2äq';
  protected override useSizeClassFilter = false; // THG has no size classes
}
