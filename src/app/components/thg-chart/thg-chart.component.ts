import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {THGRow} from '../../models/data.model';
import thgData from '../../../data/THG.json';

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
    // Component order (reversed because legend is reversed):
    // Fahrzeug (0) → Akku (1) → Energie (2) → Energie_WTT (3) → Energie_TTW (4) → Wartung (5) → EoL (6) → Infrastruktur (7)
    // This makes Infrastruktur appear at top of legend after reverse
    let componentOrder = 999;
    if (seriesName.startsWith('Fahrzeug ')) componentOrder = 0;
    else if (seriesName.startsWith('Akku ')) componentOrder = 1;
    else if (seriesName.startsWith('Energie ')) componentOrder = 2;
    else if (seriesName.startsWith('Energie_WTT ')) componentOrder = 3;
    else if (seriesName.startsWith('Energie_TTW ')) componentOrder = 4;
    else if (seriesName.startsWith('Wartung ')) componentOrder = 5;
    else if (seriesName.startsWith('EoL ')) componentOrder = 6;
    else if (seriesName.startsWith('Infrastruktur ')) componentOrder = 7;

    // Within each component (reversed): BEV (0) → FCEV (1) → OL (2) → BWS (3) → Diesel (4)
    // This makes Diesel appear at top within each component group after reverse
    let techOrder = 999;
    if (seriesName.includes('BEV') && !seriesName.includes('BWS-BEV') && !seriesName.includes('OL-BEV')) techOrder = 0;
    else if (seriesName.includes('FCEV')) techOrder = 1;
    else if (seriesName.includes('OL-BEV')) techOrder = 2;
    else if (seriesName.includes('BWS-BEV') || seriesName.includes('BWS')) techOrder = 3;
    else if (seriesName.includes('Diesel')) techOrder = 4;

    // Combine: component * 10 + tech
    return componentOrder * 10 + techOrder;
  }

  protected getLegendOrder(seriesName: string): number {
    // Same order as series for THG
    return this.getSeriesOrder(seriesName);
  }
}
