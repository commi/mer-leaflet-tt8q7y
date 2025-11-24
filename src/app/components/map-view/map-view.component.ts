import { Component, OnInit, AfterViewInit, OnDestroy, ViewEncapsulation, ViewChild, ElementRef, inject } from '@angular/core';
import * as L from 'leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import chroma from 'chroma-js';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { DataService } from '../../services/data.service';
import { getLineColor } from '../../utils/color.util';
import { Subscription, combineLatest } from 'rxjs';

declare const window: any;

interface LayerInfo {
  name: string;
  options: {
    url: string;
    szenario: string;
    colors: { [key: number]: string };
  };
  layer: {
    parentLayer: L.LayerGroup;
    features: Map<any, L.Layer>;
  };
}

@Component({
  selector: 'app-map-view',
  standalone: false,
  templateUrl: './map-view.component.html',
  styles: `

    #map {
      height: 600px;
      background: #B5D1DC;
      z-index: 0;
    }

    #label_year {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.5rem;
    }

    #tbody_legend {
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 0.25rem 0.5rem;
    }

    #tbody_legend tr {
      display: contents;
    }

    #tbody_legend td {
      padding: 0;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  scenarioState = inject(ScenarioStateService);
  private dataService = inject(DataService);

  private map?: L.Map;
  private layers: LayerInfo[] = [];
  private oberleitungsLayer?: L.LayerGroup;
  private oberleitungsFeatures = new Map<any, L.Layer>();

  layerColors: { [key: string]: { [key: number]: string } } = {
    'Diesel': {0: '#DDD', 1: '#DDDDDC', 23000: '#292929'},
    'BEV': {0: '#DDD', 1: '#C3E2FB', 23000: '#073459'},
    'OLKW': {0: '#DDD', 1: '#EBF7CE', 23000: '#496010'},
    'FCEV': {0: '#DDD', 1: '#FFD5E8', 23000: '#960045'}
  };

  legendData: Array<{name: string, colors: any, szenario: string}> = [];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.scenarioState.scenario$,
        this.scenarioState.year$,
        this.scenarioState.visibleLayer$
      ]).subscribe(() => {
        if (this.map) {
          this.updateLayerVisibility();
        }
      })
    );

    // Build legend data
    Object.keys(this.layerColors).forEach(layerName => {
      this.legendData.push({
        name: layerName,
        colors: this.layerColors[layerName],
        szenario: '1'
      });
    });
    Object.keys(this.layerColors).forEach(layerName => {
      this.legendData.push({
        name: layerName,
        colors: this.layerColors[layerName],
        szenario: '2'
      });
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  

  private async initMap(): Promise<void> {
    // Define projections
    (proj4 as any).defs('EPSG:3034',
      '+proj=lcc +lat_0=52 +lon_0=10 +lat_1=35 +lat_2=65 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
    (proj4 as any).defs('EPSG:25832',
      "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
    (proj4 as any).defs['OGC:CRS84'] = (proj4 as any).defs['EPSG:4326'];

    // Create map
    this.map = L.map(this.mapContainer.nativeElement, {
      scrollWheelZoom: false
    }).setView([51.4, 10.4], 6);

    // Add background layer
    const hintergundLayer = L.layerGroup([]).addTo(this.map);

    // Load background data
    const outlineStates = await fetch('/data/Hintergrundkarte/Grenze%20Bundesländer.geojson').then(res => res.json());
    const highways = await fetch('/data/Hintergrundkarte/TEN-T%20roads.geojson').then(res => res.json());
    const citiesGermany = await fetch('/data/Hintergrundkarte/St%C3%A4dte%20Deutschland.geojson').then(res => res.json());
    const oberleitung = await fetch('/data/Oberleitungsausbau.geojson').then(res => res.json());

    // Add state backgrounds
    L.geoJSON(outlineStates, {
      style: {color: '#FFF', weight: 1, stroke: false, fillOpacity: 1},
    }).addTo(hintergundLayer);

    // Add highways
    (L as any).Proj.geoJson(highways, {
      style: () => ({color: '#888'}),
      fill: false,
      stroke: '#777',
    }).addTo(hintergundLayer);

    // Add state borders
    L.geoJSON(outlineStates, {
      style: {color: '#DDD', weight: 1, fill: false},
    }).addTo(hintergundLayer);

    // Add cities
    L.geoJSON(citiesGermany, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 4,
        fillColor: '#EEE',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      }).bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'right',
        className: 'city',
      }).openTooltip(),
    }).addTo(hintergundLayer);

    // Add Oberleitung layer
    this.oberleitungsLayer = L.layerGroup([]).addTo(this.map);
    (L as any).Proj.geoJson(oberleitung, {
      pointToLayer: (feature: any, latlng: L.LatLng) => L.circle(latlng, {
        radius: 3000,
        fillColor: '#FA9C1B',
        stroke: false,
        fillOpacity: 1,
      }),
      onEachFeature: (feature: any, layer: L.Layer) => {
        this.oberleitungsFeatures.set(feature, layer);
      },
    });

    // Load all layer data
    await this.loadLayers();
    this.updateLayerVisibility();
  }

  private async loadLayers(): Promise<void> {
    const layerOptions = [
      { name: 'Diesel', szenario: '1' },
      { name: 'BEV', szenario: '1' },
      { name: 'OLKW', szenario: '1' },
      { name: 'FCEV', szenario: '1' },
      { name: 'Diesel', szenario: '2' },
      { name: 'BEV', szenario: '2' },
      { name: 'OLKW', szenario: '2' },
      { name: 'FCEV', szenario: '2' },
    ];

    const promises = layerOptions.map(async ({name, szenario}) => {
      const url = `/data/GeoJSON/${szenario}/${name}.geojson`;
      const colors = this.layerColors[name];

      const json = await fetch(url).then(res => res.json());
      const parentLayer = L.layerGroup([]).addTo(this.map!);
      const features = new Map<any, L.Layer>();

      (L as any).Proj.geoJson(json, {
        style: (feature: any) => ({
          color: getLineColor(colors, feature.properties?.value ?? 0)
        }),
        onEachFeature: (feature: any, layer: L.Layer) => {
          features.set(feature, layer);
        },
        fill: false,
      });

      return {
        name,
        options: { url, szenario, colors },
        layer: { parentLayer, features }
      };
    });

    this.layers = await Promise.all(promises);
  }

  updateLayerVisibility(): void {
    if (!this.map) return;

    const year = this.scenarioState.year$.value;
    const scenario = this.scenarioState.scenario$.value;
    const visibleLayer = this.scenarioState.visibleLayer$.value;

    // Update oberleitung features (only if Oberleitungsausbau is selected)
    this.oberleitungsFeatures.forEach((marker, feature) => {
      if (visibleLayer !== 'Oberleitungsausbau') {
        marker.remove();
        return;
      }
      // Convert german date to iso date
      const isoDate = feature?.properties?.Time?.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
      // Check if feature is before or equal to the selected year
      if (new Date(isoDate).getFullYear() <= year) {
        marker.addTo(this.oberleitungsLayer!);
      } else {
        marker.remove();
      }
    });

    // Update layer features (Diesel/BEV/OLKW/FCEV)
    this.layers.forEach(({name, options, layer: {features, parentLayer}}) => {
      const layerCheckboxChecked = visibleLayer === name;
      const szenarioSelected = options.szenario === scenario;

      features?.forEach((layer, feature) => {
        if (!layerCheckboxChecked || !szenarioSelected) {
          layer.remove();
          return;
        }

        const isoDate = feature?.properties?.Time?.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
        if (new Date(isoDate).getFullYear() === year) {
          layer.addTo(parentLayer);
        } else {
          layer.remove();
        }
      });
    });
  }

  getGradientColors(colors: any): string {
    const keys = Object.keys(colors).map(Number);
    const maxKey = Math.max(...keys);
    const steps = 15;

    const gradientColors = keys
      .flatMap((key, i, keys) => {
        if (i === keys.length - 1) return [];
        return Array.from({length: steps + 2}, (_, step) => {
          const color = chroma.mix(colors[key], colors[keys[i + 1]], step / (steps + 1), 'hsl').css();
          const pos = key + (keys[i + 1] - key) * step / (steps + 1);
          return `${color} ${(pos / maxKey) * 100}%`;
        });
      });

    return `linear-gradient(to right, ${gradientColors.join(', ')})`;
  }

  getMinKey(colors: any): number {
    return Math.min(...Object.keys(colors).map(Number));
  }

  getMaxKey(colors: any): number {
    return Math.max(...Object.keys(colors).map(Number));
  }

  onYearChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.scenarioState.year$.next(value);
  }

}
