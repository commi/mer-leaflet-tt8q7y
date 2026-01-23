import { Component } from '@angular/core';
import { getTechnologyColor } from '../../utils/color.util';

@Component({
  selector: 'app-abbreviations-legend',
  standalone: false,
  template: `
    <div class="card-body">
      <h5 class="h6 mb-2">Abkürzungen</h5>
      <div class="d-flex flex-row gap-2 align-items-sm-start">
        <dl class="abbreviations-grid small">
          <dt><span [style.color]="getColor('Diesel')">■</span> <strong>Diesel</strong></dt>
          <dd></dd>
          <dt><span [style.color]="getColor('BEV')">■</span> <strong>BEV</strong></dt>
          <dd>Batterieelektrisch</dd>
          <dt><span [style.color]="getColor('BWS-BEV')">■</span> <strong>BWS</strong></dt>
          <dd>Batteriewechselsystem</dd>
          <dt><span [style.color]="getColor('OL-BEV')">■</span> <strong>OL</strong></dt>
          <dd>Oberleitung</dd>
          <dt><span [style.color]="getColor('FCEV')">■</span> <strong>FCEV</strong></dt>
          <dd>H₂-Brennstoffzelle</dd>
        </dl>
        <dl class="abbreviations-grid small">
          <dt><span></span><strong>WTT</strong></dt>
          <dd>Well-to-Tank</dd>
          <dt><span></span><strong>TTW</strong></dt>
          <dd>Tank-to-Wheel</dd>
        </dl>
      </div>
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
  getColor(tech: string): string {
    return getTechnologyColor(tech);
  }
}
