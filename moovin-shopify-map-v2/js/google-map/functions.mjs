import { updateCode, setAddress, saveCoords, mapPanTo, zoneCoverage } from "../utilities/commonMap.mjs";
import { GETCOORDSGEOCODEURL, MAPSTATE, DEFAULTCOORDS } from '../utilities/CONSTANS.mjs'

/**
 * Create a map with Google Maps API
 * @param {HTMLElement} htmlElement 
 * @param {Function} clickCallback 
 * @param {Function} createCallback 
 */
export const createMap = (htmlElement, clickCallback, createCallback) => {
    let map = new google.maps.Map(document.getElementById(htmlElement), {
        center: DEFAULTCOORDS,
        zoom: 10
    });
    zoneCoverage(map, false);
    createCallback(map);
};

/**
 * Create a marker, allow drag and drop and execute functions when move or drop, also can replace an existing marker
 * @param {Object} position 
 * @param {GoogleMap} map 
 * @param {GoogleMapMarker} marker 
 * @param {Function} dragMarker 
 * @param {Function} createMarker 
 */
export function placeMarkerAndPan(position, map, marker, dragMarker, createMarker) {
    marker && (marker.setMap(null), (marker = null));
    let newMarker = new google.maps.Marker({ position: position, map: map, draggable: !0 });
    localStorage.moovin_latlng = JSON.stringify(position);
    newMarker.addListener("dragend", function () {
        dragMarker(this);
    });
    createMarker(newMarker);
};

/**
 * Center the map
 * @param {GoogleMap} map 
 * @param {float} latitude
 * @param {float} longitude 
 */
export const centerMap = (map, latitude, longitude) => {
    map.setCenter(new google.maps.LatLng(latitude, longitude));
};

/**
 * Remove a marker from the map
 * @param {GoogleMapMarker} marker 
 */
export const removeMarker = (marker) => {
    marker ? marker.setMap(null) : "";
};

/**
 * Get the coordinates of a point
 * @param {float} latitude 
 * @param {float} longitude 
 * @returns 
 */
export const getLatLng = (latitude, longitude) => {
    return new google.maps.LatLng(latitude, longitude);
};

/**
 * Update the values of the coordinates in the inputs
 * @param {HTMLElement} firstElement 
 * @param {HTMLElement} secondElement 
 * @param {Object} coords 
 */
export const updateLocation = (firstElement, secondElement, coords) => {
    let latitude = document.querySelector(firstElement);
    let longitude = document.querySelector(secondElement);
    updateCode(coords.lat(), coords.lng());
    (latitude.value = coords.lat()), (longitude.value = coords.lng());
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
                    let coords = getLatLng(position.lat, position.lng);
                    mapPanTo(MAPSTATE.map, coords);
                    placeMarkerAndPan(
                        coords,
                        MAPSTATE.map,
                        MAPSTATE.marker,
                        (marker) => {
                            saveCoords(marker.position.lat(), marker.position.lng()), updateLocation("#moovin_lat", "#moovin_lng", marker.position);
                            getGeocodeAddress(marker.position.lat(), marker.position.lng(), (marker) => {
                                setAddress(marker);
                            });
                        },
                        (marker) => {
                            MAPSTATE.marker = marker;
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
 * Get the address of a point using the coordinates and execute a callback function
 * @param {float} latitude 
 * @param {float} longitude 
 * @param {Function} callback 
 */
export const getGeocodeAddress = (latitude, longitude, callback) => {
    let geocoder = new google.maps.Geocoder();
    let address = "";
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, function (response, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (response[0]) {
                address = response[0].formatted_address;
            }
        }
        if (callback) callback(address);
        else return address;
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


/**
 * Create a popup to show the zone coverage of the company
 * @param {GoogleMap} map 
 * @param {HTMLElement} htmlElement 
 */
export const createPopup = (map, htmlElement) => {
    10.095260, -84.108757
    let lat = 10.095260;
    let lng = -84.108757;
    class Popup extends google.maps.OverlayView {
        constructor(position, content) {
            super();
            this.position = position;
            content.classList.add("popup-bubble");
            // This zero-height div is positioned at the bottom of the bubble.
            const bubbleAnchor = document.createElement("div");
            bubbleAnchor.classList.add("popup-bubble-anchor");
            bubbleAnchor.appendChild(content);
            // This zero-height div is positioned at the bottom of the tip.
            this.containerDiv = document.createElement("div");
            this.containerDiv.classList.add("popup-container");
            this.containerDiv.appendChild(bubbleAnchor);
            // Optionally stop clicks, etc., from bubbling up to the map.
            Popup.preventMapHitsAndGesturesFrom(this.containerDiv);
        }
        /** Called when the popup is added to the map. */
        onAdd() {
            this.getPanes().floatPane.appendChild(this.containerDiv);
        }
        /** Called when the popup is removed from the map. */
        onRemove() {
            if (this.containerDiv.parentElement) {
                this.containerDiv.parentElement.removeChild(this.containerDiv);
            }
        }
        /** Called each frame when the popup needs to draw itself. */
        draw() {
            const divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
            // Hide the popup when it is far out of view.
            const display = Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? "block" : "none";

            if (display === "block") {
                this.containerDiv.style.left = divPosition.x + "px";
                this.containerDiv.style.top = divPosition.y + "px";
            }

            if (this.containerDiv.style.display !== display) {
                this.containerDiv.style.display = display;
            }
        }
    }
    let popup = new Popup(new google.maps.LatLng(lat, lng), document.getElementById(htmlElement));
    popup.setMap(map);
};