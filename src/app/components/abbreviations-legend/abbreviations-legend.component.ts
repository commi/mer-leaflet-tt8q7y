import { Component } from '@angular/core';
import { getTechnologyColor } from '../../utils/color.util';

@Component({
  selector: 'app-abbreviations-legend',
  standalone: false,
  template: `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="h6 mb-2">Abkürzungen</h5>
        <div class="small">
          @for (abbr of abbreviations; track abbr.tech) {
            <div class="mb-1">
              <span [style.color]="abbr.color">■</span>
              <strong>{{abbr.tech}}</strong>{{abbr.description ? ' = ' + abbr.description : ''}}
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class AbbreviationsLegendComponent {
  abbreviations = [
    { tech: 'Diesel', description: '', color: getTechnologyColor('Diesel') },
    { tech: 'BEV', description: 'Batterieelektrisch', color: getTechnologyColor('BEV') },
    { tech: 'BWS', description: 'Batteriewechselsystem', color: getTechnologyColor('BWS') },
    { tech: 'OL', description: 'Oberleitung', color: getTechnologyColor('OL') },
    { tech: 'FCEV', description: 'H₂-Brennstoffzelle', color: getTechnologyColor('FCEV') }
  ];
}
