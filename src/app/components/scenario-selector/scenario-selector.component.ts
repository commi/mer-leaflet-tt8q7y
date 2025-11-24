import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ScenarioStateService } from '../../services/scenario-state.service';

@Component({
  selector: 'app-scenario-selector',
  standalone: false,
  templateUrl: './scenario-selector.component.html',
  styles: ``,
  encapsulation: ViewEncapsulation.None
})
export class ScenarioSelectorComponent {
  scenarioState = inject(ScenarioStateService);
}
