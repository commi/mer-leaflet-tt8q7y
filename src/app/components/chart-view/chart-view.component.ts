import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, inject } from '@angular/core';
import { Chart } from 'frappe-charts';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { DataService } from '../../services/data.service';
import { CHART_CONFIGS, ChartConfig } from '../../models/chart-config.model';
import { getSeriesColor, SIZE_CLASSES } from '../../utils/color.util';
import { Subscription, combineLatest, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `
    .chart-container {
      min-height: 300px;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class ChartViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bestandChartContainer') bestandContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('kostenChartContainer') kostenContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('thgChartContainer') thgContainer!: ElementRef<HTMLDivElement>;

  scenarioState = inject(ScenarioStateService);
  private dataService = inject(DataService);

  private charts = new Map<string, Chart>();
  private subscriptions: Subscription[] = [];

  chartConfigs = CHART_CONFIGS;
  sizeClasses = SIZE_CLASSES;

  legendGroupsByChart = new Map<string, Array<Array<{name: string, color: string}>>>();

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.scenarioState.scenario$,
        this.scenarioState.chartSizeClass$
      ]).subscribe(() => {
        CHART_CONFIGS.forEach(config => {
          this.updateChart(config);
        });
      })
    );
  }

  ngAfterViewInit(): void {
    CHART_CONFIGS.forEach(config => {
      this.updateChart(config);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.charts.forEach(chart => chart.destroy());
  }

  updateChart(config: ChartConfig): void {
    const scenario = this.scenarioState.scenario$.value;
    const sizeClasses = this.scenarioState.chartSizeClass$.value;

    // Fetch data for all selected size classes
    const requests = sizeClasses.map(sizeClass => {
      const filename = `/data/Bestand und Neuzulassungen/${scenario}/${config.dataSource} ${sizeClass}.json`;
      return this.dataService.fetchJSON(filename).pipe(
        map(data => ({ sizeClass, data })),
        catchError(error => {
          console.warn(`Failed to load ${filename}:`, error);
          return of({ sizeClass, data: null });
        })
      );
    });

    forkJoin(requests).subscribe(results => {
      const combinedData = this.combineMultiSizeClassData(results, config, sizeClasses);
      this.renderChart(config, combinedData);
    });
  }

  private combineMultiSizeClassData(
    results: Array<{sizeClass: string, data: any}>,
    config: ChartConfig,
    sizeClasses: string[]
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // If only "alle Größenklassen" selected, aggregate by technology (no suffix needed)
    if (sizeClasses.length === 1 && sizeClasses[0] === 'alle Größenklassen') {
      const result = results[0];
      if (!result.data) return { labels: [], datasets: [] };
      const extracted = this.extractChartData(result.data, config, null);

      // Aggregate by technology
      const techGroups = this.aggregateByTechnology(extracted.datasets);

      // Convert back to dataset format
      const datasets = techGroups.map(({ technology, values }) => ({
        name: technology,
        values
      }));

      // Sort by technology
      const sortedDatasets = this.sortDatasetsByTechnology(datasets);

      return {
        labels: extracted.labels,
        datasets: sortedDatasets
      };
    }

    // Multi-select: combine with suffixes and aggregate by technology
    const allLabels = new Set<string>();
    const datasetsByTechAndSize = new Map<string, number[]>();

    results.forEach(({ sizeClass, data }) => {
      if (!data || !Array.isArray(data) || data.length === 0) return;

      // Extract data WITHOUT suffix first
      const extracted = this.extractChartData(data, config, null);
      extracted.labels.forEach(label => allLabels.add(label));

      // Group by technology and aggregate values
      const techGroups = this.aggregateByTechnology(extracted.datasets);

      // Add suffix for size class
      techGroups.forEach(({ technology, values }) => {
        const seriesName = `${technology}_${sizeClass}`;
        datasetsByTechAndSize.set(seriesName, values);
      });
    });

    const labels = Array.from(allLabels).sort();
    let datasets = Array.from(datasetsByTechAndSize.entries()).map(([name, values]) => ({
      name,
      values
    }));

    // Sort by technology
    datasets = this.sortDatasetsByTechnology(datasets);

    return { labels, datasets };
  }

  /**
   * Aggregate datasets by technology group
   * All series with same technology are summed together:
   * - BEV100 + BEV200 + BEV300 → BEV
   * - Strom BEV + Fzg.-Herstellung BEV + Infrastruktur BEV → BEV
   * - Diesel + Fzg.-Herstellung Diesel → Diesel
   */
  private aggregateByTechnology(datasets: Array<{name: string, values: number[]}>): Array<{technology: string, values: number[]}> {
    const techMap = new Map<string, number[]>();

    datasets.forEach(({ name, values }) => {
      // Extract technology from series name (last matching word)
      let tech = 'Unknown';

      if (name.includes('Diesel')) tech = 'Diesel';
      else if (name.includes('BEV')) tech = 'BEV';  // Catches: BEV100, Strom BEV, Fzg.-Herstellung BEV, etc.
      else if (name.includes('BWS')) tech = 'BWS';
      else if (name.includes('O-BEV')) tech = 'OL';  // Check O-BEV before O-HEV
      else if (name.includes('O-HEV')) tech = 'OL';
      else if (name.includes('FCEV')) tech = 'FCEV';  // Catches: FCEV, H2 FCEV
      else if (name.includes('H2')) tech = 'FCEV';

      // Sum values for this technology
      if (!techMap.has(tech)) {
        techMap.set(tech, [...values]);
      } else {
        const existing = techMap.get(tech)!;
        techMap.set(tech, existing.map((v, i) => v + (values[i] || 0)));
      }
    });

    return Array.from(techMap.entries()).map(([technology, values]) => ({
      technology,
      values
    }));
  }

  /**
   * Sort datasets by technology prefix to group same technologies together
   * Order: Diesel → BEV → BWS → OL/O-BEV/O-HEV → FCEV/H2
   * Also handles energy categories like "Strom BEV", "Fzg.-Herstellung BEV", etc.
   */
  private sortDatasetsByTechnology(datasets: Array<{name: string, values: number[]}>): Array<{name: string, values: number[]}> {
    const getTechOrder = (name: string): number => {
      // Split by underscore to remove size class suffix
      const baseName = name.split('_')[0];

      // Check for energy/infrastructure categories (e.g., "Strom BEV", "Fzg.-Herstellung BEV")
      // These should be grouped with their technology
      if (baseName.includes('Diesel')) return 0;
      if (baseName.includes('BEV')) return 1;
      if (baseName.includes('BWS')) return 2;
      if (baseName.includes('O-HEV') || baseName.includes('O-BEV') || baseName.includes('OL')) return 3;
      if (baseName.includes('H2') || baseName.includes('FCEV')) return 4;

      // Direct matches (for simple series names like "BEV100", "Diesel", etc.)
      if (baseName.startsWith('Diesel')) return 0;
      if (baseName.startsWith('BEV')) return 1;
      if (baseName.startsWith('BWS')) return 2;
      if (baseName.startsWith('O-HEV') || baseName.startsWith('O-BEV') || baseName.startsWith('OL')) return 3;
      if (baseName.startsWith('H2') || baseName.startsWith('FCEV')) return 4;

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
      // This keeps BEV100, BEV200, BEV300... in order
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }

  private extractChartData(
    data: any[],
    config: ChartConfig,
    sizeClassSuffix: string | null
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // Extract labels (years with ' prefix)
    const labels = data.map(datum => {
      const year = typeof datum[config.dataSource] === 'string'
        ? datum[config.dataSource]
        : datum[config.dataSource].toString();
      return `'${year.slice(-2)}`;
    });

    // Extract series names (exclude dataSource key and 'null')
    const seriesNames = Object.keys(data[0])
      .filter(key => key !== config.dataSource && key !== 'null');

    // Create datasets with unit conversion
    const datasets = seriesNames.map(name => ({
      name: sizeClassSuffix ? `${name}_${sizeClassSuffix}` : name,
      values: data.map(datum => {
        const value = typeof datum[name] === 'string'
          ? parseFloat(datum[name].replace(',', '.'))
          : datum[name];
        return value / config.unitDivisor;
      })
    }));

    return { labels, datasets };
  }

  private renderChart(
    config: ChartConfig,
    chartData: { labels: string[], datasets: Array<{name: string, values: number[]}> }
  ): void {

    const containerMap: { [key: string]: ElementRef<HTMLDivElement> | undefined } = {
      'bestand': this.bestandContainer,
      'kosten': this.kostenContainer,
      'thg': this.thgContainer
    };

    const container = containerMap[config.id];
    if (!container) return;

    // Destroy existing chart
    const existingChart = this.charts.get(config.id);
    if (existingChart) {
      existingChart.destroy();
    }

    // Handle empty data
    if (chartData.labels.length === 0 || chartData.datasets.length === 0) {
      container.nativeElement.innerHTML = '<div class="alert alert-warning">Keine Daten verfügbar</div>';
      return;
    }

    // Create new chart
    container.nativeElement.innerHTML = '';
    const newChart = new Chart(container.nativeElement, {
      title: `${config.title} nach Fahrzeugtyp`,
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
      colors: chartData.datasets.map(d => this.getSeriesColor(d.name)),
      axisOptions: {
        xAxisMode: 'tick',
        xIsSeries: false
      }
    });

    this.charts.set(config.id, newChart);

    // Update legend for this chart
    this.updateLegend(config.id, chartData.datasets.map(d => d.name));
  }

  private getSeriesColor(seriesName: string): string {
    return getSeriesColor(seriesName);
  }

  private updateLegend(chartId: string, seriesNames: string[]): void {
    // Group by technology using same logic as sortDatasetsByTechnology
    const getTechOrder = (name: string): number => {
      const baseName = name.split('_')[0];

      // Check for energy/infrastructure categories
      if (baseName.includes('Diesel')) return 0;
      if (baseName.includes('BEV')) return 1;
      if (baseName.includes('BWS')) return 2;
      if (baseName.includes('O-HEV') || baseName.includes('O-BEV') || baseName.includes('OL')) return 3;
      if (baseName.includes('H2') || baseName.includes('FCEV')) return 4;

      // Direct matches
      if (baseName.startsWith('Diesel')) return 0;
      if (baseName.startsWith('BEV')) return 1;
      if (baseName.startsWith('BWS')) return 2;
      if (baseName.startsWith('O-HEV') || baseName.startsWith('O-BEV') || baseName.startsWith('OL')) return 3;
      if (baseName.startsWith('H2') || baseName.startsWith('FCEV')) return 4;

      return 999;
    };

    const legendGroups: Array<Array<{name: string, color: string}>> = [];
    let currentGroup: Array<{name: string, color: string}> = [];
    let prevOrder = -1;

    seriesNames.forEach(name => {
      const techOrder = getTechOrder(name);

      if (prevOrder !== -1 && techOrder !== prevOrder) {
        // Start new group (different technology)
        if (currentGroup.length > 0) {
          legendGroups.push(currentGroup);
        }
        currentGroup = [];
      }

      currentGroup.push({
        name: name,
        color: this.getSeriesColor(name)
      });
      prevOrder = techOrder;
    });

    // Push last group
    if (currentGroup.length > 0) {
      legendGroups.push(currentGroup);
    }

    this.legendGroupsByChart.set(chartId, legendGroups);
  }

  toggleSizeClass(sizeClass: string): void {
    const currentSelection = this.scenarioState.chartSizeClass$.value;

    // Special handling: "alle Größenklassen" is mutually exclusive
    if (sizeClass === 'alle Größenklassen') {
      this.scenarioState.chartSizeClass$.next(['alle Größenklassen']);
      return;
    }

    // Remove "alle Größenklassen" if selecting specific size class
    const filtered = currentSelection.filter(s => s !== 'alle Größenklassen');

    if (filtered.includes(sizeClass)) {
      // Deselect
      const updated = filtered.filter(s => s !== sizeClass);
      // If nothing left, default to "alle"
      this.scenarioState.chartSizeClass$.next(
        updated.length > 0 ? updated : ['alle Größenklassen']
      );
    } else {
      // Select
      this.scenarioState.chartSizeClass$.next([...filtered, sizeClass]);
    }
  }

  isSizeClassSelected(sizeClass: string): boolean {
    return this.scenarioState.chartSizeClass$.value.includes(sizeClass);
  }
}
