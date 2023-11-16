import { moovin_codes } from '../crcodes.js';
import { getAddressByCode, getCoberturaByCode } from '../helpers/globalFunctions.mjs';
import { removeMarker, centerMap, splitAddressToRequest } from './index.mjs';
import { setZoom, setAddress, isNumberKey } from '../utilities/commonMap.mjs'
import { MAPSTATE, DEFAULTCOORDS } from '../utilities/CONSTANS.mjs'

let postalCodeInput = document.querySelector("#moovin_data_code");
// let carrierSection = document.querySelector("#carrier-section");
// let carrierSelect = document.querySelector("#carriers");
let districtSelect = document.querySelector("#moovin_data_distrito");
let resetButton = document.querySelector("#btn_reset");
let zoneAlert = document.querySelector("#zone_alert");

/* 
    Event listener for district selection changes:
    - Updates district value and address information.
    - Adjusts carrier section visibility based on coverage.
    - Sets default carrier if moovin state is empty.
*/
districtSelect.addEventListener("change", async () => {
    let districtValue = districtSelect.value;
    let address = "";

    if (districtValue !== "") {
        moovin_codes.input_code.value = districtValue;
        address = getAddressByCode(districtValue);
        splitAddressToRequest(address, districtValue);

        if (await getCoberturaByCode(address, districtValue)) {
            // carrierSection.style.visibility = "visible";
            // carrierSection.value = "moovin-express";
            zoneAlert.style.visibility = "hidden";
        } else {
            // carrierSection.style.visibility = "hidden";
            // moovinSection.style.visibility = "hidden";
            zoneAlert.style.visibility = "visible";
        }
    }
    let moovinState = document.querySelector("#moovin_state");
    if (moovinState.value === "") {
        // carrierSelect.value = "moovin-express";
        // carrierSelect.dispatchEvent(new Event("change"));
    }
});

/* 
    Event listener for carrier selection changes:
    - Updates the address if the postal code changes.
    todo: verificar si el value deberia ser utilizado
*/
// carrierSelect.addEventListener("change", () => {
//     let value = carrierSelect.value;
//     let moovinDataCode = document.querySelector("#moovin_data_code");
//     let address = "";

//     if (moovinDataCode.value !== "" && moovinDataCode.value.length === 5) {
//         address = getAddressByCode(moovinDataCode.value);
//     } else {
//         setAddress("");
//     }
// });

/* 
    Event listener for reset button click:
    - Resets the map and clears the address.
*/

resetButton.addEventListener("click", () => {
    let address = "";
    removeMarker(MAPSTATE.marker);
    centerMap(MAPSTATE.map, DEFAULTCOORDS);
    setZoom(MAPSTATE.map, 10);
    setAddress("");
    localStorage.removeItem("sp_location_checkout");
    localStorage.removeItem("moovin_latlng");
    let resetCode = "10101";
    moovin_codes.processCode(resetCode);
    moovin_codes.input_code.value = resetCode;
    address = getAddressByCode(resetCode);
    setAddress(address);
});

/* 
    Event listener for postal code changes:
    - Changes the carrier section visibility and updates the address.
*/
moovin_codes.input_code.addEventListener("keyup", async (event) => {
    let code = postalCodeInput.value;
    let address = "";
    if ((event.isComposing && event.keyCode === 13 && code.length === 5 && isNumberKey(event)) || (code.length === 5 && isNumberKey(event))) {
        address = getAddressByCode(code);
        splitAddressToRequest(address, code);
        moovin_codes.processCode(code);
        // if (await getCoberturaByCode(address, code)) {
        //     // carrierSection.style.visibility = "visible";
        // } else {
        //     // carrierSection.style.visibility = "hidden";
        //     // moovinSection.style.visibility = "hidden";
        // }
    }
});