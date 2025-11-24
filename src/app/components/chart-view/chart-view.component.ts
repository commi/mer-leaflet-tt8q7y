import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, inject } from '@angular/core';
import { Chart } from 'frappe-charts';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { DataService } from '../../services/data.service';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-chart-view',
  standalone: false,
  templateUrl: './chart-view.component.html',
  styles: `

    #chart-1 {
      min-height: 400px;
    }

    #chart-legend {
      display: grid;
      gap: 0.5rem 1rem;
      align-items: center;
    }

    .legend-group {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: span 7;
      gap: 0.25rem;
      align-items: center;
    }

    .legend-item {
      display: flex;
      gap: 0.25rem;
      overflow: hidden;
    }

    .legend-color {
      text-align: right;
    }

    .legend-label {
      hyphens: auto;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class ChartViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef<HTMLDivElement>;

  scenarioState = inject(ScenarioStateService);
  private dataService = inject(DataService);

  private chart?: Chart;
  private subscriptions: Subscription[] = [];

  legendGroups: Array<Array<{name: string, color: string}>> = [];

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
        this.scenarioState.chartDataSource$,
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

  updateChart(): void {
    const scenario = this.scenarioState.scenario$.value;
    const dataSource = this.scenarioState.chartDataSource$.value;
    const sizeClass = this.scenarioState.chartSizeClass$.value;
    const filename = `/data/Bestand und Neuzulassungen/${scenario}/${dataSource} ${sizeClass}.json`;

    this.dataService.fetchJSON(filename).subscribe({
      next: (data: any[]) => {
        // Extract labels (years)
        const labels = data.map(datum => `'${(typeof datum[dataSource] === 'string'
          ? datum[dataSource]
          : datum[dataSource].toString()).slice(-2, 100)}`);

        // Filter keys to generate chart data
        const seriesNames = Object.keys(data[0]).filter(key => key !== dataSource && key !== 'null');
        const datasets = seriesNames.map(label => ({
          name: label,
          values: data.map(datum => typeof datum[label] === 'string' ? parseFloat(datum[label].replace(',', '.')) : datum[label])
        }));

        // Create or update chart
        if (this.chartContainer) {
          this.chartContainer.nativeElement.innerHTML = '';
          this.chart = new Chart(this.chartContainer.nativeElement, {
            title: `${dataSource} nach Fahrzeugtyp und Jahr: ${sizeClass}`,
            data: {
              labels: labels,
              datasets: datasets
            },
            type: 'bar',
            barOptions: {
              stacked: true,
              spaceRatio: 0.5
            },
            height: 400,
            colors: seriesNames.map(n => this.colorMap[n] ?? n),
            axisOptions: {
              xAxisMode: 'tick',
              xIsSeries: false
            }
          });
        }

        // Update legend - group by first character
        this.legendGroups = [];
        let currentGroup: Array<{name: string, color: string}> = [];
        let prevFirstChar = '';

        seriesNames.forEach(name => {
          const firstChar = name.at(0) || '';

          if (prevFirstChar && firstChar !== prevFirstChar) {
            // Start new group
            if (currentGroup.length > 0) {
              this.legendGroups.push(currentGroup);
            }
            currentGroup = [];
          }

          currentGroup.push({
            name: name,
            color: this.colorMap[name] || name
          });
          prevFirstChar = firstChar;
        });

        // Add last group
        if (currentGroup.length > 0) {
          this.legendGroups.push(currentGroup);
        }
      },
      error: (error) => {
        console.warn(`Could not fetch ${filename}:`, error);
      }
    });
  }

}
