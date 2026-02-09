import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartComponent} from '../base-chart';
import {BestandKostenRow} from '../../models/data.model';
import kostenData from '../../../data/Kosten.json';
import keineAntriebswendeData from '../../../data/KeineAntriebswende.json';
import {ALL_SIZE_CLASSES, getBestandKostenLegendOrder, getBestandKostenStackOrder} from '../../utils/color.util';
import {LineChartData} from '../chart/chart-types';
import {computeMaxValue, stackedTotals} from '../chart/chart-utils';

@Component({
  selector: 'app-kosten-chart',
  standalone: false,
  templateUrl: './kosten-chart.component.html', styles: `
    :host {
      display: contents;
      --series-1: #0a3b46;
    }

    .chart-node {
      grid-area: var(--chart-area);
      page-break-inside: avoid;
    }

    .legend-node {
      grid-area: var(--legend-area);
    }

    .reference-line {
      --line-stroke-dasharray: 4px 4px;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class KostenChartComponent extends BaseChartComponent {
  readonly dataSource = kostenData as BestandKostenRow[];
  readonly dataKey = 'Kosten' as const;
  readonly title = 'Kosten';
  readonly unitDivisor = 1_000_000_000;
  readonly unitLabel = 'in Mrd. €';

  // Reference line data
  referenceLineData: LineChartData = {datasets: []};
  maxValue = 1;
  lineMinX = 2025; // Default, but is overriden by bar chart data
  lineMaxX = 2045;

  protected getSeriesOrder(seriesName: string): number {
    return getBestandKostenStackOrder(seriesName);
  }

  protected getLegendOrder(seriesName: string): number {
    return getBestandKostenLegendOrder(seriesName);
  }

  protected override updateChart(): void {
    super.updateChart();

    // Create reference line first
    this.createReferenceLine();

    // Calculate maxValue from BOTH datasets (bar chart + line chart)
    if (this.chartData.datasets.length > 0) {
      // Get max from bar chart (stacked totals)
      const barMax = Math.max(...(stackedTotals(this.chartData)));

      // Get max from line chart
      let lineMax = 0;
      if (this.referenceLineData.datasets.length > 0) {
        const lineValues = this.referenceLineData.datasets.flatMap(ds =>
          ds.points.map(p => p.y)
        );
        lineMax = Math.max(...lineValues, 0);
      }

      // Use maximum of both
      this.maxValue = computeMaxValue(Math.max(barMax, lineMax), {tickCount: 6});
    }
  }

  private createReferenceLine(): void {
    if (this.chartData.labels.length === 0) {
      this.referenceLineData = {datasets: []};
      return;
    }

    // Get X-axis range from bar chart labels (labels of bars are the years)
    const barYears = this.chartData.labels.map(label => {
      const parsed = parseInt(label);
      return isNaN(parsed) ? 0 : parsed;
    }).filter(y => y > 0);

    // TODO can maybe simplified, when data source has already the same range
    this.lineMinX = Math.min(...barYears);
    this.lineMaxX = Math.max(...barYears);

    // Load reference data and filter by selected size classes
    const referenceData = keineAntriebswendeData as Array<{Groessenklasse: string, Jahr: string, Kosten: number}>;
    const sizeClasses = this.scenarioState.chartSizeClass$.value;

    // Filter by size class (same logic as bar chart data)
    let filteredData = referenceData;
    const shouldFilter = !sizeClasses.includes(ALL_SIZE_CLASSES);
    if (shouldFilter) {
      filteredData = referenceData.filter(row => sizeClasses.includes(row.Groessenklasse));
    }

    // Group by year and sum costs
    const yearTotals = new Map<string, number>();
    filteredData.forEach(row => {
      const existing = yearTotals.get(row.Jahr) || 0;
      yearTotals.set(row.Jahr, existing + row.Kosten);
    });

    // Create points from aggregated data
    const points = Array.from(yearTotals.entries())
      .map(([jahr, kosten]) => ({
        x: parseInt(jahr),
        y: kosten / this.unitDivisor,
        label: jahr,
        value: kosten / this.unitDivisor
      }))
      .sort((a, b) => a.x - b.x);

    this.referenceLineData = {
      datasets: [{
        name: 'Keine Antriebswende',
        points: points
      }]
    };
  }

  valueFormatter = (value: number): string => {
    return value.toFixed(1) + ' Mrd. €';
  };

  /**
   * Show only ref line legend for this chart
   */
  protected override updateLegend(_seriesNames: string[]) {
    // Create legend for bar chart data
    // super.updateLegend(seriesNames);

    // Add reference line to legend
    if (this.referenceLineData.datasets.length > 0) {
      this.legendGroups.push(
        this.referenceLineData.datasets.map((ds, index) => ({
          name: ds.name,
          color: this.colorForSeries(ds.name, index),
          type: 'dashed-line' as const
        }))
      );
    }
  }
}
