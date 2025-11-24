import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'szenarien-component',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent {
  title = 'MeR Szenarienexplorer';
}
