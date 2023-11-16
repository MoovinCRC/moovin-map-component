import {
    createMap,
    placeMarkerAndPan,
    updateLocation,
    getLatLng,
    createPopup,
    getGeocodeAddress
} from "./functions.mjs";
import { MAPSTATE } from '../utilities/CONSTANS.mjs'
import { setAddress, loadAutocomplete, saveCoords, mapPanTo } from '../utilities/commonMap.mjs'

let cachedLocation = localStorage.getItem("sp_location_checkout") ? JSON.parse(localStorage.getItem("sp_location_checkout")) : null;
let autocompleteAddress = null;

/* -------------Functions to be used as callbacks----------------- */
const handleAutocompleteAddress = (result) => {
    autocompleteAddress = result;
};

const handleLocationUpdate = (result) => {
    saveCoords(result.geometry.location.lat(), result.geometry.location.lng());
    updateLocation("#moovin_lat", "#moovin_lng", result.geometry.location);
    let coors = getLatLng(result.geometry.location.lat(), result.geometry.location.lng());
    mapPanTo(MAPSTATE.map, coors, false);
    placeMarkerAndPan(
        coors,
        MAPSTATE.map,
        MAPSTATE.marker,
        handleDragMarker,
        handleMarkerUpdate
    );
};

const handleMarkerUpdate = (marker) => {
    MAPSTATE.marker = marker;
};

const handleDragMarker = (event) => {
    saveCoords(event.position.lat(), event.position.lng());
    updateLocation("#moovin_lat", "#moovin_lng", event.position);
    getGeocodeAddress(event.position.lat(), event.position.lng(), (address) => {
        setAddress(address);
    });
};


/* -------------Functions to be used in initMap----------------- */
const handleMapClick = (event) => {
    mapPanTo(MAPSTATE.map, event.latLng, false);
    placeMarkerAndPan(
        event.latLng,
        MAPSTATE.map,
        MAPSTATE.marker,
        handleDragMarker,
        handleMarkerUpdate
    );
}

const handleMapCreation = (map) => {
    MAPSTATE.map = map;
    if (cachedLocation) {
        let coors = getLatLng(cachedLocation.coords.lat, cachedLocation.coords.lng);
        getGeocodeAddress(cachedLocation.coords.lat, cachedLocation.coords.lng, (address) => {
            setAddress(address);
        });
        mapPanTo(MAPSTATE.map, coors, false);
        placeMarkerAndPan(
            coors,
            MAPSTATE.map,
            MAPSTATE.marker,
            handleDragMarker,
            handleMarkerUpdate
        );
        updateLocation("#moovin_lat", "#moovin_lng", coors);
    }
    loadAutocomplete(
        "moovin_address",
        handleLocationUpdate,
        handleAutocompleteAddress
    );
    createPopup(map, "popup_map");
};

function initMap() {
    createMap(
        "map",
        handleMapClick,
        handleMapCreation,
    );
}

initMap();