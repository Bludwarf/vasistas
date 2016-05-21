		$(document).ready(function(){
		
			/*
			 
			 TODO :
			 
				1 - Placer deux points pour tracer une ligne à la fois sur la map et sur la photo
				2 - Changer la couleur pour les boutons (éclaircir pour qu'on puisse lire les textes)
				3 - Charger les zones Google Map depuis un compte Google pour savoir si on peut les afficher pour une photo donnée
					- soit idMap = id des cartes Google Map
					- soit idPhoto = id de la photo dans Picasa Web
					- alors créer un lien entre idMap et idPhoto via des points de convergence (x,y) sur la photo idPhoto
			 
			 */
			
			var infos = {
				'setAngle': function(angle) {
					var tspan = $('#infos tspan.angle');
					tspan.html(angle.toFixed(1) + '°');
				},
				'setX': function(x) {
					var tspan = $('#infos tspan.x');
					tspan.html("x=" + x);
				},
				'setZoom': function(ratio) {
					var zoom = Math.round(ratio * 100) + '%';
					this.set('zoom', zoom);
				},
				'set': function(name, value) {
					var tspan = $('#infos tspan.' + name);
					tspan.html(name + "=" + value);
				}
			};
            
            if (typeof ecran != 'undefined') {
            	photo.ecran = ecran;
		
				// hover
				$(ecran).mousemove(function (event) {
					var offsetX = event.offsetX;
					var angle = photo.getDirection(offsetX);
					//console.log(angle);
					infos.setX(photo.getX(offsetX));
					infos.setAngle(angle);
					infos.set('offsetX', offsetX);
					infos.setZoom(photo.getZoom());
					
					var infosSvg = $("#infos");
					infosSvg.attr('x', photo.getX(offsetX) + 4);
					infosSvg.attr('y', photo.getY(event.offsetY - 4));
					
					var tspans = $("#infos tspan");
					//tspans.attr('x', photo.getX(offsetX) + 8);
				});
				
				// Click pour zoomer
				$(ecran).click(function (event) {
					photo.toggleZoom(event.offsetX, event.offsetY);
				});
            }
			
			
			
			// INIT 
			
			places = [];
			
			//places[0] = new Place("Lac Anda.");
			//places[0].setLatLng(points.lac);
			//places[0].appearsAt(250, 417, photo);
			
			/*places[places.length] = new Place({
				title: "Lac Anosy",
				position: points.anosy,
			}).appearsAt(1360, 436, photo);*/
			
			/*places[places.length] = new Place({
				title: "Usine",
				position: points.usine,
			}).appearsAt(289, 470, photo);*/
			
			places[places.length] = new Place({
				title: "Arête",
				description: "Arrête de la maison dans la 3e arcade",
				lat: -18.923150,
				lng: 47.528103,
			}).appearsAt(540, 820, photo);
			
			places[places.length] = new Place({
				title: "Sombre",
				description: "Bord droit de la maison sombre dans la 4e arcade",
				lat: -18.923283,
				lng: 47.527263,
			}).appearsAt(410, 734, photo);
			
			
			function direction(place, map) {
				if (!place.latLng) throw new Error('direction impossible sans place.latLng');
				if (!photo.position) throw new Error('direction impossible sans photo.position');
				var axePoints = [
					place.latLng, // place
					photo.position // position de prise de vue
				  ];
				  var axe = new google.maps.Polyline({
					// https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions
					path: axePoints,
					geodesic: true,
					strokeColor: '#0000FF',
					strokeOpacity: 1.0,
					strokeWeight: 1,
					map: map,
				  });
				  return axe;
			}
			
			function initialize() {
				// Carte
				// https://developers.google.com/maps/documentation/javascript/reference#MapOptions
				var mapProp = {
					center:places[1].latLng,
					zoom:15,
					mapTypeId:google.maps.MapTypeId.SATELLITE,
				};
				var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
				map.setHeading(photo.heading); // TODO : le tilt de la carte doit être activé pour marcher
				console.log("TODO : map.setHeading(" + photo.heading + ")");
			  
				// Marqueur : https://developers.google.com/maps/documentation/javascript/examples/marker-simple
				var myPlace = new google.maps.Marker({
					position: photo.position,
					map: map,
					title: 'Ma position'
				});

				// TODO : places constant ?
				places.forEach(function(place) {
					place.marker.setMap(map);
				});
				
				return map;
			}
			//google.maps.event.addDomListener(window, 'load', initialize);
			var map = initialize();
			
			zones = {};
			zones.zone0 = new Zone({ // FIXME : gestion des id
				title: "Lac Andavamamba",
				photo: photo,
				map: map,
				places: [
					{lat: -18.92272904448327, lng: 47.51513010237726, x:250, y:417, name: '272.72°'},
					{lat: -18.922525,         lng: 47.513096,         x:250, y:382, name: '273.08°'},
					{lat: -18.921863,         lng: 47.513420,         x:318, y:384, name: '275.30°'},
					{lat: -18.92203160367950, lng: 47.51522911314079, x:327, y:415, name: '275.26°'}
				]
			});
			zones.zone1 = new Zone({
				title: "Lac Anosy",
				photo: photo,
				map: map,
				color: "#FF0000",
				places: [
					{lat: -18.913741, lng: 47.519569, x:1198, y:410, name: '309.97°'},
					{lat: -18.913752, lng: 47.522168, x:1363, y:436, name: '316.72°'},
					{lat: -18.914327, lng: 47.523654, x:1441, y:457, name: '319.73°'},
					{lat: -18.916407, lng: 47.522933, x:1192, y:460, name: '309.98°'},
					{lat: -18.915437, lng: 47.521681, x:1192, y:434, name: '309.90°'}
				]
			});
				
			// Axe myPlace - lac Anda. : https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
			direction(zones.zone0.getPlace(0), map);
			direction(zones.zone0.getPlace(3), map);
				
			// Ajout de tous les lieux
			var list = $("#places .places-list");
			$.each(zones, function(i, zone) {
				
				// Création dans la photo : déjà faite lors de la création de la zone associée à une photo
				
				// Création dans la map : déjà faite lors de la création de la zone associée à une map	
				
				// Création dans la liste
				var btn = document.createElement('li');
				$(btn)
					.addClass("place")
					.html(zone.getTitle());
				list.append(btn);
				
				// Association bouton <-> Zone
				zone.addButton(btn);
			});
			
		});