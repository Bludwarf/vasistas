/**
 * Created by bludwarf on 01/05/2016.
 */

(function(Photo) {

    window.Overlays = Overlays;

    /**
     * Surimpression audessus de la photo
     * @param photo {Photo}
     * @param options {{angle: jQuery}}
     */
    function Overlays(photo, options) {
        this.photo = photo;
        this.angle = new Angle(photo, options.angle);
    }

    Overlays.prototype.repaint = function() {
        this.angle.repaint();
    };

    function Angle(photo, $canvas) {
        this.photo = photo;
        this.$canvas = $canvas;

        // Redim du canvas
        this.$canvas
            .attr('width',  this.photo.view.width())
            .attr('height', this.photo.view.height())
            .css('pointer-events', 'none')
        ;

        this.ctx = $canvas.get(0).getContext("2d");
    }


    Angle.prototype.width = function() {
        return this.photo.view.width();
    };

    Angle.prototype.height = function() {
        return this.photo.view.height();
    };

    Angle.prototype.draw = function(dir) {
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

    Angle.prototype.drawX = function(x) {
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

    Angle.prototype.repaint = function() {
        if (typeof this.lastDir != 'undefined')
            this.draw(this.lastDir);
    };

})(Photo);