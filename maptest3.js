// VARIABLES TRANSFERRED IN FROM FUNCTIONS.PHP
const baseURL = "./";
const geoJson = testData;
let selectedYear = 2022;
let map;
let slider;
let markers = [];
let myLayerGroup = L.layerGroup(markers);

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
                    markers[i]['marker'].remove();
                    markers.splice(i, 1);
                }
            }
        }

        processChange();
    }
    //setMapMarkers(); // TODO - IMPLEMENT SET CLUSTERS     //createClusters(geoJson);

} //end if map


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


function setMapMarkers() {
    for (let feature of geoJson.features) {
        const exhibit = feature['properties'];
        const isInMarkers = inMarkers(exhibit['id']);
        
        // ADD MARKERS TO MAP
        if(!isInMarkers && exhibit['start_date'] <= selectedYear && (exhibit['end_date'] === "" || exhibit['end_date'] >= selectedYear)) {
            //let marker = L.marker([43.7844, -89.25]); // DEFAULT MAP MARKER LOCATION
            console.log("---------");
            if( (exhibit['lat'] && exhibit['lat'] !== "") && ( exhibit['long'] && exhibit['long'] !== "") ) {
                 marker = L.marker([exhibit['lat'], exhibit['long']]);
            }
            const markerObj = {id: exhibit['id'], marker: marker, startDate: exhibit['start_date'], endDate: exhibit['end_date']}
            markers.push(markerObj);
            //markers [] working loading correctly here

        }
    }
    createClusters();
}




function createClusters(testData) {
        // CREATE CLUSTER GROUP 
    
        let clusterMarkers = L.markerClusterGroup.layerSupport();
        let clusterSupportMarker = L.layerGroup(markers);
        clusterMarkers.addTo(map);
        clusterMarkers.checkIn(clusterSupportMarker);
        clusterSupportMarker.addTo(map);
}


function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const processChange = debounce(() => setMapMarkers());
