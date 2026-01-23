/**
 * chart-types.ts
 * Common types for ChartShell + Plot-Renderer to work together.
 */

export type ChartData = {
  labels: string[];
  datasets: Array<{ name: string; values: number[] }>;
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
