//===== Set map =======   
let map = L.map("map").setView([44.605, -89.865], 6.5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//===== Set layers for dynamic fill =====
let drawnItems = L.featureGroup().addTo(map);
let addedData = L.layerGroup().addTo(map);
let dropdownLayer = L.layerGroup().addTo(map);
//let myLocation = L.layerGroup().addTo(map);

//===== Set url variables =====
let url = "https://avstark-gis.carto.com/api/v2/sql?";
let urlJSON = url + "q=";
let urlGeoJSON = url + "format=GeoJSON&q=";

//===== Set custom icons =====

let redMarker = L.icon({
    iconUrl: "images/redIcon.png",
    shadowUrl: "images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
    
});
let greenMarker = L.icon({
    iconUrl: "images/greenIcon.png",
    shadowUrl: "images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
    
});
let uwMarker = L.icon({
    iconUrl: "images/uw-01.png",
    iconSize: [25, 41], // ??
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
    
});

let clusterMarkers = L.markerClusterGroup({maxClusterRadius : 20, showCoverageOnHover : false, singleMarkerMode : true});

//========= Create the Popups ==========

function uwPopup(feature, layer) {
    layer.bindPopup(
       "<b>Campus name</b><br>" + feature.properties.school_name 
    );
}
function regionPopup(feature, layer) {
    layer.bindPopup(
       "<b>DNR Region Name</b><br>" + feature.properties.DNR_REGION_NAME
    );
}

//===== Style the Regions

function styleRegions (feature) {
    return {
        color: "grey",
        weight: 1,
        fillColor: colorRegion(feature.properties.DNR_REGION_NAME),
        fillOpacity: 0.7
    };
}
function colorRegion (name) {
    if(name === "Northern Region") return "#C5D99A"; else
    if(name === "West Central Region") return "#F2C49B"; else
    if(name === "Northeast Region") return "#D5E7F2"; else
    if(name === "Southeast Region") return "#D0A7C4"; else
    if(name === "South Central Region") return "#F2C9E0"; else
    return "blue";
}
//===== Load in data for GeoJSON Overlays =====

//---------- clusters
let markerGeojson = L.geoJson(storydata, {
    onEachFeature : function(feature, layer, latlng){
        var popupContent = 
        '<b>Object Grouping:</b></br>' + feature.properties.clusters + '</br>' +
        '<b>History:</b></br>' + feature.properties.history;
    layer.bindPopup(popupContent);
    //return L.marker();        changed for test
    marker = L.marker();

    }//onEachFeature
});

clusterMarkers.addLayer(markerGeojson);
//map.addLayer(clusterMarkers);
//-------------


let wiscGeojson = L.geoJson(wiscBoundary, {
        style: {color: 'black', weight: '.9', fillOpacity: 0}
    }).addTo(map);

let wiscCountyGeojson = L.geoJson(wiscCounty, {
    style: {color: 'black', weight: '.5', fillOpacity: 0}
}); //.addTo(map);

let dnrRegionsGeojson = L.geoJson(dnrRegions, {
    style: styleRegions,
    onEachFeature: regionPopup
});//.addTo(map);


let uwSchoolsGeojson = L.geoJSON(uwSchools, {
            onEachFeature: uwPopup,
            pointToLayer: function(feature, latlng){
            return new L.marker(latlng, {icon: uwMarker})
            }
        }); //.addTo(map);


// Set layers for control
var otherLayers = {
    //"Objects Recently Added" : addedData,
    "All Museum Objects" : clusterMarkers,
    "Campuses | UW System": uwSchoolsGeojson,
    "Wisc DNR Regions": dnrRegionsGeojson,
    "WI County Boundaries" : wiscCountyGeojson
    }
//===== Set SQL queries =====
let sqlQuery1 = "SELECT history, clusters, the_geom FROM storydata WHERE clusters ='20-sided die'";
let sqlQuery2 = "SELECT DISTINCT clusters FROM storydata WHERE clusters != 'N/A' ORDER BY clusters"; //where description IS NULL

//This is used to display the new points on the map
let sqlQuery3 = "SELECT the_geom, point_name, description, your_name, email FROM dataadded WHERE description IS NOT NULL"; //description is field for new points only


//====== LAYER CONTROLS ======//
// Add empty drop down to fill dynamically MUSEUM
let dropdown = L.control({position: "topright"});
dropdown.onAdd = function() {
    let div = L.DomUtil.create("div", "dropdown");
    div.innerHTML = 
       '<h3>Choose Museum Object Grouping</h3>' +
        '<select id="clusters_sel"></select>';  
    return div;
};
dropdown.addTo(map);

// Overlay Control
L.control.layers(null, otherLayers, { collapsed: false }).addTo(map);

// Reset the map EasyButton
let resetMap = L.easyButton({
    states: [{
      stateName: 'reset',
      icon: 'circle-arrrow',
      title: 'Reset the Map',
      onClick: function(){
        window.location.href = "index.html";
        },
    position: 'topleft'
    }]
});
resetMap.addTo(map);

//------ end Layer Controls

//========= Load in the Data ===========

// Load the marker data | dropdown list
fetch(urlJSON + sqlQuery2)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        let html = "";
        data.rows.forEach(function(element) {
            html += "<option>" + element.clusters + "</option>";
        });
        document.getElementById("clusters_sel").innerHTML = html;
        displayDropdown();  // Display initial dropdown selection
    });
    // Function to reload markers after selection in dropdown
    function displayDropdown() {
        let valueSelected = document.getElementById("clusters_sel").value;
        //let clusterSelected = document.getElementById("clusters_sel").value;
        let sqlQuery3 = 
            "SELECT history, clusters, the_geom FROM storydata WHERE clusters = '" + 
            valueSelected + "'";
        fetch(urlGeoJSON + sqlQuery3)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                dropdownLayer.clearLayers();
                L.geoJSON(data, {
                    onEachFeature: function(feature, layer) {
                        layer.bindPopup(feature.properties.history + '<br>' + feature.properties.clusters);
                    } //change to popup function
                }).addTo(dropdownLayer);
            });
    }
    // Load the selection from the dropdown
    document.getElementById("clusters_sel").addEventListener("change", displayDropdown);
//--------end drop down fetch   

