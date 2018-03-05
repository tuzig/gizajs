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
      },
      {name: 'לשכת העבודה',
       start_age: 40,
       end_age: 67,
      }, ]
    ]
  };

function toRad (angle) {
  return angle * (Math.PI / 180);
}

function getPath(config) {
  var startAgeRad = toRad(config.startDeg),
      endAgeRad = toRad(config.endDeg),
      myRingWidth = config.ring * ringHeight;

  var x = Math.round(Math.cos(startAgeRad)*myRingWidth),
      y = Math.round(Math.sin(startAgeRad)*myRingWidth),
      x2 = Math.round(Math.cos(endAgeRad)*myRingWidth),
      y2 = Math.round(Math.sin(endAgeRad)*myRingWidth);

  return ("M"+x+" "+y+" Q "+stageRadius+" "+stageRadius+" "+x2+" "+y2);
}

function getPeriodArcs(period, ring) {
  var endDeg = period.end_age*years2deg-90,
      startDeg = period.start_age*years2deg-90;

 
  // a period arc is made of an arc the size of the period and the name
  // of the period written inside
  return ([
          new Konva.Arc({
            angle: endDeg-startDeg,
            x: stageRadius,
            y: stageRadius,
            outerRadius: (ring+1)*ringHeight,
            innerRadius: ring*ringHeight,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 5,
            rotation: startDeg
          }),
          new Konva.TextPath({
              x: stageRadius,
              y: stageRadius,
              fill: '#333',
              fontSize: 20,
              fontFamily: 'Assitant',
              text: period.name,
              data: getPath({ring: ring, startDeg: startDeg, endDeg: endDeg}),
              direction: 'rtl'
           })
  ]);
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
    stage.draw();
    stage.visible(true);
  }

  fitStage2Container();
  window.addEventListener('resize', fitStage2Container);

  var layer = new Konva.Layer(),
      ring,
      ringPeriods,
      i;

  stage.add(layer);

  // add the period reings
  var arcs = [];
  for (ring=0; ring < bio.periods.length; ring++) {
    ringPeriods = bio.periods[ring];
    for (i=0; i < ringPeriods.length; i++) {
      arcs = arcs.concat(getPeriodArcs(ringPeriods[i], 11-ring));
    }
  }
  for (i=0; i < arcs.length; i++) {
    layer.add(arcs[i]); }

});
