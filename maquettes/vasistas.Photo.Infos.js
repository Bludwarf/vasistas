/**
 * Created by bludwarf on 01/05/2016.
 */


function Infos(divId) {
    this.$ = $("#"+divId);
    this.$.html("<span class='x'>x = ?</span> <span class='dir'>dir = ?</span>");
}

Object.defineProperties(Infos.prototype, {
    x: {
        set: function(x) {
            $('.x', this.$).html("x = "+x.toFixed(1));
        }
    },

    dir: {
        set: function(dir) {
            $('.dir', this.$).html("dir = "+dir.toFixed(1));
        }
    }
});
