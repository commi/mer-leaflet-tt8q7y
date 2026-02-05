import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ScenarioSelectorComponent} from './components/scenario-selector/scenario-selector.component';
import {ChartViewComponent} from './components/chart-view/chart-view.component';
import {AbbreviationsLegendComponent} from './components/abbreviations-legend/abbreviations-legend.component';
import {SizeClassSelectorComponent} from './components/size-class-selector/size-class-selector.component';
import {ChartLegendComponent} from './components/chart-legend/chart-legend.component';
import {BestandChartComponent} from './components/bestand-chart/bestand-chart.component';
import {KostenChartComponent} from './components/kosten-chart/kosten-chart.component';
import {ThgChartComponent} from './components/thg-chart/thg-chart.component';

// Custom chart components
import {ChartGridLinesComponent, ChartShellComponent, ChartXAxisComponent, ChartYAxisComponent, LinePlotComponent, StackedBarPlotComponent} from './components/chart';

@NgModule({
  declarations: [
    AppComponent,
    ScenarioSelectorComponent,
    ChartViewComponent,
    AbbreviationsLegendComponent,
    SizeClassSelectorComponent,
    ChartLegendComponent,
    BestandChartComponent,
    KostenChartComponent,
    ThgChartComponent,
    // Custom chart components
    ChartYAxisComponent,
    ChartXAxisComponent,
    ChartGridLinesComponent,
    ChartShellComponent,
    StackedBarPlotComponent,
    LinePlotComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  exports: [
    AppComponent
  ]
})
export class AppModule {
  ngDoBootstrap() {
  }
}
