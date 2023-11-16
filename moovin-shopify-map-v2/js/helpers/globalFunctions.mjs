import { provincias, cobertura } from './index.mjs'
import { GETCOORDSGEOCODEURL } from '../utilities/CONSTANS.mjs';

export const getCantonesByProvinciaId = (id) => {
    return provincias[id].cantones;
}

export const getDistritosByCantonId = (id) => {
    if (id.length === 3) {
        let provincia = provincias[parseInt(id.substring(0, 1))];
        let canton = provincia.cantones[parseInt(id.substring(1, 3))];
        return canton.distritos;
    }
    return undefined;
}

export const getDistritoByCode = (id) => {
    if (id.length === 5) {
        let provincia = provincias[parseInt(id.substring(0, 1))];
        let canton = provincia.cantones[parseInt(id.substring(1, 3))];
        return canton.distritos[parseInt(id.substring(3, 5))];
    }
    return undefined;
}

export const getAddressByCode = (code) => {
    let address = "";
    let code_provincia = parseInt(code.substring(0, 1));
    let code_canton = parseInt(code.substring(1, 3));
    let code_distrito = parseInt(code.substring(3, 5));
    if (code_provincia in provincias) {
        let provincia = provincias[code_provincia];
        if (code_canton in provincia.cantones) {
            let canton = provincia.cantones[code_canton];
            if (code_distrito in canton.distritos) {
                let distrito = canton.distritos[code_distrito];
                address = `${distrito.nombre},${canton.nombre},${provincia.nombre}`;
            }
        }
    }
    return address;
}


const getCordsByAddress = async (address, postalCode) => {
    address = address.split(",");
    const url = `${GETCOORDSGEOCODEURL}&q=${address[0]},${address[1]},${address[2]}&qq=postalCode=${postalCode}`;
    const responseCoords = await axios.get(url);
    return responseCoords.data.items[0].position;

}

export const getCoberturaByCode = async (address, postalCode) => {
    return cobertura.includes(postalCode);
}

// export const getCoberturaByCode = async (address, postalCode) => {
//     try {
//         const { lat, lng } = await getCordsByAddress(address, postalCode);

//         const token = ""

//         const url = `${INSIDEZONECOVERAGEURL}?latitude=${lat}&longitude=${lng}`;
//         const axiosInstance = axios.create({
//             headers: {
//                 'token': token
//             },
//         });
//         const response = await axiosInstance.get(url);
//         return response.data.status === 'SUCCESS';
//     } catch (error) {
//         return cobertura.includes(postalCode);
//     }
// }


export const getProvinciaByNombre = (nombre) => {
    let resultado = undefined;
    if (nombre) {
        Object.keys(provincias).forEach((element) => {
            let p = provincias[element].nombre;
            if (p == nombre) {
                resultado = provincias[element].codigo;
                return false;
            }
        });
    }
    return resultado;
}

export const getCantonByNombre = (provincia, canton) => {
    let resultado = undefined;
    let cantones = getCantonesByProvinciaId(provincia);
    Object.keys(cantones).forEach((element) => {
        if (cantones[element].nombre === canton) {
            resultado = cantones[element].codigo;
        }
    });
    return resultado;
}

export const getDistritoByNombre = (canton, distrito) => {
    let resultado = undefined;
    let provincia_code = canton.substring(0, 1);
    let cantones = getCantonesByProvinciaId(provincia_code);
    Object.keys(cantones).forEach((element) => {
        if (cantones[element].codigo === canton) {
            let distritos = cantones[element].distritos;
            Object.keys(distritos).forEach((element) => {
                if (distritos[element].nombre === distrito) {
                    resultado = distritos[element].codigo;
                }
            });
        }
    });
    return resultado;
}

export const setProvincias = (provincias, callback) => { }

