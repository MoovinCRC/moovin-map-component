import {
    createMap,
    placeMarkerAndPan,
    updateDomCodeLocation,
    updateLocation
} from "./functions.mjs";
import { MAPSTATE } from '../utilities/CONSTANS.mjs' 
import { loadAutocomplete, saveCoords, mapPanTo} from '../utilities/commonMap.mjs'

let cachedLocation = localStorage.getItem("sp_location_checkout") ? JSON.parse(localStorage.getItem("sp_location_checkout")) : null;

let autocompleteAddress = null;

/* -------------Functions to be used as callbacks----------------- */
/**
 * Handles the autocomplete result for addresses.
 * 
 * @param {Object} result - The result object from the autocomplete.
 */
const handleAutocompleteAddress = (result) => {
    autocompleteAddress = result;
};

/**
 * Handles the update of location coordinates.
 * 
 * @param {Object} coords - The updated coordinates.
 */
const handleLocationUpdate = (coords) => {
    updateLocation(coords);
};


/**
 * Handles the update of the map marker.
 * 
 * @param {Object} marker - The updated marker object.
 */
const handleMarkerUpdate = (marker) => {
    MAPSTATE.marker = marker;
};

/**
 * Handles the autocomplete result for locations.
 * 
 * @param {Object} result - The result object from the autocomplete.
 */
const handleAutocompleteResult = (result) => {
    let coords = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
    };
    saveCoords(coords.lat, coords.lng);
    updateDomCodeLocation("#moovin_lat", "#moovin_lng", coords);
    mapPanTo(MAPSTATE.map, coords, true);
    placeMarkerAndPan(
        coords,
        MAPSTATE.map,
        MAPSTATE.marker,
        handleLocationUpdate,
        handleMarkerUpdate
    );
};

/* -------------Functions for init map----------------- */

/**
 * Handles a click event on the map.
 * 
 * @param {Object} coords - The coordinates of the clicked location.
 */
const handleMapClick = (coords) => {
    mapPanTo(MAPSTATE.map, coords, true);
    placeMarkerAndPan(
        coords,
        MAPSTATE.map,
        MAPSTATE.marker,
        handleLocationUpdate,
        handleMarkerUpdate
    );
};

/**
 * Handles the creation of the map.
 * 
 * @param {Object} map - The created map object.
 */
const handleMapCreation = (map) => {
    MAPSTATE.map = map;
    if (cachedLocation) {
        let cachedCoords = cachedLocation.coords;
        handleLocationUpdate(cachedCoords);
        mapPanTo(MAPSTATE.map, cachedCoords, true);
        placeMarkerAndPan(
            cachedCoords,
            MAPSTATE.map,
            MAPSTATE.marker,
            handleLocationUpdate,
            handleMarkerUpdate
        );
        updateDomCodeLocation("#moovin_lat", "#moovin_lng", cachedCoords);
    }

    loadAutocomplete(
        "moovin_address",
        handleAutocompleteResult,
        handleAutocompleteAddress
    );
};

/**
 * Initializes the map.
 */
const initMap = () => {
    createMap("map", handleMapClick, handleMapCreation);
};


initMap();