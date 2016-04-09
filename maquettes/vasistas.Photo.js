
function Photo() {

}

Object.defineProperties(Photo.prototype, {

    height: {
        get: function() {
            return this._height;
        },
        set: function(value) {
            this._height = value;
            this.$div.css("height", value);
            this.updateZoomMin();
        }
    },

    width: {
        get: function() {
            return this._width;
        },
        set: function(value) {
            this._width = value;
            this.$div.css("width", value);
            this.updateZoomMin();
        }
    }

});
