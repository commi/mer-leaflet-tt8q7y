import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, inject } from '@angular/core';
import { Chart } from 'frappe-charts';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { DataService } from '../../services/data.service';
import { CHART_CONFIGS, ChartConfig } from '../../models/chart-config.model';
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
  sizeClasses = [
    'alle Größenklassen',
    '3,5-7,5t',
    '7,5-12t',
    '12-18t',
    '18-26t',
    '26-40t'
  ];

  legendGroupsByChart = new Map<string, Array<Array<{name: string, color: string}>>>();

  colorMap: { [key: string]: string } = {
    "BEV100": '#C3E2FB',
    "BEV200": '#88C5F6',
    "BEV300": '#4CA8F2',
    "BEV400": '#0D68B1',
    "BEV500": '#0A4E85',
    "BEV600": '#063458',
    "O-HEV": '#DEC600',
    "O-BEV50": "#EBF7CE",
    "O-BEV50 ": "#EBF7CE",
    "O-BEV100": "#D7EF9D",
    "O-BEV150": "#C3E66C",
    "O-BEV200": "#92C020",
    "O-BEV250": "#6D9018",
    "O-BEV300": "#496010",
    "FCEV": '#C00000',
    "Diesel ": '#9A9A9A',
    "Strom BEV": "#4CA8F2",
    "Strom O-BEV": "#92C020",
    "H2 FCEV": "#C00000",
    "Diesel": "#9A9A9A",
    "Fzg.-Herstellung  BEV": "#88C5F6",
    "Fzg.-Herstellung O-BEV": "#D7EF9D",
    "Fzg.-Herstellung FCEV": "#E02020",
    "Fzg.-Herstellung Diesel": "#BABAB9",
    "Infrastruktur BEV": "#0D68B1",
    "Infrastruktur O-BEV": "#6D9018",
    "Infrastruktur O-BEV ": "#6D9018",
  };

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

    // If only "alle Größenklassen" selected, return as-is (no suffix needed)
    if (sizeClasses.length === 1 && sizeClasses[0] === 'alle Größenklassen') {
      const result = results[0];
      if (!result.data) return { labels: [], datasets: [] };
      return this.extractChartData(result.data, config, null);
    }

    // Multi-select: combine with suffixes
    const allLabels = new Set<string>();
    const datasetsBySeries = new Map<string, number[]>();

    results.forEach(({ sizeClass, data }) => {
      if (!data || !Array.isArray(data) || data.length === 0) return;

      const extracted = this.extractChartData(data, config, sizeClass);
      extracted.labels.forEach(label => allLabels.add(label));

      extracted.datasets.forEach(series => {
        const seriesName = `${series.name}_${sizeClass}`;
        datasetsBySeries.set(seriesName, series.values);
      });
    });

    const labels = Array.from(allLabels).sort();
    const datasets = Array.from(datasetsBySeries.entries()).map(([name, values]) => ({
      name,
      values
    }));

    return { labels, datasets };
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
    // Strip suffix if present (e.g., "BEV100_3,5-7,5t" -> "BEV100")
    const baseName = seriesName.split('_')[0];
    return this.colorMap[baseName] || this.colorMap[seriesName] || '#CCCCCC';
  }

  private updateLegend(chartId: string, seriesNames: string[]): void {
    // Group by first character
    const legendGroups: Array<Array<{name: string, color: string}>> = [];
    let currentGroup: Array<{name: string, color: string}> = [];
    let prevFirstChar = '';

    seriesNames.forEach(name => {
      const firstChar = name.at(0) || '';

      if (prevFirstChar && firstChar !== prevFirstChar) {
        // Start new group
        if (currentGroup.length > 0) {
          legendGroups.push(currentGroup);
        }
        currentGroup = [];
      }

      currentGroup.push({
        name: name,
        color: this.getSeriesColor(name)
      });
      prevFirstChar = firstChar;
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
