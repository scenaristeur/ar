// getting places from APIs

function loadPlaces(position){
  let lat = position.latitude
  let lon = position.longitude
  console.log(lat,lon)
  alert("2: lat: "+ lat+" lon: "+lon)


  var url = "https://en.wikipedia.org/w/api.php";

  let params = {
    //https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=37.7891838%7C-122.4033522&gsradius=10000&gslimit=100
    action: "query",
    list: "geosearch",
    gscoord: lat+"|"+lon,
    prop: "coordinates|pageimages",
    gsradius: 10000,
    gslimit: 100,
    format: "json"
  }


  console.log("params", params)
  url = url + "?origin=*";
  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
  console.log(url)
  return fetch(url)
  .then(function(response){return response.json();})
  .then((resp) => {
    console.log(resp)
    return resp.query.geosearch;
  })

  // .then(function(response) {
  //   console.log(response)
  //   var res = response.query.geosearch;
  //   console.log(res)
  //   for (var r in res) {
  //     let thing = res[r]
  //     console.info(thing)
  //     console.log(thing.lat, thing.lon, thing.dist)
  //
  //     // console.log("Latitute: " + res[r].coordinates[0].lat);
  //     // console.log("Longitude: " + res[r].coordinates[0].lon);
  //   }
  // })
  .catch(function(error){console.log(error);});

}


window.onload = () => {
  const scene = document.querySelector('a-scene');

  // first get current user location
  return navigator.geolocation.getCurrentPosition(function (position) {

    // than use it to load from remote APIs some places nearby
    loadPlaces(position.coords)
    .then((places) => {
      console.log(places)
      places.forEach((place) => {
        const latitude = place.lat;
        const longitude = place.lon;

        // add place name
        const placeText = document.createElement('a-link');
        placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        placeText.setAttribute('title', place.title+ " "+place.dist+"m");
        placeText.setAttribute('scale', '30 15 15');

        placeText.addEventListener('loaded', () => {
          window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });


        const clickListener = function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          alert(ev)

          // add place icon
    const icon = document.createElement('a-image');
    icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
    icon.setAttribute('name', place.title);
    icon.setAttribute('src', './assets/map-marker.png');

    // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
    icon.setAttribute('scale', '20, 20');

    icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

    const clickListener = function (ev) {
        ev.stopPropagation();
        ev.preventDefault();

        const name = ev.target.getAttribute('name');

        const el = ev.detail.intersection && ev.detail.intersection.object.el;

        if (el && el === ev.target) {
            const label = document.createElement('span');
            const container = document.createElement('div');
            container.setAttribute('id', 'place-label');
            label.innerText = name;
            container.appendChild(label);
            document.body.appendChild(container);

            setTimeout(() => {
                container.parentElement.removeChild(container);
            }, 1500);
        }
    };

    icon.addEventListener('click', clickListener);

    scene.appendChild(icon);
      });
    })
  },
  (err) => console.error('Error in retrieving position', err),
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 27000,
  }
);
};


function loadPlaces1(position) {
  const params = {
    radius: 300,    // search places not farther than this value (in meters)
    clientId: 'client-id',
    clientSecret: 'secret',
    version: '20300101',    // foursquare versioning, required but unuseful for this demo
  };

  // CORS Proxy to avoid CORS problems
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';

  // Foursquare API (limit param: number of maximum places to fetch)
  const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
  &ll=${position.latitude},${position.longitude}
  &radius=${params.radius}
  &client_id=${params.clientId}
  &client_secret=${params.clientSecret}
  &limit=30
  &v=${params.version}`;
  return fetch(endpoint)
  .then((res) => {
    return res.json()
    .then((resp) => {
      return resp.response.venues;
    })
  })
  .catch((err) => {
    console.error('Error with places API', err);
  })
};
