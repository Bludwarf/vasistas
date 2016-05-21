/**
 * Zone délimitée par des marqueurs (Place)
 * 
 * Pour créer une nouvelle Zone il faut au minimum une liste de Place :
 * '''
 * var zone = new Zone({
 * 	title: "Lac Andavamamba",
 * 	photo: photo,
 * 	map: map,
 * 	places: [
 * 		{lat: -18.92272904448327, lng: 47.51513010237726, x:250, y:417, name: '272.72°'},
 * 		{lat: -18.922525,         lng: 47.513096,         x:250, y:382, name: '273.08°'},
 * 		{lat: -18.921863,         lng: 47.513420,         x:318, y:384, name: '275.30°'},
 * 		{lat: -18.92203160367950, lng: 47.51522911314079, x:327, y:415, name: '275.26°'}
 * 	]
 * });
 * '''
 * 
 * @param {Object} options liste d'options pour initialiser la Zone
 */
function Zone(options) {
	var thisZone = this;
    
    if (typeof Zone.nZone == 'undefined') Zone.nZone = 0;

	this.title = options.title;
	if (options.places === null) throw new Error("Zone : places vide");
	this.photo = options.photo;
	this.i = Zone.nZone++;
	this.color = (options.color ? options.color : "#0000FF");

	this.places = (options.places ? [] : null);
	$.each(options.places, function(i, placeOptions) {
		if ((placeOptions.x != null || placeOptions.y != null) && thisZone.photo == null) throw "Zone : photo vide alors que x;y spécifiés";
		var place = new Place({
			lat: placeOptions.lat,
			lng: placeOptions.lng,
			title: placeOptions.name
		}).appearsAt(placeOptions.x, placeOptions.y, thisZone.photo);
		thisZone.places[thisZone.places.length] = place;
	});

	/**
	 * id utilisable pour base pour des id d'éléments HTML
	 */
	this.getId = function() {
		return "zone"+this.i;
	};

	/**
	 * Titre à afficher sur la photo ou sur la carte
	 */
	this.getTitle = function() {
		return this.title;
	};

	/**
	 * 
	 */
	this.getPaths = function() {
		var paths = [];
		$.each(this.places, function(i, place) {
			paths[paths.length] = place.latLng;
		});
		return paths;
	};

	/**
	 * Polygone à afficher sur la carte Google
	 * @return google.maps.Polygon
	 *
	 * @see https://developers.google.com/maps/documentation/javascript/3.exp/reference#PolygonOptions
	 */
	this.getPolygon = function() {
		if (!this.polygon) {
			var thisZone = this;
			console.log("get");
			var poly = new google.maps.Polygon({
			  paths: this.getPaths(),
			  strokeColor: this.color,
			  strokeOpacity:0.8,
			  strokeWeight:2,
			  fillColor: this.color,
			  fillOpacity:0.1,
			  title: this.title
			});
			poly.addListener('mouseover', function(event) {
					thisZone.hover(event);
			});
			poly.addListener('mouseout', function(event) {
					thisZone.hoverOut(event);
			});
			poly.addListener('click', function(event) {
					thisZone.click(event);
			});						
            this.polygon = poly;
		}
		return this.polygon;
	};

	/**
	 * @return Bounds
	 */
	this.getBounds = function() {
		var bounds = new google.maps.LatLngBounds();

		$.each(this.places, function(i, place) {
			bounds.extend(place.latLng);
		});

		return bounds;
	};

	/**
     * @param {int} i index
	 * @return les différents répères qui délimite cette zone
	 * @see Place
	 */
	this.getPlace = function(i) {
		return this.places[i];
	};


	// https://developers.google.com/maps/documentation/javascript/examples/layer-data-simple
	// https://developers.google.com/maps/documentation/javascript/3.exp/reference#PolygonOptions
	/**
	 * @param {google.maps.Map} map	Carte Google où tracer cette zone
	 */
	this.setMap = function(map) {
		this.getPolygon().setMap(map);
	};

	/**
	 * @param {Photo} photo Photo où apparait cette zone
	 */
	this.setPhoto = function(photo) {
		this.photo = photo;
		this.getSVG();
	};

	/**
	 * On a cliqué sur la zone depuis :
	 * <ul>
	 * <li>Son nom dans l'IHM (ou son bouton)</li>
	 * <li>La carte Google</li>
	 * <li>La photo</li>
	 * </ul>
	 * @param event : JS ou Google !
	 */
	this.click = function(event) {
		if (event.stopPropagation) event.stopPropagation(); // on intercepte le click et on le garde pour nous

		// Zoom dans la map
		var poly = this.getPolygon();
		//window.poly = poly; // variable globale
		poly.get('map').setCenter(this.center.latLng);
	};

	/**
	 * Dessine en SVG la zone sur la photo associée. La photo doit se trouver dans un élément SVG d'id "#idDeLaZone-svg".
	 * @return le SVG qui contient toute la photo
	 */
	this.getSVG = function() {
		var id = this.getId();
		if (this.svg == null) {
			var d = this.getSVGPath();
			var svg =
				'<path class="zone-svg" id="' + id + '-svg" d="' + d + '"'
			  + ' onclick="zones.' + id + '.click(event)"'
			  + ' onmouseover="zones.' + id + '.hover(event)"'
			  + ' onmouseout="zones.' + id + '.hoverOut(event)"'
			  + ' onclick="zones.' + id + '.click(event)"'
			  + '>'
			  +	'	<title>' + this.title + '</title>'
			  + '</path>'
			;
			this.photo.append(svg);

			var $svg = $("#" + id + "-svg");
			$svg.css({
				fill: this.color,
				stroke: this.color
			});

			this.svg = $svg.get(0); // FIXME : à cause du photo.append on ne peut pas garder la ref vers le SVG
		}
		//return this.svg;
		return $("#" + id + "-svg").get(0);
	};

	// Utilisée par this.getSVG()
	this.getSVGPath = function() {
		var d = "M";
		$.each(this.places, function(i, place) {
				d += place.x + "," + place.y + " ";
		});
		d += "Z";
		return d;
	};

	/**
	 * Lie un bouton HTML à cette zone.
	 * @param {HTML element} btn élément HTML représentant la Zone dans l'IHM (exemple : &lg;li&gt;)
	 */
	this.addButton = function(btn) {
		this.btn = btn;
		var id = this.getId();
		var thisZone = this;
		var $btn = $(btn);

		$btn.hover(function(event) {
			thisZone.hover(event);
		}, function(event) {
			thisZone.hoverOut(event);
		});
		$btn.click(function(event) {
			thisZone.click(event);
		});

		// Couleur
		$btn.css({
			//background: 'inherit', // FIXME : éclaircir une couleur
			borderColor: this.color
		});
	};

	/**
	 * On survole la zone sur la carte Google ou bien sur la photo ou bien dans l'IHM HTML
	 */
	this.hover = function(event) {
		$(this.btn).addClass('place-hover');
		this.getSVG().addClass('zone-svg-hover');
		this.getPolygon().setOptions({strokeWeight: 2, fillOpacity: 0.35}); // TODO : backup styles
	};

	/**
	 * @see hover
	 */
	this.hoverOut = function(event) {
		$(this.btn).removeClass('place-hover');
		this.getSVG().removeClass('zone-svg-hover');
		this.polygon.setOptions({strokeWeight: 1, fillOpacity: 0.1});
	};

	// Photo
	if (options.photo) {
		this.setPhoto(this.photo);
	};

	// Map
	if (options.map) {
		this.setMap(options.map);
	};
}

Object.defineProperties(Zone.prototype, {

	/**
	 * @return Place
	 */
	center: {
		get: function () {
			var center = this.getBounds().getCenter();
			var place = new Place({
				lat: center.lat(),
				lng: center.lng(),
				x: 'todo', // TODO : center x,y
				y: 'todo'
			});
			return place;
		}
	}

});