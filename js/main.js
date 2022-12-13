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

  // add german border
  const highways = await (
    await fetch(
      'https://raw.githubusercontent.com/commi/mer-leaflet-tt8q7y/main/data/Hintergrundkarte/TEN-T%20roads.geojson'
    )
  ).json();


  L.Proj.geoJson(highways).addTo(map);
  L.geoJSON(highways, {
    style: { color: '#333' },
    fill: false
  }).addTo(map);
}

initMap();
