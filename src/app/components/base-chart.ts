import {Directive, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {ScenarioStateService} from '../services/scenario-state.service';
import {DataRow, hasGroessenklasse, hasKomponente} from '../models/data.model';
import {ALL_SIZE_CLASSES, getChartColor} from '../utils/color.util';
import {LegendItem} from './chart-legend/chart-legend.component';
import {ChartData, ColorForSeries} from './chart/chart-types';
import {combineLatest, Subscription} from 'rxjs';

@Directive()
export abstract class BaseChartComponent implements OnInit, OnDestroy {
  @Input() height: number = 300;

  protected scenarioState = inject(ScenarioStateService);

  protected subscriptions: Subscription[] = [];

  // Chart data for template binding
  chartData: ChartData = { labels: [], datasets: [] };
  legendGroups: Array<Array<LegendItem>> = [];

  // Color function for the chart
  colorForSeries: ColorForSeries = (seriesName: string, index: number) => {
    return getChartColor(seriesName, index);
  };

  // Abstract properties that child components must provide
  abstract readonly dataSource: DataRow[];
  abstract readonly dataKey: string;
  abstract readonly title: string;
  abstract readonly unitDivisor: number;
  abstract readonly unitLabel: string;
  // Override this in THG chart to skip size class filtering
  protected useSizeClassFilter = true;

  // Abstract methods for sorting
  protected abstract getSeriesOrder(seriesName: string): number;
  protected abstract getLegendOrder(seriesName: string): number;

  ngOnInit(): void {
    // Initial load
    this.updateChart();

    // Subscribe to state changes
    this.subscriptions.push(
      combineLatest([
        this.scenarioState.scenario$,
        this.scenarioState.chartSizeClass$
      ]).subscribe(() => {
        this.updateChart();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  protected updateChart(): void {
    const scenario = this.scenarioState.scenario$.value;
    const sizeClasses = this.scenarioState.chartSizeClass$.value;

    // Use directly imported data
    const chartData = this.transformData(this.dataSource, scenario, sizeClasses);
    this.renderChart(chartData);
  }

  /**
   * Transform new data format (long format) to chart format
   * New format: [{Szenario, Groessenklasse, Technologie/Komponente, Jahr, Value}]
   * Chart format: {labels: ['25, '26, ...], datasets: [{name, values}]}
   */
  private transformData(
    rawData: DataRow[],
    scenario: string,
    sizeClasses: string[]
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // Filter by scenario
    let filtered = rawData.filter(row => row.Szenario === scenario);

    // THG-specific transformations
    if (this.dataKey === 'THG') {
      filtered = filtered.map(row => {
        if (hasKomponente(row)) {
          // Rename "Energie X" → "Energie_WTT X" for all technologies
          const komponente = row.Komponente
            .replace('Energie Diesel', 'Energie_WTT Diesel')
            //.replace('Energie BEV', 'Energie_WTT BEV')
            //.replace('Energie BWS-BEV', 'Energie_WTT BWS-BEV')
            //.replace('Energie OL-BEV', 'Energie_WTT OL-BEV')
            //.replace('Energie FCEV', 'Energie_WTT FCEV')
            ;
          return { ...row, Komponente: komponente };
        }
        return row;
      });
    }

    // Determine key names based on data structure
    const dataKey = this.dataKey; // 'Bestand', 'Kosten', or 'THG'
    const hasSizeClass = filtered.length > 0 && hasGroessenklasse(filtered[0]);

    // Filter by size classes (only for Bestand/Kosten, not THG)
    // ALL_SIZE_CLASSES means no filtering (include all available)
    if (hasSizeClass && this.useSizeClassFilter) {
      const shouldFilter = !sizeClasses.includes(ALL_SIZE_CLASSES);
      if (shouldFilter) {
        filtered = filtered.filter(row => {
          if (hasGroessenklasse(row)) {
            return sizeClasses.includes(row.Groessenklasse);
          }
          return false;
        });
      }
    }

    // Get unique years (sorted)
    const years = [...new Set(filtered.map(row => row.Jahr))].sort();
    // Show only years divisible by 5 (2025, 2030, 2035, 2040, 2045)
    const labels = years.map(year => {
      const yearNum = parseInt(year);
      return yearNum % 5 === 0 ? year : '';
    });

    // Build datasets
    const datasetMap = new Map<string, number[]>();

    filtered.forEach(row => {
      // Get technology/component name with type safety
      let tech: string;
      if (hasGroessenklasse(row)) {
        tech = row.Technologie?.trim() || 'Unknown';
      } else {
        tech = row.Komponente?.trim() || 'Unknown';
      }

      const year = row.Jahr;

      // Get value from correct field with type safety
      let rawValue: string | undefined;
      if (hasGroessenklasse(row)) {
        rawValue = dataKey === 'Bestand' ? row.Bestand : row.Kosten;
      } else {
        rawValue = row.THG;
      }
      const value = parseFloat(rawValue || '0') / this.unitDivisor;

      // Create series name with size class suffix (if applicable)
      // Add suffix only when multiple specific size classes selected (not ALL_SIZE_CLASSES)
      let seriesName = tech;
      const hasAlleGK = sizeClasses.includes(ALL_SIZE_CLASSES);
      if (hasSizeClass && this.useSizeClassFilter && !hasAlleGK && sizeClasses.length > 1 && hasGroessenklasse(row)) {
        seriesName = `${tech} ${row.Groessenklasse}`;
      }

      // Initialize array if not exists
      if (!datasetMap.has(seriesName)) {
        datasetMap.set(seriesName, new Array(years.length).fill(0));
      }

      // Add value at correct year index
      const yearIndex = years.indexOf(year);
      if (yearIndex !== -1) {
        const existing = datasetMap.get(seriesName)!;
        existing[yearIndex] += value;
      }
    });

    // Convert to array and sort by technology
    let datasets = Array.from(datasetMap.entries()).map(([name, values]) => ({
      name,
      values
    }));

    datasets = this.sortDatasetsByTechnology(datasets);

    // Filter out technologies where ALL values are zero across all years
    datasets = datasets.filter(dataset => {
      return dataset.values.some(value => value !== 0);
    });

    return { labels, datasets };
  }

  private sortDatasetsByTechnology(datasets: Array<{name: string, values: number[]}>): Array<{name: string, values: number[]}> {
    return datasets.sort((a, b) => {
      const orderA = this.getSeriesOrder(a.name);
      const orderB = this.getSeriesOrder(b.name);

      // Sort by order first
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Fallback to alphabetical
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }

  private renderChart(
    chartData: { labels: string[], datasets: Array<{name: string, values: number[]}> }
  ): void {
    // Store chart data for template binding
    this.chartData = chartData;

    // Update legend
    this.updateLegend(chartData.datasets.map(d => d.name).reverse());
  }

  protected updateLegend(seriesNames: string[]): void {
    const legendGroupsArray: Array<Array<LegendItem>> = [];
    let currentGroup: Array<LegendItem> = [];
    let prevOrder = -1;

    seriesNames.forEach((name, index) => {
      const legendOrder = this.getLegendOrder(name);

      if (prevOrder !== -1 && legendOrder !== prevOrder) {
        // Start new group (different order)
        if (currentGroup.length > 0) {
          legendGroupsArray.push(currentGroup);
        }
        currentGroup = [];
      }

      currentGroup.push({
        name: name,
        color: getChartColor(name, index)
      });
      prevOrder = legendOrder;
    });

    // Push last group
    if (currentGroup.length > 0) {
      legendGroupsArray.push(currentGroup);
    }

    this.legendGroups = legendGroupsArray;
  }
}
