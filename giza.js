/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva */
/*
 * giza.js - perpetuating lives since 2018
 */
"use strict";

var DIALS_COLOR = '#333'
var stageLen = 1000,
    stageRadius = stageLen / 2,
    ringHeight = stageRadius / 12,
    totalDeg = 350,
    maxAge = 95,
    years2deg = totalDeg / 95; // 95 is giza's age, should come from bio

var bio = {};
// START
var gallery;

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
	for (var ring=0; ring < bio.meta.spans.length; ring++) {
		var ringSpans = bio.meta.spans[ring];
		for (i=0; i < ringSpans.length; i++) {
		  var span = ringSpans[i];
		  this.addSpanShapes(span, 11-ring);
		}
	}

	this.layer.draw();
};

TableLayer.prototype.scale = function (scale) {
	var curPos;
    var textPaths=this.textsGroup.getChildren()
	// BUG: birth and passing dates are not showing
    //      uncommenting the next line should fix it, but it fails miserably 
    // var textPaths=this.textsGroup.getChildren().concat(this.datesGroup.getChildren())


	this.arcsGroup.scale(scale)
	this.dialsGroup.scale(scale)
	// scaling the texts
	for (var i=0; i < textPaths.length; i++ ) {
		var text = textPaths[i];
        var attrs = {
			x: this.layer.width()/2,
			y: this.layer.height()/2
        };
        if (text.pathConfig)
			attrs.data = this.getPath(text.pathConfig)
		text.setAttrs(attrs)
    }
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
		pathConfig = {ring: ring, startDeg: startDeg, endDeg: endDeg};
    var text, i;

 
  // a span arc is made of an arc the size of the span and the name
  // of the span written inside
	text = '';
	for (i=0; i < ageSpan; i=i+18) {
		text += reverse(span.name) + '                             ';
	}
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
          }))
	var text = new Konva.TextPath({
			fill: '#222',
			// fontSize: (span.name == 'יד מרדכי')?20:32,
			fontSize: (span.name == 'יד מרדכי')?20:32,
			fontFamily: 'Assistant',
			text: text,
			direction: 'rtl'
		});
	 text.pathConfig = pathConfig;
	 this.textsGroup.add(text);
};

TableLayer.prototype.addDialsShapes = function() {
	// returning 4 dials at 1/8. 3/8, 5/8 & 7/8. each dial is made from two 
	// shapes - a line and a text.
    var fontSize = 30,
        color = '#aaa';
    var xs = [0.8, 0.8, -0.8, -0.8];
    var ys = [-0.8, 0.8, 0.8, -0.8];
    var ret =[], i, age, x, y;
    // where's are the min-max dials?
	var maxAgeDialStart = getPoint(maxAge, 11);
	var maxAgeDialEnd = getPoint(maxAge, 9.5);
	var minAgeDialStart = getPoint(0, 11);
	var minAgeDialEnd = getPoint(0, 10.5);
    for (i=0; i < 4; i++) {
		age = "בת\n"+Math.round((i*2+1)*maxAge/8);

	//if (i===0) age = "בת\n"+age;

	this.dialsGroup.add(
        new Konva.Text({
            // x: stageRadius*(1+xs[i]*(xs[i]<0)?1.1:1),
            x: stageRadius*(1+xs[i]*1.05),
            y: stageRadius*(1+ys[i]*1.05),
            fill: DIALS_COLOR,
            fontSize: fontSize,
            fontFamily: 'Rubik',
            align: 'center',
            text: age
        }),
        new Konva.Line({
            points: [maxAgeDialStart.x, maxAgeDialStart.y, maxAgeDialEnd.x, maxAgeDialEnd.y], 
            dash: [5, 5],
            stroke: DIALS_COLOR,
            strokeWidth: 4,
            lineCap: 'round',
            lineJoin: 'round'
        }),
        new Konva.Line({
            points: [minAgeDialStart.x, minAgeDialStart.y, minAgeDialEnd.x, minAgeDialEnd.y], 
            dash: [5, 5],
            stroke: DIALS_COLOR,
            strokeWidth: 4,
            lineCap: 'round',
            lineJoin: 'round'
        }),
        new Konva.Line({
            points: [stageRadius*(1+xs[i]*0.93), stageRadius*(1+ys[i]*0.93),
                     stageRadius*(1+xs[i]*0.63), stageRadius*(1+ys[i]*0.63)],
            dash: [5, 5],
            stroke: DIALS_COLOR,
            strokeWidth: 4,
            lineCap: 'round',
            lineJoin: 'round'
		})
	);
  }
  return ret;
};

TableLayer.prototype.addDatesShapes = function() {
    var fontSize = 30;

    this.datesGroup.add(
          new Konva.TextPath({
              fill: DIALS_COLOR,
              fontSize: fontSize,
              fontFamily: 'Assistant',
			  fontStyle: 'bold',
              text: bio.date_of_birth,
           }),
          new Konva.TextPath({
              fill: DIALS_COLOR,
              fontSize: fontSize,
              fontFamily: 'Assistant',
			  fontStyle: 'bold',
              text: bio.date_of_passing,
           })
    )
};
/* End of TableLayer */

var GalleryLayer = function(stage) {
	this.stage = stage;
  	this.layer = new Konva.Layer();
	this.images = [];
	stage.add(this.layer);
};

GalleryLayer.prototype.scale = function (scale) {
	var curPos;

	for (var i=0; i < this.images.length; i++) {
		this.images[i].x(this.images[i].loc.x*scale.x);
		this.images[i].y(this.images[i].loc.y*scale.y);
	}	
	this.layer.draw();
};
GalleryLayer.prototype.draw = function () {
    var ageRE = /^age_(\d+)/;
    var spriteFrames = bio.thumbs.frames;
	var psImages = [];
	var i;

    // sort the thumbs according to age
    spriteFrames.sort(function (a,b) {
        var aAge = Number(a.filename.match(ageRE)[1]);
        var bAge = Number(b.filename.match(ageRE)[1]);
        return aAge-bAge;
    });

	// create the array for PhotoSwipe
	for(i=0; i < spriteFrames.length; i++) {
		psImages.push(bio.images[spriteFrames[i].filename])
	}

    var spriteSheet = new Image(bio.thumbs.meta.width, bio.thumbs.meta.width);

	var layer = this.layer,
		images = this.images;
    spriteSheet.onload = function () {
        var ringMin = 1,
            ringMax = 8,
            ring = ringMin,
            i,
            age,
			loc,
			img;

        for (i = 0; i < spriteFrames.length; i++) {
            age = Number(spriteFrames[i].filename.match(ageRE)[1]);
            loc = getPoint(age, ring);
            img = new Konva.Image({
                x: loc.x,
                y: loc.y,
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
					  PhotoSwipeUI_Default, psImages, {index: this.i } );
				  gallery.init();

			})
			images.push(img);
			layer.add(img);
            ring++;
            if (ring === ringMax)
                ring = ringMin;
        }
		layer.draw()
    }
    spriteSheet.src = bio.url+bio.thumbs.meta.sprite_path;
};

function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function drawChronus () {
  // draw the biochronus complete with dials and the gallery
    var container = document.getElementById('container');
    var header = document.getElementById('biocHeader');
    var ring,
      ringPeriods,
	  layer,
	  dob,
      i;

    // draw it only when all the data was downloaded
	if (!(window.bio.meta && window.bio.images && window.bio.thumbs))
		return;

    dob = document.createElement('h1');
    dob.innerHTML = bio.meta.first_name + ' ' + bio.meta.last_name;
    header.appendChild(dob);

    var stage = new Konva.Stage({
        container: 'container',
        width: container.offsetWidth,
        height: window.innerHeight,
        visible: false // we'll show it when we fit it into the page
    });

  var tableLayer = new TableLayer(stage);
  tableLayer.draw();

  var galleryLayer = new GalleryLayer(stage);
  galleryLayer.draw();

  function fitStage2Container() {

    var scale = {x: window.innerWidth / stageLen,
				 y: (window.innerHeight * 0.91) / stageLen};

    stage.width(stageLen * scale.x);
    stage.height(stageLen * scale.y);
    tableLayer.scale(scale);
    galleryLayer.scale(scale);
    stage.visible(true);
    stage.draw();
  }
  window.addEventListener('resize', fitStage2Container);
  document.body.onfullscreenchange = fitStage2Container;
  // make it fullscreen

}

document.addEventListener("DOMContentLoaded", function() {
    var welcome = document.getElementById('welcome');
    var footer = document.querySelector('footer');
    var bichronus = document.getElementById('biochronus');
    bio.url = getParameterByName('u') || 'bios/local/';

    bichronus.style.display = 'none';

    getAjax(bio.url + 'bio.json', function (data) {
        window.bio.meta = data;
        drawChronus();
    });
    getAjax(bio.url + 'images.json', function (data) {
        window.bio.images = data;
        drawChronus();
    });
    getAjax(bio.url + 'thumbs.json', function (data) {
        window.bio.thumbs = data;
        drawChronus();
    });
	welcome.addEventListener("click", function () {
			welcome.style.display = 'none';
			footer.style.display = 'none';
			bichronus.style.display = '';
		    requestFullScreen(document.body);
	});
});
