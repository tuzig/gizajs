/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva, PhotoSwipe, PhotoSwipeUI_Default, fscreen, AngleFace, firebase, route
*/
/*
 * giza.js - perpetuating lives since 2018
 */
"use strict";

var DIALS_COLOR = '#81aa8d';
var theme = {
    stroke_color: '#81aa8d',
    descripton_color: '#fffadf',
    fill_color: '#5B946B'
};
var fb_config = {
    apiKey: "AIzaSyD0d0qCzvALRaBWdVdgAgrLucodjgWNu0Y",
    authDomain: "bios-tuzig.firebaseapp.com",
    databaseURL: "https://bios-tuzig.firebaseio.com",
    projectId: "bios-tuzig",
    storageBucket: "bios-tuzig.appspot.com",
    messagingSenderId: "710538398471"
};
var stageLen = 1000,
    stageRadius = stageLen / 2,
    stageCenter = {x: stageLen / 2,
                   y: stageLen / 2},
    ringHeight = stageRadius / 12.5,
    totalDeg = 350,
    // refactor to this.scale and remove maxAge
    maxAge = 95, 
    years2deg = totalDeg / 95; // 95 is giza's age, should come from bio

// three sizes: 0, 1 & 2 for small, medium, large

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
        return s.split("").reverse().join("");
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
    this.groups = [this.arcsGroup, this.textsGroup, this.dialsGroup];

	this.layer.add(this.arcsGroup, this.textsGroup, this.dialsGroup); // this.groups);
	stage.add(this.layer);
};

TableLayer.prototype.draw = function() {
	var i, ring, ringSpans;
	// start with the dates and the dials
	this.addDates();
    this.addDialsShapes();
	// draw the life spans
    if (bio.spans !== undefined) 
        for (ring=0; ring < bio.spans.length; ring++) {
            ringSpans = bio.spans[ring];
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
	var movingShapes = this.textsGroup.getChildren();
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

function showDescription (ev) {
    var span = ev.target.span;
    var layer = new Konva.Layer();
    var canvas = layer.getCanvas()._canvas;

    canvas.setAttribute('dir', 'rtl');
    var text = new Konva.Text({
      x: 0,
      y: 0,
      text: span.description,
      fontSize: 22,
      fontFamily: 'Assistant',
      fill: theme.descripton_color,
      width: 600,
      padding: 20,
      align: 'right'
    });
    var rect = new Konva.Rect({
      stroke: theme.stroke_color,
      strokeWidth: 5,
      fill: theme.fill_color,
      width: 600,
      height: text.getHeight()+10,
      shadowColor: 'black',
      shadowBlur: 20,
      shadowOffset: {x : 10, y : 10},
      shadowOpacity: 0.3,
      cornerRadius: 10
    });
    // fix the position based on size so it'll be centerd
    var h = text.getHeight(),
        w = text.getWidth(),
        text_pos = {x: stageCenter.x + w / 2 -50,
                    y: stageCenter.y - h / 2};


    text.position(text_pos);
    rect.position(text_pos);

    layer.add(rect, text);
    chronusStage.add(layer);
    layer.draw();
}

TableLayer.prototype.addSpanShapes = function(span, ring) {
    var ageSpan = span.end_age-span.start_age,
        endDeg = span.end_age*years2deg-90,
		startDeg = span.start_age*years2deg-90,
		name,
		fontSize, fontStyle,
		glyphRotation,
		text,
        arcShape,
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
    arcShape = new Konva.Arc({
            opacity: 0.3,
            angle: endDeg-startDeg,
            x: stageRadius,
            y: stageRadius,
            outerRadius: (ring+1)*ringHeight,
            innerRadius: ring*ringHeight,
            fill: '#fff',
            stroke: '#81aa8d',
            strokeWidth: 3,
            rotation: startDeg
          });
	this.arcsGroup.add(arcShape);
	// add the arc's text
    if (span.name == 'יד מרדכי') {
        fontSize = 14;
        fontStyle='normal';
    } else {
        fontSize = 40;
        fontStyle='bold';
    }
	textShape = new Konva.TextPath({
			text: text,
			fill: '#81aa8d',
			fontFamily: 'Assistant',
            fontStyle: fontStyle,
			fontSize: fontSize,
			glyphRotation: glyphRotation
		});
	 textShape.initialFontSize = fontSize;
	 textShape.pathConfig = {ring: ring, startDeg: startDeg, endDeg: endDeg,
	 				    group:this.textsGroup};
	 this.textsGroup.add(textShape);
    if (span.description) {
        console.log('got description');
        arcShape.span = span;
        textShape.span = span;
        arcShape.on('click tap', showDescription);
        textShape.on('click tap', showDescription);
    }
};

TableLayer.prototype.addDialsShapes = function() {
	// returning 4 dials at 1/8. 3/8, 5/8 & 7/8. each dial is made from two 
	// shapes - a line and a text.

    // add a border for the whole thing
    this.dialsGroup.add(
        new Konva.Arc({
            opacity: 0.3,
            angle: totalDeg,
            x: stageRadius,
            y: stageRadius,
            outerRadius: 12*ringHeight+4,
            innerRadius: 12*ringHeight,
            fill: '#81aa8d',
            rotation: -90
        })
    );
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

TableLayer.prototype.addDates = function() {
    var fontSize = 40; 

    var dob = new Konva.TextPath({
								  fill: DIALS_COLOR,
								  fontSize: fontSize,
								  fontFamily: 'Assistant',
								  fontStyle: 'bold',
								  text: bio.date_of_birth,
								  }),
        dop = new Konva.TextPath({
								  fill: DIALS_COLOR,
								  fontSize: fontSize,
                                  fontStyle: 'bold',
								  fontFamily: 'Assistant',
								  fontStyle: 'bold',
								  text: bio.date_of_passing
								 });
    dob.initialFontSize = fontSize;
    dop.initialFontSize = fontSize;
	dob.pathConfig = {ring: 9.8, startDeg: -96, endDeg: 100.4,
						   group: this.textsGroup};
	dop.pathConfig = {ring: 8.8, startDeg: -106, endDeg: 0.4,
						   group: this.textsGroup};
    this.textsGroup.add(dob, dop);
};
/* End of TableLayer */

var GalleryLayer = function(stage) {
	this.stage = stage;
  	this.layer = new Konva.Layer();
	this.images = [];
	stage.add(this.layer);
};

GalleryLayer.prototype.scale = function (scale) {
    var imageScale = Math.min(scale.x, scale.y);
    console.log('imageScale', imageScale);
	for (var i=0; i < this.images.length; i++) {
		this.images[i].x(this.images[i].loc.x*scale.x);
		this.images[i].y(this.images[i].loc.y*scale.y);
        this.images[i].width(this.images[i].spriteFrame.frame.w*imageScale);
        this.images[i].height(this.images[i].spriteFrame.frame.h*imageScale);
	}	
	this.layer.draw();
};

GalleryLayer.prototype.draw = function () {
	var that = this;
    var ageRE = /^age_(\d+)/;
    var spriteFrames = bio.thumbs.frames;
	var i;
    var scale = calcScale(),
	    imageScale = Math.min(scale.x, scale.y);

	this.psImages = [];

    console.log(imageScale);
    // sort the thumbs according to age
    spriteFrames.sort(function (a,b) {
        var aAge = Number(a.filename.match(ageRE)[1]);
        var bAge = Number(b.filename.match(ageRE)[1]);
        return aAge-bAge;
    });

	// create the array for PhotoSwipe
	for(i=0; i < spriteFrames.length; i++)
		this.psImages.push(bio.images[spriteFrames[i].filename.slice(0,-4)]);

    var spriteSheet = new Image(bio.thumbs.meta.width, bio.thumbs.meta.width);

    spriteSheet.src = bio.thumbs.meta.sprite_url;

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
                y: (loc.y-0)*scale.y,
                width: spriteFrames[i].frame.w*imageScale,
                height: spriteFrames[i].frame.h*imageScale,
                strokeWidth: 5,
                stroke: '#5B946B',
                image: spriteSheet,
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOffset: {x : 10, y : 10},
                shadowOpacity: 0.3
            });
            img.crop({
                    width: spriteFrames[i].frame.w,
                    height: spriteFrames[i].frame.h,
                    x: 0 - spriteFrames[i].frame.x,
                    y: 0 - spriteFrames[i].frame.y
            });
            img.i = i;
            img.spriteFrame = spriteFrames[i];
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
    name = header.firstChild;
    header.innerHTML = '<h1>' + bio.full_name + '</h1>';

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
    elm.innerHTML = bio.full_name;
    section.appendChild(elm);
	if (bio.date_of_birth_he) {
		elm = document.createElement('h2');
		elm.innerHTML = bio.date_of_birth_he + ' - ' + bio.date_of_passing_he;
		section.appendChild(elm);
	}
	elm = document.createElement('h2');
	elm.style.direction = 'ltr';
	elm.innerHTML = bio.date_of_birth + ' - ' + bio.date_of_passing;
	section.appendChild(elm);
	elm = document.createElement('h2');
	elm.innerHTML = '&#10048;';
	section.appendChild(elm);
	elm = document.createElement('h2');
	elm.innerHTML = (bio.sex=='F')?'תהי נשמתה צרורה':'תהי נשמתו צרורה';
	section.appendChild(elm);
	elm = document.createElement('h2');
	elm.innerHTML = 'בצרור החיים';
	section.appendChild(elm);
	elm = document.createElement('button');
	elm.className = 'enter';
	elm.innerHTML = (bio.sex=='F')?'לזכרה':'לזכרו';
	section.appendChild(elm);
	section = document.createElement('section');
	section.className = 'centered';
	welcome.appendChild(section);
	elm = document.createElement('img');
	elm.width = 350;
	elm.src = bio.cover_photo;
	elm.alt = 'cover photo for '+bio.first_name;
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
	var myFamily = document.getElementById('myFamily');
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
                   ring: (r==0)?0.5:r*3,
                   start: i*arcLength,
                   len: arcLength,
                   onClick: function (ev) {
                      // ev.dial is very usefull
                       route('/'+encodeURIComponent(ev.target.text));
                   }};
            face.addArc(arc);
        }
    }
    face.draw();
    myFamily.style.display = '';
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
        console.log(window.bio);
        chronusStage.clear();
		fscreen.requestFullscreen(document.body);

	}
}

route('/', function() {
    route('giza');
});

route('/noya', function() {
    var welcome = document.getElementById('welcome');
    var myFamily = document.getElementById('myFamily');

    welcome.style.display = 'none';
    biochronus.style.display = 'none';
    myFamily.style.display = '';
});

route('/*/photo/*', function(name, photoId) {
    state = 'photo';
    gallery = new PhotoSwipe(document.getElementById('photos'),
                             PhotoSwipeUI_Default,
                             galleryLayer.psImages);
    gallery.init();
    gallery.listen('close', function () {
        gotoState('biochronus');
    });
});

route('/*', function(encodedName) {
    var welcome = document.getElementById('welcome');
    var myFamily = document.getElementById('myFamily');
	var footer = document.querySelector('footer');
    var name = decodeURIComponent(encodedName);
    var cid = 'stage-'+encodedName;
    var containers = biochronus.querySelectorAll('.stage');

    /*
    welcome.style.display = 'none';
    footer.style.display = 'none';
    myFamily.style.display = 'none';
    */
    myFamily.style.display = 'none';
    footer.style.display = 'none';
    welcome.style.display = 'none';
    window.bio = window.bios[name];
    console.log(window.bio);
    
    chronusStage.destroyChildren();
    chronusStage.clear();

    drawChronus(chronusStage);
    chronusStage.draw();
    // fscreen.requestFullscreen(document.body);
    biochronus.style.display = '';
    resizeBioChronus();
});


fscreen.addEventListener('fullscreenchange', function() {
	if (!tableLayer) {
		biochronus.style.display = 'none';
		drawChronus(chronusStage);
        console.log('drawing');
        chronusStage.draw();
		biochronus.style.display = '';
    }
});

function calcScale() {
    return {x: (window.innerWidth - 20) / stageLen,
		    y: (window.innerHeight * 0.91 - 20) / stageLen};
}

window.addEventListener('resize', resizeBioChronus);
function resizeBioChronus() {
    var scale = calcScale();
    chronusStage.width(stageLen * scale.x );
    chronusStage.height(stageLen * scale.y );
    tableLayer.scale(scale);
    galleryLayer.scale(scale);
};

function readBios(snapshot) {
    var data = snapshot.val();
    // var giza = data["גיזה גולדפארב לבית בראו"];
    for (var name in data) {
        var bio = data[name];
        var spans = [];
        if (bio.spans !== undefined) {
            // to make it easier on the display we translate the spans into
            // an array of ring arrays
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
    chronusStage.destroyChildren();
    window.bios = data;
    route.start(true);
}

document.addEventListener("DOMContentLoaded", function() {
    welcome = document.getElementById('welcome');
	biochronus = document.getElementById('biochronus');
	container = document.getElementById('container');
	var myFamily = document.getElementById('myFamily');

    chronusStage = new Konva.Stage({container: 'container',
										width: container.offsetWidth,
										height: window.innerHeight,
										visible: true });
    bio.url = getParameterByName('u') || 'bios/local/';

    myFamily.style.display = '';
    biochronus.style.display = '';
    drawMyFamily();

	//TODO: merge these three data sources
    var ref = firebase.database().ref('bios');
    ref.on('value', readBios);

});
// Initialize Firebase
firebase.initializeApp(fb_config);
