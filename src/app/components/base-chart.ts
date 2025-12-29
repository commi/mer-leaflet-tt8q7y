import { Directive, OnInit, OnDestroy, AfterViewInit, Input, ElementRef, inject } from '@angular/core';
import { Chart } from 'frappe-charts';
import { DataService } from '../services/data.service';
import { ScenarioStateService } from '../services/scenario-state.service';
import { ChartConfig } from '../models/chart-config.model';
import { getSeriesColor } from '../utils/color.util';
import { LegendItem } from './chart-legend/chart-legend.component';
import { Subscription, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Directive()
export abstract class BaseChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedSizeClasses: string[] = [];

  protected scenarioState = inject(ScenarioStateService);
  protected dataService = inject(DataService);

  protected chart?: Chart;
  protected subscriptions: Subscription[] = [];

  legendGroups: Array<Array<LegendItem>> = [];

  // Abstract properties that child components must provide
  abstract chartConfig: ChartConfig;
  abstract chartContainer: ElementRef<HTMLDivElement>;
  // Override this in THG chart to skip size class filtering
  protected useSizeClassFilter = true;

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.scenarioState.scenario$,
        this.scenarioState.chartSizeClass$
      ]).subscribe(() => {
        if (this.chart) {
          this.updateChart();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.updateChart();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.chart) {
      this.chart.destroy();
    }
  }

  protected updateChart(): void {
    const scenario = this.scenarioState.scenario$.value;
    const sizeClasses = this.scenarioState.chartSizeClass$.value;

    // Fetch single data file (new format: all data in one file)
    const filename = `/data/${this.chartConfig.dataSource}.json`;

    this.dataService.fetchJSON(filename).pipe(
      catchError(error => {
        console.warn(`Failed to load ${filename}:`, error);
        return of([]);
      })
    ).subscribe((data: any[]) => {
      const chartData = this.transformData(data, scenario, sizeClasses);
      this.renderChart(chartData);
    });
  }

  /**
   * Transform new data format (long format) to chart format
   * New format: [{Szenario, Groessenklasse, Technologie/Komponente, Jahr, Value}]
   * Chart format: {labels: ['25, '26, ...], datasets: [{name, values}]}
   */
  private transformData(
    rawData: any[],
    scenario: string,
    sizeClasses: string[]
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // Filter by scenario
    let filtered = rawData.filter(row => row.Szenario === scenario);

    // Determine key names based on data structure
    const dataKey = this.chartConfig.dataKey; // 'Bestand', 'Kosten', or 'THG'
    const hasSizeClass = filtered.length > 0 && 'Groessenklasse' in filtered[0];
    const techKey = hasSizeClass ? 'Technologie' : 'Komponente';

    // Filter by size classes (only for Bestand/Kosten, not THG)
    // "alle Größenklassen" means no filtering (include all available)
    if (hasSizeClass && this.useSizeClassFilter) {
      const shouldFilter = !sizeClasses.includes('alle Größenklassen');
      if (shouldFilter) {
        filtered = filtered.filter(row => sizeClasses.includes(row.Groessenklasse));
      }
    }

    // Get unique years (sorted)
    const years = [...new Set(filtered.map(row => row.Jahr))].sort();
    const labels = years.map(year => `'${year.toString().slice(-2)}`);

    // Build datasets
    const datasetMap = new Map<string, number[]>();

    filtered.forEach(row => {
      const tech = row[techKey]?.trim() || 'Unknown';
      const year = row.Jahr;
      const value = parseFloat(row[dataKey]) / this.chartConfig.unitDivisor;

      // Create series name with size class suffix (if applicable)
      // Add suffix only when multiple specific size classes selected (not "alle Größenklassen")
      let seriesName = tech;
      const hasAlleGK = sizeClasses.includes('alle Größenklassen');
      if (hasSizeClass && this.useSizeClassFilter && !hasAlleGK && sizeClasses.length > 1) {
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

    return { labels, datasets };
  }

  private sortDatasetsByTechnology(datasets: Array<{name: string, values: number[]}>): Array<{name: string, values: number[]}> {
    const getTechOrder = (name: string): number => {
      // Split by underscore to remove size class suffix
      const baseName = name.split('_')[0].trim();

      // IMPORTANT: Check most specific prefixes first!
      // Order: Diesel (0) → BEV (1) → BWS (2) → OL (3) → FCEV (4)
      if (baseName.includes('OL-BEV')) return 3;
      if (baseName.includes('BWS-BEV') || baseName.includes('BWS')) return 2;
      if (baseName.includes('BEV')) return 1;
      if (baseName.includes('FCEV') || baseName.includes('H2')) return 4;
      if (baseName.includes('Diesel')) return 0;

      return 999; // Unknown
    };

    return datasets.sort((a, b) => {
      const orderA = getTechOrder(a.name);
      const orderB = getTechOrder(b.name);

      // Sort by technology order first
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Within same technology, sort by series name
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }

  private renderChart(
    chartData: { labels: string[], datasets: Array<{name: string, values: number[]}> }
  ): void {

    if (!this.chartContainer) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Create new chart
    this.chart = new Chart(this.chartContainer.nativeElement, {
      title: `${this.chartConfig.title} nach Fahrzeugtyp`,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      type: 'bar',
      barOptions: {
        stacked: true,
        spaceRatio: 0.5
      },
      height: 300,
      colors: chartData.datasets.map(d => getSeriesColor(d.name)),
      axisOptions: {
        xAxisMode: 'tick',
        xIsSeries: false
      }
    });

    // Update legend
    this.updateLegend(chartData.datasets.map(d => d.name));
  }

  private updateLegend(seriesNames: string[]): void {
    // Group by technology using same logic as sortDatasetsByTechnology
    const getTechOrder = (name: string): number => {
      const baseName = name.split('_')[0].trim();

      // IMPORTANT: Check most specific prefixes first!
      if (baseName.includes('OL-BEV')) return 3;
      if (baseName.includes('BWS-BEV') || baseName.includes('BWS')) return 2;
      if (baseName.includes('BEV')) return 1;
      if (baseName.includes('FCEV') || baseName.includes('H2')) return 4;
      if (baseName.includes('Diesel')) return 0;

      return 999;
    };

    const legendGroupsArray: Array<Array<LegendItem>> = [];
    let currentGroup: Array<LegendItem> = [];
    let prevOrder = -1;

    seriesNames.forEach(name => {
      const techOrder = getTechOrder(name);

      if (prevOrder !== -1 && techOrder !== prevOrder) {
        // Start new group (different technology)
        if (currentGroup.length > 0) {
          legendGroupsArray.push(currentGroup);
        }
        currentGroup = [];
      }

      currentGroup.push({
        name: name,
        color: getSeriesColor(name)
      });
      prevOrder = techOrder;
    });

    // Push last group
    if (currentGroup.length > 0) {
      legendGroupsArray.push(currentGroup);
    }

    this.legendGroups = legendGroupsArray;
  }
}
