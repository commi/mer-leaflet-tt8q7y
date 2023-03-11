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
  const map = L.map('map').setView([51.4, 10.4], 6);

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
  const outlineStatesPromise = fetch('./data/Hintergrundkarte/Grenze%20Bundesländer.geojson').then(res => res.json());

  // add german highways
  // fetch GeoJOSN file and decode it as JSON
  const highwaysPromise = fetch('./data/Hintergrundkarte/TEN-T%20roads.geojson').then(res => res.json());

  // add city dots
  // fetch GeoJOSN file and decode it as JSON
  const citiesGermanyPromise = fetch('./data/Hintergrundkarte/St%C3%A4dte%20Deutschland.geojson').then(res => res.json());

  // add oberleitung layer
  const oberleitungPromise = fetch('./data/Oberleitungsausbau.geojson').then(res => res.json());

  // Wait for all promises to complete before continuing
  const [outlineStates, highways, citiesGermany, oberleitung] = await Promise.all([
    outlineStatesPromise, highwaysPromise, citiesGermanyPromise, oberleitungPromise
  ]);

  // Add german state borders to background layer
  L.geoJSON(outlineStates, {
    style: { color: '#333', weight: 1, fill: false },
  }).addTo(hintergundLayer);

  // Add german highways to background layer
  L.Proj.geoJson(highways, {
    style:  _ => ({ color: '#888' }),
    fill:   false,
    stroke: '#777',
  }).addTo(hintergundLayer);

  // Add german state backgrounds to background layer
  L.geoJSON(outlineStates, {
    style: { color: '#333', weight: 1, stroke: false },
  }).addTo(hintergundLayer);

  // Add cities to background layer
  L.geoJSON(citiesGermany, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius:      4,
        fillColor:   '#EEE',
        color:       '#000',
        weight:      1,
        opacity:     1,
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
    pointToLayer:  (feature, latlng) => L.circle(latlng, {
      radius:      3000, // in meters here
      fillColor:   '#EDA',
      stroke:      false,
      fillOpacity: 1,
    }),
    onEachFeature: (feature, layer) => {
      // add each new layer to the Map, linked with the feature it was created from
      oberleitungsFeatures.set(feature, layer);
    },
    style:         _ => ({ color: '#888' }),
    fill:          false,
    stroke:        '#777',
  });

  /**
   * Function to add a GeoJSON file with MultiLineFeatures to the map.
   * It creates a layer and adds all features as sub-layers to it.
   * It colors the with the value derived with {@see getValueFromFeature}
   *
   * @param {string} url URL to GeoJSON file
   * @param {string} lowColor      Define the colors to use for the gradient
   * @param {string} highColor      Define the colors to use for the gradient
   * @param {number} minValue       Define the minimum and maximum values
   * @param {number} maxValue       Define the minimum and maximum values
   * @param {(Object) => Number} getValueFromFeature  function to get a scalar value from the GeoJSON feature
   */
  async function addLayer(url, lowColor, highColor, minValue, maxValue, getValueFromFeature)
  {
    // fetch the File and decode it as JSON
    const json        = await (await fetch(url)).json();
    // add a layer to the existing map
    const parentLayer = L.layerGroup([]).addTo(map);
    // Map to store features and the map objects created from them outside that map to manipulate them later
    const features    = new Map();

    // create map layers from GeoJSON
    L.Proj.geoJson(json, {
      style:         feature => ({
        // set color of the feature with the value derived from the feature
        "color": getLineColor(lowColor, highColor, minValue, maxValue, getValueFromFeature(feature))
      }),
      onEachFeature: (feature, layer) => {
        // add each new layer to the Map, linked with the feature it was created from
        features.set(feature, layer);
      },
      fill:          false,
    });
    return { parentLayer, features };
  }

  // Map with names and layers that are added to the map
  const layers = new Map();

  // create and add Diesel layer
  const [dieselLayer, bevLayer, olkwLayer, fcevLayer] = await Promise.all([
    addLayer('./data/GeoJSON/Diesel.geojson', '#FFEDA0', '#800026', 0, 15000, feature => feature.properties?.Diesel_Wer ?? 0),
    addLayer('./data/GeoJSON/BEV.geojson', '#FFEDA0', '#800026', 0, 15000, feature => feature.properties?.BEV_Wert ?? 0),
    addLayer('./data/GeoJSON/OLKW.geojson', '#FFEDA0', '#800026', 0, 15000, feature => feature.properties?.OLKW_Wert ?? 0),
    addLayer('./data/GeoJSON/FCEV.geojson', '#F7FCF5', '#075C05', 0, 15000, feature => feature.properties?.FCEV_Wert ?? 0),
  ]);

  layers.set('Diesel', dieselLayer);
  layers.set('BEV', bevLayer);
  layers.set('OLKW', olkwLayer);
  layers.set('FCEV', fcevLayer);


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
      if(!radioOberleitungsausbau.checked) {
        marker.remove();
        return;
      }
      // convert german date to iso date
      const isoDate = feature?.properties?.Time?.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
      // check if feature is before the selected year
      if(new Date(isoDate).getFullYear() <= year) {
        marker.addTo(oberleitungsLayer)
      }
      else {
        marker.remove()
      }
    });

    // add/remove Diesel/FCEV/…-features to their respective layer if the checkbox is checked and the year matches the feature date
    layers.forEach(({ features, parentLayer }, name) => {

      // get the checked state of the checkbox associated with this layer with the matching 'data-toggles' attribut
      let layerCheckboxChecked = document.querySelector(`input[data-toggles="${name}"]`).checked;

      features?.forEach((layer, feature) => {
        // if the checkbox is not checked, jsut remove the feature
        if(!layerCheckboxChecked) {
          layer.remove();
          return;
        }
        // convert german date to iso date
        const isoDate = feature?.properties?.Time?.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
        // check if feature is exaclty in the selected year
        if(new Date(isoDate).getFullYear() === year) {
          layer.addTo(parentLayer)
        }
        else {
          layer.remove()
        }
      });

    });
  }

  // Update the visibility of all feature once after creating everything so the map state mathes the inputs
  updateLayerVisibility();

  // Update the visibility of all feature whenever a control in the #form_settings container is changed by the user
  let timeoutId;
  document.querySelector('#form_settings').addEventListener('input', () => {
    if(timeoutId) {
      cancelAnimationFrame(timeoutId);
    }
    timeoutId = requestAnimationFrame(() => {
      updateLayerVisibility();
      timeoutId = null;
    });
  });
}

// start the loading process
initMap();

