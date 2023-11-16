# Moovin Mensajería Express
# Nombre del proyecto 
* moovin-shopify-map-v2
# Fecha de creación
* 2023-11-07
# Proyecto creado por 
* Breiner Carranza. bcarranza@moovin.me
* Jhonny Picado. jpicado@moovin.me
* Oldemar Cortés Rodríguez. ocortes@moovin.me

# Configuraciones generales 
* Ir al archivo CONSTANS en la constante KAPPAH añadir el apiKey de Here Map
```
export const KAPPAH = "aquí el apikey";
```
* Ir al achivo index-here.html cambiar el apiKey
```
 <script
    src="https://maps.googleapis.com/maps/api/js?key=aquí el apiKey&libraries=places">
  </script>
```
* Ir al achivo index-google.html 
```
  <script
    src="https://maps.googleapis.com/maps/api/js?key=aquí el apiKey&libraries=places">
  </script>
```