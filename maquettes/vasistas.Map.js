/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var vasistas = vasistas || {};

if (!google) throw new Error("Veuillez importer le script \"http://maps.googleapis.com/maps/api/js?libraries=geometry\" dans la page HTML");

/**
 * 
 * @param {type} div
 * @param {type} options facultatif (utilisé en 2e arg pour google.maps.Map) avec en plus :
 *   - photo : {scroll.js:photo} photo associée à la carte
 * @returns {undefined}
 */
vasistas.Map = function(div, options) {
    options = options || {};
    this.div = div;
    
    var defaultOptions = {
        //center: photo.getPosition(),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    for (var i in defaultOptions) {
        if (typeof options[i] == 'undefined') options[i] = defaultOptions[i];
    }
    
    var map = new google.maps.Map(document.getElementById("googleMap"), options);
    
    /** https://developers.google.com/maps/documentation/javascript/reference#Map */
    this.googleMap = map;
    
    // photo
    if (options.photo) this.setPhoto(options.photo);
};

/**
 * 
 * @param {scroll.js:photo} photo
 * @returns {undefined}
 */
vasistas.Map.prototype.setPhoto = function(photo) {
    if (this.photo == photo) return;
    
    var map = this.googleMap;
    var position = photo.getPosition();
    
    map.setCenter(position);
    map.setHeading(photo.getHeading()); // TODO : le tilt de la carte doit être activé pour marcher
    var myPlace = new google.maps.Marker({
        position: photo.getPosition(),
        map: map,
        title: 'Ma position'
    });
    this.myPlace = myPlace;
    this.photo = photo;
    
    // Lien avec photo
    photo.setMap(this);
};

/**
 * Conversion direction (0..360) -> heading (-180..180)
 * @param {degrés 0..360} dir
 * @returns {degrés -180..180}
 */
vasistas.Map.getHeading = function(dir) {
    return (dir >= 180 ? dir-360 : dir);
};

/**
 * Trace une ligne sur la carte pour visualiser la direction indiquée à partir de la position de la photo
 * @param {degrés} dir
 * @returns {undefined}
 */
vasistas.Map.prototype.drawDirection = function(dir) {
    var photo = this.photo;
    if (photo == null) {
        console.warn("Impossible de tracer une direction sans connaitre la position de la photo");
        return;
    }
    var distance = 10000; // m
    var heading  = vasistas.Map.getHeading(dir);
    var from = photo.getPosition();
    var to   = google.maps.geometry.spherical.computeOffset(from, distance, heading);
    
    this.drawDirectionTo(to);
};

/**
 * Trace une ligne sur la carte pour visualiser la direction indiquée à partir de la position de la photo
 * @param {google.maps.LatLng} latLng
 * @returns {undefined}
 */
vasistas.Map.prototype.drawDirectionTo = function(latLng) {
    var photo = this.photo;
    if (photo == null) {
        console.warn("Impossible de tracer une direction sans connaitre la position de la photo");
        return;
    }
    
    // Ancien flightPath
    if (this.flightPath) this.flightPath.setMap(null);
    
    // source : https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
    var from = photo.getPosition();
    var to   = latLng;
    var flightPlanCoordinates = [
        from,
        to
    ];
    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 1
    });
    flightPath.setMap(this.googleMap);
    
    this.flightPath = flightPath;
};