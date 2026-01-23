/**
 * Renders the y-labels.
 * ChartShell calculates ticks + maxValue and passes them here.
 */

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TickLabelFormatter} from './chart-types';

@Component({
  selector: 'app-chart-y-axis',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (t of reversedTicks; track t; let i = $index) {
      <div class="y-tick"
           *ngIf="t <= maxValue"
           [style.--tick-value]="t"
           [style.--max-value]="maxValue">
        <span class="tick-mark"></span>
        <span class="tick-label">{{ formatTick(t, reversedTicks.length - 1 - i) }}</span>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      color: var(--axis-text, #444);
      font-size: var(--axis-font-size, 12px);
      line-height: 1;

      /* Position ticks based on data ratio */
      .y-tick {
        position: absolute;
        bottom: calc((var(--tick-value) / var(--max-value)) * 100%);
        transform: translateY(50%);
        white-space: nowrap;
        text-align: right;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;

        opacity: 1;
        transition-duration: 0.2s;
        transition-timing-function: ease-in-out;
        transition-property: bottom, opacity;
        @starting-style {
          opacity: 0;
        }
      }

      .tick-mark {
        display: var(--show-tick-marks, none);
        width: var(--tick-mark-length, 4px);
        height: 1px;
        background: var(--grid-line-color, #999);
        flex-shrink: 0;
      }

      .tick-label {
        display: inline-block;
      }
    }
  `]
})
export class ChartYAxisComponent {
  /** From ChartShell: e.g. [0, 200, 400, ...] */
  @Input({required: true}) ticks!: number[];

  /** From ChartShell: scale maximum */
  @Input({required: true}) maxValue!: number;

  /** Optional: e.g., €, %, etc. */
  @Input() tickLabel?: TickLabelFormatter;

  /** Reversed ticks for display (highest at top, 0 at bottom) */
  get reversedTicks(): number[] {
    return [...this.ticks].reverse();
  }

  formatTick(v: number, i: number): string {
    return this.tickLabel ? this.tickLabel(v, i) : String(v);
  }
}
