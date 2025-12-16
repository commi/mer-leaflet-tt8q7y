import { Directive, OnInit, OnDestroy, AfterViewInit, Input, ElementRef, inject } from '@angular/core';
import { Chart } from 'frappe-charts';
import { DataService } from '../services/data.service';
import { ScenarioStateService } from '../services/scenario-state.service';
import { ChartConfig } from '../models/chart-config.model';
import { getSeriesColor } from '../utils/color.util';
import { LegendItem } from './chart-legend/chart-legend.component';
import { Subscription, combineLatest, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Directive()
export abstract class BaseChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedSizeClasses: string[] = ['alle Größenklassen'];

  protected scenarioState = inject(ScenarioStateService);
  protected dataService = inject(DataService);

  protected chart?: Chart;
  protected subscriptions: Subscription[] = [];

  legendGroups: Array<Array<LegendItem>> = [];

  // Abstract properties that child components must provide
  abstract chartConfig: ChartConfig;
  abstract chartContainer: ElementRef<HTMLDivElement>;

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

    // Fetch data for all selected size classes
    const requests = sizeClasses.map(sizeClass => {
      const filename = `/data/Bestand und Neuzulassungen/${scenario}/${this.chartConfig.dataSource} ${sizeClass}.json`;
      return this.dataService.fetchJSON(filename).pipe(
        map(data => ({ sizeClass, data })),
        catchError(error => {
          console.warn(`Failed to load ${filename}:`, error);
          return of({ sizeClass, data: null });
        })
      );
    });

    forkJoin(requests).subscribe(results => {
      const combinedData = this.combineMultiSizeClassData(results, sizeClasses);
      this.renderChart(combinedData);
    });
  }

  private combineMultiSizeClassData(
    results: Array<{sizeClass: string, data: any}>,
    sizeClasses: string[]
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // If only "alle Größenklassen" selected, aggregate by technology (no suffix needed)
    if (sizeClasses.length === 1 && sizeClasses[0] === 'alle Größenklassen') {
      const result = results[0];
      if (!result.data) return { labels: [], datasets: [] };
      const extracted = this.extractChartData(result.data, null);

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
      const extracted = this.extractChartData(data, null);
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

  private aggregateByTechnology(datasets: Array<{name: string, values: number[]}>): Array<{technology: string, values: number[]}> {
    const techMap = new Map<string, number[]>();

    datasets.forEach(({ name, values }) => {
      // Determine technology group based on which technology is mentioned
      // IMPORTANT: Check most specific prefixes first (O-BEV before BEV!)
      let tech = '';

      if (name.includes('O-BEV')) tech = 'OL';  // Must check BEFORE 'BEV'!
      else if (name.includes('O-HEV')) tech = 'OL';
      else if (name.includes('BWS')) tech = 'BWS';
      else if (name.includes('BEV')) tech = 'BEV';  // Catches: BEV100, Strom BEV, Fzg.-Herstellung BEV, etc.
      else if (name.includes('FCEV')) tech = 'FCEV';  // Catches: FCEV, H2 FCEV
      else if (name.includes('H2')) tech = 'FCEV';
      else if (name.includes('Diesel')) tech = 'Diesel';
      else tech = name; // Fallback: use original name

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

  private sortDatasetsByTechnology(datasets: Array<{name: string, values: number[]}>): Array<{name: string, values: number[]}> {
    const getTechOrder = (name: string): number => {
      // Split by underscore to remove size class suffix
      const baseName = name.split('_')[0];

      // IMPORTANT: Check most specific prefixes first (O-BEV before BEV!)
      if (baseName.includes('O-BEV') || baseName.includes('O-HEV') || baseName.includes('OL')) return 3;
      if (baseName.includes('BWS')) return 2;
      if (baseName.includes('BEV')) return 1;
      if (baseName.includes('H2') || baseName.includes('FCEV')) return 4;
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
      // This keeps BEV100, BEV200, BEV300... in order
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }

  private extractChartData(
    data: any[],
    sizeClassSuffix: string | null
  ): { labels: string[], datasets: Array<{name: string, values: number[]}> } {

    // Extract labels (years with ' prefix)
    const labels = data.map(datum => {
      const year = typeof datum[this.chartConfig.dataSource] === 'string'
        ? datum[this.chartConfig.dataSource]
        : datum[this.chartConfig.dataSource].toString();
      return `'${year.slice(-2)}`;
    });

    // Extract series names (exclude dataSource key and 'null')
    const seriesNames = Object.keys(data[0])
      .filter(key => key !== this.chartConfig.dataSource && key !== 'null');

    // Create datasets with unit conversion
    const datasets = seriesNames.map(name => ({
      name: sizeClassSuffix ? `${name}_${sizeClassSuffix}` : name,
      values: data.map(datum => {
        const value = typeof datum[name] === 'string'
          ? parseFloat(datum[name].replace(',', '.'))
          : datum[name];
        return value / this.chartConfig.unitDivisor;
      })
    }));

    return { labels, datasets };
  }

  private renderChart(
    chartData: { labels: string[], datasets: Array<{name: string, values: number[]}> }
  ): void {

    if (!this.chartContainer) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Handle empty data
    if (chartData.labels.length === 0 || chartData.datasets.length === 0) {
      this.chartContainer.nativeElement.innerHTML = '<div class="alert alert-warning">Keine Daten verfügbar</div>';
      return;
    }

    // Create new chart
    this.chartContainer.nativeElement.innerHTML = '';
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
      const baseName = name.split('_')[0];

      // IMPORTANT: Check most specific prefixes first (O-BEV before BEV!)
      if (baseName.includes('O-BEV') || baseName.includes('O-HEV') || baseName.includes('OL')) return 3;
      if (baseName.includes('BWS')) return 2;
      if (baseName.includes('BEV')) return 1;
      if (baseName.includes('H2') || baseName.includes('FCEV')) return 4;
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
