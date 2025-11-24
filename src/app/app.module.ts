import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ScenarioSelectorComponent } from './components/scenario-selector/scenario-selector.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { ChartViewComponent } from './components/chart-view/chart-view.component';

@NgModule({
  declarations: [
    AppComponent,
    ScenarioSelectorComponent,
    MapViewComponent,
    ChartViewComponent
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
  ngDoBootstrap() {}
}
