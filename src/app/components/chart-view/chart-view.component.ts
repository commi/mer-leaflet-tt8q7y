import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ScenarioStateService } from '../../services/scenario-state.service';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `
    .chart-container {
      min-height: 300px;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class ChartViewComponent {
  scenarioState = inject(ScenarioStateService);
}
