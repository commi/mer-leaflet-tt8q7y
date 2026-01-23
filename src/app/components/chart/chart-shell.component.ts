/**
 * Chart scaffold: Title + Y-Axis + Plot-Area + Grid + X-Axis
 *
 * Connections:
 *   - renders child components (YAxis, GridLines, XAxis)
 *   - projects Plot-Renderer via <ng-content select="[plot]">
 */

import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ChartData, ChartFormatInputs, ChartScaleInputs} from './chart-types';
import {assertChartData, computeMaxValue, computeTicks, maxOfData, stackedTotals} from './chart-utils';

@Component({
  selector: 'app-chart-shell',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title) {
      <div class="chart-title">{{ title }}</div>
    }

    <div class="chart">
      <!-- Y-Axis -->
      <app-chart-y-axis
        [ticks]="ticks"
        [maxValue]="maxValue"
        [tickLabel]="fmt?.tickLabel">
      </app-chart-y-axis>

      <!-- Plot-Area -->
      <div class="plot">
        <app-chart-grid-lines
          [ticks]="ticks"
          [maxValue]="maxValue"
          [gridLineVisible]="fmt?.gridLineVisible">
        </app-chart-grid-lines>

        <!-- Plot-Renderer comes from outside (stacked-bar-plot / line-plot / ...) -->
        <ng-content></ng-content>
      </div>

      <!-- Spacer (so x-axis aligns under plot like in HTML) -->
      <div></div>

      <!-- X-Axis -->
      <app-chart-x-axis [labels]="data.labels"
                        [style.--num-columns]="data.labels.length"></app-chart-x-axis>
    </div>
  `,
  styles: [`
    :host {
      display: grid;
      gap: 10px;
      container-type: inline-size;
      container-name: chart;
      page-break-inside: avoid;
      
      /* Defaults: can be overridden externally */
      --axis-text: #444;
      --axis-font-size: 12px;
      --grid-line-color: rgba(0,0,0,.10);
      --bar-gap: 3px;

      /* Default series colors (fallback if no generator used) */
      --series-1: #0a3b46;
      --series-2: #d9d300;
      --series-3: #4f6b74;
      --series-4: #274650;
      --series-5: #f0e88b;
      --series-6: #aeb8bc;
    }

    .chart-title {
      font-weight: 600;
      color: var(--title-color, #111);
    }

    /* 2 columns: y-axis | plot ; 2 rows: plot-row | x-axis-row */
    .chart {
      display: grid;
      grid-template-columns: var(--y-axis-width, 56px) 1fr;
      grid-template-rows: 1fr var(--x-axis-height, 32px);
      gap: 8px 12px;
      align-items: stretch;
    }

    .plot {
      position: relative;
      min-height: var(--plot-min-height, 220px);
      display: flex;
      align-items: flex-end;
      background: var(--plot-bg, transparent);
    }

    /* so x-axis sits in 2nd column */
    .chart app-chart-x-axis { grid-column: 2; }
  `]
})
export class ChartShellComponent implements OnChanges {
  @Input({ required: true }) data!: ChartData;

  /** Title at top left */
  @Input() title?: string;

  /** Scale inputs: maxValue/ticks overrides, tickCount, 20% rule */
  @Input() scale?: ChartScaleInputs;

  /** Formatting: tickLabel + gridLineVisible */
  @Input() fmt?: ChartFormatInputs;

  /** Use stacked totals for max value calculation (for stacked bar charts) */
  @Input() useStackedMax = true;

  /** Calculated output of shell -> passed to axes/grid/plots */
  maxValue = 1;
  ticks: number[] = [0, 1];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      assertChartData(this.data);
    }

    if (this.data) {
      // For stacked bars, use stacked totals for max; otherwise use raw max
      const m = this.useStackedMax
        ? Math.max(...stackedTotals(this.data))
        : maxOfData(this.data);
      this.maxValue = computeMaxValue(m, this.scale);
      this.ticks = computeTicks(this.maxValue, this.scale);
    }
  }
}
