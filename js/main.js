navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const coords = position.coords;
  const latitude = coords.latitude;
  const longitude = coords.longitude;
  const accuracy = coords.accuracy;

  console.log(`Latitude : ${latitude}`);
  console.log(`Longitude: ${longitude}`);
  console.log(`Accuracy: ${accuracy} m.`);

  const latLong = [latitude, longitude];

  const map = L.map('map').setView(latLong, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
  }).addTo(map);

  const marker = L.marker(latLong).addTo(map);

  const circle = L.circle(latLong, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
  }).addTo(map);
  
  map.on('click', onMapClick);
}

function error(error) {
  console.error('Error getting location:', error.code, error.message);
}


const popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

