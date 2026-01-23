/**
 * chart-utils.ts
 * Scaling + Ticks + Validation for charts.
 *
 * Connections:
 *   ChartShell -> computeMaxValue/computeTicks
 *   StackedBarPlot -> stackedTotals
 */

import {ChartData, ChartScaleInputs} from './chart-types';

export function assertChartData(data: ChartData): void {
  if (!data?.labels?.length) throw new Error('ChartData.labels must be non-empty');
  if (!data?.datasets?.length) throw new Error('ChartData.datasets must be non-empty');

  for (const ds of data.datasets) {
    if (ds.values.length !== data.labels.length) {
      throw new Error(`Dataset "${ds.name}" values length must match labels length`);
    }
  }
}

export function maxOfData(data: ChartData): number {
  let max = 0;
  for (const ds of data.datasets) {
    for (const v of ds.values) {
      if (Number.isFinite(v)) max = Math.max(max, v);
    }
  }
  return max;
}

export function stackedTotals(data: ChartData): number[] {
  const totals = new Array(data.labels.length).fill(0);
  for (const ds of data.datasets) {
    for (let i = 0; i < ds.values.length; i++) {
      const v = ds.values[i];
      totals[i] += Number.isFinite(v) ? v : 0;
    }
  }
  return totals;
}

/**
 * Auto-Max Rule:
 * - "clever" / "round"
 * - not more than 20% (default) over data max
 * - can be overridden via maxValue
 */
export function computeMaxValue(dataMax: number, scale?: ChartScaleInputs): number {
  if (!Number.isFinite(dataMax) || dataMax <= 0) return 1;

  // Override has priority
  if (Number.isFinite(scale?.maxValue as number)) return Math.max(1, scale!.maxValue!);

  const ratio = scale?.maxOverageRatio ?? 1.2;
  const cap = dataMax * ratio;

  const nice = niceCeil(dataMax); // round to 1/2/5*10^k
  if (nice <= cap) return nice;

  // Fallback: "fewest significant digits" rounded up
  const round = roundUpFewSigDigits(dataMax);
  if (round <= cap) return round;

  // If both exceed 20% rule: exact data max (so no gap)
  return dataMax;
}

export function computeTicks(maxValue: number, scale?: ChartScaleInputs): number[] {
  if (scale?.ticks?.length) return scale.ticks;

  const tickCount = Math.max(2, scale?.tickCount ?? 5);
  const rawStep = maxValue / (tickCount - 1);
  const step = niceCeil(rawStep);

  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) ticks.push(i * step);

  // Ensure last tick >= maxValue
  if (ticks[ticks.length - 1] < maxValue) ticks[ticks.length - 1] = niceCeil(maxValue);

  return ticks;
}

/** 1/2/5*10^k ceiling */
export function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const f = value / base;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * base;
}

/** "fewest significant digits" (637 -> 700, 134 -> 140, 19 -> 20) */
export function roundUpFewSigDigits(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const lead = Math.ceil(value / base);
  return lead * base;
}
