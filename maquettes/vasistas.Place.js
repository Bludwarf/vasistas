
points = loadPoints({
    rova  : {lat: -18.92348100124909,   lng: 47.53185215892805},
    lac   : {lat: -18.9226356424,       lng: 47.5148770807},        // 273.01081393192686° x=252
    anosy : {lat: -18.91366689,         lng: 47.5221688827},        // 316.97226770386897° x=1360
    usine : {lat: -18.92279776874189,   lng: 47.51983074455688}
});

/**
 * 
 * @param {type} data JSON au format
 * ```javascript
 * {
 *      pointA  : {lat: -18.92348100124909,   lng: 47.53185215892805}
 * }
 * ```
 * 
 * @returns {google.maps.LatLng} liste de points Google Map
 */
function loadPoints(data) {
    var points = {};
    for (var name = 0 in data) {
        var point = data[name];
        points[name] = new google.maps.LatLng(point.lat, point.lng);
    }
    return points;
}

/**
 * Coordonnées Google Earth
 * lng : West-East   <=> x
 * lat : North-South <=> y
 * alt : altitude
 */

/**
 * Associe une photo à un endroit, en indiquant où l'endroit apparait sur cette photo
 * @param {map} options Liste des options pour initialiser le répère (carte ou photo)
 */
function Place(options) {			
    this.name = options.title;
    this.photo = null;
    this.x = (options.x != null ? options.x : -1); // sur la photo
    this.y = (options.y != null ? options.y : -1); // sur la photo
    this.posX = -1; // position par rapport à la taille de la photo (de 0 à 1 inclus)
    this.posY = -1; // position par rapport à la taille de la photo (de 0 à 1 inclus)
    this.heading = null; // [-180;180) direction terrestre par rapport à l'objectif calculée par Google Map

    this.latLng = null; // position réelle sur Terre
    if (options.position != null) {
        this.latLng = options.position;
    }
    else if (options.lat != null || options.lng != null) {
        if (!(options.lat != null && options.lng != null)) throw "Place : lat et lng doivent être spécifié en même temps ou pas du tout";
        this.latLng = new google.maps.LatLng(options.lat, options.lng	);
    }

    this.coords = null; // Coords

    this.getName = function() {
        return this.name;
    };

    this.setName = function(name) {
        this.name = name;
    };

    this.getX = function() {
        return this.x;
    };

    this.getY = function() {
        return this.y;
    };

    this.setPhoto = function(photo) {
        this.photo = photo;
    };

    this.appearsAt = function(x, y, photo) {
        if (photo == null) {
            if (this.photo == null) throw 'Place.appearsAt : Vous devez indiquer à quelle photo est rattaché cet endroit';
            photo = this.photo;
        }
        else {
            if (this.photo != null && photo != this.photo) throw 'Place.appearsAt : Impossible d\'associer un endroit à plusieurs photos dans cette version';
            this.photo = photo;
        }

        this.x = x;
        this.y = y;
        this.posX = x / photo.getWidth();
        this.posY = y / photo.getHeight();

        this.heading = null; // heading à recalculer

        photo.addPlace(this);

        return this;
    };

    /**
     * Tels qu'ils apparaissent dans un export KML (lng puis lat)
     * @param {int} lng longitude
     * @param {int} lat latitude
     */ 
    this.setCoords = function(lng, lat) {
        this.setLatLng(new google.maps.LatLng(lat, lng));
    };

    this.serialize = function() {
        return "'" + this.name + "':" + this.posX + "," + this.posY + " (" + this.getDirection() + "°)";
    };

    this.setLatLng = function(latLng) {
        this.latLng = latLng;
    };

    this.getLatLng = function() {
        return this.latLng;
    };

    /**
     * Direction terrestre
     */
    this.getDirection = function(from) {
        
        if (this.heading == null) this.heading = {};
        
        var heading = this.heading[from];
        if (heading == null) {
            from = from || this.photo.getLatLng();
            var to = this.latLng;
            if (to == null) throw "this.getDirection : impossible d'avoir la direction vers un point inconnu sur la carte";
            heading = google.maps.geometry.spherical.computeHeading(from, to);
            this.heading[from] = heading;
        }
        
        var direction = (heading+360)%360;
        return direction;
    };

    /**
     * Direction terrestre
     */
    this.getDistance = function(from) {
        var to = this.latLng;
        return google.maps.geometry.spherical.computeDistanceBetween(from, to);
    };

    /**
     * Angle sur la photo
     */
    this.getAngle = function() {
        var xMax = this.photo.getWidth();
        var ratio = this.getX() / xMax;
        //console.log(this.getX() + " / " + xMax);
        return ratio * this.photo.getAngle();
    };

    // options : https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions
    this.getMarker = function() {
        return new google.maps.Marker({
            position: this.getLatLng(),
            title: this.getName()
        });
    };
}