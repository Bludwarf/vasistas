		$(document).ready(function() {

            /*points = Place.loadPoints({
                rova  : {lat: -18.92348100124909,   lng: 47.53185215892805},
                lac   : {lat: -18.9226356424,       lng: 47.5148770807},        // 273.01081393192686° x=252
                anosy : {lat: -18.91366689,         lng: 47.5221688827},        // 316.97226770386897° x=1360
                usine : {lat: -18.92279776874189,   lng: 47.51983074455688}
            });*/
            
            var degToRad = Math.PI / 180;
            function rad(deg) {
                return deg * degToRad;
            }
            function deg(rad) {
                return rad / degToRad;
            }
            
            //var αE = -31.13; // °
            //var lE = -880;   // px
            var αE = 194.8583-184.5952; // appart.JPG : centre -> facade beige
            var lE = 1203-960;   // px
            var ρE = Math.tan(rad(αE))/lE;
            var angleIxus = function(x,y, width, height) {
                var dx = x - width / 2;
                return deg(Math.atan(dx*ρE));
            };
            
            var dxIxus = function(angle) {
                return Math.tan(rad(angle)) / ρE;
            };

            photos = {
                rova: new Photo({
                    photo: {
                        // IXUS
                        width: 1920,
                        height: 1080,
                        filename: "../photos/rova.jpg",
                        lat: -18.92348100124909,//-18.923857,
                        lng: 47.53185215892805,//47.531719,
                        //lat: -18.923014,
                        //lng: 47.532082,
                        pm: 20,

                        getAngle: angleIxus,
                        dx: dxIxus
                    }
                }),

                /*appart: new Photo({
                    photo: {
                        // IXUS
                        width: 1920,
                        height: 1080,
                        filename: "../photos/appart.JPG",
                        lat: 48.106314,
                        lng: -1.666214,
                        pm : 1,

                        getAngle: angleIxus,
                        dx: dxIxus
                    }
                }),

                francis: new Photo({
                    photo: {
                        // EOS
                        width: 2592,
                        height: 1728,

                        filename: '../photos/18-55/IMG_0254.JPG',
                        lat: -18.907185, // Chez Francis
                        lng: 47.527982, // Chez Francis
                        pm: 5,

                        getAngle: angleIxus,
                        dx: dxIxus
                    }
                })*/
            };
            
            photo = photos.rova;
            photo.points.add([
                
                // Rova.jpg 
                {
                    name: 'Lac Anda. A bottom-left',
                    dir: 272.718915972411,
                    x: 250,
                    lat: -18.922657,
                    lng: 47.514780
                }, {
                    name: 'Lac Anda. B top-left',
                    dir: 273.203208362151,
                    x: 250,
                    lat: -18.922366,
                    lng: 47.510606
                }, {
                    name: 'Lac Anda. C bottom-right',
                    dir: 275.263572205116,
                    x: 327,
                    lat: -18.922027,
                    lng:  47.515155
                },
                {
                    name: 'Lac Anda. D top-right',
                    dir: 275.755325674204,
                    x: 318,
                    lat: -18.921509,
                    lng:  47.510537
                },
                {
                    name: 'Tour Anda. gauche',
                    x: 275,
                    lat: -18.922884,
                    lng:  47.519834
                },
                {
                    name: 'Tour Anda. droite',
                    x: 289,
                    lat: -18.922784,
                    lng:  47.519785
                },
                {
                    name: 'Cabane foot',
                    dir: 278.66,
                    x: 427
                }, {
                    name: 'Arbre hypodrome',
                    dir: 288.94,
                    x: 677
                }, {
                    name: 'Bord gauche de l\'immeuble à droite de l\'hypo',
                    dir: 292.24,
                    x: 763
                },
                {
                    name: 'Bord droit de l\'immeuble à droite de l\'hypo',
                    dir: 293.21,
                    x: 789
                },
                {
                    name: 'Tour Anosy gauche',
                    x: 1244,
                    lat: -18.912715,
                    lng:  47.519531
                },
                {
                    name: 'Tour Anosy droite',
                    x: 1264,
                    lat: -18.912618,
                    lng:  47.519692
                }
                
                // Photo appart.jpg
                /*{
                    name: 'Eglise',
                    x: 946,
                    lat:  48.095133,
                    lng: -1.667443
                },
                {
                    name: 'Centre (église clocher gauche)',
                    x: 960,
                    lat:  48.095287,
                    lng: -1.667541
                },
                {
                    name: 'Facade beige',
                    x: 1203,
                    lat:  48.101773,
                    lng: -1.668018
                }*/
            
            
                // IMG_0254.JPG
                /*{
                    name: 'Clocher vert',
                    x: 350,
                    lat: -18.914523,
                    lng:  47.528910
                }*/
            ]);
            photo.view.revealAll();
            //photo.view.zoom(2); 

    	});