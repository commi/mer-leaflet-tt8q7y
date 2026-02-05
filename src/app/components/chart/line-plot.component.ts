/**
 * Line Plot Component
 *
 * Renders multiple lines with optional points/markers
 * Can be combined with other plots (e.g., stacked-bar-plot) within chart-shell
 */

import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {ChartScaleInputs, LineChartData} from './chart-types';

interface LinePoint {
  x: number;      // percentage 0-100 (for SVG positioning)
  y: number;      // percentage 0-100 (inverted: 0=top, 100=bottom)
  xCoord: number; // original X coordinate (e.g., year 2025)
  yCoord: number; // original Y coordinate (e.g., value)
  label?: string; // original x label (e.g., "2025")
  value?: number; // original y value for tooltips
}

interface Line {
  name: string;
  points: LinePoint[];
  segments: string[];  // Multiple path segments (SVG polyline points strings)
}

@Component({
  selector: 'app-line-plot',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- SVG for line paths with viewBox for coordinate transformation -->
    <svg class="lines-svg"
         viewBox="0 0 100 100"
         preserveAspectRatio="none">
      @for (line of lines; track $index; let lineIdx = $index) {
        <!-- Render each segment of the line (allows gaps) -->
        @for (points of line.segments; track $index; let segIdx = $index) {
          <polyline
            class="line"
            [attr.points]="points"
            [attr.data-series-name]="line.name"
            [attr.data-series-index]="lineIdx"
            [attr.data-segment-index]="segIdx">
          </polyline>
        }
      }
    </svg>

    <!-- HTML elements for points -->
    @if (showPoints) {
      @for (line of lines; track $index; let lineIdx = $index) {
        @for (point of line.points; track $index; let ptIdx = $index) {
          <div class="point"
               [style.left.%]="point.x"
               [style.top.%]="point.y"
               [attr.data-series-name]="line.name"
               [attr.data-series-index]="lineIdx"
               [attr.data-point-index]="ptIdx">

            <!-- Tooltip -->
            <div class="point-tooltip">
              <strong>{{ line.name }}</strong><br>
              @if (point.label) {
                {{ point.label }}<br>
              }
              {{ valueFormatter ? valueFormatter(point.value ?? point.yCoord) : (point.value ?? point.yCoord) }}
            </div>
          </div>
        }
      }
    }
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
    }

    .lines-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    .line {
      fill: none;
      /* Stroke color from CSS */
      stroke: var(--line-color, var(--series-1));
      stroke-width: var(--line-width, 2px);
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
      stroke-dasharray: var(--line-stroke-dasharray, none);
      opacity: 1;
      pointer-events: fill;
    }

    /* Fallback colors by index */
    [data-series-index="0"] {
      --line-color: var(--series-1);
    }

    [data-series-index="1"] {
      --line-color: var(--series-2);
    }

    [data-series-index="2"] {
      --line-color: var(--series-3);
    }

    [data-series-index="3"] {
      --line-color: var(--series-4);
    }

    [data-series-index="4"] {
      --line-color: var(--series-5);
    }

    [data-series-index="5"] {
      --line-color: var(--series-6);
    }

    /* Points (HTML divs, absolutely positioned) */
    .point {
      position: absolute;
      width: var(--point-size, 8px);
      height: var(--point-size, 8px);
      transform: translate(-50%, -50%);
      background: var(--point-color, var(--series-1));
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      z-index: 10;
      transition: width 0.2s ease-in-out, height 0.2s ease-in-out;

      &:hover {
        width: calc(var(--point-size, 8px) * 1.4);
        height: calc(var(--point-size, 8px) * 1.4);
      }

      /* Fallback colors by index */

      &[data-series-index="0"] {
        --point-color: var(--series-1);
      }

      &[data-series-index="1"] {
        --point-color: var(--series-2);
      }

      &[data-series-index="2"] {
        --point-color: var(--series-3);
      }

      &[data-series-index="3"] {
        --point-color: var(--series-4);
      }

      &[data-series-index="4"] {
        --point-color: var(--series-5);
      }

      &[data-series-index="5"] {
        --point-color: var(--series-6);
      }

      /* Tooltip */
      .point-tooltip {
        --tooltip-offset-y: 8px;
        --tooltip-transition: var(--transition-base, 0.2s ease-in-out);

        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-block-end: var(--tooltip-margin, 6px);
        text-align: center;

        display: flex;
        flex-direction: column;
        align-items: center;

        background: var(--tooltip-bg, rgba(0, 0, 0, 0.9));
        color: var(--tooltip-color, var(--white, white));
        padding: var(--tooltip-padding-y, 8px) var(--tooltip-padding-x, 12px);
        border-radius: var(--tooltip-border-radius, 6px);
        font-size: var(--tooltip-font-size, 12px);
        line-height: var(--body-line-height, 1.4);
        white-space: nowrap;
        pointer-events: none;
        z-index: var(--tooltip-zindex, 1000);

        opacity: 0;
        translate: -50% calc(var(--tooltip-offset-y) * -1);
        visibility: hidden;

        transition: opacity var(--tooltip-transition),
        visibility var(--tooltip-transition),
        translate var(--tooltip-transition);
        transition-behavior: allow-discrete;

        @starting-style {
          translate: -50% calc(var(--tooltip-offset-y) * -1);
          opacity: 0;
        }

        /* Arrow pointing down */
        &::after {
          content: '';
          position: absolute;
          bottom: calc(1px - var(--tooltip-arrow-width, 6px));
          left: 50%;
          translate: -50% 0;
          border: calc(var(--tooltip-arrow-width, 6px) * 0.5) solid transparent;
          border-top-color: var(--tooltip-bg, rgba(0, 0, 0, 0.9));
        }
      }

      /* Show tooltip on hover */
      &:hover .point-tooltip {
        opacity: 1;
        translate: -50% 0;
        visibility: visible;
      }
    }
  `]
})
export class LinePlotComponent implements OnChanges {
  @Input({required: true}) data!: LineChartData;
  @Input() showPoints = true;
  @Input() valueFormatter?: (value: number) => string;

  /** Scale configuration (maxValue, minX, maxX) */
  @Input() scale?: ChartScaleInputs;

  /** @deprecated Use scale.maxValue instead */
  @Input() maxValue = 1;

  /** @deprecated Use scale.minX instead */
  @Input() minX = 0;

  /** @deprecated Use scale.maxX instead */
  @Input() maxX = 1;

  lines: Line[] = [];

  // Computed values
  private _maxValue = 1;
  private _minX = 0;
  private _maxX = 1;

  ngOnChanges(): void {
    if (!this.data) return;

    // Use scale values if provided, otherwise fall back to direct inputs
    this._maxValue = this.scale?.maxValue ?? this.maxValue;
    this._minX = this.scale?.minX ?? this.minX;
    this._maxX = this.scale?.maxX ?? this.maxX;

    this.transformData();
  }

  private transformData(): void {
    if (!this.data || this.data.datasets.length === 0) return;

    const xRange = this._maxX - this._minX;

    // Transform datasets to lines with percentage positions
    // Input: LineChartData with points[{x, y, label?, value?}]
    // Output: Lines with percentage positions for SVG rendering
    this.lines = this.data.datasets.map(dataset => {
      const points: LinePoint[] = dataset.points.map(point => {
        // X position as percentage (map from minX..maxX to 0..100%)
        const x = xRange > 0 ? ((point.x - this._minX) / xRange) * 100 : 50;

        // Y position as percentage (inverted: 0=top, 100=bottom)
        const y = 100 - (point.y / this._maxValue) * 100;

        return {
          x,
          y,
          xCoord: point.x,
          yCoord: point.y,
          label: point.label,
          value: point.value
        };
      });

      // Build segments
      // create one segment per dataset
      const segments: string[] = [];

      if (points.length > 0) {
        segments.push(points.map(p => `${p.x},${p.y}`).join(' '));
      }

      return {
        name: dataset.name,
        points,
        segments
      };
    });
  }
}
