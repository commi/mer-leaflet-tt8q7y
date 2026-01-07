import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ALL_SIZE_CLASSES } from '../utils/color.util';

@Injectable({
  providedIn: 'root'
})
export class ScenarioStateService {
  // Scenario selection (1-8)
  scenario$ = new BehaviorSubject<string>('1');

  // Size class multi-select (array of selected size classes)
  // Default: ALL_SIZE_CLASSES (loads all available in data)
  chartSizeClass$ = new BehaviorSubject<string[]>([ALL_SIZE_CLASSES]);
}
