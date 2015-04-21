/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var photo = {};
            
photo.init = function(options) {
    var divPhoto = $("#" + options.photo);
    this.$div = divPhoto;
    this._zoom = 1;
    this.dragging = false;
    
    this.bindDrag();
    
    this.view.init(this, $("#" + options.dock));
};

photo.bindDrag = function() {
    var thisPhoto = this;
    
    this.$div.mousedown(function(event) {

        if (!thisPhoto.dragging) {
            // start drag
            var startX = event.pageX + thisPhoto.view.x;
            var startY = event.pageY + thisPhoto.view.y;

            $(window).mousemove(function(event) {
                console.log("startX   : "+startX);
                console.log("leftStart: "+leftStartX);
                console.log("scroll   : "+(startX - event.pageX));
                console.log("scroll Z : "+(thisPhoto.view.left(startX) - thisPhoto.view.left(event.pageX)));
                console.log("");    
                thisPhoto.view.scrollBy((startX - event.pageX) / thisPhoto.zoom(), startY - event.pageY);
            });
            thisPhoto.dragging = true;
        }
    });
    
    $(window).mouseup(function(event) {
        if (thisPhoto.dragging) {
            $(window).unbind('mousemove');
            thisPhoto.dragging = false;
        }
    });
    
    // Zoom
    // TODO : centrer le zoom sur le curseur
    // TODO : modifier le blocage min max du dragging en cas de zoom
    var zoomSpeed=0.015;

    var zoomIn  = 1+zoomSpeed;
    var zoomOut = 1-zoomSpeed;
    this.$div.bind('mousewheel', function(e) {
        var zoomMin = Math.min(
            thisPhoto.view.width()  / thisPhoto.width(), // TODO : à deplacer plus haut
            thisPhoto.view.height() / thisPhoto.height());
        var zoom = thisPhoto.zoom();
        if(e.originalEvent.wheelDelta /120 > 0) {
            zoom *= zoomIn;
        }
        else if (zoom > zoomMin) {
            zoom = Math.max(zoomMin, zoom * zoomOut);
        }
        var centerX = e.pageX - thisPhoto.view.$div.offset().left;
        var centerY = e.pageY - thisPhoto.view.$div.offset().top;
        var left = thisPhoto.view.left(centerX);
        var top  = thisPhoto.view.top( centerY);
        //thisPhoto.zoom(zoom, left, top);
        thisPhoto.zoom(zoom);
        
    });
};

photo.width = function() {
    return 1920;
};

photo.height = function() {
    return 1080;
};

/**
 * 
 * @param {type} zoom facteur
 * @param {type} x centre du zoom
 * @param {type} y centre du zoom
 * @returns {@this;@pro;_zoom|@var;zoom|Number}
 */
photo.zoom = function(zoom, x, y) {
    if (typeof zoom == 'undefined') return this._zoom;
    
    if (typeof x == 'undefined') x = this.view.left(this.view.width()  / 2);
    if (typeof y == 'undefined') y = this.view.top( this.view.height() / 2);
    
    // FIXME : De 22h jusqu'à 3h pour pondre une merde pareille :'(
    var x0 = x - this.view.width() / zoom / 2;
    var y0 = y - this.view.height() / zoom / 2;
    console.log(x0);
    this.view.moveTo(x0, y0, zoom);
    
    this._zoom = zoom;
};

photo.view = {};

photo.view.init = function(photo, div) {
    this.photo = photo;
    this.$div = div;
    this.x = 0;
    this.y = 0;
    this._zoom = 1;
};

photo.view.width = function() {
    return this.$div.width();
};

photo.view.height = function() {
    return this.$div.height();
};

/**
 * 
 * @param {type} x
 * @param {type} y
 * @param {type} width
 * @param {type} height
 * @returns {undefined}
 */
photo.view.moveTo = function(x, y, zoom) {
    if (typeof x == 'undefined') x = this.x;
    if (typeof y == 'undefined') y = this.y;
    zoom = zoom || this.photo.zoom();
    
    // TODO : perf OK ?
    var xMax = this.photo.width()  - this.width()  / zoom;
    var yMax = this.photo.height() - this.height() / zoom;
    x = Math.max(0, Math.min(xMax, x));
    y = Math.max(0, Math.min(yMax, y));
    
    var mx = zoom > 1 ? this.photo.width()  * (zoom - 1) / 2 : -this.photo.width()  * (1 - zoom) / 2;
    mx -= x * zoom;
    var my = zoom > 1 ? this.photo.height() * (zoom - 1) / 2 : -this.photo.height() * (1 - zoom) / 2;
    my -= y * zoom;
    
    var matrix = zoom + ",0,0," + zoom + "," + mx + "," + my;
    this.photo.$div.css("transform", "matrix("+matrix+")");
    
    // Curseurs
    var cx = zoom > 1 ? -x*zoom : -x*zoom;
    $("#photo-overlay-angles").css("transform", "matrix(1,0,0,1," + cx + ",0)");
    
    this.x = x;
    this.y = y;
    this._zoom = zoom;
};

photo.view.centerTo = function(x, y, zoom) {
    zoom = zoom || this.photo.zoom();
    var x0 = x - this.width()  / 2 / zoom;
    var y0 = y - this.height() / 2 / zoom;
    this.moveTo(x0, y0, zoom);
};

photo.view.left = function(x) {
    return this.x + x / this.photo.zoom();
};

photo.view.top = function(y) {
    return this.y + y / this.photo.zoom();
};

photo.view.scrollBy = function(x, y) {
	// Tenir compte du zoom
    this.moveTo(x, y);
};
