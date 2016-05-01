/**
 * Created by bludwarf on 01/05/2016.
 */

function View(photo, div) {
    this.photo = photo;
    this.$ = div;
    this.x = 0;
    this.y = 0;
    this._zoom = 1;
}


// TODO : ajouter un listener pour maj la largeur et corriger le zoom
// à chaque redimensionnement de l'IHM
View.prototype.width = function() {
    return this.$.width();
};

View.prototype.height = function() {
    return this.$.height();
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} zoom
 * @returns {undefined}
 */
View.prototype.moveTo = function(x, y, zoom) {
    if (typeof x == 'undefined') x = this.x;
    if (typeof y == 'undefined') y = this.y;
    zoom = zoom || this.photo.zoom();

    // TODO : perf OK ?
    var xMax = this.photo.width  - this.width()  / zoom;
    var yMax = this.photo.height - this.height() / zoom;
    x = Math.max(0, Math.min(xMax, x));
    y = Math.max(0, Math.min(yMax, y));

    var mx = zoom > 1 ? this.photo.width  * (zoom - 1) / 2 : -this.photo.width  * (1 - zoom) / 2;
    mx -= x * zoom;
    var my = zoom > 1 ? this.photo.height * (zoom - 1) / 2 : -this.photo.height * (1 - zoom) / 2;
    my -= y * zoom;

    var matrix = zoom + ",0,0," + zoom + "," + mx + "," + my;
    this.photo.$.css("transform", "matrix("+matrix+")");

    // Curseurs
    var cx = zoom > 1 ? -x*zoom : -x*zoom;
    //$("#photo-overlay-angles").css("transform", "matrix(1,0,0,1," + cx + ",0)");

    this.x = x;
    this.y = y;
    this._zoom = zoom;

    // infos : TODO : gérer des events avec des listener
    this.photo.infos.x = Math.round(x);
    this.photo.overlays.repaint();
};

View.prototype.centerTo = function(x, y, zoom) {
    if (typeof x == 'undefined') x = this.x;
    if (typeof y == 'undefined') y = this.y;
    zoom = zoom || this.photo.zoom();

    var x0 = x - this.width()  / 2 / zoom;
    var y0 = y - this.height() / 2 / zoom;
    this.moveTo(x0, y0, zoom);
};

/**
 *
 * @param {number} x valeur x sur la vue ou mouse event dont on souhaite récupérer les coords sur la photo
 * @returns x sur la photo
 */
View.prototype.left = function(x) {
    if (x.pageX) return this.x + (x.pageX - this.offset().left) / this.photo.zoom();
    return this.x + x / this.photo.zoom();
};

/**
 *
 * @param {number} y valeur y sur la vue ou mouse event dont on souhaite récupérer les coords sur la photo
 * @returns {photo.view@pro;photo@call;zoom|photo.view@call;offset@pro;top|type|Number|@this;@pro;y}
 */
View.prototype.top = function(y) {
    if (y.pageY) return this.y + (y.pageY - this.offset().top) / this.photo.zoom();
    return this.y + y / this.photo.zoom();
};

/**
 * x sur la vue
 * @param {degrés} dir direction réelle
 * @returns {px} x sur la vue
 */
View.prototype.xDir = function(dir) {
    if (typeof dir == 'undefined') throw new Error('Veuillez indiquer une direction pour avoir le xDir');
    return (this.photo.getX(dir) - this.x) * this.photo.zoom();
};

View.prototype.revealAll = function() {
    this.photo.zoom(this.photo._zoomMin);
};

/**
 *
 * @returns {photo.view@pro;$div@call;offset} Coordonnées du div dans la page HTML
 */
View.prototype.offset = function() {
    return this.$.offset();
};
