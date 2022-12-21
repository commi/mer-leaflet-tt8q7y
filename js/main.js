async function initMap()
{
  const latLong = [51.4, 10.4];

  const map = L.map('map').setView(latLong, 6);

  proj4.defs(
    'EPSG:3034',
    '+proj=lcc +lat_0=52 +lon_0=10 +lat_1=35 +lat_2=65 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
  );
  proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

  proj4.defs['OGC:CRS84'] = proj4.defs['EPSG:4326'];

  const hintergundLayer = L.layerGroup([]).addTo(map);

  // add german border
  /*
   const outlineGermany = await (
   await fetch(
   './data/Hintergrundkarte/Grenze%20Deutschland.geojson'
   )
   ).json();

   L.geoJSON(outlineGermany, {
   style: { color: '#333' },
   }).addTo(map);
   */

  // add state backgrounds
  const outlineStates = await (
    await fetch(
      './data/Hintergrundkarte/Grenze%20Bundesländer.geojson'
    )
  ).json();

  L.geoJSON(outlineStates, {
    style: { color: '#333', weight: 1, stroke: false },
  }).addTo(hintergundLayer);

  // add german highways
  const highways = await (
    await fetch(
      './data/Hintergrundkarte/TEN-T%20roads.geojson'
    )
  ).json();

  L.Proj.geoJson(highways, {
    style:  _ => ({ color: '#888' }),
    fill:   false,
    stroke: '#777',
  }).addTo(hintergundLayer);

  // state borders
  L.geoJSON(outlineStates, {
    style: { color: '#333', weight: 1, fill: false },
  }).addTo(hintergundLayer);

  // add city dots
  const citiesGermany = await (
    await fetch(
      './data/Hintergrundkarte/St%C3%A4dte%20Deutschland.geojson'
    )
  ).json();

  const geojsonMarkerOptions = {
    radius:      4,
    fillColor:   '#EEE',
    color:       '#000',
    weight:      1,
    opacity:     1,
    fillOpacity: 0.8,
  };

  L.geoJSON(citiesGermany, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, geojsonMarkerOptions)
      // add label to each city dot
      .bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'right',
        className: 'city',
      })
      .openTooltip(),
  }).addTo(hintergundLayer);


  // =========

  // add oberleitung
  const oberleitung = await (
    await fetch(
      './data/Oberleitungsausbau.geojson'
    )
  ).json();

  const oberleitungMarkerOptions = {
    radius:      3000, // in meters here
    fillColor:   '#EDA',
    stroke:      false,
    fillOpacity: 1,
  };

  const oberleitungsLayer = L.layerGroup([]).addTo(map);

  const oberleitungsFeatures = new Map();

  L.Proj.geoJson(oberleitung, {
    pointToLayer: (feature, latlng) => {
      const marker = L.circle(latlng, oberleitungMarkerOptions);
      oberleitungsFeatures.set(feature, marker);
      return marker;
    },
    style:        _ => ({ color: '#888' }),
    fill:         false,
    stroke:       '#777',
  }).addTo(oberleitungsLayer);

  // add Diesel
  const DieselFahrten = await (
    await fetch(
      './data/GeoJSON/Diesel.geojson'
    )
  ).json();

  const DieselFahrtenLayer = L.layerGroup([]).addTo(map);

  const DieselFahrtenFeatures = new Map();

  L.Proj.geoJson(DieselFahrten, {
    pointToLayer: (feature, latlng) => {
      if(feature.properties.Wert) {
        // convert german date to iso date
        const isoDate     = feature?.properties?.Time.replace(/(\d\d)\.(\d\d)\.(\d{4}).*/, '$3-$2-$1');
        // check if feature is before the selected year
        const featureDate = new Date(isoDate);

        if(featureDate.getFullYear() != 2023) return;

        const marker = L.circle(latlng, {
          radius:      feature.properties.Wert / 2, // in meters here
          fillColor:   'red',
          stroke:      false,
          fillOpacity: 0.5,
        });
        DieselFahrtenFeatures.set(feature, marker);
        return marker;
      }
    },
    style:        _ => ({ color: '#888' }),
    fill:         false,
    stroke:       '#777',
  }).addTo(DieselFahrtenLayer);


  // interactive controls
  const yearSlider = document.querySelector('#input_year');


  // show / hide Oberleitungen depending on seleted year
  function updateOberleitungslayer()
  {
    const year = yearSlider.valueAsNumber;

    oberleitungsFeatures.forEach((marker, feature) => {
      // convert german date to iso date
      const isoDate     = feature?.properties?.Time.replace(/(\d\d)\.(\d\d)\.(\d{4})/, '$3-$2-$1');
      // check if feature is before the selected year
      const featureDate = new Date(isoDate);
      if(featureDate.getFullYear() <= year) {
        marker.addTo(oberleitungsLayer)
      }
      else {
        marker.remove()
      }
    });
  };
  updateOberleitungslayer();

  yearSlider.addEventListener('input', _ => {
    updateOberleitungslayer();
  });
}

initMap();

