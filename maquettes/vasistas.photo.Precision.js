
function Precision(photo) {
    this.photo = photo;
}

Object.defineProperties(Precision.prototype, {
    direction: {
        /**
         * Précision sur les estimation de directions. Renvoie l'erreur moyenne (avec signe)
         * @returns {undefined}
         */
        get: function() {
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
        }
    }
});