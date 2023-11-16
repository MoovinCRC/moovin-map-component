import { moovin_codes } from "../crcodes.js";
import { getProvinciaByNombre, getCantonByNombre, getDistritoByNombre, } from "../helpers/globalFunctions.mjs";
import { UPDATECODEURL, ZONECOVERAGEURL, DANGERZONESURL } from '../utilities/CONSTANS.mjs'

import { dangerZoneCoverageCoors, zoneCoverageCoors } from '../helpers/index.mjs'

let zoomPanTo = 12;
let codeAlert = document.querySelector("#code_alert");

/**
 * Set the zoom of the map
 * @param {H.map} map 
 * @param {int} zoom 
 */
export const setZoom = (map, zoom) => {
    map.setZoom(zoom);
}

/**
 * Load and configure an autocomplete of places using the Google Maps API.
 * @param {String} elementId 
 * @param {Function} selectCallback 
 * @param {Function} setCallback 
 */
export const loadAutocomplete = (elementId, selectCallback, setCallback) => {
    let autocomplete = new google.maps.places.Autocomplete(document.getElementById(elementId), {
        componentRestrictions: { country: "cr" },
        fields: ["geometry"]
    });
    autocomplete.addListener("place_changed", function () {
        let moovin_state = document.getElementById("moovin_state");
        moovin_state.value = "search";
        var place = this.getPlace();
        if (place.geometry) {
            selectCallback(place);
        }
    });
    setCallback(autocomplete);
};

/**
 * Do a reverse geocoding request to HERE API using the provided coordinates (latitude and longitude).
 * Process the response to get address information and its associated codes.
 * Finally, update an input field on the page with the obtained code.
 * @param {float} latitude 
 * @param {float} longitude 
 */
export const updateCode = (latitude, longitude) => {
    const url = `${UPDATECODEURL}&at=${latitude}%2C${longitude}`;
    axios
        .get(url)
        .then((result) => {
            if (result.data.items.length > 0) {
                let address = result.data.items[0];
                let province = address.address.state
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                let canton = address.address.county
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                let district = "";
                if (address.address.district) {
                    district = address.address.district
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                } else {
                    district = address.address.city
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                }
                let province_code = getProvinciaByNombre(province);
                let canton_code = getCantonByNombre(province_code, canton);
                let district_code = getDistritoByNombre(canton_code, district);
                moovin_codes.processCode(district_code);
                moovin_codes.input_code.value = district_code;
                codeAlert.style.visibility = "hidden";
            }
        })
        .catch((e) => {
            codeAlert.style.visibility = "visible";
        });
};



/**
 * Set an address in an input field on the page.
 * @param {String} address 
 */
export const setAddress = (address) => {
    document.getElementById("moovin_address").value = address;
};


/**
 * Verify if the pressed key is a number. Allow the plus sign (+).
 * @param {KeyboardEvent} evt 
 * @returns true if the key is a number or the plus sign, false otherwise
 */
export const isNumberKey = (evt) => {
    let charCode = evt.which ? evt.which : event.keyCode;
    if (charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
};


/**
 * Return a capitalized string.
 * @param {String} string 
 * @returns capitalized string
 */
const capitalize = (string) => {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
};


/**
 * Save the provided coordinates in the local storage as a JSON object.
 * @param {float} latitude 
 * @param {float} longitude 
 */
export const saveCoords = (latitude, longitude) => {
    localStorage.sp_location_checkout = JSON.stringify({ coords: { lat: latitude, lng: longitude } });
};

/**
 * Move the map to the provided coordinates and set the zoom.
 * @param {Map} map 
 * @param {Object} coords 
 * @param {Boolean} isHereMap 
 */
export const mapPanTo = (map, coords, isHereMap) => {
    if (!isHereMap) {
        map.panTo(coords)
    }
    map.setCenter(coords);
    setZoom(map, zoomPanTo);
}


/**
 * Paint the zone coverage and danger zones in the map.
 * @param {Map} map 
 * @param {Boolean} isHereMap 
 */
export const zoneCoverage = (map, isHereMap) => {
    axios
        .get(ZONECOVERAGEURL)
        .then((response) => {
            paintPolygon(map, response.data.list, "RGBA(1,52,69,0.11)", isHereMap);
        })
        .catch((e) => {
            console.error(e);
            paintPolygon(map, zoneCoverageCoors, "RGBA(1,52,69,0.11)", isHereMap);
        });

    setDangerZones(map, isHereMap);
}

/**
 * Paint the danger zones in the map.
 * @param {Map} map 
 * @param {Boolean} isHereMap 
 */
const setDangerZones = (map, isHereMap) => {
    axios
        .get(DANGERZONESURL)
        .then((response) => {
            response.data.list.forEach((dangerZone) => {
                paintPolygon(map, dangerZone.zoneData, "RGBA(235, 64, 52, 1)", isHereMap);
            });
        })
        .catch((e) => {
            console.error(e);
            dangerZoneCoverageCoors.forEach((dangerZone) => {
                paintPolygon(map, dangerZone.zoneData, "RGBA(235, 64, 52, 1)", isHereMap);
            })
        });
}

/**
 * Paint a polygon in the map.
 * @param {Map} map 
 * @param {Object []} coords 
 * @param {String} color 
 * @param {Boolean} isHereMap 
 */
const paintPolygon = (map, coords, color, isHereMap) => {
    if (isHereMap) {
        map.addObject(
            new H.map.Polygon(new H.geo.LineString(getCoordsPolygon(coords)), {
                style: {
                    fillColor: color,
                    strokeColor: "#013445",
                    lineWidth: 1.3
                }
            })
        );
    } else {
        new google.maps.Polygon({
            paths: coords,
            strokeColor: "#013544",
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: color,
            fillOpacity: 1,
            map: map
        });
    }
}



/**
 * Function to format the coordinates of a polygon from an object array
 * @param {Object []} objectArray 
 * @returns coords
 */
const getCoordsPolygon = (objectArray) => {
    let coords = [];
    objectArray.forEach((object) => {
        coords.push(object.lat, object.lng, 0);
    });
    return coords;
}