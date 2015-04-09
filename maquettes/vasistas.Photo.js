/**
 * Il faut distinguer 3 types de mesures différentes :
 *     1 - La taille de la photo réelle (par exemple 1920 x 1080) : en pixels photo
 *     2 - La taille de ce qu'on affiche sur l'écran (en pixel sur l'écran réel) (par exemple 640 x 480) : en pixels écran
 *     3 - La taille de ce qui est visible de la photo originale (par exemple le centre de la photo avec un zoom à 200%) : en pixels photo
 *
 * Dans le code cela se traduit par des méthodes portant les noms suivants :
 *     1 - getWidth()
 *     2 - getWidthOnScreen()
 *     3 - getVisibleWidth()
 */
// image totale (attention valable uniquement sans bordure autour de l'image)
var photo = {
    'offsetXMax': ecran.width.baseVal.value - 1, // 1250 avec le Debug Chrome
    'offsetYMax': ecran.height.baseVal.value - 1,

    /**
     * Direction sur l'intervalle [0;360) (cf. "heading" qui lui est sur [-180;180) dans la lib geometry : https://developers.google.com/maps/documentation/javascript/reference#Distance)
     *
     * Conversions :
     * direction = (heading+360)%360
     * heading   = (dir >= 180 ? dir-360 : dir)
     */
    'directionMin': 265.559861911151,

    //'angle': 71.31448095, // [0..360) : calcul formule

                    /** Angle de vue réel de la photo (en degré). Cette mesure doit être la plus précise possible pour permettre un bon repérage */
    'angle': 76.1786924567, // [0..360) : triangulation avec deux repères (lac+anosy) : 1108px/1920px = 43,9614537719°

                    /** (interne) On zoome actuellement sur la photo dans l'IHM */
    'zoomed': false,

                    /** (Place) Position d'où as été prise la photo */
    'position': points.rova,

                    /** Un repère sur la photo qui a été identifié (donc sa position réelle sur la carte est connue) */
    'anchor': null, // LatLng : bord du lac à gauche actuellement
    // http://www.movable-type.co.uk/scripts/latlong.html
    // http://www.earthpoint.us/Convert.aspx

    /**
     * pixels écran -> pixels photo
     * @param offsetX pixels écran sur la photo affichée (et pas réelle)
     */
    'getX' : function(offsetX) {
        var ratio = offsetX / this.offsetXMax;
        return this.getVisibleX() + Math.round(ratio * this.getVisibleWidth());
    },

    /**
     * pixels écran -> pixels photo
     * @param offsetY pixels écran sur la photo affichée (et pas réelle)
     */
    'getY' : function(offsetY) {
        var ratio = offsetY / this.offsetYMax;
        return this.getVisibleY() + Math.round(ratio * this.getVisibleHeight());
    },

    /**
     * pixels écran -> pixels photo
     * @param offsetX pixels écran sur la photo affichée (et pas réelle)
     */
    'getAngle' : function(offsetX) {
        if (offsetX != null) throw "getAngle(offsetX) non implémenté";
        else {
            return this.angle;
        }
    },

    /**
     * LatLng
     */
    'getPosition' : function() {
        return this.position;
    },

    /**
     * pixels photo
     */
    'getWidth' : function() {
        return $("image.photo", ecran).attr('width');
    },

    /**
     * pixels photo
     */
    'getHeight' : function() {
        return $("image.photo", ecran).attr('height');
    },

    /**
     * pixels écran -> orientation par rapport à la boussole (0 = Nord, 90 = Est)
     */
    'getDirection' : function(offsetX) { // TODO perf : stocker les résultats pour chaque offsetX
        var ratio = offsetX / this.offsetXMax;
        //console.log(offsetX + " / " + offsetXMax);
        return this.directionMin + ratio * this.angle % 360;
    },

    'setHeading' : function(heading) {
        this.directionMin = (heading+360)%360;
    },

    'getHeading' : function() {
        var dir = this.directionMin + this.angle / 2;
        return (dir >= 180 ? dir-360 : dir);
    },

    /**
     * 1 = zoom à 100%
     */
    'getZoom': function() { // TODO : utiliser le zoom pour retrouver la marge d'erreur possible dû à la taille de l'affichage actuel (exemple : 50% => 2px d'erreur à l'écran) auqule on doit ajouter la marge d'erreur de l'utilisateur
        return this.getWidthOnScreen() / this.getVisibleWidth(); // FIXME : le calcul du ZOOM ne semble pas bon alors que la fonction toggleZoom marche bien
    },

    /**
     * La taille de l'image sur l'écran
     */
    'getWidthOnScreen': function() {
        return ecran.width.baseVal.value;
    },

    /**
     * La taille de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'getVisibleWidth': function() {
        var view = ecran.viewBox.baseVal;
        return view.width;
    },

    /**
     * La taille de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'getVisibleHeight': function() {
        var view = ecran.viewBox.baseVal;
        return view.height;
    },

    /**
     * Le bord gauche de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'getVisibleX': function() {
        var view = ecran.viewBox.baseVal;
        return view.x;
    },

    /**
     * Le bord supérieur de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'getVisibleY': function() {
        var view = ecran.viewBox.baseVal;
        return view.y;
    },

    'toggleZoom': function(offsetX, offsetY) {
        var x = this.getX(offsetX);
        var y = this.getY(offsetY);
        var z = 2 / 0.65; // On veut du 200%
        //var z = 1 / 0.65; // On veut du 100%

        var view = ecran.viewBox.baseVal;

        if (!this.zoomed) {
            this.zoom(z, offsetX, offsetY);
        }

        else {

            // On trace la position par rapport à l'image
            this.addPoint(x, y);

            view.x = 0; // FIXME : pas toujours vrai ?
            view.y = 0; // FIXME : pas toujours vrai ?
            view.width *= z;
            view.height *= z;
        }

        this.zoomed = !this.zoomed;
    },

    // TODO : attention : ne marche plus quand on a scrollé la page !
    'zoom': function(factor, offsetX, offsetY) {
        var z = factor;
        var view = ecran.viewBox.baseVal;
        view.x += (1 - 1/z) * this.getX(offsetX);
        view.y += (1 - 1/z) * this.getY(offsetY);
        view.width /= z;
        view.height /= z;
    },

    /**
     * x,y (en pixels photo)
     */
    'addPoint' : function(x, y) {
        var name = "point";
        var posX = x / this.getWidth();
        var posY = y / this.getHeight();

        var place = new Place(name);
        place.appearsAt(x, y, photo);
        var coords = points.lac; // TODO : LatLng : bord du lac à gauche actuellement
        place.setLatLng(coords);
        console.log("addPoint : " + place.serialize());
        console.log("  distance : " + google.maps.geometry.spherical.computeDistanceBetween(photo.getLatLng(), place.getLatLng()));

        // On change le répère de la photo si c'est le 1er point qu'on place
        if (this.anchor == null) photo.setAnchor(place);

        // Création dans l'IHM
        var html = '<text x="' + x + '" y="' + y + '" text-anchor="middle" fill="#FFF" pointer-events="none">' + name + '</text>';
        this.append(html);
    },

    /**
     * x,y (en pixels photo)
     */
    'addPlace' : function(place) {

        // On change le répère de la photo si c'est le 1er point qu'on place
        if (this.anchor == null) photo.setAnchor(place);

        // Création dans l'IHM
        if (place.getName()) {
            var html = '<text x="' + place.getX() + '" y="' + place.getY() + '" text-anchor="middle" fill="#FFF" pointer-events="none">' + place.getName() + '</text>';
            this.append(html);
        }
    },

    /**
     * Repère sur la photo et localisé sur Terre pour en déduire l'orientation de la photo
     */
    'setAnchor' : function(place) {
        this.anchor = place.getLatLng();

        this.directionMin = (place.getDirection() - place.getAngle()) % 360;
        console.log("place.getDirection = " + place.getDirection());
        console.log("place.getAngle = " + place.getAngle());
        console.log("this.directionMin = " + this.directionMin);
        console.log("this.directionMin = " + this.directionMin);
    },

    'append': function(html) {
        $(ecran).append(html);
        $(ecran).html($(ecran).html());
    },

    'getLatLng': function() {
        return this.position;
    }
};