/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var photo = new Photo();
            
photo.init = function(options) {
    var divPhoto = $("#" + options.div);
    this.$div = divPhoto;
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
    
    this.precision.init(this);
    this.view.init(this, $("#" + options.dock));
    
    this.setPhoto(options.photo);
    
    // Overlays
    this.overlays.angle.init(this, $("canvas#photo-overlay-angle"));
    
    // Drag
    //this.bindDrag();
    this.selectTool(tools.move);
    this.bindScroll();
    
    this.infos.init(options.infos);
    
    // Control points
    this.points.init(this, $("#"+options.ctrlPoints));
};

photo.setPhoto = function(options) {
    this.$div.css("background-image",   "url("+options.filename+")");
    this.width = options.width;
    this.height = options.height;
};

photo.bindDrag = function() {
    var thisPhoto = this;
    
    this.$div.mousedown(function(event) {

        if (!thisPhoto.dragging) {
            // start drag
            var start = event;
            var x0 = thisPhoto.view.x;
            var y0 = thisPhoto.view.y;

            $(window).mousemove(function(event) {
                var dx = event.pageX - start.pageX;
                var dy = event.pageY - start.pageY;
                var  x = x0 - dx / thisPhoto.zoom();
                var  y = y0 - dy / thisPhoto.zoom();
                thisPhoto.view.moveTo(x, y);
            });
            
            thisPhoto.dragging = true;
        }
    });
};

photo.bindScroll = function() {
    var photo = this;
    
    // Zoom
    // TODO : centrer le zoom sur le curseur
    // TODO : modifier le blocage min max du dragging en cas de zoom
    var zoomSpeed=0.05;

    var zoomIn  = 1+zoomSpeed;
    var zoomOut = 1-zoomSpeed;
    this.$div.bind('mousewheel', function(e) {
        var zoom = photo.zoom();
        if(e.originalEvent.wheelDelta /120 > 0) {
            zoom *= zoomIn;
        }
        else if (zoom > photo._zoomMin) {
            zoom = Math.max(photo._zoomMin, zoom * zoomOut);
        }
        photo.zoom(zoom);
        e.stopPropagation();
        e.preventDefault(); // http://stackoverflow.com/q/5802467/1655155
    });
};

photo.x = function(dir) {
    var angle = dir - this.getDirection();
    var dx = this.dx(angle);
    return this.width / 2 + dx;
};

// private
photo.updateZoomMin = function() {
    this._zoomMin = Math.min(
        this.view.width()  / this.width,
        this.view.height() / this.height);
};

/**
 * 
 * @param {type} zoom facteur
 * @param {type} x centre du zoom
 * @param {type} y centre du zoom
 * @returns {@this;@pro;_zoom|@var;zoom|Number}
 */
// TODO : en cas de zoom faisant apparaitre le fond, il faudrait center l'image plutôt que de la caler en haut à gauche
photo.zoom = function(zoom, x, y) {
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

/**
 * getDirection()    -> direction du centre de la photo
 * getDirection(x,y) -> direction d'un point sur l'image
 * @returns {Number}
 */
photo.getDirection = function(x, y) {
    
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

photo.addPoint = function(x, y) {
    console.log("TODO : addPoint("+x+","+y+")");
    this.points.add(x, y);
};



photo.points = {};

photo.points.init = function(photo, div) {
    this.photo = photo;
    this.$div = div;
    
    // TODO : générer un id unique ? ou récupérer dès la création la table fille
    var tableId = 'ctrl-points-table';
    div.html('<table id="'+tableId+'"><th>nom</th>'+
            '<th>x</th>'+
            //'<th>y</th>'+
            '<th>dir</th>'+
            '<th>d</th>'+
            //'<th>lng</th><th>lat</th>'+
            '</table>');
    this.table = $("#"+tableId, div);  
};

/**
 * Appel 1 : add(x, y)
 * Appel 2 : add({name, x, y, dir})
 *    - x     : x sur la photo
 *    - y?    : y sur la photo
 *    - pp    : précision en pixel (1 => +/- 1px sur les x/y)
 *    - name? : nom complet
 *    - dir?  : direction en degré entre le point d'observation et le point
 *    - lat?  : latitude du point
 *    - lng?  : longitude du point
 *    - pm?   : précision en mètre (1 => +/- 1m sur les lat/lng)
 * Appel 3 : add([point])
 *    - Appel 2 pour chaque point du tableau
 * 
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 */
photo.points.add = function(x, y) {
    
    var point;
    if (typeof x.x != 'undefined')
        point = x;
    else if (x.length) {
        var points = x;
        for (var i in points) {
            point = points[i];
            this.add(point);
        }
        return;
    }
    else
        point = {
            name: 'Point 1',
            x: x,
            y: y
        };
    
    // Ajout de la date automatiquement
    if (!point.date)
        point.date = new Date();
    
    // Ajout de la direction, si lat/lng
    if (typeof point.lat != 'undefined' && typeof point.lng != 'undefined') {
        if (typeof point.dir != 'undefined') console.warn('On recalcule la dir pour ' + point.name);
        var place = new Place({
            name: point.name,
            x: point.x,
            y: point.y,
            lat: point.lat,
            lng: point.lng
        });
        var from = new google.maps.LatLng(this.photo.lat, this.photo.lng);
        point.dir = place.getDirection(from);
        point.d   = place.getDistance(from);
    }
    
    this.list = this.list || [];
    point.i = this.list.length;
    this.list.push(point);
    
    // Ajout IHM
    var d = point.d ? point.d.toFixed(0) : "?";
    var td = $(
        '<td>'+point.name           +'</td>'
        +'<td>'+Math.round(point.x)  +'</td>'
        //'<td>'+Math.round(point.y)  +'</td>'+
        +'<td class="point-dir" title="'+point.dir+'">'+point.dir.toFixed(1)+'°'+'</td>'
        +'<td class="point-d" title="'+point.d+'">'+d+'m'+'</td>'
        //'<td class="point-lat" title="'+point.lat+'">'+point.lat.toFixed(2)+'°'+'</td>'+
        //'<td class="point-lng" title="'+point.lng+'">'+point.lng.toFixed(2)+'°'+'</td>'
    );
    var photo = this.photo;
    td.click(function() {
        photo.overlays.angle.draw(point.dir);
    });
    var tr = $('<tr class="point-data point'+point.i+'"></tr>').append(td);
    this.table.append(tr);
};

photo.precision = {};

photo.precision.init = function(photo) {
    this.photo = photo;
};

/**
 * Précision sur les estimation de directions. Renvoie l'erreur moyenne (avec signe)
 * @returns {undefined}
 */
photo.precision.direction = function() {
    var sum = 0;
    var n = 0;
    var points = this.photo.points.list;
    // TODO : prendre en compte la précision de chaque point
    for (var i in points) {
        var point = points[i];
        var err = this.photo.getDirection(point.x, point.y) - point.dir;
        console.log("precision.direction('"+point.name+"') : "+err);
        sum += err;
        ++n;
    }
    return sum/n;
};



photo.view = {};

photo.view.init = function(photo, div) {
    this.photo = photo;
    this.$div = div;
    this.x = 0;
    this.y = 0;
    this._zoom = 1;
};

// TODO : ajouter un listener pour maj la largeur et corriger le zoom 
// à chaque redimensionnement de l'IHM
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
    var xMax = this.photo.width  - this.width()  / zoom;
    var yMax = this.photo.height - this.height() / zoom;
    x = Math.max(0, Math.min(xMax, x));
    y = Math.max(0, Math.min(yMax, y));
    
    var mx = zoom > 1 ? this.photo.width  * (zoom - 1) / 2 : -this.photo.width  * (1 - zoom) / 2;
    mx -= x * zoom;
    var my = zoom > 1 ? this.photo.height * (zoom - 1) / 2 : -this.photo.height * (1 - zoom) / 2;
    my -= y * zoom;
    
    var matrix = zoom + ",0,0," + zoom + "," + mx + "," + my;
    this.photo.$div.css("transform", "matrix("+matrix+")");
    
    // Curseurs
    var cx = zoom > 1 ? -x*zoom : -x*zoom;
    //$("#photo-overlay-angles").css("transform", "matrix(1,0,0,1," + cx + ",0)");
    
    this.x = x;
    this.y = y;
    this._zoom = zoom;
    
    // infos : TODO : gérer des events avec des listener
    this.photo.infos.x(Math.round(x));
    this.photo.overlays.repaint();
};

photo.view.centerTo = function(x, y, zoom) {
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
photo.view.left = function(x) {
    if (x.pageX) return this.x + (x.pageX - this.offset().left) / this.photo.zoom();
    return this.x + x / this.photo.zoom();
};

/**
 * 
 * @param {number} y valeur y sur la vue ou mouse event dont on souhaite récupérer les coords sur la photo
 * @returns {photo.view@pro;photo@call;zoom|photo.view@call;offset@pro;top|type|Number|@this;@pro;y}
 */
photo.view.top = function(y) {
    if (y.pageY) return this.y + (y.pageY - this.offset().top) / this.photo.zoom();
    return this.y + y / this.photo.zoom();
};

/**
 * x sur la vue
 * @param {degrés} dir direction réelle
 * @returns {px} x sur la vue
 */
photo.view.xDir = function(dir) {
    if (typeof dir == 'undefined') throw new Error('Veuillez indiquer une direction pour avoir le xDir');
    return (this.photo.x(dir) - this.x) * this.photo.zoom();
};

photo.view.revealAll = function() {
    this.photo.zoom(this.photo._zoomMin);
};

/**
 * 
 * @returns {photo.view@pro;$div@call;offset} Coordonnées du div dans la page HTML
 */
photo.view.offset = function() {
    return this.$div.offset();
};

photo.infos = {};

photo.infos.init = function(divId) {
    var div = $("#"+divId);
    this.$div = div;
    this.$div.html("<span class='x'>x = ?</span> <span class='dir'>dir = ?</span>");
};

photo.infos.x = function(x) {
    $('.x', this.$div).html("x = "+x.toFixed(1));
};

photo.infos.dir = function(dir) {
    $('.dir', this.$div).html("dir = "+dir.toFixed(1));
};

photo.selectTool = function(tool) {
    // Ancien outil
    if (this._tool && this._tool.detachFrom) this._tool.detachFrom(this);
    
    // check si toutes les méthodes obligatoires sont présentes
    if (!tool.detachFrom) throw new Error("L'outil doit implémenter la méthode detachFrom(photo)");
    
    tool.attachTo(this);
    
    this._tool = tool;
};



// Surimpression audessus de la photo
photo.overlays = {};

photo.overlays.repaint = function() {
    this.angle.repaint();
};


photo.overlays.angle = {};

photo.overlays.angle.init = function(photo, $canvas) {
    this.photo = photo;
    this.$canvas = $canvas;
    
    // Redim du canvas
    this.$canvas
        .attr('width',  this.photo.view.width())
        .attr('height', this.photo.view.height())
        .css('pointer-events', 'none')
    ;

    this.ctx = $canvas.get(0).getContext("2d");
};

photo.overlays.angle.width = function() {
    return this.photo.view.width();
};

photo.overlays.angle.height = function() {
    return this.photo.view.height();
};

photo.overlays.angle.draw = function(dir) {
    var ctx = this.ctx;
    
    // TODO : Effacer uniquement ce qui a été tracé avant
    if (typeof this.lastX != 'undefined') {
        var e = 2;
        ctx.clearRect(this.lastX - e, 0, 2 * e, this.height());
    }
    else
        ctx.clearRect(0, 0, this.width(), this.height());
    
    var x = this.photo.view.xDir(dir);
    this.drawX(x);
    
    this.lastDir = dir;
};

photo.overlays.angle.drawX = function(x) {
    var ctx = this.ctx;
    
    var width = this.photo.view.width();
    if (x < 0 || x > width) return;
    var height = this.photo.view.height();
    
    ctx.beginPath();      // Début du chemin
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.closePath();      // Fermeture du chemin (facultative)
    ctx.stroke();
    
    this.lastX = x;
};

photo.overlays.angle.repaint = function() {
    if (typeof this.lastDir != 'undefined')
        this.draw(this.lastDir);
};





tools = {};

tools.move = {};

tools.move.attachTo = function(photo) {
    this.photo = photo;
    this.dragging = false;
    
    var tool = this;
    
    photo.$div.bind('mousedown', function(event) {
        tool.mousedown(event); // pour garder this = photo
    });
    
    $(window).mouseup(function(event) {
        if (tool.dragging) {
            $(window).unbind('mousemove');
            tool.dragging = false;
        }
    });
    
    // Icon
    photo.$div.css("cursor", "-webkit-grab");
    
    console.log("Tool 'move' selected");
};

tools.move.detachFrom = function(photo) {
    photo.$div.unbind('mousedown');
};

tools.move.mousedown = function(event) {
    var photo = this.photo;
    
    if (!this.dragging) {
        // start drag
        var start = event;
        var x0 = photo.view.x;
        var y0 = photo.view.y;

        $(window).mousemove(function(event) {
            var dx = event.pageX - start.pageX;
            var dy = event.pageY - start.pageY;
            var  x = x0 - dx / photo.zoom();
            var  y = y0 - dy / photo.zoom();
            photo.view.moveTo(x, y);
        });

        this.dragging = true;
    }
};



tools.point = {};

tools.point.attachTo = function(photo) {
    this.photo = photo;
    var tool = this;
    
    // Mousedown
    photo.$div.bind('mousedown', function (event) {
        tool.mousedown(event);
    });
    photo.$div.bind('mousemove', function (event) {
        tool.mousemove(event);
    });
    
    // Curseur
    photo.$div.css("cursor", "crosshair");
    
    console.log("Tool 'point' selected");
};

tools.point.mousedown = function(event) {
    var x = this.photo.view.left(event);
    var y = this.photo.view.top(event);
    console.log('TODO:this.photo.addPoint(x, y)');
};

tools.point.mousemove = function(event) {
    var x = this.photo.view.left(event);
    //var y = this.photo.view.top(event);
    this.photo.infos.x(x);
    this.photo.infos.dir(this.photo.getDirection(x));
};

tools.point.detachFrom = function(photo) {
    photo.$div.unbind('mousedown');
    photo.$div.unbind('mousemove');
};