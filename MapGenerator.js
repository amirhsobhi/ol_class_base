class GenerateMap{
    constructor(props){
        this.map;
        this.Settings;
        this.baseView;
    }
    
    setDefaultSetting(settings){
        this.Settings = settings
    }
    
    getBaseView(){
        return new ol.View({
                    center: ol.proj.fromLonLat(this.Settings.Main),
                    zoom: this.Settings.DefaultZoom
                })
    }
    
    initMap(){
        var interactions = ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false});
        this.map = new ol.Map({
            interactions: interactions,
            controls : ol.control.defaults({
            attribution : false,
            zoom : true,
                }),
                target: 'map',
                view: new ol.View({
                    center: ol.proj.fromLonLat(this.Settings.Main),
                    zoom: this.Settings.DefaultZoom,
                    minZoom: 3
                })
            });
    }
    
    generateMapLayer(type, name, isvisible){
        switch (type) {
            case 'Tile':
                var osm = new ol.layer.Tile({
                    visible: isvisible,
                    source: new ol.source.OSM()
                });
                var sac = new ol.layer.Tile({
                    visible: isvisible,
                    source: new ol.source.XYZ({
                        url: "http://shabakehafzar.net:3832/{z}/{x}/{y}.png"
                    })
                });
                var GRoad = new ol.layer.Tile({
                    visible: isvisible,
                    source: new ol.source.XYZ({
                        url: "http://mt.google.com/vt/lyrs=m&hl=fa&gl=fa&x={x}&y={y}&z={z}&s=png"
                    })
                });
                var GSat = new ol.layer.Tile({
                    visible: isvisible,
                    source: new ol.source.XYZ({
                        url: "http://mt.google.com/vt/lyrs=s&hl=fa&gl=fa&x={x}&y={y}&z={z}&s=png"
                    })
                });
                break;
            case 'Bing':
                var BRoad = new ol.layer.Tile({
                    visible: isvisible,
                    preload: Infinity,
                    source: new ol.source.BingMaps({
                        key: this.Settings.bingKey,
                        imagerySet: "Road"
                    })
                });

                var BTag = new ol.layer.Tile({
                    visible: isvisible,
                    preload: Infinity,
                    source: new ol.source.BingMaps({
                        key: this.Settings.bingKey,
                        imagerySet: "aerialWithLabels"
                    })
                });

                var BSat = new ol.layer.Tile({
                    visible: isvisible,
                    source: new ol.source.BingMaps({
                        key: this.Settings.bingKey,
                        imagerySet: "aerial"
                    })
                });
                break;
        }
        if(name){
            this.map.addLayer(eval(name))
        }
    }

    gennerateTileLayer(url, layer_name){
        layer_name = new ol.layer.Tile({
            visible: false,
            source: new ol.source.XYZ({
                url: url
            })
        });
        this.map.addLayer(layer_name)
    }

    generateImgLayer(){
        var I = new ol.layer.Image({
            visible: false,
            source: new ol.source.ImageWMS({
                url: '',
                params: {'LayerId': ''},
            })
        });
    }

    flyTo(location, customZoom, done) {
        var duration = 3000;
        var zoom = this.map.getView().getZoom();
        var parts = 2;
        var called = false;
        function callback(complete) {
            --parts;
            if (called) {
                return;
            }
            if (parts === 0 || !complete) {
                called = true;
                done(complete);
            }
        }
        this.map.getView().animate({
            center: location,
            duration: duration
        }, callback);
        this.map.getView().animate({
                zoom: zoom - 1,
                duration: duration / 2
            }, {
                zoom: customZoom !== null ? customZoom : zoom,
                duration: duration / 2
        }, callback);
    }
    
    resetZoom(long, lat, zoom) {
        this.map.getView().animate({
            center: ol.proj.fromLonLat([long, lat]),
            zoom: zoom,
            duration: 1200
        });
    }

    FindMyLocation(){
        var a = this;
        var positionFeature = new ol.Feature();
        var accuracyFeature = new ol.Feature();
        var coordinates;
        var firstTime = true

        accuracyFeature.setStyle(new ol.style.Style({
            // image: new ol.style.Circle({
            //     radius: 16,
            //     fill: new ol.style.Fill({
            //         color: '#eee'
            //     }),
            //     stroke: new ol.style.Stroke({
            //         color: '#000',
            //         width: 2,
            //     })
            // })
        }));
        positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2,
                })
            })
        }));
        var MyLocation = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [accuracyFeature, positionFeature]
            })
        });
        var geolocation = new ol.Geolocation({
            // enableHighAccuracy must be set to true to have the heading value.
            trackingOptions: {
                enableHighAccuracy: true
            },
            projection: a.map.getView().getProjection()

        });

        geolocation.on('change:accuracyGeometry', function () {
            accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        });
        geolocation.on('change:position', function () {
            coordinates = geolocation.getPosition();
            positionFeature.setGeometry(coordinates ?
                new ol.geom.Point(coordinates) : null);
            if(firstTime === false){
                a.map.setView(new ol.View({
                    center: geolocation.getPosition(),
                    zoom: 17
                }));
            }
        });
        setTimeout(() => {
            a.flyTo(coordinates, 16, function() {})
            setTimeout(() => {
                firstTime = false
            }, 3000);
        }, 2000);
        geolocation.setTracking('checked');
        a.map.addLayer(MyLocation)
    }

    onMapImg(iconType, iconName, pos){
        var style = new ol.style.Style({
            image: new ol.style.Icon({
                opacity: 1,
                scale: 1,
                crossOrigin: 'anonymous',
                src: iconType == 'int'? `assets/img/${iconName}.png`: iconName
            }),
            text: new ol.style.Text({
                text: 'تست',
                offsetX: 0,
                offsetY: 25,
                textAlign: 'center',
                textBaseline: "middle",
                font: '800 14px sans-serif',
                stroke: new ol.style.Stroke({ color:"#000", width:3 }),
                fill: new ol.style.Fill({color:"#fff"})
            })
        });
        var nlayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [
                    new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat(pos))
                    })
                ]
            })
        });
        nlayer.setStyle(style);
        this.map.addLayer(nlayer);
    }
}
