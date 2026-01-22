import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ScenarioStateService } from './services/scenario-state.service';

@Component({
  selector: 'szenarien-component',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent {
  title = 'MeR Szenarienexplorer';
  scenarioState = inject(ScenarioStateService);
}
