// VARIABLES TRANSFERRED IN FROM FUNCTIONS.PHP
const baseURL = "./";
const geoJson = testData;
let selectedYear = 2022;
let map;
let slider;

let markers = [];
let mapContainer = document.getElementById("wisc-101-map");

// MAP
if(mapContainer) {

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoiam1qYW5pc2NoIiwiYSI6ImNreXZ4Y3pkOTAzMjIydXB0bTV1YWt6bnQifQ.EGsVeEHL4CXEMnk2zF1_xA'
    });

    let openStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '<a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
    });

    map = L.map('wisc-101-map', {
        center: [44.605, -89.865],
        zoom: 6,
        minZoom: 5,
        //zoomControl: false,
        scrollWheelZoom: false,
        layers:[openStreetMap_HOT]
    });

    let wiscGeojson = L.geoJson(wiscBoundary, {
        style: {color: 'black', weight: '.7', fillOpacity: 0}
    }).addTo(map);
    // BEFORE SLIDER ADD MARKER SUPPORT LAYER WITH CLUSTERS
    
    // TIME SLIDER
    slider = document.getElementById("time-slider");
    let sliderOutput = document.getElementById("slider-output");
    sliderOutput.innerHTML = selectedYear;  // TODO: SLIDER BUGS OUT AND DOES NOT RESET ON NAVIGATION BACK TO HOMEPAGE - MAY HAVE TO SET STATUS WITH COOKIES
    slider.value = selectedYear;

    slider.oninput = function () {
        selectedYear = this.value;
        sliderOutput.innerHTML = selectedYear;

        // REMOVE ALL MARKERS AND REPOPULATE
        if (markers.length > 0) {
            for (let i = 0; i < markers.length; i++) {
                const startYear = Number.parseInt(markers[i]['startDate']);

                if(startYear > selectedYear) {
                    console.log("REMOVE MARKER WITH START YEAR OF: " + startYear);
                    console.log(markers);
                    //cluster marker object is different that L.marker object Change this
                    markers[i]['marker'].remove();
                    markers.splice(i, 1);
                    
                }
            }
        }

        processChange();
    }
    
    setMapMarkers(); // TODO - IMPLEMENT SET CLUSTERS
    //createClusters(geoJson);  //This runs the function to addin all the points/clusters (not dynamic slider)
}

function setMapMarkers() {
    console.log("setMapMarkers()Top");
    for (let feature of geoJson.features) {
        const exhibit = feature['properties'];
        const isInMarkers = inMarkers(exhibit['id']);

        // ADD MARKERS TO MAP
        if(!isInMarkers && exhibit['start_date'] <= selectedYear && (exhibit['end_date'] === "" || exhibit['end_date'] >= selectedYear)) {
           console.log("this is here?? What's the point")
           console.log("move to next if");
           //L.marker([43.7844, -89.25]); // DEFAULT MAP MARKER LOCATION

        if( (exhibit['lat'] && exhibit['lat'] !== "") && ( exhibit['long'] && exhibit['long'] !== "") ) {
                let marker = L.markerClusterGroup();
                let markerGeojson = L.geoJson(testData, {
                   onEachFeature: function(feature, layer, latlng) {
                       const exhibit = feature['properties'];
       
                       let markerContent = "<b>" + exhibit['title'] + "</b><br/>";
                       markerContent += "<div style='display: flex; justify-content: center'><img src='" + exhibit['img_url'] + "' alt='' style='max-height: 260px; width: auto;'/></div>";
                       markerContent += "<p style='width: 100%; text-align: center'><a href='" + exhibit['page_link'] + "'>View Story</a></p>"
                       layer.bindPopup(markerContent);

                       const markerObj = {id: exhibit['id'], marker: marker, startDate: exhibit['start_date'], endDate: exhibit['end_date']}
                       markers.push(markerObj);
                       console.log("markers here"); console.log(markers);
                       //return L.marker();  //test what this does
                   }
               });
               //added this vs .addTo(map)
               marker.addLayer(markerGeojson);
               map.addLayer(marker); 
               // was here markerObj 
            

           }

            /*marker.addTo(map);

            let markerContent = "<b>" + exhibit['title'] + "</b><br/>";
            markerContent += "<div style='display: flex; justify-content: center'><img src='" + exhibit['img_url'] + "' alt='' style='max-height: 260px; width: auto;'/></div>";
            markerContent += "<p>" + exhibit['desc'] + "</p>"
            markerContent += "<p><a href='" + exhibit['page_link'] + "'>View Exhibit</a></p>"
            marker.bindPopup(markerContent);
           */
           

        }
    }
    console.log("setMapMarkers()Bottom");
}


function inMarkers(lookForId) {
    if(markers.length === 0) { return false }

    let existsInMarkers = false;

    markers.forEach((marker) => {
        if(marker['id'] === lookForId) {
            existsInMarkers = true;
        }
    })

    return existsInMarkers;
}


/*function createClusters(data) {
        // CREATE CLUSTER GROUP
        //was clusterMarker
        let marker = L.markerClusterGroup();

        // CREATE ICON
        let myIcon = L.icon({
            iconUrl: 'images/pin24.png',
            iconSize: [29, 24],
            iconAnchor: [9, 21],
            popupAnchor: [0, -14],
        });

        // MARKER OPTIONS
        let markerOptions = {
            icon: myIcon
        };

        // PARSE DATA / GEOJSON AND CREATE MARKERS
        let markerGeojson = L.geoJson(data, {
            onEachFeature: function(feature, layer, latlng) {
                const exhibit = feature['properties'];

                let markerContent = "<b>" + exhibit['title'] + "</b><br/>";
                markerContent += "<div style='display: flex; justify-content: center'><img src='" + exhibit['img_url'] + "' alt='' style='max-height: 260px; width: auto;'/></div>";
                markerContent += "<p style='width: 100%; text-align: center'><a href='" + exhibit['page_link'] + "'>View Story</a></p>"
                layer.bindPopup(markerContent);

                return L.marker();
            }
        });

        marker.addLayer(markerGeojson);
        map.addLayer(marker);
}
*/

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const processChange = debounce(() => setMapMarkers());
