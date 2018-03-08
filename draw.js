"use strict";

var stageLen = 1000,
    stageRadius = stageLen / 2,
    ringHeight = stageRadius / 12,
    totalDeg = 360,
    maxAge = 95,
    years2deg = totalDeg / 95 * 0.98; // 95 is giza's age, should come from bio

var bio = {
    first_name: 'גיזה',
    last_name: 'גולדפרב',
    date_of_birth: '10.2.1914', // we will need to store iso here and convert
    place_of_birth: 'טרנוב',
    date_of_passing: '17.4.2009',
    place_of_passing: 'נתניה',
    cover_photo: 'https://s3.eu-central-1.amazonaws.com/tsvi.bio/img/cover.png',
    periods: [[
        {name: 'טרנוב פולין',
        start_age: 0,
        end_age: 22,
        },
        {name: 'נתניה',
        start_age: 22,
        end_age: 29,
        },
        {name: 'יד מרדכי',
        start_age: 29,
        end_age: 32,
        },
        {name: 'נתניה',
        start_age: 32,
        end_age: 95,
        }],[
        {name: 'השומר הצעיר',
        start_age: 14,
        end_age: 32,
        },
        {name: 'שרות התעסוקה',
        start_age: 40,
        end_age: 67,
        },
        {name: 'גמלאות',
        start_age: 67,
        end_age: 95,
        },],[
        {name: '\u2764 אלו \u2764',
        start_age: 22,
        end_age: 30,
        },{name: '\u2764 וולוק \u2764',
        start_age: 32,
        end_age: 90,
        }
       ]
    ]
  };
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

/*
 * Our bottom layer - the table layer, complete with dials, periods and names
 */
var TableLayer = function(stage) {
	this.stage = stage;
  	this.layer = new Konva.Layer();
	stage.add(this.layer);
};

TableLayer.prototype.draw = function() {
	var i, ring, ringPeriods;
	// start with the dates and the dials
	var shapes = this.getDates().concat(this.getDials());
	//
	for (ring=0; ring < bio.periods.length; ring++) {
		ringPeriods = bio.periods[ring];
		for (i=0; i < ringPeriods.length; i++) {
		  shapes = shapes.concat(this.getPeriodArcs(ringPeriods[i], 11-ring));
		}
	}

	for (i=0; i < shapes.length; i++) {
			this.layer.add(shapes[i]);
	}

	this.layer.draw();
};

TableLayer.prototype.getPath = function(config) {
  // config is expected to have ring, startDeg & endDeg
  var myRingWidth = (config.ring+0.5) * ringHeight;

  var deg, rad, x, y;

  var ret = "M ";

  for (deg=config.startDeg+2; deg < config.endDeg; deg++) {

    
    rad = toRad(deg);
    x = Math.round(Math.cos(rad)*myRingWidth);
    y = Math.round(Math.sin(rad)*myRingWidth);
    ret += x+" "+y+" L ";
  }
  ret = ret.slice(0,-3);
  return ret;
};

TableLayer.prototype.getPeriodArcs = function(period, ring) {
    var span = period.end_age-period.start_age,
            endDeg = period.end_age*years2deg-90,
      startDeg = period.start_age*years2deg-90;
    var text, i;

 
  // a period arc is made of an arc the size of the period and the name
  // of the period written inside
	text = '';
	for (i=0; i < span; i=i+18) {
		text += reverse(period.name) + '                             ';
	}
	return [
          new Konva.Arc({
            angle: endDeg-startDeg,
            x: stageRadius,
            y: stageRadius,
            outerRadius: (ring+1)*ringHeight,
            innerRadius: ring*ringHeight,
            fill: '#999',
            stroke: '#222',
            strokeWidth: 3,
            rotation: startDeg
          }),
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              fill: '#222',
              fontSize: (period.name == 'יד מרדכי')?20:32,
              fontFamily: 'Assistant',
              text: text,
			  data: this.getPath(
			  	{ring: ring, startDeg: startDeg, endDeg: endDeg}),
              direction: 'rtl'
		   })
	];
};

TableLayer.prototype.getDials = function() {
	// returning 4 dials at 1/8. 3/8, 5/8 & 7/8. each dial is made from two 
	// shapes - a line and a text.
    var fontSize = 30,
        color = '#aaa';
    var xs = [0.8, 0.8, -0.8, -0.8];
    var ys = [-0.8, 0.8, 0.8, -0.8];
    var ret =[], i, age, x, y;
    for (i=0; i < 4; i++) {
		age = Math.round((i*2+1)*maxAge/8);

	if (i===0) age = "בת\n"+age;

	ret.push(
		new Konva.Text({
			// x: stageRadius*(1+xs[i]*(xs[i]<0)?1.1:1),
			x: stageRadius*(1+xs[i]*1.05),
			y: stageRadius*(1+ys[i]*1.05),
			fill: color,
			fontSize: fontSize,
			fontFamily: 'Rubik',
			align: 'center',
			text: age
       }),
       new Konva.Line({
			points: [stageRadius*(1+xs[i]*0.95), stageRadius*(1+ys[i]*0.95),
					 stageRadius*(1+xs[i]*0.2), stageRadius*(1+ys[i]*0.2)],
			dash: [5, 5],
			stroke: color,
			strokeWidth: 4,
			lineCap: 'round',
			lineJoin: 'round'
		})
	);
  }
  return ret;
};

TableLayer.prototype.getDates = function() {
    var fontSize = 30;
	var maxAgeDialStart = getPoint(maxAge, 11);
	var maxAgeDialEnd = getPoint(maxAge, 9.5);

	var minAgeDialStart = getPoint(0, 11);
	var minAgeDialEnd = getPoint(0, 10.5);

    return [
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              fill: 'black',
              fontSize: fontSize,
              fontFamily: 'Assistant',
			  fontStyle: 'bold',
              text: bio.date_of_birth,
              data: this.getPath({ring: 9.2, startDeg: -98, endDeg: 180}),
           }),
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              fill: 'black',
              fontSize: fontSize,
              fontFamily: 'Assistant',
			  fontStyle: 'bold',
              text: bio.date_of_passing,
              data: this.getPath({ring: 8.2, startDeg: maxAge*years2deg-99.5, endDeg: 350})
           }),
		  new Konva.Line({
				points: [maxAgeDialStart.x, maxAgeDialStart.y, maxAgeDialEnd.x, maxAgeDialEnd.y], 
			    dash: [5, 5],
				stroke: '#222',
				strokeWidth: 4,
				lineCap: 'round',
				lineJoin: 'round'
			}),
		  new Konva.Line({
				points: [minAgeDialStart.x, minAgeDialStart.y, minAgeDialEnd.x, minAgeDialEnd.y], 
			    dash: [5, 5],
				stroke: '#222',
				strokeWidth: 4,
				lineCap: 'round',
				lineJoin: 'round'
			})
    ];
};

var GalleryLayer = function(stage) {
	this.stage = stage;
  	this.layer = new Konva.Layer();
	stage.add(this.layer);
};

GalleryLayer.prototype.draw = function () {
    var ageRE = /^age_(\d+)/;
    var spriteFrames = window.sprites.frames;
	var images = [];
	var i;

    // sort the thumbs according to age
    spriteFrames.sort(function (a,b) {
        var aAge = Number(a.filename.match(ageRE)[1]);
        var bAge = Number(b.filename.match(ageRE)[1]);
        return aAge-bAge;
    });

	// create the array for PhotoSwipe
	for(i=0; i < spriteFrames.length; i++) {
		images.push(window.images[spriteFrames[i].filename])
	}

    var spriteSheet = new Image(window.sprites.meta.width, window.sprites.meta.width);

	var layer = this.layer;
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
			img.on('mouseup touchend', function() {
				  gallery = new PhotoSwipe(document.getElementById('photos'),
					  PhotoSwipeUI_Default, images, {index: this.i } );
				  gallery.init();

			})
			layer.add(img);
            ring++;
            if (ring === ringMax)
                ring = ringMin;
        }
		layer.draw()
    }
    spriteSheet.src = window.sprites.meta.sprite_path;
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

function drawChronus (){
  // draw the biochronus complete with dials and the gallery
    var container = document.getElementById('container');
    var header = document.getElementById('biocHeader');
    var ring,
      ringPeriods,
	  layer,
      i;

    var dob = document.createElement('h1');
    dob.innerHTML = bio.first_name + ' ' + bio.last_name;
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
    tableLayer.layer.scale(scale);
    galleryLayer.layer.scale(scale);
    stage.visible(true);
    stage.draw();
  }
  window.addEventListener('resize', fitStage2Container);
  // make it fullscreen
  requestFullScreen(document.body);
  // make it fit
  fitStage2Container()

}

document.addEventListener("DOMContentLoaded", function() {
    var welcome = document.getElementById('welcome');
    var bichronus = document.getElementById('biochronus');

    bichronus.style.display = 'none';
	welcome.addEventListener("click", function () {
			welcome.style.display = 'none';
			bichronus.style.display = '';
			drawChronus();
	});
});
