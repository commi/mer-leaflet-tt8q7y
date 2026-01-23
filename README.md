# MeR Szenarienexplorer

Web-basierter Szenarienexplorer.

## Live Demo

- Angular App: https://commi.github.io/mer-leaflet-tt8q7y/angular/
- Vanilla JS App (Legacy): https://commi.github.io/mer-leaflet-tt8q7y/

## Technologie-Stack

- Angular 19 mit Angular Elements (für Web Component Erstellung)
- Bootstrap 5.3 für Styling
- TypeScript
- chroma-js für Farbinterpolation

## Komponentenhierarchie

```
AppComponent (szenarien-component)
├── ScenarioSelectorComponent
└── ChartViewComponent
    ├── Charts
    ├── Datenquellen-Auswahl (Bestand / Kosten / THG-Emissionen)
    └── Größenklassen-Filter
```

## Services & Utilities

- ScenarioStateService: Zentrale UI-State-Verwaltung
- color.util.ts: Farbinterpolation und Color Mapping

## Datenstruktur

JSON-Dateien werden statisch importiert:

```
src/
├── Bestand.json       # Bestandszahlen aller Szenarien & Größenklassen
├── Kosten.json        # Kostendaten aller Szenarien & Größenklassen
└── THG.json           # THG-Emissionen aller Szenarien (keine Größenklassen)
```

### Datenformat

```json
[
  {
    "Szenario": "Referenz",
    "Groessenklasse": "3,5-12 t",
    "Technologie": "Diesel",
    "Jahr": "2025",
    "Bestand": "123456"
  },
  ...
]
```

Werte für Technologien:
- `Diesel` - Dieselantrieb
- `BEV` - Battery Electric Vehicle
- `BWS-BEV` - Batteriewechselsystem
- `OL-BEV` - Oberleitungs-BEV
- `FCEV` - Fuel Cell Electric Vehicle

Werte für Größenklassen:
- `3,5-12 t`
- `12-26 t`
- `Lastzüge`
- `Sattelzüge`
- `alle Größenklassen`

## Development

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm start
# → http://localhost:4200

# Build
npm run build
# → Erstellt in dist/szenarienexplorer/browser/
```

### Neue Komponente erstellen

```bash
ng generate component components/my-component --skip-tests --standalone=false --inline-style --module=app
```

## Deployment

### Automatisches GitHub Pages Deployment

Push auf `main` triggert automatisch:

1. Angular App wird mit `--base-href /mer-leaflet-tt8q7y/angular/` gebaut
2. Automatische GitHub-Release-Erstellung mit Version `YYYY-MM-DD-HASH`
3. Commit des Builds zu GitHub Pages Branch `gh-pages:/angular/`
4. `gh-pages`-Branch wird automatisch unter https://commi.github.io/mer-leaflet-tt8q7y/ veröffentlicht

Workflow: `.github/workflows/angular-build-release.yml`

### Als Web Component verwenden

Die Anwendung kann als Custom Element eingebunden werden:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Szenarienexplorer</title>
</head>
<body>
  <!-- Webcomponent start -->
  <szenarien-component></szenarien-component>

  <script src="polyfills.js" type="module"></script>
  <script src="main.js" type="module"></script>
  <!-- Ende -->
</body>
</html>
```

### Release Download

Jeder Build erstellt auch ein Release ZIP mit der kompilierten Anwendung:

- https://github.com/commi/mer-leaflet-tt8q7y/releases/latest

## Projektstruktur

```
src/
├── Bestand.json                       # Statische Datenimporte
├── Kosten.json
├── THG.json
├── app/
│   ├── components/
│   │   ├── scenario-selector/        # Szenario-Auswahl
│   │   ├── chart-view/                # Chart Container
│   │   ├── chart/                     # Custom Chart Components
│   │   │   ├── ...
│   │   │   └── ...
│   │   ├── bestand-chart/             # Bestandschart
│   │   ├── kosten-chart/              # Kostenchart
│   │   ├── thg-chart/                 # THG-Emissionen Chart
│   │   ├── chart-legend/              # Chart-Legende (wiederverwendbar)
│   │   ├── size-class-selector/       # Größenklassen-Auswahl
│   │   ├── abbreviations-legend/      # Technologie-Abkürzungen
│   │   └── base-chart.ts              # Abstract Base für Chart-Komponenten
│   ├── services/
│   │   └── scenario-state.service.ts  # State Management
│   ├── models/
│   │   └── data.model.ts              # Datenmodelle mit Type Guards
│   ├── utils/
│   │   └── color.util.ts              # Color Mapping
│   ├── app.component.ts               # Root Component
│   └── app.module.ts                  # App Module
├── main.ts                            # Angular Elements Bootstrap
└── styles.scss                        # Global Styles (Bootstrap)
```

## Szenarien

- Referenz: Rückbildung der Energiepreise nach Krise 2022
- Krise: Verharren der Energiepreise auf Krisenniveau

## Color System

Statisches Color Mapping für konsistente Farben über alle Charts:

- Diesel → Schwarz/Grau-Töne
- BEV → Blau-Töne
- BWS-BEV → Hellblau-Töne
- OL-BEV → Türkis-Töne
- FCEV → Violett-Töne

## aktive Branches

- main: Angular App (aktuelle Entwicklung)
- vanillajs-legacy: Vanilla JS Version (alt)
- gh-pages: Deployment-Branch für GitHub-Pages (automatisch befüllt)

