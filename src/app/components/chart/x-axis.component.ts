/**
 * Renders the categories/x-label at the bottom.
 * ChartShell has labels[] from ChartData and passes them here.
 */

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-chart-x-axis',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="x-axis" [style.--num-columns]="labels.length">
      @for (l of labels; track $index) {
        <div class="x-label">
          <span class="tick-mark"></span>
          <span class="tick-label">{{ l }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .x-axis {
      display: grid;
      grid-template-columns: repeat(var(--num-columns), 1fr);
      gap: calc(var(--bar-gap, 0px) + 1cqi);
      color: var(--axis-text, #444);
      font-size: var(--axis-font-size, 12px);
      container-type: inline-size;

      padding-inline: var(--plot-padding-inline, 8px);
    }

    .x-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      min-height: 2em;
    }

    .tick-mark {
      display: var(--show-tick-marks, block);
      position: absolute;
      top: -8px;
      left: 50%;
      width: 1px;
      height: var(--tick-mark-length, 4px);
      background: var(--grid-line-color, #999);
    }

    .tick-label {
      position: absolute;
      width: auto;
      transform-origin: center top;
      transform: rotate(var(--x-label-rotate, 0deg));
      /*white-space: nowrap;
      overflow: hidden;
      text-overflow: clip;*/
    }

    /* Responsive label rotation using container queries */
    @container chart (max-width: 400px) {
      .tick-label {
        transform: translateX(50%) rotate(45deg);
        transform-origin: left top;
      }
    }

    @container chart (max-width: 300px) {
      .tick-label {
        transform: translateX(80%) rotate(90deg);  
        transform-origin: left top;
      }
    }
  `]
})
export class ChartXAxisComponent {
  @Input({ required: true }) labels!: string[];
}
