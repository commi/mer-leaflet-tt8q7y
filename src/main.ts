import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { createCustomElement } from '@angular/elements';
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(moduleRef => {
    const injector = moduleRef.injector;
    const customElement = createCustomElement(AppComponent, { injector });
    customElements.define('szenarien-component', customElement);
  })
  .catch(err => console.error(err));
