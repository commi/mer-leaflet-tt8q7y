import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ScenarioStateService } from '../../services/scenario-state.service';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 1.5rem;
      grid-template-areas:
        "bestand thg"
        "kosten thg";
    }

    .chart-area-bestand {
      grid-area: bestand;
    }

    .chart-area-kosten {
      grid-area: kosten;
    }

    .chart-area-thg {
      grid-area: thg;
      min-height: 600px;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class ChartViewComponent {
  scenarioState = inject(ScenarioStateService);
}
