# Global





* * *

### Zone(options) 

Zone délimitée par des marqueurs (Place)

Pour créer une nouvelle Zone il faut au minimum une liste de Place :
'''
var zone = new Zone({
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
'''

**Parameters**

**options**: `Object`, liste d'options pour initialiser la Zone



### getId() 

id utilisable pour base pour des id d'éléments HTML



### getTitle() 

Titre à afficher sur la photo ou sur la carte



### getPaths() 



### getPolygon() 

Polygone à afficher sur la carte Google

**Returns**: , google.maps.Polygon


### getCenter() 

**Returns**: , Place


### getBounds() 

**Returns**: , Bounds


### getPlace() 

**Returns**: , les différents répères qui délimite cette zone


### setMap(map) 

**Parameters**

**map**: `google.maps.Map`, Carte Google où tracer cette zone



### setPhoto(photo) 

**Parameters**

**photo**: `Photo`, Photo où apparait cette zone



### click(event) 

On a cliqué sur la zone depuis :
<ul>
<li>Son nom dans l'IHM (ou son bouton)</li>
<li>La carte Google</li>
<li>La photo</li>
</ul>

**Parameters**

**event**: , : JS ou Google !



### getSVG() 

Dessine en SVG la zone sur la photo associée. La photo doit se trouver dans un élément SVG d'id "#idDeLaZone-svg".

**Returns**: , le SVG qui contient toute la photo


### addButton() 

Lie un bouton HTML à cette zone.



### hover() 

On survole la zone sur la carte Google ou bien sur la photo ou bien dans l'IHM HTML



### hoverOut() 




* * *










