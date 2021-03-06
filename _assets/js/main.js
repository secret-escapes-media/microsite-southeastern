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
    minZoom: 7,
    center: [0.6702, 51.1897]
  });

  // disable map rotation using right click + drag
  map.dragRotate.disable();

  // disable map rotation using touch rotation gesture
  map.touchZoomRotate.disableRotation();

  // builds map with custom functionality
  map.on('load', function(event) {

    ///////////// add the poi marker data so it can create clusters
    map.addSource("poi-markers", {
      type: "geojson",
      data: poiMarkers,
      cluster: true,
      clusterMaxZoom: 14,
    });

    ///////////// adds se offer markers to the map
    map.addLayer({
      id: 'se-offers',
      type: 'symbol',
      // Add a GeoJSON source containing place coordinates and information.
      source: {
        type: 'geojson',
        data: offerMarkers
      },
      layout: {
        "icon-image": "se-offer-01", // custom icon is in the mapbox style spritesheet
        "icon-size": .8,
        'icon-anchor': "bottom"
      }
    });

    ///////////// add station markers to the map
    map.addLayer({
      id: 'stations',
      type: 'symbol',
      // Add a GeoJSON source containing place coordinates and information.
      source: {
        type: 'geojson',
        data: stationMarkers
      },
      layout: {
        "icon-image": "train-station-02", // custom icon is in the mapbox style spritesheet
        "icon-size": .8,
        'icon-anchor': "bottom",
        "text-field": "{title}",
        "text-font": ["Roboto Slab Regular"],
        "text-size": 13,
        "text-anchor": "top",
        "text-letter-spacing": .02
      },
      paint: {
        "text-color": "#2e2e2e",
        "text-halo-color": "rgba(248,244,240,.66)",
        "text-halo-width": 3,
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
        "circle-radius": 22
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
        "text-size": 22,
        "text-allow-overlap": true
      },
      paint: {
        "text-color": "#2baee5"
      }
    });

    ///////////// adds normal marker when there is no cluster
    map.addLayer({
      id: "unclustered-point",
      type: "symbol",
      source: "poi-markers",
      filter: ["!has", "point_count"],
      layout: {
        "icon-image": "poi-star-01", // custom icon is in the mapbox style spritesheet
        "icon-size": .8,
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

    ///////////// Launches POI modal when marker is clicked
    map.on('click', 'unclustered-point', function (e) {
      var clickedModalId = e.features[0].properties.id
      modalOpen(null, clickedModalId);
    });

    ///////////// Launches offer card modal when se offer marker is clicked
    map.on('click', 'se-offers', function (e) {
      var clickedOfferId = e.features[0].properties.id
      modalOpen(null, clickedOfferId);
    });

    ///////////// Opens station information in a new window when clicked
    map.on('click', 'stations', function (e) {
      var clickedStationLink = e.features[0].properties.link
      window.open(clickedStationLink, '_blank');
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
      // set different padding depending on original viewport width
      // not super precise but should catch mobile phones and reduce the padding
      var iconPadding;
      if ($(window).innerWidth() < 400) {
        iconPadding = { "padding": 30 };
      } else {
        iconPadding = { "padding": 60 };
      }
      map.fitBounds(bounds, iconPadding); // adds padding so markers aren't on edge

    }
    getMapBounds(); // resets the view when the map loads

  });
}

///////////////////////////////////////
//            open map
///////////////////////////////////////

console.log();

$('.js-open-map').on('click', function(e) {
  e.preventDefault();
  // disable scrolling on background content (doesn't work iOS)
  $('body').addClass('map-disable-scroll');
  // dont reload the map if its already open
  if ($('#map').children().length === 0) { map(); }
  $('.map__wrap').removeClass('is-closed').addClass('is-open');
})

$('.js-close-map').on('click', function(e) {
  e.preventDefault();
  // enable scrolling on background content
  $('body').removeClass('map-disable-scroll');
  $('.map__wrap').removeClass('is-open').addClass('is-closed');
})