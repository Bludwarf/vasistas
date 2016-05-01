/**
 * Created by bludwarf on 01/05/2016.
 */

function Points(photo, div) {
    this.photo = photo;
    this.$ = div;

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
}


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
Points.prototype.add = function(x, y) {

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
