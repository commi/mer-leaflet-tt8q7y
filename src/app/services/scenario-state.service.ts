import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScenarioStateService {
  // Scenario selection (1-8)
  scenario$ = new BehaviorSubject<string>('1');

  // Size class multi-select (array of selected size classes)
  // Can include: 'alle Größenklassen', '3,5-7,5t', '7,5-12t', '12-18t', '18-26t', '26-40t'
  chartSizeClass$ = new BehaviorSubject<string[]>(['alle Größenklassen']);
}
