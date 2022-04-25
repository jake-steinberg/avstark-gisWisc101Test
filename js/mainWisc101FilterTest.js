//Step 1: Create the Leaflet map

//===== Create the map object =====
function createMap() {
     
    
    let openStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '<a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        //map.attributionControl.addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>', {collapsed:true});
    });
   
    //---create the map object
    let map = L.map('map', {
        center: [44.605, -89.865],
        zoom: 6,
        minZoom: 5,
        //zoomControl: false,
        scrollWheelZoom: false,
        layers:[openStreetMap_HOT]  //, overlayLocations
    });

  
    let wiscGeojson = L.geoJson(wiscBoundary, {
        style: {color: 'black', weight: '.7', fillOpacity: 0}
    }).addTo(map);

    let wiscCountyGeojson = L.geoJson(wiscCounty, {
        style: {color: 'black', weight: '.5', fillOpacity: 0}
    }).addTo(map);
   
    //=====Removed this for test with filters below====== 
    /*
    let allPoints = L.geoJson(storyObjects);
    allPoints.addTo(map);
    //---other over lay options here

    //---create overlay object
    let overlayMap = {
        "Wisc Boundary" : wiscGeojson,
        "All 101 Points" : allPoints,
        "Wisc Counties" : wiscCountyGeojson
        //other map options here
    };
    //---create the control layer with click boxes
    L.control.layers(null, overlayMap, {collapsed : false}).addTo(map);
    */
    //=====================================================
    
    //call getData ()  this will be the entire dataset entered in as .js file later
    getData(map);  
};
//===== Get the data =====
function getData(map) {
    
    $.ajax("data/miniWithYear.geojson", {
        dataType: "json",
        success: function(response){
        
           
        let clusterMarkers = L.markerClusterGroup({maxClusterRadius : 20, showCoverageOnHover : false, singleMarkerMode : true});
        
        let subgroup1 = L.featureGroup.subGroup(clusterMarkers);
        let subgroup2 = L.featureGroup.subGroup(clusterMarkers);
        let subgroup3 = L.featureGroup.subGroup(clusterMarkers);
        let subgroup4 = L.featureGroup.subGroup(clusterMarkers);
        let rest = L.featureGroup.subGroup(clusterMarkers);

        control = L.control.layers(null, null, {collapsed : false});
        
        let markerGeojson = L.geoJson(response, {
            onEachFeature : function(feature, layer, latlng){
                var popupContent = 
                '<b>Object Grouping:</b></br>' + feature.properties.Clusters + '</br>' +
                '<b>History:</b></br>' + feature.properties.History;
            layer.bindPopup(popupContent);
            //return L.marker();        changed for test
           

            marker = L.marker();
            
            start = feature.properties.timelineStart;
            end = feature.properties.timelineEnd;
            //IF ELSE HERE for Start and End (not working yet)
    

            }//onEachFeature
             

        });
        
        clusterMarkers.addLayer(markerGeojson);
        map.addLayer(clusterMarkers);
        /*clusterMarkers.on('clusterclick', function (a) {
            a.layer.zoomToBounds({padding: [20, 20]});
            });*/
        
        control.addOverlay(subgroup1,'Prehistoric');
        control.addOverlay(rest, 'The rest for now');
        control.addTo(map);
        
        //same as adding in the checked = "" within a input <dvi> HTML  | removed = unchecked
        subgroup1.addTo(map);
        rest.addTo(map);
       
        }

    });
  
};

$(document).ready(createMap);