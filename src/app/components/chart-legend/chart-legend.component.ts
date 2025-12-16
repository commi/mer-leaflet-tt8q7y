import { Component, Input } from '@angular/core';

export interface LegendItem {
  name: string;
  color: string;
}

@Component({
  selector: 'app-chart-legend',
  standalone: false,
  templateUrl: './chart-legend.component.html',
  styles: ``
})
export class ChartLegendComponent {
  @Input() legendGroups: Array<Array<LegendItem>> = [];
}
