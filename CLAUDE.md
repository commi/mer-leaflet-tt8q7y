# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based scenario explorer for transport and logistics data visualization, focusing on different drivetrain technologies (Diesel, BEV, OLKW, FCEV) and emissions scenarios. The project is built as an **Angular 19** application with **Angular Elements** to export as a Web Component.

## Architecture

The application is built with Angular and follows a component-based architecture:

- **Angular Elements**: Exports the app as `<szenarien-component>` custom element with `ViewEncapsulation.ShadowDom`
- **Non-standalone Components**: All child components use the traditional module-based approach
- **Modern DI**: Uses `inject()` function instead of constructor injection
- **Reactive State Management**: Central state via `ScenarioStateService` with RxJS observables
- **Data Caching**: HTTP requests cached via `DataService`
- **Custom Chart Components**: Custom stacked bar charts
- **New Control Flow**: Uses `@for` and `@if` instead of `*ngFor` and `*ngIf`

## Key Components

### Component Hierarchy

```
AppComponent (selector: szenarien-component, ViewEncapsulation.ShadowDom)
├── ScenarioSelectorComponent - Scenario selection (Referenz/Krise)
└── ChartViewComponent - Chart visualization with inline controls
    ├── BestandChartComponent - Vehicle stock chart
    ├── KostenChartComponent - Cost chart
    └── ThgChartComponent - GHG emissions chart
```

### Services & Utilities

- **ScenarioStateService** (src/app/services/scenario-state.service.ts:7): Central state management with BehaviorSubjects for scenario and chart settings
- **DataService** (src/app/services/data.service.ts:9): HTTP client with Map-based caching, uses `inject(HttpClient)`
- **color.util.ts** (src/app/utils/color.util.ts): Pure function for color interpolation using chroma-js (not a service)

### Modern Angular Patterns

- **inject() function**: All components use `inject()` instead of constructor DI
  ```typescript
  private scenarioState = inject(ScenarioStateService);
  private dataService = inject(DataService);
  ```

- **ViewChild for DOM refs**: Use `@ViewChild` with `ElementRef` instead of `document.querySelector`

- **New Control Flow**: Templates use `@for` and `@if` syntax
  ```html
  @for (item of items; track item.id) {
    @if (condition) { ... }
  }
  ```

- **ViewEncapsulation**:
  - `AppComponent`: `ViewEncapsulation.ShadowDom` (creates custom element with shadow DOM)
  - All child components: `ViewEncapsulation.None` (no isolation needed)
  - Components that need layout transparency: `:host { display: contents; }`

## Data Structure

All data files are located in `public/data/`:

```
data/
├── Bestand und Neuzulassungen/
│   ├── 1/                    # Scenario "Referenz"
│   │   └── {Bestand,Neuzulassungen,THG-Emissionen} {size class}.json
│   └── 2/                    # Scenario "Krise"
│       └── (same structure)
```

## Development

### Running the Application

```bash
npm install          # Install dependencies
npm start            # Dev server on http://localhost:4200
npm run build        # Production build to dist/szenarienexplorer
```

### Creating Components

All new components should be **non-standalone** and added to `app.module.ts`:

```bash
ng generate component components/my-component --skip-tests --standalone=false --inline-style --module=app
```

Use `inject()` for dependency injection and `@ViewChild` for DOM references.

### Build Configuration

- **Output hashing**: Disabled (`outputHashing: "none"`) for stable file names
- **Build output**: `dist/szenarienexplorer/browser/` contains:
  - `main.js` - Application bundle
  - `polyfills.js` - Polyfills
  - `styles.css` - Global styles (Bootstrap)
  - `data/` - All JSON data files
  - `favicon.ico`

### CSS Architecture

- **Global styles**: `src/styles.scss` imports Bootstrap CSS
- **Component styles**: Use `:host { display: contents; }` where needed
- **CSS Grid**: Chart legends use CSS Grid with `display: contents` on child elements
- **Subgrid**: Chart legend uses CSS Subgrid for perfect alignment across groups

## Web Component Usage

The built application can be embedded as a custom element:

```html
<link rel="stylesheet" href="dist/szenarienexplorer/browser/styles.css">
<szenarien-component></szenarien-component>
<script src="dist/szenarienexplorer/browser/polyfills.js" type="module"></script>
<script src="dist/szenarienexplorer/browser/main.js" type="module"></script>
```

## External Dependencies

Loaded via npm packages (not script tags):
- **chroma-js** + **@types/chroma-js**: Color interpolation for gradients
- **bootstrap@5.3**: Styling framework
- **@angular/elements**: Web Component support

## Important Notes

- The root component selector is `szenarien-component` (not `app-root`)
- All components are non-standalone and declared in AppModule
- AppComponent uses `ViewEncapsulation.ShadowDom` for proper custom element behavior
- Child components use `ViewEncapsulation.None` (no additional isolation needed)
- Components use `:host { display: contents; }` for layout transparency with Bootstrap Grid
- All services are injected via `inject()` function, not constructor
- DOM references use `@ViewChild` with `ElementRef` instead of `document.querySelector`
- Templates use new Angular syntax: `@for`, `@if` instead of `*ngFor`, `*ngIf`
- Legends use CSS Grid with `display: contents` for proper alignment
- Chart legend uses CSS Subgrid for column alignment across groups
