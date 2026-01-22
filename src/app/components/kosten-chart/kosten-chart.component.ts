import { Component, ViewChild, ElementRef } from '@angular/core';
import { BaseChartComponent } from '../base-chart';
import { CHART_CONFIGS } from '../../models/chart-config.model';

@Component({
  selector: 'app-kosten-chart',
  standalone: false,
  templateUrl: './kosten-chart.component.html',
  styles: `:host { display: flex; flex-direction: column; }`
})
export class KostenChartComponent extends BaseChartComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  chartConfig = CHART_CONFIGS[1]; // Kosten config
}
