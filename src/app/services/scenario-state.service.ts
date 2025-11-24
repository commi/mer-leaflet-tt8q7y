import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScenarioStateService {
  scenario$ = new BehaviorSubject<string>('1');
  year$ = new BehaviorSubject<number>(2025);
  visibleLayer$ = new BehaviorSubject<string>('Diesel'); // Can be: 'Oberleitungsausbau' | 'Diesel' | 'BEV' | 'OLKW' | 'FCEV'
  chartDataSource$ = new BehaviorSubject<string>('Bestand');
  chartSizeClass$ = new BehaviorSubject<string>('alle Größenklassen');
}
