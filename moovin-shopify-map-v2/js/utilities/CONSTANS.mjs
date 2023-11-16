export const KAPPAH = "";
export const GETCOORDSGEOCODEURL = `https://geocode.search.hereapi.com/v1/geocode?apiKey=` + KAPPAH + `&resultType=locality&in=countryCode%3ACRI`;
export const ZONECOVERAGEURL = 'https://moovin.me/moovinApiWebServices-cr/rest/api/supportCenter/statistics/zone?zoneName=moovinCoverage'
export const DANGERZONESURL = "https://moovin.me/moovinApiWebServices-cr/rest/api/supportCenter/getAllDangerZoneOnDemand";
export const UPDATECODEURL = `https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=` + KAPPAH + `&resultType=locality`;
export const MAPSTATE = {
    marker: null,
    map: null,
}
export const DEFAULTCOORDS = { lat: 9.9355438, lng: -84.1484504 };