/**
 * Created by bludwarf on 01/04/2015.
 */

/**
 * Associe une photo à un endroit, en indiquant où l'endroit apparait sur cette photo
 *
 * Coordonnées Google Earth
 * lng : West-East   <=> x
 * lat : North-South <=> y
 * alt : altitude
 *
 * @param {{title, x, y, position, lat, lng}} options Liste des options pour initialiser le répère (carte ou photo)
 */
function Place(options) {
    /**
     * Nom de la photo (prop)
     */
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
        this.latLng = new google.maps.LatLng(options.lat, options.lng);
    }

    this.coords = null; // Coords
}

Place.prototype.appearsAt = function(x, y, photo) {
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
    this.posX = x / photo.width;
    this.posY = y / photo.height;

    this.heading = null; // heading à recalculer

    /**
     *
     * @type {google.maps.Marker}
     * @private
     */
    this._marker = null;

    photo.addPlace(this);

    return this;
};

Object.defineProperties(Place.prototype, {

    /**
     * Angle sur la photo
     */
    angle: {
        get: function() {
            var xMax = this.photo.width;
            var ratio = this.x / xMax;
            //console.log(this.getX() + " / " + xMax);
            return ratio * this.photo.angle;
        }
    },

    /**
     * type {google.maps.Marker}
     */
    marker: {

        /**
         * @returns {google.maps.Marker}
         */
        get: function() {
            if (!this._marker) {
                // options : https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions
                this._marker = new google.maps.Marker({
                    position: this.latLng,
                    title: this.name
                });
            }
            return this._marker;
        }
    }

});

/**
 * Tels qu'ils apparaissent dans un export KML (lng puis lat)
 * @param {int} lng longitude
 * @param {int} lat latitude
 */
Place.prototype.setCoords = function(lng, lat) {
    this.latlng = new google.maps.LatLng(lat, lng);
};

Place.prototype.serialize = function() {
    return "'" + this.name + "':" + this.posX + "," + this.posY + " (" + this.getDirection() + "°)";
};

/**
 * Direction terrestre
 */
Place.prototype.getDirection = function(from) {

    if (this.heading == null) this.heading = {};

    var heading = this.heading[from];
    if (heading == null) {
        from = from || this.photo.latLng;
        var to = this.latLng;
        if (to == null) throw "this.getDirection : impossible d'avoir la direction vers un point inconnu sur la carte";
        heading = google.maps.geometry.spherical.computeHeading(from, to);
        this.heading[from] = heading;
    }

    return (heading+360)%360;
};


/**
 * Direction terrestre
 */
Place.prototype.getDistance = function(from) {
    var to = this.latLng;
    return google.maps.geometry.spherical.computeDistanceBetween(from, to);
};


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
Place.loadPoints = function(data) {
    var points = {};
    for (var name = 0 in data) {
        var point = data[name];
        points[name] = new google.maps.LatLng(point.lat, point.lng);
    }
    return points;
};