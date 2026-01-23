/**
 * Horizontal guide lines.
 * ChartShell calculates ticks+maxValue and decides on gridLineVisible rule.
 */

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {GridLineVisible} from './chart-types';

@Component({
  selector: 'app-chart-grid-lines',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (t of ticks; track t; let i = $index) {
      @if (isVisible(t, i)) {
        <div class="grid-line"
             *ngIf="t <= maxValue"
             [style.--tick-value]="t"
             [style.--max-value]="maxValue"></div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
    }

    .grid-line {
      position: absolute;
      inset: auto 0 calc((var(--tick-value) / var(--max-value)) * 100%) 0;
      height: 0;
      border-top: 1px solid var(--grid-line-color, rgba(0, 0, 0, .08));


      opacity: 1;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;
      transition-property: bottom, opacity;
      @starting-style {
        opacity: 0;
      }
      
      /* 0 grid line  in front of bars */
      &:first-child {
        z-index: 1;
      }
    }
  `]
})
export class ChartGridLinesComponent {
  @Input({ required: true }) ticks!: number[];
  @Input({ required: true }) maxValue!: number;

  /** true/false or function */
  @Input() gridLineVisible?: GridLineVisible;

  isVisible(v: number, i: number): boolean {
    const rule = this.gridLineVisible;
    if (typeof rule === 'function') return rule(v, i, this.ticks);
    if (typeof rule === 'boolean') return rule;
    return true; // default
  }
}
