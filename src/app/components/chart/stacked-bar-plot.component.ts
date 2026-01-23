/**
 * Stacked Bars (any number of datasets), one column per label.
 *
 * Connections:
 *   - receives data + maxValue + colorForSeries explicitly from parent
 *   - uses stackedTotals() to scale column heights
 */

import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {ChartData, ChartScaleInputs, ColorForSeries} from './chart-types';
import {computeMaxValue, stackedTotals} from './chart-utils';

interface StackedColumn {
  total: number;
  segments: Array<{ value: number; name: string }>;
}

@Component({
  selector: 'app-stacked-bar-plot',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stacked-bars" [style.--num-columns]="columns.length"
         [style.--max-total]="maxTotal"
         [style.--max-value]="maxValue">
      @for (col of columns; track $index; ) {
        <div class="bar-column"
             [attr.aria-label]="col.total | number:'1.0-0'"
             [style.--column-total]="col.total">

          @for (seg of col.segments; track seg.name; let s = $index) {
            <div class="segment"
                 [attr.aria-label]="seg.value | number:'1.0-0'"
                 [attr.data-name]="seg.name"
                 [style.--value]="seg.value"
                 [style.--series-color]="seriesColor(seg.name, s)">
              @if (showValues && seg.value > 0) {
                {{ seg.value | number:'1.0-0' }}
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Plot-Root fills the ChartShell plot grid cells */
    .stacked-bars {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      /* Height of bar-area is fraction ot total height as total height is rounded up by computeMaxValue */
      height: calc((var(--max-total) / var(--max-value)) * 100%);
      display: grid;
      grid-template-columns: repeat(var(--num-columns, 1), 1fr);
      gap: calc(var(--bar-gap, 0px) + 1cqi);
      padding-inline: var(--plot-padding-inline, 8px);
      container-type: inline-size;
    }

    .bar-column {
      display: flex;
      flex-direction: column-reverse; /* Stack from bottom to top naturally */
      align-items: stretch;
      height: calc((var(--column-total) / var(--max-total)) * 100%);
      align-self: flex-end; /* Align column to bottom of container */

      .segment {
        flex: 0 0 calc((var(--value) / var(--column-total)) * 100%);
        opacity: 1;
        transition-duration: 0.2s;
        transition-timing-function: ease-in-out;
        transition-property: flex-basis, opacity;
        @starting-style {
          flex-basis: 0;
          opacity: 0;
        }

        background: var(--series-color);
        display: grid;
        place-items: center;
        font-size: var(--segment-font-size, 11px);
        color: var(--segment-text, rgba(255, 255, 255, .92));
        line-height: 1;
        min-height: 0;

        &:first-child {
          margin-bottom: 0;
        }
      }
    }


  `]
})
export class StackedBarPlotComponent implements OnChanges {
  /** Data in standard format */
  @Input({required: true}) data!: ChartData;


  /** Scale inputs: maxValue/ticks overrides, tickCount, 20% rule */
  @Input() scale?: ChartScaleInputs;

  /** Color generator function (seriesName, seriesIndex) => color */
  @Input() colorForSeries?: ColorForSeries;

  /** Show values in segments? (screenshot: left yes, right more no) */
  @Input() showValues = false;

  columns: StackedColumn[] = [];
  maxTotal = 1;

  /**
   * computex max value of the axis (might be more than max because of rounding)
   */
  maxValue = 1;

  ngOnChanges(): void {
    if (!this.data) return;

    const totals = stackedTotals(this.data);
    this.columns = totals.map((total, i) => ({
      total,
      segments: this.data.datasets.map((ds, _dsIndex) => ({
        value: Number.isFinite(ds.values[i]) ? ds.values[i] : 0,
        name: ds.name
      }))
    }));
    this.maxTotal = Math.max(1, ...totals);


    this.maxValue = computeMaxValue(this.maxTotal, this.scale);
  }

  seriesColor(seriesName: string, seriesIndex: number): string {
    // Generator wins; otherwise fallback to CSS vars (--series-1, --series-2, ...)
    return this.colorForSeries
      ? this.colorForSeries(seriesName, seriesIndex)
      : `var(--series-${seriesIndex + 1})`;
  }
}
