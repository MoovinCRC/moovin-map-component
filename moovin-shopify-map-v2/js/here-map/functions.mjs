import { updateCode, setAddress, saveCoords, mapPanTo, zoneCoverage } from "../utilities/commonMap.mjs";
import { KAPPAH, GETCOORDSGEOCODEURL, MAPSTATE, DEFAULTCOORDS } from '../utilities/CONSTANS.mjs'

let behavior = null;
let platform = null;

/**
 * Create a map with HERE Maps API
 * @param {HTMLElement} htmlElement 
 * @param {Function} clickCallback 
 * @param {Function} createCallback 
 */
export const createMap = (htmlElement, clickCallback, createCallback) => {
    platform = new H.service.Platform({
        apikey: KAPPAH
    });
    let layers = platform.createDefaultLayers();
    let map = new H.Map(document.getElementById(htmlElement), layers.vector.normal.map, {
        zoom: 10,
        center: DEFAULTCOORDS,
        pixelRatio: window.devicePixelRatio || 1
    });
    zoneCoverage(map, true);
    let mapEventsObject = new H.mapevents.MapEvents(map);
    window.addEventListener("resize", function () {
        map.getViewPort().resize();
    });
    /* map.addEventListener("tap", function (evt) {
         let coords = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
         clickCallback(coords);
     });*/
    addListeners(map, updateLocation);
    behavior = new H.mapevents.Behavior(mapEventsObject);
    createCallback(map);
}

/**
 * Add listeners to the map to allow drag and drop
 * @param {H.Map} map 
 * @param {Function} dragMarker 
 */
const addListeners = (map, dragMarker) => {
    map.addEventListener(
        "dragstart",
        function (event) {
            var target = event.target,
                pointer = event.currentPointer;
            if (target instanceof H.map.Marker) {
                var targetPosition = map.geoToScreen(target.getGeometry());
                target["offset"] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                behavior.disable();
            }
        },
        false
    );

    map.addEventListener(
        "dragend",
        function (event) {
            var target = event.target;
            if (target instanceof H.map.Marker) {
                behavior.enable();
                var position = map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
                dragMarker(position);
            }
        },
        false
    );

    map.addEventListener(
        "drag",
        function (event) {
            var target = event.target,
                pointer = event.currentPointer;
            if (target instanceof H.map.Marker) {
                target.setGeometry(map.screenToGeo(pointer.viewportX - target["offset"].x, pointer.viewportY - target["offset"].y));
            }
        },
        false
    );
}

/**
 * Create a marker, allow drag and drop and execute functions when move or drop, also can replace an existing marker
 * @param {Object} position 
 * @param {H.map} map 
 * @param {H.map.Marker} marker 
 * @param {Function} dragMarker 
 * @param {Function} createMarker 
 */
export const placeMarkerAndPan = (position, map, marker, dragMarker, createMarker) => {
    marker && (map.removeObject(marker), ((marker = null), (MAPSTATE.marker = null)));
    let newMarker = new H.map.Marker(position, { volatility: true });
    localStorage.moovin_latlng = JSON.stringify(position);
    newMarker.draggable = true;
    map.addObject(newMarker);
    createMarker(newMarker);
}

/**
 * Center the map
 * @param {H.map} map 
 * @param {Object} coords 
 */
export const centerMap = (map, coords) => {
    map.setCenter(coords);
}

/**
 * Remove a marker from the map
 * @param {H.map.Marker} marker 
 */
export const removeMarker = (marker) => {
    marker && (MAPSTATE.map.removeObject(marker), (MAPSTATE.marker = null));
}

/**
 * Update the values of two elements in the DOM with the coordinates 'coords.lat' and 'coords.lng'.
 * Also, call the 'update_code' function with 'coords.lat' and 'coords.lng' as arguments.
 * @param {HTMLBaseElement} firstElement 
 * @param {HTMLBaseElement} secondElement 
 * @param {Object} coords 
 */
export const updateDomCodeLocation = (firstElement, secondElement, coords) => {
    document.querySelector(firstElement).value = coords.lat;
    document.querySelector(secondElement).value = coords.lng;
    updateCode(coords.lat, coords.lng);
};


/**
 * Get an address from geographic coordinates using a reverse geocoding service.
 * @param {float} latitude 
 * @param {float} longitude 
 * @param {Function} callback 
 */
const getGeocodeAddress = (latitude, longitude, callback) => {
    let search = platform.getSearchService();
    let address = "";
    search.reverseGeocode({ at: `${latitude},${longitude}` }, (reverse) => {
        reverse.items.forEach((i) => {
            address = i.address.label;
        });
        if (callback) callback(address);
        else return address;
    });
};

/**
 * Update the location with the provided coordinates.
 * @param {Object} coords 
 */
export const updateLocation = (coords) => {
    saveCoords(coords.lat, coords.lng), updateDomCodeLocation("#moovin_lat", "#moovin_lng", coords);
    getGeocodeAddress(coords.lat, coords.lng, (coords) => {
        setAddress(coords);
    });
};


/**
 * Do a geocoding request to HERE API using the provided address.
 * Process the response to get position and address information.
 * Finally, execute specific actions based on the response.
 * @param {String} province 
 * @param {String} city 
 * @param {String} street 
 * @param {String} postalCode 
 */
const getCoordsGeocode = (province, city, street, postalCode) => {
    const url = `${GETCOORDSGEOCODEURL}&q=${street},${city},${province}&qq=postalCode=${postalCode}`;
    axios
        .get(url)
        .then((response) => {
            if (response.data.items.length > 0) {
                let item = response.data.items[0];
                let position = item.position;
                let moovin_state = document.getElementById("moovin_state");
                if (moovin_state.value === "") {
                    setAddress(`${street} DISTRITO, ${province}`.toUpperCase());
                    saveCoords(position.lat, position.lng);
                    mapPanTo(MAPSTATE.map, position, true);
                    placeMarkerAndPan(
                        position,
                        MAPSTATE.map,
                        MAPSTATE.marker,
                        (a) => {
                            updateLocation(a);
                        },
                        (a) => {
                            MAPSTATE.marker = a;
                        }
                    );
                } else {
                    moovin_state.value = "";
                }
            }
        })
        .catch((e) => {
            console.error(e);
        });
};

/**
 * Split an address into its components (province, city, street) and use the coordinates to get additional
 * information through the 'getCoordsGeocode' function.
 * @param {String} address 
 * @param {Function} callback 
 */
export const splitAddressToRequest = (address, postalCode) => {
    address = address.split(",");
    getCoordsGeocode(address[2], address[1], address[0], postalCode);
};