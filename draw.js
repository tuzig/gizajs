"use strict";

  var stageLen = 1000,
      stageRadius = stageLen/2,
      ringHeight = stageRadius/12,
      totalDeg = 360,
      maxAge = 94,
	  years2deg = totalDeg/94; // 94 is giza's age, should come from bio

  var bio = {
    first_name: 'גיזה',
    last_name: 'גולדפרב',
    date_of_birth: '10.2.1914',
    place_of_birth: 'טרנוב',
    date_of_passing: '17.04.2008',
    place_of_passing: 'נתניה',
    cover_photo: 'https://s3.eu-central-1.amazonaws.com/tsvi.bio/img/cover.png',
    periods: [[
      {name: 'טרנוב',
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
       end_age: 94,
      }],[
      {name: 'השומר הצעיר',
       start_age: 14,
       end_age: 32,
      },
      {name: 'עם וולוק',
       start_age: 32,
       end_age: 90,
      }],[
      {name: 'עם אלו',
       start_age: 22,
       end_age: 30,
      },
      {name: 'לשכת העבודה',
       start_age: 40,
       end_age: 67,
      },
      {name: 'גמלאות',
       start_age: 67,
       end_age: 94,
      }, ]
    ]
  };

function reverse(s){
        return s.split("").reverse().join("");
}

function toRad (angle) {
  return angle * (Math.PI / 180);
}

function getPath(config) {

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
}

function getHeader() {
	var fontSize = 40;
	return [
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              stroke: 'blue',
              fontSize: fontSize,
              fontFamily: 'Assitant',
              text: reverse(bio.last_name),
              data: getPath({ring: 1, startDeg: 0, endDeg: 180}),
           }),
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              stroke: 'blue',
              fontSize: fontSize,
              fontFamily: 'Assitant',
              text: reverse(bio.first_name),
              data: getPath({ring: 1, startDeg: 180, endDeg: 360})
           }),
	];
}
function getDials() {
	var fontSize = 30,
	    color = '#222';
	var xs = [0.8, 0.8, -0.8, -0.8];
	var ys = [-0.8, 0.8, 0.8, -0.8];
	var ret =[], i, age, x, y;
	for (i=0; i < 4; i++) {
	 age = Math.round((i*2+1)*maxAge/8);
	 ret.push(new Konva.Text({
              // x: stageRadius*(1+xs[i]*(xs[i]<0)?1.1:1),
              x: stageRadius*(1+xs[i]),
              y: stageRadius*(1+ys[i]),
              stroke: color,
              fontSize: fontSize,
              fontFamily: 'Rubik',
							align: 'center',
              text: age
            }),
					  new Konva.Line({
							points: [stageRadius*(1+xs[i]*0.95), stageRadius*(1+ys[i]*0.95),
									     stageRadius*(1+xs[i]*0.9), stageRadius*(1+ys[i]*0.9)],
							stroke: color,
							strokeWidth: 4,
							lineCap: 'round',
							lineJoin: 'round'
						}));
  }
	return ret;
}

function getPeriodArcs(period, ring) {
  var endDeg = period.end_age*years2deg-90,
      startDeg = period.start_age*years2deg-90;

 
  // a period arc is made of an arc the size of the period and the name
  // of the period written inside
  return [
          new Konva.Arc({
            angle: endDeg-startDeg,
            x: stageRadius,
            y: stageRadius,
            outerRadius: (ring+1)*ringHeight,
            innerRadius: ring*ringHeight,
            fill: '#ccc',
            stroke: '#222',
            strokeWidth: 3,
            rotation: startDeg
          }),
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              stroke: 'green',
              fontSize: 20,
              fontFamily: 'Assitant',
              text: reverse(period.name),
              data: getPath({ring: ring, startDeg: startDeg, endDeg: endDeg}),
              direction: 'rtl'
           })
  ];
}
document.addEventListener("DOMContentLoaded", function() {
  // draw the biochronus
  var container = document.getElementById('container');

  var stage = new Konva.Stage({
    container: 'container',
    width: container.offsetWidth,
    height: window.innerHeight,
    visible: false // we'll show it when we fit it into the page
  });

  function fitStage2Container() {

    var scale = {x: container.offsetWidth / stageLen,
                 y: window.innerHeight / stageLen};

    stage.width(stageLen * scale.x);
    stage.height(stageLen * scale.y);
    stage.scale(scale);
    stage.visible(true);
    stage.draw();
  }

  window.addEventListener('resize', fitStage2Container);

  var layer = new Konva.Layer(),
      ring,
      ringPeriods,
      i;

  stage.add(layer);

  // add the period reings
  var shapes = getHeader().concat(getDials());
		console.log(shapes);
	console.log(shapes);
  for (ring=0; ring < bio.periods.length; ring++) {
    ringPeriods = bio.periods[ring];
    for (i=0; i < ringPeriods.length; i++) {
      shapes = shapes.concat(getPeriodArcs(ringPeriods[i], 11-ring));
    }
  }
  for (i=0; i < shapes.length; i++) {
	layer.add(shapes[i]);
  }
  fitStage2Container();

  window.layer = layer;

});
