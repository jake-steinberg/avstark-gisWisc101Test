// VARIABLES TRANSFERRED IN FROM FUNCTIONS.PHP
const baseURL = "./";
const geoJson = testData;
let selectedYear = 2022;
let map;
let slider;

let markers = [];

let markerCluster;
let markerGeojson;
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

    //CHANGE cluster radius to bring in points at various distances, also to have constant icon vs. pin icon for single points
    //markerCluster = L.markerClusterGroup({maxClusterRadius : 20, showCoverageOnHover : false, singleMarkerMode : true});
    
    markerCluster = L.markerClusterGroup();
    geoJsonCluster = L.geoJson(testData);
    markerCluster.addLayer(geoJsonCluster); //markers before slider initialized
    map.addLayer(markerCluster);


    //SET THE MARKERS WITH LAYER SUPPORT AND CHECK IN | BEFORE SLIDER
    function setMapMarkers() {
        
        map.removeLayer(markerCluster);

        for (let feature of geoJson.features) {
            const exhibit = feature['properties'];
            const isInMarkers = inMarkers(exhibit['id']);

            // ADD MARKERS TO MAP
            if(!isInMarkers && exhibit['start_date'] <= selectedYear && (exhibit['end_date'] === "" || exhibit['end_date'] >= selectedYear)) {
            console.log("--------")
            //L.marker([43.7844, -89.25]); // DEFAULT MAP MARKER LOCATION

            if( (exhibit['lat'] && exhibit['lat'] !== "") && ( exhibit['long'] && exhibit['long'] !== "") ) {
                    //let marker = L.markerClusterGroup.layerSupport({maxClusterRadius : 20, showCoverageOnHover : false, singleMarkerMode : true});
                    
                    let marker = L.markerClusterGroup.layerSupport();
                    let markerGeojson = L.geoJson(geoJson, {
                    onEachFeature: function(feature, layer, latlng) {
                        const exhibit = feature['properties'];
                        
                        let markerContent = "<b>" + exhibit['title'] + "</b><br/>";
                        markerContent += "<div style='display: flex; justify-content: center'><img src='" + exhibit['img_url'] + "' alt='' style='max-height: 260px; width: auto;'/></div>";
                        markerContent += "<p>" + 'start date' + exhibit['start_date'] + "</p>"
                        markerContent += "<p style='width: 100%; text-align: center'><a href='" + exhibit['page_link'] + "'>View Story</a></p>"
                        layer.bindPopup(markerContent);

                        const markerObj = {id: exhibit['id'], marker: marker, startDate: exhibit['start_date'], endDate: exhibit['end_date']};
                        markers.push(markerObj);
                        
                    }
                    });
                // 1. marker added to map 2. layer added to marker 3. add layer to map
                marker.addTo(map);
                marker.addLayer(markerGeojson);
                markerGeojson.addTo(map);
        
                
            }

            }
        }
        console.log("markers here end of setMapMarkers()"); console.log(markers);   
    }
    getSlider();
} // if map

//####### Was thinking of replacing the slider object created by Justin with the Leaflet Slider plugin #######
function getSlider(){
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
                //###### THIS IS WHERE THE ISSUE IS CONNECTED TO ######  all markers come in and out at once #######
                if(startYear > selectedYear) {
                    console.log("REMOVE MARKER WITH START YEAR OF: " + startYear);
                    markers[i]['marker'].remove();
                    console.log("marker object removed");console.log(markers[i]['marker']);
                    markers.splice(i, 1);
                    console.log("markers [] after slider removes points"); console.log(markers);
                }
            }
        }
        setMapMarkers();
    }
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


function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const processChange = debounce(() => setMapMarkers());