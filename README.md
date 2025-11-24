# MeR Szenarienexplorer

Web-basierter Szenarienexplorer für Transport- und Logistik-Datenvisualisierung mit Fokus auf verschiedene Antriebstechnologien (Diesel, BEV, OLKW, FCEV) und Emissionsszenarien.

## Technologie-Stack

- **Angular 19** mit Angular Elements (Web Component)
- **Leaflet** für interaktive Karten
- **Frappe Charts** für Datenvisualisierung
- **Bootstrap 5.3** für Styling
- **TypeScript**

## Komponentenhierarchie

```
AppComponent (szenarien-component)
├── ScenarioSelectorComponent
│   └── Szenario-Auswahl (Referenz/Krise)
├── MapViewComponent
│   ├── Leaflet-Karte mit GeoJSON-Layern
│   ├── Jahr-Slider (2025-2045)
│   └── Layer-Auswahl (Diesel/BEV/OLKW/FCEV/Oberleitung)
└── ChartViewComponent
    ├── Frappe Charts (Stacked Bar Charts)
    ├── Datenquelle (Bestand/Neuzulassungen/THG-Emissionen)
    └── Größenklasse (3,5-7,5t bis >26t)
```

**Hinweis**: Controls sind direkt in Map/ChartView integriert (keine separaten Control-Komponenten).

## Services & Utilities

- **ScenarioStateService**: Zentrale State-Verwaltung mit RxJS BehaviorSubjects
- **DataService**: HTTP-Client mit Caching für JSON-Daten
- **color.util.ts**: Pure function für Farbinterpolation (kein Service)

## Moderne Angular Features

- ✅ `inject()` Function statt Constructor Dependency Injection
- ✅ `@ViewChild` mit `ElementRef` für DOM-Referenzen
- ✅ Neue Control Flow Syntax: `@for`, `@if`
- ✅ `ViewEncapsulation.ShadowDom` auf Root Component
- ✅ `:host { display: contents; }` für Layout-Transparenz
- ✅ CSS Grid & Subgrid für Legenden

## Datenquellen

### Verzeichnisstruktur: `public/data/`

```
data/
├── GeoJSON/
│   ├── 1/                          # Szenario "Referenz"
│   │   ├── Diesel.geojson
│   │   ├── BEV.geojson
│   │   ├── OLKW.geojson
│   │   └── FCEV.geojson
│   └── 2/                          # Szenario "Krise"
│       ├── Diesel.geojson
│       ├── BEV.geojson
│       ├── OLKW.geojson
│       └── FCEV.geojson
├── Bestand und Neuzulassungen/
│   ├── 1/                          # Szenario "Referenz"
│   │   ├── Bestand alle Größenklassen.json
│   │   ├── Neuzulassungen alle Größenklassen.json
│   │   ├── THG-Emissionen alle Größenklassen.json
│   │   └── ... (weitere Größenklassen)
│   └── 2/                          # Szenario "Krise"
│       └── ... (gleiche Struktur)
├── Hintergrundkarte/
│   ├── Grenze Bundesländer.geojson
│   ├── TEN-T roads.geojson
│   └── Städte Deutschland.geojson
└── Oberleitungsausbau.geojson
```

### Koordinatensysteme

- **EPSG:3034**: Lambert Conformal Conic (Hauptprojektionssystem)
- **EPSG:25832**: UTM Zone 32N
- **EPSG:4326** / **OGC:CRS84**: WGS84 (Lat/Lon)

## Development

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm start
# → http://localhost:4200

# Production Build
npm run build
# → dist/szenarienexplorer/browser/
```

## Als Web Component verwenden

Nach dem Build kann die Anwendung als Custom Element eingebunden werden:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>MeR Szenarienexplorer</title>
  <link rel="stylesheet" href="dist/szenarienexplorer/browser/styles.css">
</head>
<body>
  <szenarien-component></szenarien-component>

  <script src="dist/szenarienexplorer/browser/polyfills.js" type="module"></script>
  <script src="dist/szenarienexplorer/browser/main.js" type="module"></script>
</body>
</html>
```

**Test-Datei**: `test.html` (lokalen HTTP-Server erforderlich)

## Projektstruktur

```
src/
├── app/
│   ├── components/
│   │   ├── scenario-selector/        # Szenario-Auswahl
│   │   ├── map-view/                  # Karte + Controls (inline)
│   │   └── chart-view/                # Chart + Controls (inline)
│   ├── services/
│   │   ├── scenario-state.service.ts  # State Management
│   │   └── data.service.ts            # Data Fetching & Caching
│   ├── utils/
│   │   └── color.util.ts              # Farbinterpolation (pure function)
│   ├── app.component.ts               # Root Component
│   └── app.module.ts                  # App Module (non-standalone)
├── main.ts                            # Angular Elements Bootstrap
├── styles.scss                        # Global Styles (Bootstrap + Leaflet)
└── typings.d.ts                       # Type Definitions (frappe-charts)

public/
├── data/                              # JSON & GeoJSON Daten
└── favicon.ico
```

## Szenarien

- **Referenz**: Rückbildung der Energiepreise nach Krise 2022
- **Krise**: Verharren der Energiepreise auf Krisenniveau

Beide Szenarien unterscheiden sich hinsichtlich der Entwicklung des Strom- und Dieselpreises.
