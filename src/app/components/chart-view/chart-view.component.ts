import {Component, inject} from '@angular/core';
import {ScenarioStateService} from '../../services/scenario-state.service';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      gap: 1.5rem;
      grid-template-areas:
        "bestand"
        "kosten"
        "thg";
    }

    @media (min-width: 992px) {
      .charts-grid {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        grid-template-areas:
          "bestand thg"
          "kosten thg";
      }
    }

    .chart-area-bestand {
      grid-area: bestand;
    }

    .chart-area-kosten {
      grid-area: kosten;
    }

    .chart-area-thg {
      grid-area: thg;
      min-height: 400px;
    }

    @media (min-width: 992px) {
      .chart-area-thg {
        min-height: 600px;
      }
    }
  `,
})
export class ChartViewComponent {
  scenarioState = inject(ScenarioStateService);
}
