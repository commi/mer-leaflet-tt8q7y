import { Component, ViewChild, ElementRef } from '@angular/core';
import { BaseChartComponent } from '../base-chart';
import { CHART_CONFIGS } from '../../models/chart-config.model';

@Component({
  selector: 'app-thg-chart',
  standalone: false,
  templateUrl: './thg-chart.component.html',
  styles: ``
})
export class ThgChartComponent extends BaseChartComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  chartConfig = CHART_CONFIGS[2]; // THG config
}
