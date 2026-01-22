import { Directive, OnInit, OnDestroy, AfterViewInit, Input, ElementRef, inject } from '@angular/core';
import { Chart } from 'frappe-charts';
import { DataService } from '../services/data.service';
import { ScenarioStateService } from '../services/scenario-state.service';
import { ChartConfig } from '../models/chart-config.model';
import { DataRow, hasGroessenklasse, hasKomponente } from '../models/data.model';
import { getChartColor, ALL_SIZE_CLASSES } from '../utils/color.util';
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
    // Use relative path to respect base-href
    const filename = `data/${this.chartConfig.dataSource}.json`;

    this.dataService.fetchJSON<DataRow[]>(filename).pipe(
      catchError(error => {
        console.warn(`Failed to load ${filename}:`, error);
        return of<DataRow[]>([]);
      })
    ).subscribe(data => {
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
    rawData: DataRow[],
    scenario: string,
    sizeClasses: string[]
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // Filter by scenario
    let filtered = rawData.filter(row => row.Szenario === scenario);

    // THG-specific transformations
    if (this.chartConfig.id === 'thg') {
      filtered = filtered.map(row => {
        if (hasKomponente(row)) {
          // Rename "Energie X" → "Energie_WTT X" for all technologies
          const komponente = row.Komponente
            .replace('Energie Diesel', 'Energie_WTT Diesel')
            .replace('Energie BEV', 'Energie_WTT BEV')
            .replace('Energie BWS-BEV', 'Energie_WTT BWS-BEV')
            .replace('Energie OL-BEV', 'Energie_WTT OL-BEV')
            .replace('Energie FCEV', 'Energie_WTT FCEV');
          return { ...row, Komponente: komponente };
        }
        return row;
      }).filter(row => {
        // Filter out always-zero Infrastruktur components
        if (hasKomponente(row)) {
          const comp = row.Komponente || '';
          return !comp.includes('Infrastruktur FCEV') &&
                 !comp.includes('Infrastruktur BWS-BEV');
        }
        return true;
      });
    }

    // Determine key names based on data structure
    const dataKey = this.chartConfig.dataKey; // 'Bestand', 'Kosten', or 'THG'
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
    const labels = years.map(year => `'${year.toString().slice(-2)}`);

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
      const value = parseFloat(rawValue || '0') / this.chartConfig.unitDivisor;

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
    const getTechOrder = (name: string): number => {
      // Split by underscore to remove size class suffix
      const baseName = name.split('_')[0].trim();

      // IMPORTANT: Check most specific prefixes first!
      // Order: BEV (0, bottom) → FCEV (1) → OL (2) → BWS (3) → Diesel (4, top)
      if (baseName.includes('OL-BEV')) return 2;
      if (baseName.includes('BWS-BEV') || baseName.includes('BWS')) return 3;
      if (baseName.includes('BEV')) return 0;
      if (baseName.includes('FCEV') || baseName.includes('H2')) return 1;
      if (baseName.includes('Diesel')) return 4;

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
      title: `${this.chartConfig.title} ${this.chartConfig.unitLabel}`,
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
      colors: chartData.datasets.map(d => getChartColor(d.name, this.selectedSizeClasses)),
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
        color: getChartColor(name, this.selectedSizeClasses)
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
