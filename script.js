map.on('load', async () => {
    const startCoord = await getCoords(start);
    const endCoord = await getCoords(end);
    if (!startCoord || !endCoord) return;

    new mapboxgl.Marker({color:'green'}).setLngLat(startCoord).addTo(map);
    new mapboxgl.Marker({color:'red'}).setLngLat(endCoord).addTo(map);

    const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`);
    const data = await res.json();
    const route = data.routes[0].geometry;

    map.addSource('route', { type: 'geojson', data: { type:'Feature', geometry: route } });
    map.addLayer({ id:'route', type:'line', source:'route', layout:{'line-join':'round','line-cap':'round'}, paint:{'line-color':'#42e695','line-width':5} });

    map.fitBounds([startCoord, endCoord], { padding: 50 });

    document.getElementById('map').style.opacity = 1;

    const distance = (data.routes[0].distance / 1000).toFixed(2) + ' km';
    const duration = (data.routes[0].duration / 60).toFixed(0) + ' mins';
    document.getElementById('distance').innerText = 'Distance: ' + distance;
    document.getElementById('duration').innerText = 'Estimated Time: ' + duration;
});
