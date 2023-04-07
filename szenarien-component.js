class SzenarienComponent extends HTMLElement {
  basePath;
  initialized = false;

  constructor()
  {
    super();
    this.attachShadow({ mode: 'open' });
    this.basePath = new URL('.', import.meta.url).href;
  }


  loadCSS(url)
  {
    return new Promise((resolve, reject) => {
      const link   = document.createElement('link');
      link.rel     = 'stylesheet';
      link.href    = url;
      link.onload  = () => resolve();
      link.onerror = (error) => reject(error);
      this.shadowRoot.appendChild(link);
    });
  }

  loadScript(url)
  {
    return new Promise((resolve, reject) => {
      const script   = document.createElement('script');
      script.src     = url;
      script.onload  = () => resolve();
      script.onerror = (error) => reject(error);
      this.shadowRoot.appendChild(script);
    });
  }

  async loadDependencies()
  {
    const externalStyles = [
      `${this.basePath}js/leaflet.css`,
      `${this.basePath}js/bootstrap.min.css`
    ];

    const externalScripts = [
      `${this.basePath}js/leaflet.js`,
      `${this.basePath}js/proj4.js`,
      `${this.basePath}js/proj4leaflet.js`,
      `${this.basePath}js/chroma.min.js`,
      `${this.basePath}js/frappe-charts.min.umd.js`
    ];

    // Load external styles
    await Promise.all(externalStyles.map((style) => this.loadCSS(style)));

    // Load Leaflet and proj4
    await Promise.all([
      this.loadScript(externalScripts[0]),
      this.loadScript(externalScripts[1])
    ]);

    // Load proj4leaflet and the remaining scripts
    await Promise.all([
      this.loadScript(externalScripts[2]),
      this.loadScript(externalScripts[3]),
      this.loadScript(externalScripts[4])
    ]);
  }

  // noinspection JSUnusedGlobalSymbols
  async connectedCallback()
  {
    if (this.initialized) {
      return;
    }
    const template = document.createElement('template');

    /* data-bs-theme="light" to get the css variables from bootstrap */
    template.innerHTML = `<div class="container-fluid root" data-bs-theme="light">
  <div class="row">

    <!-- linke Card -->
    <div class="col-12 col-lg-5">

      <div class="card mb-3">
        <div class="card-body" id="form_settings">

          <div class="row align-items-stretch">
            <!-- Karte -->
            <div class="col-12">

              <h4 class="h5">Fahrten pro Antriebsart pro Autobahnabschnitt</h4>

              <div class="position-relative">
                <div id="map" style="background: #B5D1DC"></div>

                <h2 id="label_year" class="position-absolute top-0 end-0 p-2"></h2>
              </div>
            </div>

            <!-- controls for year -->
            <div class="col-12">
              <div class="row g-3 pt-2">

                <div class="col-auto">
                  <label class="form-label" for="input_year">Jahr</label>
                </div>
                <div class="col-auto">
                  <label class="form-label" for="input_year">2023</label>
                </div>
                <div class="col">
                  <input class="form-range" type="range" min="2023" max="2050" value="2023"
                         id="input_year">
                </div>
                <div class="col-auto">
                  <label class="form-label" for="input_year">2050</label>
                </div>
              </div>
            </div>

            <!-- controls for map layer visibility -->
            <div class="col-12 col-md-6 d-flex align-items-stretch">
              <div class="card flex-fill">
                <div class="card-body">
                  <h4 class="h5">Anzuzeigende Größe</h4>

                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="visible_layer"
                           id="visible_layer_oberleitungsausbau">
                    <label class="form-check-label" for="visible_layer_oberleitungsausbau">
                      Oberleitungsausbau
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="visible_layer"
                           id="visible_layer_diesel"
                           data-toggles="Diesel"
                           checked>
                    <label class="form-check-label" for="visible_layer_diesel">
                      Diesel
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="visible_layer"
                           id="visible_layer_bev"
                           data-toggles="BEV">
                    <label class="form-check-label" for="visible_layer_bev">
                      BEV
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="visible_layer"
                           id="visible_layer_olkw"
                           data-toggles="OLKW">
                    <label class="form-check-label" for="visible_layer_olkw">
                      OLKW
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="visible_layer"
                           id="visible_layer_fcev"
                           data-toggles="FCEV"
                    >
                    <label class="form-check-label" for="visible_layer_fcev">
                      FCEV
                    </label>
                  </div>

                </div>
              </div>
            </div>

            <!-- Legende für die Karte -->
            <div class="col-12 col-md-6 d-flex align-items-stretch">
              <div class="card flex-fill">
                <div class="card-body">
                  <h4 class="h5">Prognostizierten Fahrten pro Tag pro Abschnitt</h4>

                  <table class="table table-borderless table-sm mb-0">
                    <tbody id="tbody_legend"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- rechte  Card -->
    <div class="col-12 col-lg-7">

      <div class="card">
        <div class="card-body">

          <h4 class="h5">Bestand/Neuzulassungen pro Antriebsart </h4>

          <div class="row flex-nowrap">
            <div class="col flex-fill" style="max-width: calc(100% - 4em - var(--bs-gutter-x) * 4)">
              <!-- charts -->
              <div id="chart-1"></div>
            </div>
            <div class="col-auto align-self-center" style="min-width: 4em">
              <!-- Legende für das Diagramm -->
              <table>
                <tbody id="tbody_legend_chart" class="text-nowrap"></tbody>
              </table>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-auto" id="chart_settings">

              <div class="card">
                <div class="card-body">

                  <div class="row">
                    <div class="col-auto">
                      <h4 class="h5">Anzuzeigende Größe</h4>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="datasource"
                               id="input_datasource_Bestand" value="Bestand" checked>
                        <label class="form-check-label"
                               for="input_datasource_Bestand">Bestand</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="datasource"
                               id="input_datasource_Neuzulassungen" value="Neuzulassungen">
                        <label class="form-check-label" for="input_datasource_Neuzulassungen">Neuzulassungen</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="datasource"
                               id="input_datasource_THG-Emissionen" value="THG-Emissionen">
                        <label class="form-check-label" for="input_datasource_THG-Emissionen">THG-Emissionen</label>
                      </div>
                    </div>

                    <div class="col-auto">
                      <h4 class="h5">Größenklasse</h4>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="sizeclass"
                               id="input_sizeclass_gesamt" value="alle Größenklassen" checked>
                        <label class="form-check-label" for="input_sizeclass_gesamt">Alle
                          Größenklassen</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="sizeclass"
                               id="input_sizeclass_3,5-7,5" value="3,5-7,5t">
                        <label class="form-check-label" for="input_sizeclass_3,5-7,5">3,5 – 7,5 t</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="sizeclass"
                               id="input_sizeclass_7,5-12" value="7,5-12t">
                        <label class="form-check-label"
                               for="input_sizeclass_7,5-12">7,5 – 12 t</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="sizeclass"
                               id="input_sizeclass_12-18" value="12-18t">
                        <label class="form-check-label"
                               for="input_sizeclass_12-18">12 – 18 t</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="sizeclass"
                               id="input_sizeclass_18-26" value="18-26t">
                        <label class="form-check-label"
                               for="input_sizeclass_18-26">18 – 26 t</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="sizeclass"
                               id="input_sizeclass_26-40" value="26-40t">
                        <label class="form-check-label"
                               for="input_sizeclass_26-40">&gt; 26 t</label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-auto">
              <div class="card">
                <div class="card-body">
                  Dieses Szenario bildet die TCO-basierte Flottenentwicklung ohne Berücksichtigung
                    der Infrastrukturkosten ab. Dabei wurde eine degressive Förderung alternativer
                    Antriebe inkl. Mautbefreiung bis 2029 angenommen.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
  <style>
      :host {
          display: contents;
          hyphens: auto;
      }

      /* replacement for bootstrap styles on <body> */
      /*noinspection CssUnresolvedCustomProperty*/
      .root {
          margin: 0;
          font-family: var(--bs-body-font-family);
          font-size: var(--bs-body-font-size);
          font-weight: var(--bs-body-font-weight);
          line-height: var(--bs-body-line-height);
          color: var(--bs-body-color);
          text-align: var(--bs-body-text-align);
          background-color: transparent;
          -webkit-text-size-adjust: 100%;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }

      .row {
          --bs-gutter-x: 1rem;
          --bs-gutter-y: 1rem;
      }

      div#map {
          height: 600px;
      }

      /**
       * style for city labels
       */
      .leaflet-tooltip.city {
          background-color: transparent;
          border: transparent;
          box-shadow: none;
      }

      .leaflet-tooltip.city:before {
          display: none;
      }


      /**
       * Hide the frappe chart tooltip, it is ugly
       */
      .chart-container .graph-svg-tip {
          display: none;
      }

      .chart-container .chart-legend {
          display: none;
      }

      #tbody_legend_chart td {
          font-size: 12px
      }

      #tbody_legend td {
          white-space: nowrap;
          min-width: 1rem;
      }

      #tbody_legend td:first-child {
          padding-inline-start: 0;
      }

      #tbody_legend td:last-child {
          padding-inline-end: 0;
      }
  </style>
    `;

    this.initialized = true;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    await this.loadDependencies();
    this.onInit(this.shadowRoot);
  }

  onInit(document)
  {
    const basePath = this.basePath;

    /** Function to calculate the color of a feature based on a number
     *
     * @return {string}
     * @param {string} lowColor
     * @param {string} highColor
     * @param {number} minWert
     * @param {number} maxWert
     * @param {number} wert
     */
    function getLineColor(lowColor, highColor, minWert, maxWert, wert)
    {
      // Calculate the proportion of the value between the minimum and maximum values
      const proportion = (wert - minWert) / (maxWert - minWert);

      // Interpolate between the two colors based on the proportion, return the color as a string
      return chroma.interpolate(lowColor, highColor, proportion, 'hsl').hex();
    }


    async function initMap()
    {
      // create LeafLet map on the div #map and center it on germany
      const map = L.map(document.querySelector('#map')).setView([51.4, 10.4], 6);

      // define projection definition used in the GeoJSOn files
      proj4.defs('EPSG:3034',
        '+proj=lcc +lat_0=52 +lon_0=10 +lat_1=35 +lat_2=65 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
      proj4.defs('EPSG:25832',
        "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
      // OGC:CRS84 is the same as EPSG:4326
      proj4.defs['OGC:CRS84'] = proj4.defs['EPSG:4326'];

      // add layer to map for holding the background sub-layers
      const hintergundLayer = L.layerGroup([]).addTo(map);

      // Add german state backgrounds
      // fetch GeoJOSN file and decode it as JSON
      const outlineStatesPromise = fetch(`${basePath}/data/Hintergrundkarte/Grenze%20Bundesländer.geojson`).then(res => res.json());

      // add german highways
      // fetch GeoJOSN file and decode it as JSON
      const highwaysPromise = fetch(`${basePath}/data/Hintergrundkarte/TEN-T%20roads.geojson`).then(res => res.json());

      // add city dots
      // fetch GeoJOSN file and decode it as JSON
      const citiesGermanyPromise = fetch(`${basePath}/data/Hintergrundkarte/St%C3%A4dte%20Deutschland.geojson`).then(res => res.json());

      // add oberleitung layer
      const oberleitungPromise = fetch(`${basePath}/data/Oberleitungsausbau.geojson`).then(res => res.json());

      // Wait for all promises to complete before continuing
      const [outlineStates, highways, citiesGermany, oberleitung] = await Promise.all([
        outlineStatesPromise, highwaysPromise, citiesGermanyPromise, oberleitungPromise
      ]);

      // Add german state backgrounds to background layer
      L.geoJSON(outlineStates, {
        style: { color: '#FFF', weight: 1, stroke: false, fillOpacity: 1 },
      }).addTo(hintergundLayer);

      // Add german highways to background layer
      L.Proj.geoJson(highways, {
        style: _ => ({ color: '#888' }),
        fill: false,
        stroke: '#777',
      }).addTo(hintergundLayer);

      // Add german state borders to background layer
      L.geoJSON(outlineStates, {
        style: { color: '#DDD', weight: 1, fill: false },
      }).addTo(hintergundLayer);

      // Add cities to background layer
      L.geoJSON(citiesGermany, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
          radius: 4,
          fillColor: '#EEE',
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        })
          // add a label to each city dot
          .bindTooltip(feature.properties.name, {
            permanent: true,
            direction: 'right',
            className: 'city',
          })
          .openTooltip(),
      }).addTo(hintergundLayer);


      // add a layer to the existing map
      const oberleitungsLayer    = L.layerGroup([]).addTo(map);
      // Map to store features and the map objects created from them outside that map to manipulate them later
      const oberleitungsFeatures = new Map();

      L.Proj.geoJson(oberleitung, {
        pointToLayer: (feature, latlng) => L.circle(latlng, {
          radius: 3000, // in meters here
          fillColor: '#EDA',
          stroke: false,
          fillOpacity: 1,
        }),
        onEachFeature: (feature, layer) => {
          // add each new layer to the Map, linked with the feature it was created from
          oberleitungsFeatures.set(feature, layer);
        },
        style: _ => ({ color: '#888' }),
        fill: false,
        stroke: '#777',
      });

      /**
       * Function to add a GeoJSON file with MultiLineFeatures to the map.
       * It creates a layer and adds all features as sub-layers to it.
       * It colors the with the value derived with {@see getValueFromFeature}
       *
       * @param {Object} options An object containing the following properties:
       * @param {string} options.url URL to GeoJSON file
       * @param {string} options.lowColor The color to use for the lowest value.
       * @param {string} options.highColor The color to use for the highest value.
       * @param {number} options.minValue The minimum value of the range.
       * @param {number} options.maxValue The maximum value of the range.
       * @param {(Object) => Number} options.getValueFromFeature A function to get a scalar value from the GeoJSON feature.
       *
       * @returns {Promise<{features: Map<any, any>, parentLayer: any}>} A promise that resolves to an object containing the parent layer and the map of features.
       */
      async function addLayer({
                                url,
                                lowColor,
                                highColor,
                                minValue,
                                maxValue,
                                getValueFromFeature,
                              })
      {
        // fetch the File and decode it as JSON
        const json        = await (await fetch(url)).json();
        // add a layer to the existing map
        const parentLayer = L.layerGroup([]).addTo(map);
        // Map to store features and the map objects created from them outside that map to manipulate them later
        const features    = new Map();

        // create map layers from GeoJSON
        L.Proj.geoJson(json, {
          style: feature => ({
            // set color of the feature with the value derived from the feature
            "color": getLineColor(lowColor, highColor, minValue, maxValue, getValueFromFeature(feature))
          }),
          onEachFeature: (feature, layer) => {
            // add each new layer to the Map, linked with the feature it was created from
            features.set(feature, layer);
          },
          fill: false,
        });
        return { parentLayer, features };
      }


      // create layer options as a Map with layer names as keys
      const layerOptions = new Map([
        [
          'Diesel', {
          url: `${basePath}/data/GeoJSON/Diesel.geojson`,
          lowColor: '#DDDDDC',
          highColor: '#292929',
          minValue: 0,
          maxValue: 23000,
          getValueFromFeature: feature => feature.properties?.Diesel_Wer ?? 0
        }
        ],
        [
          'BEV', {
          url: `${basePath}/data/GeoJSON/BEV.geojson`,
          lowColor: '#C3E2FB',
          highColor: '#073459',
          minValue: 0,
          maxValue: 23000,
          getValueFromFeature: feature => feature.properties?.BEV_Wert ?? 0
        }
        ],
        [
          'OLKW', {
          url: `${basePath}/data/GeoJSON/OLKW.geojson`,
          lowColor: '#EBF7CE',
          highColor: '#496010',
          minValue: 0,
          maxValue: 23000,
          getValueFromFeature: feature => feature.properties?.OLKW_Wert ?? 0
        }
        ],
        [
          'FCEV', {
          url: `${basePath}/data/GeoJSON/FCEV.geojson`,
          lowColor: '#FFD5E8',
          highColor: '#960045',
          minValue: 0,
          maxValue: 23000,
          getValueFromFeature: feature => feature.properties?.FCEV_Wert ?? 0
        }
        ],
      ]);


      // Map with names and layers that are added to the map
      const layers = new Map();

      // create and add layers using layer options
      const promises = Array.from(layerOptions)
        .map(([layerName, options]) => addLayer(options).then(layer => [layerName, layer]));

      (await Promise.all(promises))
        .forEach(([layerName, layer]) => layers.set(layerName, layer));


      // create table and legend
      const tbody = document.querySelector('#tbody_legend');

      for (const [layerName, { highColor, lowColor, maxValue, minValue }] of layerOptions) {
        // create table row and cells for layer legend
        const row       = tbody.insertRow();
        const nameCell  = row.insertCell();
        const colorCell = row.insertCell();
        const rangeCell = row.insertCell();

        // layer name
        nameCell.textContent = layerName;

        // color legend
        const gradientColors           = chroma.scale([lowColor, highColor]).mode('hsl').colors(10).map(color => color);
        colorCell.style.background     = `linear-gradient(to right, ${gradientColors.join(', ')})`;
        colorCell.style.width          = '120px';
        colorCell.style.padding        = '6px';
        colorCell.style.backgroundClip = 'content-box';

        // value range
        rangeCell.textContent = `${minValue} – ${maxValue}`;
      }


      // get references to controls from HTML
      const yearSlider              = document.querySelector('#input_year');
      const yearLabel               = document.querySelector('#label_year');
      const radioOberleitungsausbau = document.querySelector('#visible_layer_oberleitungsausbau');

      // show / hide Layer depending on seleted year and selected checkboxes
      function updateLayerVisibility()
      {
        const year = yearSlider.valueAsNumber;

        // show year in on the map
        yearLabel.textContent = year;

        // add/remove Oberleitungs-features to berleitungs-layer if the checkbox is checked and the year as before the feature date
        oberleitungsFeatures.forEach((marker, feature) => {
          if (!radioOberleitungsausbau.checked) {
            marker.remove();
            return;
          }
          // convert german date to iso date
          const isoDate = feature?.properties?.Time?.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
          // check if feature is before the selected year
          if (new Date(isoDate).getFullYear() <= year) {
            marker.addTo(oberleitungsLayer);
          } else {
            marker.remove();
          }
        });

        // add/remove Diesel/FCEV/…-features to their respective layer if the checkbox is checked and the year matches the feature date
        layers.forEach(({ features, parentLayer }, name) => {

          // get the checked state of the checkbox associated with this layer with the matching 'data-toggles' attribut
          let layerCheckboxChecked = document.querySelector(`input[data-toggles="${name}"]`).checked;

          features?.forEach((layer, feature) => {
            // if the checkbox is not checked, jsut remove the feature
            if (!layerCheckboxChecked) {
              layer.remove();
              return;
            }
            // convert german date to iso date
            const isoDate = feature?.properties?.Time?.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
            // check if feature is exaclty in the selected year
            if (new Date(isoDate).getFullYear() === year) {
              layer.addTo(parentLayer);
            } else {
              layer.remove();
            }
          });

        });
      }

      // Update the visibility of all feature once after creating everything so the map state mathes the inputs
      updateLayerVisibility();

      // Update the visibility of all feature whenever a control in the #form_settings container is changed by the user
      let timeoutId;
      document.querySelector('#form_settings').addEventListener('input', () => {
        if (timeoutId) {
          cancelAnimationFrame(timeoutId);
        }
        timeoutId = requestAnimationFrame(() => {
          updateLayerVisibility();
          timeoutId = null;
        });
      });
    }


    // Erstellen einer Map zum Speichern der zwischengespeicherten Daten
    const dataCache = new Map();

    // Funktion zum Abrufen von JSON-Daten unter Verwendung des Cache
    async function fetchJSON(filename)
    {
      if (dataCache.has(filename)) {
        // Wenn die Daten bereits vorhanden sind, aus dem Cache zurückgeben
        return dataCache.get(filename);
      }
      // Abrufen der Daten ab, wenn sie nicht im Cache vorhanden sind
      const data = await (await fetch(filename)).json();

      // Füge die Daten zum Cache hinzu
      dataCache.set(filename, data);

      return data;
    }


    async function initCharts()
    {
      // Funktion zum Aktualisieren der Sichtbarkeit der Kartenfunktionen basierend auf den ausgewählten Einstellungen
      async function updateChart()
      {
        // Abrufen der ausgewählten Datenquelle und Größenklasse
        const dataSource = document.querySelector('input[name="datasource"]:checked').value;
        const sizeClass  = document.querySelector('input[name="sizeclass"]:checked').value;

        // Zusammensetzen des Dateinamens aus den ausgewählten Einstellungen
        const filename = `${basePath}/data/Bestand und Neuzulassungen/${dataSource} ${sizeClass}.json`;

        // Abrufen der Daten unter Verwendung des Cache
        let data;
        try {
          data = await fetchJSON(filename);
        }
        catch (error) {
          console.warn(`Could not fetch ${filename}: ${error}`);
          return;
        }

        // Mapping für die Farben
        const colorMap = {
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

          "Strom BEV": "#063458",
          "Strom O-BEV": "#496010",
          "H2 FCEV": "#C00000",
          "Diesel": "#9A9A9A",
          "Fzg.-Herstellung  BEV": "#0D68B1",
          "Fzg.-Herstellung O-BEV": "#92C020",
          "Fzg.-Herstellung FCEV": "#E02020",
          "Fzg.-Herstellung Diesel": "#BABABA",
          "Infrastruktur BEV": "#88C5F6",
          "Infrastruktur O-BEV ": "#D7EF9D",
        };

        // Extrahieren der Serien-namen (Jahreszahl)
        const labels = data.map(datum => `'${(typeof datum[dataSource] === 'string'
          ? datum[dataSource]
          : datum[dataSource].toString()).slice(-2, 100)}`);

        // Filtere die Schlüssel, um die Daten für das Diagramm zu generieren
        const seriesNames = Object.keys(data[0]).filter(key => key !== dataSource && key !== 'null');
        const datasets    = seriesNames.map(label => ({
          name: label,
          values: data.map(datum => typeof datum[label] === 'string' ? parseFloat(datum[label].replace(',', '.')) : datum[label])
        }));

        // Erstellen des gestapelten Balkendiagramms mit Frappe Charts
        const chartDiv     = document.querySelector('#chart-1');
        chartDiv.innerHTML = '';
        new frappe.Chart(chartDiv, {
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
          colors: seriesNames.map(n => colorMap[n] ?? n),
          axisOptions: {
            xAxisMode: 'tick',
            xIsSeries: false
          }
        });

        // Erstellen der Legenden-Tabelle
        const legendTable     = document.querySelector('#tbody_legend_chart');
        legendTable.innerHTML = '';
        seriesNames.forEach(name => {
          const row = legendTable.insertRow();

          // Zelle für Farbmarkierung
          const colorCell       = row.insertCell();
          colorCell.innerHTML   = '&#x25A0;';
          colorCell.style.color = colorMap[name];

          // Zelle für Seriennamen
          const labelCell       = row.insertCell();
          labelCell.textContent = name;
        });
      }

      // Update the chart
      updateChart();

      // Update the chart whenever a control in the #chart_settings container is changed by the user
      document.querySelector('#chart_settings').addEventListener('input', () => updateChart());
    }


    // start the loading process for the map
    initMap();

    // start the loading process for the charts
    initCharts();
  }
}

window.customElements.define('szenarien-component', SzenarienComponent);