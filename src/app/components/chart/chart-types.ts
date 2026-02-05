/**
 * chart-types.ts
 * Common types for ChartShell + Plot-Renderer to work together.
 */

export type ChartData = {
  labels: string[];
  datasets: Array<{ name: string; values: number[] }>;
};

/**
 * Line chart data with explicit X/Y coordinates
 * Used for line plots where X values are not evenly spaced categories
 */
export type LineChartData = {
  datasets: Array<{
    name: string;
    points: Array<{
      x: number;              // X coordinate in data space (e.g., year)
      y: number;              // Y coordinate in data space (e.g., value)
      label?: string;         // Original label for tooltip (e.g., "2025")
      value?: number;         // Original value before transformation (for tooltip)
    }>;
  }>;
};

export type ColorForIndex = (seriesIndex: number) => string;

export type ColorForSeries = (seriesName: string, seriesIndex: number) => string;

export type TickLabelFormatter = (value: number, tickIndex: number) => string;

export type GridLineVisible =
  | boolean
  | ((tickValue: number, tickIndex: number, ticks: number[]) => boolean);

export type ChartScaleInputs = {
  /** Optional: maxValue hart setzen (wird sonst berechnet). */
  maxValue?: number;

  /** Optional: ticks hart setzen (wird sonst berechnet). */
  ticks?: number[];

  /** Default: 5 */
  tickCount?: number;

  /**
   * Default: 1.2 (maxValue soll nicht mehr als 20% über dem Daten-Max liegen)
   * Wird nur für auto-max verwendet.
   */
  maxOverageRatio?: number;

  /** Optional: Minimum X value for line charts (e.g., start year) */
  minX?: number;

  /** Optional: Maximum X value for line charts (e.g., end year) */
  maxX?: number;
};

export type ChartFormatInputs = {
  /** Wie die Tick-Labels gerendert werden. Default: String(value). */
  tickLabel?: TickLabelFormatter;

  /**
   * Sichtbarkeit von Hilfslinien (gridlines).
   * - true/false oder Funktion pro Tick
   */
  gridLineVisible?: GridLineVisible;
};
