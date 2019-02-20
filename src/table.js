/*
 * Our bottom layer - the table layer, complete with dials, and arcs
 * TODO: add buttons
 */
export default class TableLayer {
    constructor(params) {
        this.chronus = params.chronus;
        this.currentScale = {x:1,y:1};
        this.stage = params.stage;
        this.bio = params.bio;
        this.theme = params.theme;
        this.layer = new Konva.Layer();
        // the groups differ on the way they scale
        this.arcsGroup = new Konva.Group();
        this.textsGroup = new Konva.Group();
        this.dialsGroup = new Konva.Group();

        this.layer.add(this.arcsGroup, this.textsGroup, this.dialsGroup); // this.groups);
        this.stage.add(this.layer);
    }

    draw() {
        var i, ring, ringSpans;
        // start with the dates and the dials
        this.drawDials();
        this.drawDates();
        // draw the life spans
        if (this.bio.spans !== undefined) 
            for (ring=0; ring < this.bio.spans.length; ring++) {
                ringSpans = this.bio.spans[ring];
                for (i=0; i < ringSpans.length; i++) {
                  var span = ringSpans[i];
                  this.drawSpan(span, 11-ring);
                }
            }

    }

    scale(scale) {
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
    }

    getPath(config) {
      // config is expected to have ring, startDeg & endDeg
      var myRingWidth = (config.ring+0.5) * this.chronus.ringHeight;
      var scale = this.arcsGroup.scale();

      var deg, rad, x, y;

      var ret = "M ";

      for (deg=config.startDeg+2; deg < config.endDeg; deg++) {

        
        rad = deg * Math.PI/180;
        x = Math.round(Math.cos(rad)*myRingWidth)*scale.x;
        y = Math.round(Math.sin(rad)*myRingWidth)*scale.y;
        ret += x+" "+y+" L ";
      }
      ret = ret.slice(0,-3);
      return ret;
    }

    drawSpan(doc, ring) {
        var ageSpan = doc.end_age-doc.start_age,
            endDeg = doc.end_age*this.chronus.years2deg-90,
            startDeg = doc.start_age*this.chronus.years2deg-90,
            fontStyle = (doc.description)?'bold':'normal',
            fontSize,
            name,
            glyphRotation,
            text,
            arcShape,
            textShape,
            i;

     
        if (startDeg > -30 && startDeg < 220) {
            glyphRotation = 180;
            name = doc.name;
        } else {
            glyphRotation = 0;
            // TODO: support left-to-right
            name = doc.name.split("").reverse().join("");
        }
        text = name ;
        // add the arc 
        arcShape = new Konva.Arc({
                opacity: (fontStyle=='bold')?0.6:0.3,
                angle: endDeg-startDeg,
                x: this.chronus.stageRadius,
                y: this.chronus.stageRadius,
                outerRadius: (ring+1)*this.chronus.ringHeight,
                innerRadius: ring*this.chronus.ringHeight,
                fill: '#fff',
                stroke: '#81aa8d',
                strokeWidth: 3,
                rotation: startDeg
              });
        this.arcsGroup.add(arcShape);
        // add the arc's text
        if (doc.name == 'יד מרדכי') {
            fontSize = 14;
            fontStyle='normal';
        } else {
            fontSize = 40;
            fontStyle='bold';
        }
        textShape = new Konva.TextPath({
                text: text,
                fill: '#81aa8d',
                fontFamily: this.theme.fontFamily,
                fontStyle: fontStyle,
                fontSize: fontSize,
                glyphRotation: glyphRotation
            });
         this.textsGroup.add(textShape);
         textShape.initialFontSize = fontSize;
         textShape.pathConfig = {ring: ring, startDeg: startDeg, endDeg: endDeg,
                            group:this.textsGroup};
        if (doc.description) {

            textShape.doc = arcShape.doc = doc;
            textShape.ring = arcShape.ring = ring;

            arcShape.on('click tap', function(ev) {
                window.chronus.showDescription(ev.target);
            });
            textShape.on('click tap', function(ev) {
                window.chronus.showDescription(ev.target);
            });
        }
    }

    drawDials() {
        // returning 4 dials at 1/8. 3/8, 5/8 & 7/8. each dial is made from two 
        // shapes - a line and a text.

        // add a border for the whole thing
        this.dialsGroup.add(
            new Konva.Arc({
                opacity: 0.3,
                angle: this.chronus.totalDeg,
                x: this.chronus.stageRadius,
                y: this.chronus.stageRadius,
                outerRadius: 12*this.chronus.ringHeight+4,
                innerRadius: 12*this.chronus.ringHeight,
                fill: '#81aa8d',
                rotation: -90
            })
        );
        for (var i=0; i <= this.chronus.maxAge; i++) {
            var from = this.chronus.getPoint(i, 12);
            var to = this.chronus.getPoint(i, (i % 10 == 0)?11.7:11.9);
            this.dialsGroup.add(
                new Konva.Line({
                    points: [from.x, from.y, to.x,to.y],
                    stroke: this.theme.stroke_color,
                    strokeWidth: (i % 10 == 0)?6:3,
                    lineCap: 'round',
                    lineJoin: 'round'
                })
            );
       }
    }

    drawDates() {
		var that = this,
			fontSize = 40, 
            dob = new Konva.TextPath({
                                      fill: this.theme.stroke_color,
                                      fontSize: fontSize,
                                      fontFamily: this.theme.fontFamily,
                                      fontStyle: 'bold',
                                      text: this.bio.date_of_birth,
                                      }),
            dop = new Konva.TextPath({
                                      fill: this.theme.stroke_color,
                                      fontSize: fontSize,
                                      fontStyle: 'bold',
                                      fontFamily: this.theme.fontFamily,
                                      text: this.bio.date_of_passing
									 }),
			endOfVars;

        dob.initialFontSize = fontSize;
        dop.initialFontSize = fontSize;
        dob.pathConfig = {ring: 9.8, startDeg: -92, endDeg: 100.4,
                               group: this.textsGroup};
        dop.pathConfig = {ring: 8.5, startDeg: -100, endDeg: 0.4,
                               group: this.textsGroup};
		[dob, dop].forEach(function (path) {
			
            var attrs = {x: that.layer.width()/2, y: that.layer.height()/2};

            if (path.pathConfig)
                attrs.data = that.getPath(path.pathConfig);
            if (path.initialFontSize)
				attrs.fontSize = path.initialFontSize; // *that.currentScale;
            path.setAttrs(attrs);
		});
        this.textsGroup.add(dob);
        this.textsGroup.add(dop);
    }
}
