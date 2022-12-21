async function initMap() {
  const latLong = [51.4, 10.4];

  const map = L.map('map').setView(latLong, 6);

  // add german border
  const outlineGermany = await (
    await fetch(
      'https://raw.githubusercontent.com/commi/mer-leaflet-tt8q7y/main/data/Hintergrundkarte/Grenze%20Deutschland.geojson'
    )
  ).json();

  L.geoJSON(outlineGermany, {
    style: { color: '#333' },
  }).addTo(map);

  // add city dots
  const citiesGermany = await (
    await fetch(
      'https://raw.githubusercontent.com/commi/mer-leaflet-tt8q7y/main/data/Hintergrundkarte/St%C3%A4dte%20Deutschland.geojson'
    )
  ).json();

  const geojsonMarkerOptions = {
    radius: 4,
    fillColor: '#eee',
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  };

  L.geoJSON(citiesGermany, {
    pointToLayer: function (feature, latlng) {
      return (
        L.circleMarker(latlng, geojsonMarkerOptions)
          // add label to each city dot
          .bindTooltip(feature.properties.name, {
            permanent: true,
            direction: 'right',
            className: 'city',
          })
          .openTooltip()
      );
    },
  }).addTo(map);

  // add german highways
  const highways = await (
    await fetch(
      'https://raw.githubusercontent.com/commi/mer-leaflet-tt8q7y/main/data/Hintergrundkarte/TEN-T%20roads.geojson'
    )
  ).json();

  proj4.defs(
    'EPSG:3034',
    '+proj=lcc +lat_0=52 +lon_0=10 +lat_1=35 +lat_2=65 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
  );

  L.Proj.geoJson(highways, {
    style: (f) => ({ color: '#888' }),
    fill: false,
    stroke: '#777',
  }).addTo(map);
}

initMap();
