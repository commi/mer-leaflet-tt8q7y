import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { SCENARIOS, ScenarioConfig } from '../../models/scenario.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-scenario-selector',
  standalone: false,
  templateUrl: './scenario-selector.component.html',
  host: {
    'class': 'card border-0'
  }
})
export class ScenarioSelectorComponent {
  scenarioState = inject(ScenarioStateService);

  scenarios = SCENARIOS;

  // Map current scenario to its config
  selectedScenarioConfig$ = this.scenarioState.scenario$.pipe(
    map(scenarioId => this.scenarios.find(s => s.id === scenarioId))
  );
}
