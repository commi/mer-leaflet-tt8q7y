import {Component, inject} from '@angular/core';
import {ScenarioStateService} from '../../services/scenario-state.service';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `
    :host {
      display: block;
      container: charts-container / inline-size;
    }

    .charts-grid {
      display: grid;
      gap: 1rem;
      place-items: end normal;
      grid-template-columns: 1fr;
      grid-template-areas:
        "bestand-chart"
        "kosten-chart"
        "kosten-legend"
        "bestand-legend"
        "thg-chart"
        "thg-legend";
    }

    @container charts-container (min-width: 540px) {
      .charts-grid {
        grid-template-columns: 1fr auto;
        gap: 1rem 1rem;
        grid-template-areas:
          "bestand-chart bestand-legend"
          "kosten-chart kosten-legend"
          "thg-chart thg-legend";
      }
    }

    @container charts-container (min-width: 1024px) {
      .charts-grid {
        grid-template-columns: 1fr auto 1fr auto;
        gap: 1rem 1rem;
        grid-template-areas:
          "bestand-chart bestand-legend thg-chart thg-legend"
          "kosten-chart kosten-legend thg-chart thg-legend";
      }
    }
  `,
})
export class ChartViewComponent {
  scenarioState = inject(ScenarioStateService);
}
