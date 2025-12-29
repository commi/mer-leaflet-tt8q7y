import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ScenarioStateService } from '../../services/scenario-state.service';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `
    .charts-grid {
      display: grid;
      max-width: 100%;
      grid-template-columns: 1fr 1fr auto;
      gap: 1.5rem;
      grid-template-areas:
        "bestand kosten sidebar"
        "thg leer sidebar";
    }

    .chart-area-bestand {
      grid-area: bestand;
    }

    .chart-area-kosten {
      grid-area: kosten;
    }

    .chart-area-thg {
      grid-area: thg;
    }

    .sidebar-controls {
      grid-area: sidebar;
      min-width: 250px;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class ChartViewComponent {
  scenarioState = inject(ScenarioStateService);
}
