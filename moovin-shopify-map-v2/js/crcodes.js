"use strict";


import { 
  provincias
  ,cobertura
  ,getCantonesByProvinciaId
  ,getDistritosByCantonId
} from './helpers/index.mjs';


const moovin_data_provincia = document.querySelector("#moovin_data_provincia");
const moovin_data_canton = document.querySelector("#moovin_data_canton");
const moovin_data_distrito = document.querySelector("#moovin_data_distrito");
const moovin_data_code = document.querySelector("#moovin_data_code");
const moovin_state = document.querySelector("#moovin_state");


export const moovin_codes = {

    select_provincia: null,
    select_canton: null,
    select_distrito: null,
    input_code: null,
    init: function (id_provincia, id_canton, id_distrito, id_code, id_state) {
        /* inicializa las provincias en el select */
        moovin_codes.select_provincia = id_provincia;
        moovin_codes.select_canton = id_canton;
        moovin_codes.select_distrito = id_distrito;
        moovin_codes.input_code = id_code;
        let first = undefined;
        let el = document.createElement("option");
        el.textContent = "";
        el.value = "";
        moovin_codes.select_provincia.appendChild(el);
        Object.keys(provincias).forEach((id) => {
            let provincia = provincias[id];
            let el = document.createElement("option");
            el.textContent = provincia.nombre;
            el.value = provincia.codigo;
            if (first === undefined) {
                first = provincia.codigo;
            }
            moovin_codes.select_provincia.appendChild(el);
        });

        /* agrega un event listener para soportar el cambio de provincia */
        moovin_codes.select_provincia.addEventListener("change", function () {
            moovin_codes.removeCantones();
            let cantones = getCantonesByProvinciaId(moovin_codes.select_provincia.value);
            moovin_codes.setCantones(cantones);
            moovin_codes.input_code.value = "";
            moovin_codes.select_canton.value = "";
            moovin_codes.select_canton.dispatchEvent(new Event("change"));
        });
        /* agrega un event listener para soportar el cambio de canton */
        moovin_codes.select_canton.addEventListener("change", function () {
            let canton_id = moovin_codes.select_canton.value;
            moovin_codes.removeDistritos();
            if (canton_id) {
                let distritos = getDistritosByCantonId(canton_id);
                moovin_codes.setDistritos(distritos);
            }
            moovin_codes.input_code.value = "";
            // moovin_codes.select_distrito.value = "";
            // moovin_codes.select_distrito.dispatchEvent(new Event("change"));
        });

        /**
         * código de área por defecto
         */
        moovin_codes.processCode("10101");
        moovin_codes.input_code.value = "10101";
        /* fin de init */
    },
    processCode: function (code, callback) {
        let code_provincia = parseInt(code.substring(0, 1));
        let code_canton = parseInt(code.substring(1, 3));
        let code_province_canton = code.substring(0, 3);
        let code_distrito = parseInt(code.substring(3, 5));
        if (code_provincia in provincias) {
            moovin_codes.removeCantones();
            let cantones = getCantonesByProvinciaId(code_provincia);
            if (code_canton in cantones) {
                moovin_codes.setCantones(cantones, function () {
                    moovin_codes.removeDistritos();
                    let distritos = getDistritosByCantonId(code_province_canton);
                    if (code_distrito in distritos) {
                        moovin_codes.setDistritos(distritos, function () {
                            moovin_codes.select_provincia.value = code_provincia;
                            moovin_codes.select_canton.value = code_province_canton;
                            moovin_codes.select_distrito.value = code;
                            moovin_codes.select_distrito.dispatchEvent(new Event("change"));
                        });
                    }
                });
            }
        }
    },
    setCantones: function (cantones, callback) {
        let el = document.createElement("option");
        el.textContent = "";
        el.value = "";
        moovin_codes.select_distrito.appendChild(el);
        Object.keys(cantones).forEach((id) => {
            let canton = cantones[id];
            let el = document.createElement("option");
            el.textContent = canton.nombre;
            el.value = canton.codigo;
            moovin_codes.select_canton.appendChild(el);
        });
        callback ? callback() : "";
    },

    setDistritos: function (distritos, callback) {
        let el = document.createElement("option");
        el.textContent = "";
        el.value = "";
        moovin_codes.select_distrito.appendChild(el);
        Object.keys(distritos).forEach((id) => {
            let distrito = distritos[id];
            el = document.createElement("option");
            el.textContent = distrito.nombre;
            el.value = distrito.codigo;
            moovin_codes.select_distrito.appendChild(el);
        });
        callback ? callback() : "";
    },

    removeCantones: function (data, callback) {
        while (moovin_codes.select_canton.length > 0) {
            moovin_codes.select_canton.remove(0);
        }
        callback ? callback() : "";
    },

    removeDistritos(data, callback) {
        while (moovin_codes.select_distrito.length > 0) {
            moovin_codes.select_distrito.remove(0);
        }
        callback ? callback() : "";
    }
};

moovin_codes.init(moovin_data_provincia, moovin_data_canton, moovin_data_distrito, moovin_data_code, moovin_state);