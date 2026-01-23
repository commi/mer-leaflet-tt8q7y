# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

Web-based scenario explorer for transport data visualization. Built as **Angular 19** application exported as Web Component via **Angular Elements**.

## Architecture

- **Angular Elements**: Exports as `<szenarien-component>` with `ViewEncapsulation.ShadowDom`
- **Non-standalone Components**: Traditional module-based approach
- **Modern DI**: `inject()` function instead of constructor injection
- **State Management**: `ScenarioStateService` with RxJS BehaviorSubjects
- **Static Data**: JSON files imported at compile-time (not HTTP requests)
- **Control Flow**: `@for` and `@if` syntax (not `*ngFor`/`*ngIf`)

## Component Hierarchy

```
AppComponent (szenarien-component)
├── ScenarioSelectorComponent
└── ChartViewComponent
    ├── BestandChartComponent
    ├── KostenChartComponent
    └── ThgChartComponent
```

## Data & Configuration

**JSON Data**: Located in `src/` and imported statically:
```typescript
import bestandData from '../../../Bestand.json';
readonly dataSource = bestandData as BestandKostenRow[];
```

**Chart Components**: Each chart has inlined readonly configuration fields:
- `dataSource`: Imported JSON data
- `dataKey`: Field name ('Bestand', 'Kosten', 'THG')
- `title`, `unitDivisor`, `unitLabel`: Display configuration

**BaseChartComponent**: Abstract base class using abstract readonly properties.

## Key Patterns

**inject() DI**:
```typescript
private scenarioState = inject(ScenarioStateService);
```

**ViewChild for DOM**:
```typescript
@ViewChild('canvas', { static: false }) canvas?: ElementRef<HTMLCanvasElement>;
```

**New Control Flow**:
```html
@for (item of items; track item.id) {
  @if (condition) { }
}
```

## Development

```bash
npm install          # Install dependencies
npm start            # Dev server on http://localhost:4200
npm run build        # Production build
```

**Create Components**:
```bash
ng generate component components/my-component --skip-tests --standalone=false --inline-style --module=app
```

## Build Output

`dist/szenarienexplorer/browser/`:
- `main.js` - Application bundle (includes bundled JSON data)
- `polyfills.js`
- `styles.css`

## Web Component Usage

```html
<szenarien-component></szenarien-component>
<script src="polyfills.js" type="module"></script>
<script src="main.js" type="module"></script>
```

## Important Notes

- Root selector: `szenarien-component` (not `app-root`)
- All components are non-standalone
- `AppComponent`: `ViewEncapsulation.ShadowDom`
- Child components: `ViewEncapsulation.None`
- Layout transparency: `:host { display: contents; }`
- Chart legend uses CSS Subgrid
