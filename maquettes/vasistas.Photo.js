/**
 * @param options {{div, photo: Photo, dock, ctrlPoints}} Par défaut :
 *   {
 *      div: "photo"
 *   }
 * @constructor
 */
function Photo(options) {

    // defaults
    var defaults = {
        div: "photo",
        infos: "photo-infos",
        dock: "photo-dock",
        ctrlPoints: "ctrl-points"
    };
    _.defaults(options, defaults);

    this.$ = $("#" + options.div);
    this._zoom = 1;
    this.dragging = false;
    this.lat = options.photo.lat;
    this.lng = options.photo.lng;

    // closure ok ?
    var width = options.photo.width;
    var height = options.photo.height;
    this.getAngle = function(x, y) {
        if (typeof x == 'undefined') {
            return -this.getAngle(0) * 2;
        }
        return options.photo.getAngle(x, y, width, height);
    };
    this.dx = function(angle) {
        return options.photo.dx(angle);
    };

    this.precision = new Precision(this);
    this.view = new View(this, $("#" + options.dock));

    // TODO : en doublon avec la property photo
    this.photo = options.photo;

    // Overlays
    this.overlays = new Overlays(this, {
        angle: $("canvas#photo-overlay-angle")
    });

    // Drag
    //this.bindDrag();
    this.selectTool(tools.move);
    this.bindScroll();

    this.infos = new Infos(options.infos);

    // Control points
    this.points = new Points(this, $("#"+options.ctrlPoints));
}

Object.defineProperties(Photo.prototype, {

    height: {
        get: function() {
            return this._height;
        },
        set: function(value) {
            this._height = value;
            this.$.css("height", value);
            this.updateZoomMin();
        }
    },

    width: {
        get: function() {
            return this._width;
        },
        set: function(value) {
            this._width = value;
            this.$.css("width", value);
            this.updateZoomMin();
        }
    },

    photo: {
        set: function(options) {
            this.$.css("background-image",   "url("+options.filename+")");
            this.width = options.width;
            this.height = options.height;
        }
    },
    
    /**
     * Repère sur la photo et localisé sur Terre pour en déduire l'orientation de la photo
     */
    anchor: {
    	get: function() {
    		return this._anchor;
    	},
    	
    	/**
    	 * @param place {Place}
    	 */
     	set: function(place) {
     		if (!place.latLng) throw new Error('Impossible de placer sur une photo une ancre sans latLng');
	        this._anchor = place.latLng;
	
	        this.directionMin = (place.getDirection() - place.angle) % 360;
	        console.log("place.getDirection = " + place.getDirection());
	        console.log("place.getAngle = " + place.angle);
	        console.log("this.directionMin = " + this.directionMin);
	        console.log("this.directionMin = " + this.directionMin);
	    }
     },
     
     // TODO : c'est bien ça ?
     latLng: {
     	get: function() {
     		if (this.anchor == null) return null;
     		return this.anchor;
     	}
     },

    position: {
        get: function() {
            return this.latLng;
        }
    },

    offsetXMax: {
        get: function() {
            return this.ecran.width.baseVal.value - 1;
        }
    },
    offsetYMax: {
        get: function() {
            return this.ecran.height.baseVal.value - 1;
        }
    },

    /**
     * La taille de l'image sur l'écran
     */
    'widthOnScreen': {
        get: function () {
            return ecran.width.baseVal.value;
        }
    },

    /**
     * La taille de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'visibleWidth': {
        get: function () {
            var view = ecran.viewBox.baseVal;
            return view.width;
        }
    },

    /**
     * La taille de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'visibleHeight': {
        get: function () {
            var view = ecran.viewBox.baseVal;
            return view.height;
        }
    },

    /**
     * Le bord gauche de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'visibleX': {
        get: function () {
            var view = this.ecran.viewBox.baseVal;
            return view.x;
        }
    },

    /**
     * Le bord supérieur de ce qui est visible sur l'écran par rapport à la photo réelle (en pixels photo)
     */
    'visibleY': {
        get: function () {
            var view = this.ecran.viewBox.baseVal;
            return view.y;
        }
    }

});

Photo.prototype.getX = function(dir) {
    var angle = dir - this.getDirection();
    var dx = this.dx(angle);
    return this.width / 2 + dx;
};

/**
 * pixels écran -> pixels photo
 * @param offsetY pixels écran sur la photo affichée (et pas réelle)
 */
Photo.prototype.getY = function(offsetY) {
    var ratio = offsetY / this.offsetYMax;
    return this.visibleY + Math.round(ratio * this.visibleHeight);
};

/**
 * getDirection()    -> direction du centre de la photo
 * getDirection(x,y) -> direction d'un point sur l'image
 * @returns {Number}
 */
Photo.prototype.getDirection = function(x, y) {

    // getDirection()
    if (typeof x == 'undefined' && typeof y == 'undefined') {
        var dir = 0;
        var n = 0;
        // TODO : prendre en compte la précision de chaque point
        // TODO : sauvegarder le résultat à chaque fois si aucun changement de point
        for (var i in this.points.list) {
            var point = this.points.list[i];
            if (!point.dir) continue;
            dir += point.dir - this.getAngle(point.x, point.y);
            ++n;
        }
        return dir/n;
    }

    // getDirection(x,y)
    else {
        var angle = this.getAngle(x, y);
        return this.getDirection() + angle;
    }
};


Photo.prototype.addPoint = function(x, y) {
    console.log("TODO : addPoint("+x+","+y+")");
    this.points.add(x, y);
};


// private
Photo.prototype.updateZoomMin = function() {
    this._zoomMin = Math.min(
        this.view.width()  / this.width,
        this.view.height() / this.height);
};

/**
 *
 * @param {type} zoom facteur
 * @param {number} x centre du zoom
 * @param {number} y centre du zoom
 * @returns {@this;@pro;_zoom|@var;zoom|Number}
 */
// TODO : en cas de zoom faisant apparaitre le fond, il faudrait center l'image plutôt que de la caler en haut à gauche
Photo.prototype.zoom = function(zoom, x, y) {
    if (typeof zoom == 'undefined') return this._zoom;

    if (typeof x == 'undefined') x = this.view.left(this.view.width()  / 2);
    if (typeof y == 'undefined') y = this.view.top( this.view.height() / 2);

    // FIXME : De 22h jusqu'à 3h pour pondre une merde pareille :'(
    var x0 = x - this.view.width() / zoom / 2;
    var y0 = y - this.view.height() / zoom / 2;
    //console.log(x0);
    this._zoom = zoom;
    this.view.moveTo(x0, y0, zoom);
};

Photo.prototype.getZoom = function() {
    return this._zoom;
}

Photo.prototype.selectTool = function(tool) {
    // Ancien outil
    if (this._tool && this._tool.detachFrom) this._tool.detachFrom(this);

    // check si toutes les méthodes obligatoires sont présentes
    if (!tool.detachFrom) throw new Error("L'outil doit implémenter la méthode detachFrom(photo)");

    tool.attachTo(this);

    this._tool = tool;
};

/**
 * x,y (en pixels photo)
 */
Photo.prototype.addPlace = function(place) {

    // On change le répère de la photo si c'est le 1er point qu'on place
    if (this.anchor == null) this.anchor = place;

    // Création dans l'IHM
    if (place.name) {
        var html = '<text x="' + place.x + '" y="' + place.y + '" text-anchor="middle" fill="#FFF" pointer-events="none">' + place.name + '</text>';
        this.append(html);

        // Création dans la table
        console.log("TODO : ajouter point : "+place.name+" : "+place.x+","+place.y);
    }
};

Photo.prototype.append = function(html) {
    if (typeof(ecran) === 'undefined') {
        console.warn("ecran not defined");
        return;
    }
    $(ecran).append(html);
    $(ecran).html($(ecran).html());
};
