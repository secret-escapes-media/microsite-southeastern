// general js for the project that wouldn't be a reuseable component


///////////////////////////////////////
//      Interactive map
///////////////////////////////////////

function map(){

  // launch map with settings
  mapboxgl.accessToken = 'pk.eyJ1IjoiaGFtaXNoamdyYXkiLCJhIjoiY2pkbjBmeGN6MDd1YzMzbXI3cWdpNThjayJ9.3YE8T1H2QUyqNIkxdKWxkg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hamishjgray/cjj740poy21gv2sqpicc0kxws',
    logoPosition: 'bottom-right',
    zoom: 8,
    center: [0.835399, 51.150949]
  });

  map.on('load', function(event) {

    ///////////// add the poi marker data so it can create clusters
    map.addSource("poi-markers", {
      type: "geojson",
      data: poiMarkers,
      cluster: true,
      clusterMaxZoom: 14,
    });

    ///////////// adds normal marker when there is no cluster
    map.addLayer({
      id: 'se-offers',
      type: 'symbol',
      // Add a GeoJSON source containing place coordinates and information.
      source: {
        type: 'geojson',
        data: offerMarkers
      },
      layout: {
        "icon-image": "map-pin-offer", // custom icon is in the mapbox style spritesheet
        'icon-anchor': "bottom"
      }
    });

    ///////////// adds normal marker when there is no cluster
    map.addLayer({
      id: 'stations',
      type: 'symbol',
      // Add a GeoJSON source containing place coordinates and information.
      source: {
        type: 'geojson',
        data: stationMarkers
      },
      layout: {
        "icon-image": "pin-southeastern", // custom icon is in the mapbox style spritesheet
        'icon-anchor': "bottom"
      }
    });

    ///////////// creates cluster shape layer to the map
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "poi-markers",
      filter: ["has", "point_count"],
      paint: { // style formatting for the cluster circle
        "circle-color": "#1f214d",
        "circle-radius": 20
      }
    });

    ///////////// adds cluster number data on top of shape
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "poi-markers",
      filter: ["has", "point_count"],
      layout: { // style formatting for cluster number
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Roboto Slab Bold"],
        "text-size": 18,
        "text-allow-overlap": true
      },
      paint: {
        "text-color": "#ffffff"
      }
    });

    ///////////// adds normal marker when there is no cluster
    map.addLayer({
      id: "unclustered-point",
      type: "symbol",
      source: "poi-markers",
      filter: ["!has", "point_count"],
      layout: {
        "icon-image": "pin-highlight", // custom icon is in the mapbox style spritesheet
        "icon-anchor": "bottom",
        "icon-allow-overlap": true
      }
    });

    ///////////// zooms in the map a bit to break the cluster on click
    map.on('click', 'clusters', function (e) {
      map.flyTo({
        center: e.lngLat,
        zoom: map.getZoom() + 1.5
      });
      // would like to get this so that the zoom level goes until the cluster separates, but after half a day of looking turns out it is a bit too complicated
    });

    ///////////// Launches modal when marker is clicked
    map.on('click', 'unclustered-point', function (e) {
      var clickedModalId = e.features[0].properties.id
      modalOpen(null, clickedModalId);
    });

    ///////////// Launches offer card when se offer marker is clicked
    map.on('click', 'se-offers', function (e) {
      var clickedOfferId = e.features[0].properties.id
      modalOpen(null, clickedOfferId);
    });

    ///////////// Launches station when station marker is clicked
    map.on('click', 'stations', function (e) {
      var clickedStationId = e.features[0].properties.id
      modalOpen(null, clickedStationId);
    });

    ///////////// center the map markers within the viewport
    var bounds = new mapboxgl.LngLatBounds();
    function getMapBounds() {
      poiMarkers.features.forEach(function(feature) {
        bounds.extend(feature.geometry.coordinates);
      });
      offerMarkers.features.forEach(function(feature) {
        bounds.extend(feature.geometry.coordinates);
      });
      stationMarkers.features.forEach(function(feature) {
        bounds.extend(feature.geometry.coordinates);
      });
      map.fitBounds(bounds, {padding: 60}); // adds padding so markers aren't on edge
    }
    getMapBounds(); // resets the view when the map loads
    windowResize(getMapBounds); // resets the view after the viewport has finished resizing

  });
}

///////////////////////////////////////
//            open map
///////////////////////////////////////

console.log();

$('.js-open-map').on('click', function(e) {
  e.preventDefault();
  // dont reload the map if its already open
  if ($('#map').children().length === 0) { map(); }
  $('.map__wrap').removeClass('is-closed').addClass('is-open');
})

$('.js-close-map').on('click', function(e) {
  e.preventDefault();
  $('.map__wrap').removeClass('is-open').addClass('is-closed');
})