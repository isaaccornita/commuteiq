// Get start & end from URL
const params = new URLSearchParams(window.location.search);
const startName = params.get('start') || 'FEU Manila';
const endName = params.get('end') || 'FEU Diliman';

// Initialize map
const map = L.map('map').setView([14.63,121.05],12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
  attribution:'&copy; OpenStreetMap contributors', subdomains:'abcd', maxZoom:19, opacity:0.95
}).addTo(map);

// Locations
const locations = {
  "FEU Manila": [14.607621, 121.051903],
  "FEU Diliman": [14.651686, 121.074436],
  "Quezon City": [14.676,121.043],
  "FEU Alabang": [14.4082,121.038]
};

const start = L.latLng(...locations[startName]);
const destination = L.latLng(...locations[endName]);

// Stations & Terminals
const stations = [
  {name:"FEU Manila Station", lat:14.607621, lng:121.051903},
  {name:"Tricycle Terminal 1", lat:14.6085, lng:121.0525},
  {name:"Tricycle Terminal 2", lat:14.6070, lng:121.0500},
  {name:"Visayas Avenue Station", lat:14.6765, lng:121.0430},
  {name:"Elliptical Road Station", lat:14.6490, lng:121.0290},
  {name:"Commonwealth Avenue Station", lat:14.6480, lng:121.0370},
  {name:"FEU Diliman Station", lat:14.651686, lng:121.074436},
];

// Add station markers
stations.forEach(s=>{
  const li=document.createElement('li'); li.textContent=s.name; document.getElementById('stations-list').appendChild(li);
  const iconUrl = s.name.includes("Tricycle") ? 'https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png':'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png';
  const marker = L.marker([s.lat,s.lng],{icon:L.icon({iconUrl:iconUrl,iconSize:[32,32]})}).addTo(map);
  marker.bindPopup(`<b>${s.name}</b>`);
});

// Live GPS
let userMarker;
if(navigator.geolocation){
  navigator.geolocation.watchPosition(pos=>{
    const userLatLng = L.latLng(pos.coords.latitude,pos.coords.longitude);
    if(!userMarker){
      userMarker = L.marker(userLatLng,{icon:L.icon({iconUrl:'https://maps.gstatic.com/mapfiles/ms2/micons/man.png',iconSize:[32,32]})}).addTo(map).bindPopup("You are here").openPopup();
      map.setView(userLatLng,14);
    } else userMarker.setLatLng(userLatLng);
  },err=>console.error(err),{enableHighAccuracy:true});
}

// Routing with via points for correct FEU Manila → FEU Diliman path
let waypoints = [start, destination];

// Only add via points if FEU Manila → FEU Diliman
if(startName === "FEU Manila" && endName === "FEU Diliman"){
  waypoints = [
    L.latLng(...locations["FEU Manila"]),
    L.latLng(14.6185, 121.0535), // España Blvd
    L.latLng(14.6390, 121.0580), // Quezon Ave
    L.latLng(...locations["FEU Diliman"])
  ];
}

const routeControl = L.Routing.control({
  waypoints: waypoints,
  router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
  lineOptions: { styles:[{color:'#42e695',weight:5}] },
  createMarker: function(i, wp) {
      if(i === 0) return L.marker(wp.latLng,{icon:L.icon({iconUrl:'https://maps.gstatic.com/mapfiles/ms2/micons/green.png',iconSize:[32,32]})});
      if(i === waypoints.length-1) return L.marker(wp.latLng,{icon:L.icon({iconUrl:'https://maps.gstatic.com/mapfiles/ms2/micons/red.png',iconSize:[32,32]})});
      return null;
  },
  routeWhileDragging: false,
  addWaypoints: false
}).addTo(map);

routeControl.on('routesfound',e=>{
  const route=e.routes[0];
  document.getElementById('distance').textContent=`Distance: ${(route.summary.totalDistance/1000).toFixed(2)} km`;
  document.getElementById('duration').textContent=`Duration: ${Math.round(route.summary.totalTime/60)} mins`;
});

// Panel toggle
function togglePanel(id){
  const content=document.getElementById(id).querySelector('.panel-content');
  const btn=document.querySelector('#'+id+' .toggle-btn');
  if(content.style.display==='none'){ content.style.display='block'; btn.textContent='–'; }
  else { content.style.display='none'; btn.textContent='+'; }
}
