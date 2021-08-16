window.onload = () => {
  document
    .querySelector(".say-hi-button")
    .addEventListener("click", function() {
      console.log(this);
      let place = JSON.parse(this.getAttribute("place"));
      console.log("place", place);
      getUrl(place).then(url => {
        console.log("url : ", url);

      });

      // here you can change also a-scene or a-entity properties, like
      // changing your 3D model source, size, position and so on
      // or you can just open links, trigger actions...
      //alert("Hi there!");
    });

  let method = "dynamic";

  // if you want to statically add places, de-comment following line
  //method = 'static';

  if (method === "static") {
    let places = staticLoadPlaces();
    renderPlaces(places);
  }

  if (method !== "static") {
    // first get current user location
    return navigator.geolocation.getCurrentPosition(
      function(position) {
        // than use it to load from remote APIs some places nearby
        dynamicLoadPlaces(position.coords).then(places => {
          renderPlaces(places);
        });
      },
      err => console.error("Error in retrieving position", err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000
      }
    );
  }
};

function staticLoadPlaces() {
  return [
    {
      title: "Your place name",
      location: {
        lat: 3, // add here latitude if using static data
        lng: 3 // add here longitude if using static data
      }
    },
    {
      title: "Another place name",
      location: {
        lat: 46,
        lng: 3
      }
    }
  ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
  let lat = position.latitude;
  let lon = position.longitude;
  console.log(lat, lon);
  // alert("7: lat: " + lat + " lon: " + lon);

  var url = "https://fr.wikipedia.org/w/api.php";
  //var url = "https://www.mediawiki.org/w/api.php"

  let params = {
    //https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=37.7891838%7C-122.4033522&gsradius=10000&gslimit=100
    action: "query",
    list: "geosearch",
    gscoord: lat + "|" + lon,
    prop: "coordinates|pageimages",
    gsradius: 10000,
    gslimit: 100,
    format: "json"
  };

  console.log("params", params);
  url = url + "?origin=*";
  Object.keys(params).forEach(function(key) {
    url += "&" + key + "=" + params[key];
  });
  console.log(url);
  return fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(resp => {
      console.log(resp);
      return resp.query.geosearch;
    })
    .catch(function(error) {
      console.log(error);
    });
}

function renderPlaces(places) {
  let scene = document.querySelector("a-scene");

  places.forEach(place => {
    console.log(place);
    const latitude = place.lat;
    const longitude = place.lon;

    // add place icon
    const icon = document.createElement("a-box");
    icon.setAttribute(
      "gps-entity-place",
      `latitude: ${latitude}; longitude: ${longitude}`
    );
    icon.setAttribute("name", place.title);
    icon.setAttribute("src", "assets/map-marker.png");

    // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
    icon.setAttribute("scale", "200, 200");

    icon.addEventListener("loaded", () =>
      window.dispatchEvent(new CustomEvent("gps-entity-place-loaded"))
    );

    const clickListener = function(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      const name = ev.target.getAttribute("name");

      const el = ev.detail.intersection && ev.detail.intersection.object.el;

      // alert("click place 2", place.title);
      console.log("click", place);

      if (el && el === ev.target) {
        let btn = document.querySelector(".say-hi-button");
        btn.innerHTML = place.title + " dist : " + place.dist + " m";
        btn.setAttribute("place", JSON.stringify(place));
      }

      /*  if (el && el === ev.target) {
        const label = document.createElement("span");
        const container = document.createElement('div');
        container.setAttribute('id', 'place-label');
        label.innerText = "yep";//place.title;
        container.appendChild(label);
        document.body.appendChild(container);
console.log(container)
        setTimeout(() => {
          container.parentElement.removeChild(container);
        }, 1500);
      }*/
    };

    icon.addEventListener("click", clickListener);

    scene.appendChild(icon);
  });
}

function getUrl(place) {
  // https://en.wikipedia.org/w/api.php?action=query&prop=info&pageids=18630637&inprop=url

  var url = "https://fr.wikipedia.org/w/api.php";
  //var url = "https://www.mediawiki.org/w/api.php"

  let params = {
    //https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=37.7891838%7C-122.4033522&gsradius=10000&gslimit=100
    action: "query",
    prop: "info",
    pageids: place.pageid,
    inprop: "url",
    format: "json"
  };

  console.log("params", params);
  url = url + "?origin=*";
  Object.keys(params).forEach(function(key) {
    url += "&" + key + "=" + params[key];
  });
  console.log(url);
  return fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(resp => {
      console.log(resp);
    let url = resp.query.pages[place.pageid].fullurl
     const target_url = new URL(url);

        window.open(target_url, "_blank");
      return target_url;
    })
    .catch(function(error) {
      console.log(error);
    });
}
