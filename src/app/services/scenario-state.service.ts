import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScenarioStateService {
  // Scenario selection (1-8)
  scenario$ = new BehaviorSubject<string>('1');

  // Size class multi-select (array of selected size classes)
  // Default: "alle Größenklassen" (loads all available in data)
  chartSizeClass$ = new BehaviorSubject<string[]>(['alle Größenklassen']);
}
