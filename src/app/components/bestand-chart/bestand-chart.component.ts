import { Component, ViewChild, ElementRef } from '@angular/core';
import { BaseChartComponent } from '../base-chart';
import { CHART_CONFIGS } from '../../models/chart-config.model';

@Component({
  selector: 'app-bestand-chart',
  standalone: false,
  templateUrl: './bestand-chart.component.html',
  styles: ``
})
export class BestandChartComponent extends BaseChartComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  chartConfig = CHART_CONFIGS[0]; // Bestand config
}
