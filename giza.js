
/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva, PhotoSwipe, PhotoSwipeUI_Default, fscreen, AngleFace, firebase
*/
/*
 * giza.js - perpetuating lives since 2018
 */
"use strict";

var DIALS_COLOR = '#81aa8d';
var // refactore stageLen to ...
    stageLen = 1000,
    stageRadius = stageLen / 2,
    ringHeight = stageRadius / 12,
    totalDeg = 350,
    // refactor to this.scale and remove maxAge
    maxAge = 95, 
    years2deg = totalDeg / 95; // 95 is giza's age, should come from bio

// the data
var bio = {};
// display elements
var gallery;
var biochronus;
var container;
var welcome;
var chronusStage;
// layers
var tableLayer;
var galleryLayer;

function reverse(s){
    var ret = "";
    for (var i = s.length-1; i >= 0; i--)
        ret += s[i];
    return ret;
}

function toRad (angle) {
  return angle * (Math.PI / 180);
}

function getPoint(age, ring) {
    var rad = toRad(age*years2deg-90);
    return {
        x: stageRadius+Math.round(Math.cos(rad)*ringHeight*ring),
        y: stageRadius+Math.round(Math.sin(rad)*ringHeight*ring)
    };
}
// from https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/
function getAjax(url, callback) {
	    var xhr = new XMLHttpRequest();
	    xhr.addEventListener("load", function() {
			var json;
	        if (this.readyState > 3 && this.status === 200) {
				try {
					json = JSON.parse(this.responseText);
				} catch(e) {
					console.log('getAjax('+url+') got error: '+e);
					callback(e);
					return;
				}
				callback(json);
				return;
			}
			callback(json);
		});
	    // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	    xhr.open('GET', url);
	    xhr.send();
	    return xhr;
}
// from https://stackoverflow.com/a/901144
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
/*
 * Our bottom layer - the table layer, complete with dials, and arcs
 * TODO: add buttons
 */
var TableLayer = function(stage) {
	this.currentScale = {x:1,y:1};
	this.stage = this.stage;
  	this.layer = new Konva.Layer();

	this.arcsGroup = new Konva.Group();
	this.textsGroup = new Konva.Group();
	this.dialsGroup = new Konva.Group();
	this.datesGroup = new Konva.Group();
    this.groups = [this.arcsGroup, this.textsGroup, this.dialsGroup, this.datesGroup];

	this.layer.add(this.arcsGroup, this.textsGroup, this.dialsGroup, this.datesGroup); // this.groups);
	stage.add(this.layer);
};

TableLayer.prototype.draw = function() {
	var i, ring, ringSpans;
	// start with the dates and the dials
	this.addDatesShapes();
    this.addDialsShapes();
	// draw the life spans
    if (bio.meta.spans !== undefined) 
        for (ring=0; ring < bio.meta.spans.length; ring++) {
            ringSpans = bio.meta.spans[ring];
            for (i=0; i < ringSpans.length; i++) {
              var span = ringSpans[i];
              this.addSpanShapes(span, 11-ring);
            }
        }

	this.layer.draw();
};

TableLayer.prototype.scale = function (scale) {
	var fontScale = Math.min(scale.x, scale.y);
	this.arcsGroup.scale(scale);
	this.dialsGroup.scale(scale);

	// scaling the movingShapes
	var movingShapes;
	movingShapes = this.textsGroup.getChildren().slice();
	movingShapes.push(this.dob);
	movingShapes.push(this.dop);
	for (var i=0; i < movingShapes.length; i++ ) {
		var path = movingShapes[i];
        var attrs = {
			x: this.layer.width()/2,
			y: this.layer.height()/2
        };
        if (path.pathConfig)
			attrs.data = this.getPath(path.pathConfig);
		if (path.initialFontSize)
			attrs.fontSize = path.initialFontSize*fontScale;
		path.setAttrs(attrs);
    }
	this.currentScale = scale;
	this.layer.draw();
};

TableLayer.prototype.getPath = function(config) {
  // config is expected to have ring, startDeg & endDeg
  var myRingWidth = (config.ring+0.5) * ringHeight;
  var scale = this.arcsGroup.scale();

  var deg, rad, x, y;

  var ret = "M ";

  for (deg=config.startDeg+2; deg < config.endDeg; deg++) {

    
    rad = toRad(deg);
    x = Math.round(Math.cos(rad)*myRingWidth)*scale.x;
    y = Math.round(Math.sin(rad)*myRingWidth)*scale.y;
    ret += x+" "+y+" L ";
  }
  ret = ret.slice(0,-3);
  return ret;
};

TableLayer.prototype.addSpanShapes = function(span, ring) {
    var ageSpan = span.end_age-span.start_age,
        endDeg = span.end_age*years2deg-90,
		startDeg = span.start_age*years2deg-90,
		name,
		fontSize,
		glyphRotation,
		text,
		textShape,
		i;

 
	if (startDeg > 0 && startDeg < 180) {
		glyphRotation = 180;
		name = span.name;
	} else {
		glyphRotation = 0;
		name = reverse(span.name);
	}
	text = name ;
	// add the arc 
	this.arcsGroup.add(
		 new Konva.Arc({
            opacity: 0.3,
            angle: endDeg-startDeg,
            x: stageRadius,
            y: stageRadius,
            outerRadius: (ring+1)*ringHeight,
            innerRadius: ring*ringHeight,
            fill: '#fff',
            stroke: '#222',
            strokeWidth: 3,
            rotation: startDeg
          }));
    // make the outer ring a border
    if (ring == 11)
        this.arcsGroup.add(
             new Konva.Arc({
                opacity: 1,
                angle: maxAge*years2deg,
                x: stageRadius,
                y: stageRadius,
                outerRadius: (ring+1)*ringHeight+2,
                innerRadius: (ring+1)*ringHeight,
                fill: '#81aa8d',
                strokeWidth: 2,
                rotation: -90
              }));
	// add the arc's text
	fontSize = (span.name == 'יד מרדכי')?24:40;
	textShape = new Konva.TextPath({
			fill: '#81aa8d',
			// fontSize: (span.name == 'יד מרדכי')?20:32,
			fontFamily: 'Assistant',
			text: text,
			fontSize: fontSize,
            direction: "rtl",
			glyphRotation: glyphRotation
		});
	 textShape.initialFontSize = fontSize;
	 textShape.pathConfig = {ring: ring, startDeg: startDeg, endDeg: endDeg,
	 				    group:this.textsGroup};
	 this.textsGroup.add(textShape);
};

TableLayer.prototype.addDialsShapes = function() {
	// returning 4 dials at 1/8. 3/8, 5/8 & 7/8. each dial is made from two 
	// shapes - a line and a text.

    for (var i=0; i <= maxAge; i++) {
        var from = getPoint(i, 12);
        var to = getPoint(i, 11.9);
        this.dialsGroup.add(
            new Konva.Line({
                points: [from.x, from.y, to.x,to.y],
                stroke: DIALS_COLOR,
                strokeWidth: (i % 10 == 0)?6:3,
                lineCap: 'round',
                lineJoin: 'round'
            })
        );
   }
};

TableLayer.prototype.addDatesShapes = function() {
    var fontSize = 30;

    this.dob = new Konva.TextPath({
								  fill: DIALS_COLOR,
								  fontSize: fontSize,
								  fontFamily: 'Assistant',
								  fontStyle: 'bold',
								  text: bio.meta.date_of_birth,
								  });
    this.dop = new Konva.TextPath({
								  fill: DIALS_COLOR,
								  fontSize: fontSize,
								  fontFamily: 'Assistant',
								  fontStyle: 'bold',
								  text: bio.meta.date_of_passing
								 });
	this.dob.pathConfig = {ring: 9.8, startDeg: -96, endDeg: 100.4,
						   group: this.datesGroup};
	this.dop.pathConfig = {ring: 8.8, startDeg: -106, endDeg: 0.4,
						   group: this.datesGroup};

    this.datesGroup.add(this.dob, this.dop);
};
/* End of TableLayer */

var GalleryLayer = function(stage) {
	this.stage = stage;
  	this.layer = new Konva.Layer();
	this.images = [];
	stage.add(this.layer);
};

GalleryLayer.prototype.scale = function (scale) {
	for (var i=0; i < this.images.length; i++) {
		this.images[i].x(this.images[i].loc.x*scale.x);
		this.images[i].y(this.images[i].loc.y*scale.y);
	}	
	this.layer.draw();
};
GalleryLayer.prototype.draw = function () {
	var that = this;
    var ageRE = /^age_(\d+)/;
    var spriteFrames = bio.thumbs.frames;
	var i;
    var scale = {x: window.innerWidth / stageLen,
				 y: (window.innerHeight * 0.91) / stageLen};

	this.psImages = [];

    // sort the thumbs according to age
    spriteFrames.sort(function (a,b) {
        var aAge = Number(a.filename.match(ageRE)[1]);
        var bAge = Number(b.filename.match(ageRE)[1]);
        return aAge-bAge;
    });

	// create the array for PhotoSwipe
	for(i=0; i < spriteFrames.length; i++)
		this.psImages.push(bio.images[spriteFrames[i].filename]);

    var spriteSheet = new Image(bio.thumbs.meta.width, bio.thumbs.meta.width);

	var layer = this.layer,
		images = this.images;
    spriteSheet.onload = function () {
        var ringMin = 5,
            ringMax = 8,
            ring = ringMin,
            center_age = 0,
            i,
            age,
			loc,
			img;

        for (i = 0; i < spriteFrames.length; i++) {
            age = Number(spriteFrames[i].filename.match(ageRE)[1]);
            if (age == 0) {
                loc = getPoint(center_age, 1);
                center_age += 25;
            }
            else {
                loc = getPoint(age, ring);
            }
            img = new Konva.Image({
                x: loc.x*scale.x,
                y: loc.y*scale.y,
                width: spriteFrames[i].frame.w,
                height: spriteFrames[i].frame.h,
                strokeWidth: 1,
                stroke: '#222',
                image: spriteSheet
            });
            img.crop({
                    width: spriteFrames[i].frame.w,
                    height: spriteFrames[i].frame.h,
                    x: 0 - spriteFrames[i].frame.x,
                    y: 0 - spriteFrames[i].frame.y
            });
            img.i = i;
            img.loc = loc;
            img.on('mouseup touchend', function() {
                  gallery = new PhotoSwipe(document.getElementById('photos'),
                      PhotoSwipeUI_Default, that.psImages, {index: this.i } );
                  //TODO: capture the on exit and carry on with the drawing
                  gallery.init();


            });
            images.push(img);
            layer.add(img);
            ring++;
            if (ring === ringMax)
                ring = ringMin;
        }
		layer.draw();
    };
    spriteSheet.src = bio.url+bio.thumbs.meta.sprite_path;
};

function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    }
}

function drawChronus (stage) {
  // draw the biochronus complete with dials and the gallery
    var header = document.getElementById('biocHeader');
    var ring,
      ringPeriods,
	  layer,
	  name,
      i;

	//TODO: make the name konva based
    name = document.createElement('h1');
    header.appendChild(name);

  tableLayer = new TableLayer(stage);
  galleryLayer = new GalleryLayer(stage);

  tableLayer.draw();
  galleryLayer.draw();
}

function drawWelcome(welcome) {
	var section, elm;

	section = document.createElement('section');
	section.className = 'centered';
	welcome.appendChild(section);
	elm = document.createElement('h1');
	elm.innerHTML = bio.meta.first_name + ' ' + bio.meta.last_name;
	section.appendChild(elm);
	if (bio.meta.more_name) {
		elm = document.createElement('h1');
		elm.innerHTML = bio.meta.more_name;
		section.appendChild(elm);
	}
	if (bio.meta.date_of_birth_he) {
		elm = document.createElement('h2');
		elm.innerHTML = bio.meta.date_of_birth_he + ' - ' + bio.meta.date_of_passing_he;
		section.appendChild(elm);
	}
	elm = document.createElement('h2');
	elm.style.direction = 'ltr';
	elm.innerHTML = bio.meta.date_of_birth + ' - ' + bio.meta.date_of_passing;
	section.appendChild(elm);
	elm = document.createElement('h2');
	elm.innerHTML = '&#10048;';
	section.appendChild(elm);
	elm = document.createElement('h2');
	elm.innerHTML = (bio.meta.sex=='F')?'תהי נשמתה צרורה':'תהי נשמתו צרורה';
	section.appendChild(elm);
	elm = document.createElement('h2');
	elm.innerHTML = 'בצרור החיים';
	section.appendChild(elm);
	elm = document.createElement('button');
	elm.className = 'enter';
	elm.innerHTML = (bio.meta.sex=='F')?'לזכרה':'לזכרו';
	section.appendChild(elm);
	section = document.createElement('section');
	section.className = 'centered';
	welcome.appendChild(section);
	elm.width = 350;
	elm.src = bio.meta.cover_photo;
	elm.alt = 'cover photo for '+bio.meta.first_name;
	section.appendChild(elm);
}

function drawMyFamily() {
    var family = [['נויה דאון'],
                  ['ליבי דאון לבית בלודז',
                   'בני דאון'],
                  ['איזבלה בלודז לבית גינסבורג',
                   'דניאל בלודז',
                   'רחל דאון לבית רייכר',
                   'יצחק דאון לבית דואני']
                 ];
    var face = new AngleFace({container: 'myFamily',
                              scale: 8,
                              startAngle: 0,
                              rings: 8,
                              endAngle: 360,
                              fullScreen: true,
                              visible: true });
    var arc;

    face.addBorder();
    for (var r=0; r < family.length; r++) {
        var arcLength = 360 / Math.pow(2, r);
        for (var i=0; i < family[r].length; i++) {
            var name = family[r][i];
            arc = {text: name,
                   ring: (r==0)?0.5:r*2,
                   start: i*arcLength,
                   len: arcLength,
                   onClick: function (ev) {
                      // ev.dial is very usefull
                       gotoState('biochronus', ev.target.text);
                   }};
            face.addArc(arc);
        }
    }
    face.draw();
}
function gotoState(state, message) {
    // Main state machine, where routing takes place.
    // currently supported states are:  welcome, visible, photo & myFamily
    //
    var welcome = document.getElementById('welcome');
	var footer = document.querySelector('footer');

	// only work when all data is here should add a timeout to retry
    // if (!(window.bio.meta && window.bio.images && window.bio.thumbs)) 
    //  return;

    if (window.location.hash) {
        state = 'photo';
        gallery = new PhotoSwipe(document.getElementById('photos'),
                                 PhotoSwipeUI_Default,
                                 galleryLayer.psImages);
        gallery.init();
        gallery.listen('close', function () {
            gotoState('biochronus');
        });
    }
	if (state == 'welcome') {

		drawWelcome(welcome);
		biochronus.style.display = 'none';
		welcome.style.display = '';
		footer.style.display = '';
		welcome.addEventListener("click", function () {
				gotoState('biochronus');
		});
    }
    else if (state == 'myFamily') {
		welcome.style.display = 'none';
		footer.style.display = 'none';
		biochronus.style.display = 'none';
		myFamily.style.display = '';
    }
	else if (state == 'biochronus') {
		welcome.style.display = 'none';
		footer.style.display = 'none';
		myFamily.style.display = 'none';
		// biochronus.style.display = 'none';
		// container.style.display = 'none';
		// make it fullscreen
        console.log(message);
        window.bio.meta = window.bios[message];
        console.log(window.bio.meta);
        chronusStage.clear();
		fscreen.requestFullscreen(document.body);

	}
}

fscreen.addEventListener('fullscreenchange', function() {
	if (!tableLayer) {
		biochronus.style.display = 'none';
		drawChronus(chronusStage);
        console.log('drawing');
        chronusStage.draw();
		biochronus.style.display = '';
    }
});

window.addEventListener('resize', function () {

    var scale = {x: (window.innerWidth - 20) / stageLen,
				 y: (window.innerHeight * 0.91 - 20) / stageLen};

    if (biochronus.style.display == '') {
        console.log('resizing');
        chronusStage.width(stageLen * scale.x );
        chronusStage.height(stageLen * scale.y );
        tableLayer.scale(scale);
        galleryLayer.scale(scale);
    }
});

function readBios(snapshot) {
    var data = snapshot.val();
    // var giza = data["גיזה גולדפארב לבית בראו"];
    for (var name in data) {
        var bio = data[name];
        var spans = [];
        if (bio.spans !== undefined) {
            for (var i = 0; i < bio.spans.length; i++) {
                var span = bio.spans[i];
                var ring = span.ring - 1;
                if (ring >= spans.length)
                    spans.push([span]);
                else
                    spans[ring].push(span);
            }
            bio.spans = spans;
        }
    }
    window.bios = data;
    return bio;
}

document.addEventListener("DOMContentLoaded", function() {
    var initialState = "myFamily";
    welcome = document.getElementById('welcome');
	biochronus = document.getElementById('biochronus');
	container = document.getElementById('container');

    chronusStage = new Konva.Stage({container: 'container',
										width: container.offsetWidth,
										height: window.innerHeight,
										visible: true });
    bio.url = getParameterByName('u') || 'bios/local/';

    biochronus.style.display = 'none';
    drawMyFamily();

	//TODO: merge these three data sources
    var ref = firebase.database().ref('noya');
    ref.on('value', readBios);
    getAjax(bio.url + 'images.json', function (data) {
        window.bio.images = data;
    });
    getAjax(bio.url + 'thumbs.json', function (data) {
        window.bio.thumbs = data;
    });
    gotoState(initialState);

});
