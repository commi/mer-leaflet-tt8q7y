import { Component } from '@angular/core';
import { getTechnologyColor } from '../../utils/color.util';

@Component({
  selector: 'app-abbreviations-legend',
  standalone: false,
  template: `
    <div class="card-body">
      <h5 class="h6 mb-2">Abkürzungen</h5>
      <dl class="abbreviations-grid small mb-0">
        @for (abbr of abbreviations; track abbr.tech) {
          <dt><span [style.color]="abbr.color">@if(abbr.color) {■}</span> <strong>{{abbr.tech}}</strong></dt>
          <dd>{{abbr.description}}</dd>
        }
      </dl>
    </div>
  `,
  host: {
    'class': 'card border-0'
  },
  styles: `
    :host {
      min-width: max-content;
    }
    .abbreviations-grid {
      display: grid;
      grid-template-columns: auto auto 1fr;
      align-items: center;
      gap: 0.25rem 0.5rem;
      margin-bottom: 0;
    }

    .abbreviations-grid dt {
      display: contents;
      font-weight: unset;
    }

    .abbreviations-grid dd {
      margin-bottom: 0;
    }
  `
})
export class AbbreviationsLegendComponent {
  abbreviations = [
    { tech: 'Diesel', description: '', color: getTechnologyColor('Diesel') },
    { tech: 'BEV', description: 'Batterieelektrisch', color: getTechnologyColor('BEV') },
    { tech: 'BWS', description: 'Batteriewechselsystem', color: getTechnologyColor('BWS-BEV') },
    { tech: 'OL', description: 'Oberleitung', color: getTechnologyColor('OL-BEV') },
    { tech: 'FCEV', description: 'H₂-Brennstoffzelle', color: getTechnologyColor('FCEV') },
    { tech: 'WTT', description: 'Well-to-Tank', color: '' },
    { tech: 'TTW', description: 'Tank-to-Wheel', color: '' }
  ];
}
