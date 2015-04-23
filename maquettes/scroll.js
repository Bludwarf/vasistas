/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var photo = {};
            
photo.init = function(options) {
    var divPhoto = $("#" + options.div);
    this.$div = divPhoto;
    this._zoom = 1;
    this.dragging = false;
    this.view.init(this, $("#" + options.dock));
    
    this.setPhoto(options.photo);
    
    // Drag
    //this.bindDrag();
    this.selectTool(tools.move);
    this.bindScroll();
    
    this.infos.init(options.infos);
    
    // Control points
    this.points.init($("#"+options.ctrlPoints));
};

photo.setPhoto = function(options) {
    this.$div.css("background-image",   "url("+options.filename+")");
    this.width(options.width);
    this.height(options.height);
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

photo.width = function(value) {
    if (!value) return this._width;
    this._width = value;
    this.$div.css("width", value);
    this.updateZoomMin();
};

photo.height = function(value) {
    if (!value) return this._height;
    this._height = value;
    this.$div.css("height", value);
    this.updateZoomMin();
};

// private
photo.updateZoomMin = function() {
    this._zoomMin = Math.min(
        this.view.width()  / this.width(),
        this.view.height() / this.height());
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
    this.view.moveTo(x0, y0, zoom);
    
    this._zoom = zoom;
};

photo.addPoint = function(x, y) {
    console.log("TODO : addPoint("+x+","+y+")");
    this.points.add(x, y);
};



photo.points = {};

photo.points.init = function(div) {
    this.$div = div;
    
    // TODO : générer un id unique ? ou récupérer dès la création la table fille
    var tableId = 'ctrl-points-table';
    div.html('<table id="'+tableId+'"><th>nom</th><th>x</th><th>y</th><th>dir</th><th>lng</th><th>lat</th></table>');
    this.table = $("#"+tableId, div);  
};

photo.points.add = function(x, y) {
    this.list = this.list || [];
    this.list.push({
        x: x,
        y: y,
        date: new Date()
    });
    
    // Ajout IHM
    this.table.append('<tr>'+
        '<td>'+'Point 1'+'</td>'+
        '<td>'+
        +Math.round(x)+'</td><td>'
        +Math.round(y)+'</td><td>'
        +'290°'+'</td>'+
        '<td>'+'18°E'+'</td>'+
        '<td>'+'-40°S'+'</td>'+
        '</tr>');
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
    
    // infos
    this.photo.infos.x(Math.round(x));
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
 * @param {type} x valeur x sur la photo ou mouse event dont on souhaite récupérer les coords sur la photo
 * @returns {photo.view@pro;photo@call;zoom|type|@this;@pro;x|Number|photo.view.photo.x}
 */
photo.view.left = function(x) {
    if (x.pageX) return this.x + (x.pageX - this.offset().left) / this.photo.zoom();
    return this.x + x / this.photo.zoom();
};

/**
 * 
 * @param {type} y valeur y sur la photo ou mouse event dont on souhaite récupérer les coords sur la photo
 * @returns {photo.view@pro;photo@call;zoom|photo.view@call;offset@pro;top|type|Number|@this;@pro;y}
 */
photo.view.top = function(y) {
    if (y.pageY) return this.y + (y.pageY - this.offset().top) / this.photo.zoom();
    return this.y + y / this.photo.zoom();
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
};

photo.infos.x = function(x) {
    this.$div.html("x = "+x);
};

photo.selectTool = function(tool) {
    // Ancien outil
    if (this._tool && this._tool.detachFrom) this._tool.detachFrom(this);
    
    // check si toutes les méthodes obligatoires sont présentes
    if (!tool.detachFrom) throw new Error("L'outil doit implémenter la méthode detachFrom(photo)");
    
    tool.attachTo(this);
    
    this._tool = tool;
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
    
    // Curseur
    photo.$div.css("cursor", "crosshair");
    
    console.log("Tool 'point' selected");
};

tools.point.mousedown = function(event) {
    var x = this.photo.view.left(event);
    var y = this.photo.view.top(event);
    this.photo.addPoint(x, y);
};

tools.point.detachFrom = function(photo) {
    photo.$div.unbind('mousedown');
};