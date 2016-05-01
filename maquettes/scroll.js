/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

Photo.prototype.bindDrag = function() {
    var thisPhoto = this;
    
    this.$.mousedown(function(event) {

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

Photo.prototype.bindScroll = function() {
    var photo = this;
    
    // Zoom
    // TODO : centrer le zoom sur le curseur
    // TODO : modifier le blocage min max du dragging en cas de zoom
    var zoomSpeed=0.05;

    var zoomIn  = 1+zoomSpeed;
    var zoomOut = 1-zoomSpeed;
    this.$.bind('mousewheel', function(e) {
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

tools = {};

tools.move = {};

tools.move.attachTo = function(photo) {
    this.photo = photo;
    this.dragging = false;
    
    var tool = this;
    
    photo.$.bind('mousedown', function(event) {
        tool.mousedown(event); // pour garder this = photo
    });
    
    $(window).mouseup(function(event) {
        if (tool.dragging) {
            $(window).unbind('mousemove');
            tool.dragging = false;
        }
    });
    
    // Icon
    photo.$.css("cursor", "-webkit-grab");
    
    console.log("Tool 'move' selected");
};

tools.move.detachFrom = function(photo) {
    photo.$.unbind('mousedown');
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
    photo.$.bind('mousedown', function (event) {
        tool.mousedown(event);
    });
    photo.$.bind('mousemove', function (event) {
        tool.mousemove(event);
    });
    
    // Curseur
    photo.$.css("cursor", "crosshair");
    
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
    this.photo.infos.x = x;
    this.photo.infos.dir = this.photo.getDirection(x);
};

tools.point.detachFrom = function(photo) {
    photo.$.unbind('mousedown');
    photo.$.unbind('mousemove');
};