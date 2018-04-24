/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva , reverse
*/
'use strict';

var AngleFace = function(params) {
    this.params = params;
    this.stageR = 500;
    this.ringHeight = this.stageR / this.params.rings;
	this.container = document.getElementById(params.container);
    this.stage = new Konva.Stage({container: params.container});
    //TODO: make ir resize
    this.stage.width(1000);
    this.stage.height(1000);
  	this.layer = new Konva.Layer();
	this.arcsGroup = new Konva.Group();
	this.textsGroup = new Konva.Group();
	this.dialsGroup = new Konva.Group();
    this.groups = [this.arcsGroup, this.textsGroup, this.dialsGroup];
	this.layer.add(this.arcsGroup, this.textsGroup, this.dialsGroup); // this.groups);
    this.stage.add(this.layer);
};

AngleFace.prototype = {
    getPath: function (config) {
        // config is expected to have ring, startDeg & endDeg
        var myRingWidth = (config.ring+0.5) * this.ringHeight;
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
    },

    draw: function() {
        this.layer.draw();
    },
    addBorder: function () {
        // draw the border
        this.arcsGroup.add(
             new Konva.Arc({
                opacity: 1,
                angle: this.params.endAngle - this.params.startAngle - 90,
                x: this.stageR,
                y: this.stageR,
                outerRadius: (this.ring+1)*this.ringHeight+2,
                innerRadius: (this.ring+1)*this.ringHeight,
                fill: '#81aa8d',
                strokeWidth: 2,
                rotation: this.params.startAngle-90
              }));
    },

    addArc: function (params) {
        var ring = params.ring,
            endDeg = params.start+params.len,
            startDeg = params.start,
            fontSize = 40,
            glyphRotation,
            displayText,
            textShape, arcShape,
            i;

        if (startDeg >= 0 && startDeg < 180) {
            glyphRotation = 180;
            displayText = params.text;
        } else {
            glyphRotation = 0;
            displayText = reverse(params.text);
        }
        // add the arc 
        arcShape = new Konva.Arc({
                opacity: 0.3,
                angle: endDeg-startDeg,
                x: this.stageR,
                y: this.stageR,
                outerRadius: (ring+1)*this.ringHeight,
                innerRadius: ring*this.ringHeight,
                fill: '#fff',
                stroke: '#222',
                strokeWidth: 3,
                rotation: startDeg
              });
        arcShape.text = params.text;
        this.arcsGroup.add(arcShape);
        // add the arc's text
        textShape = new Konva.TextPath({
                fill: '#81aa8d',
                fontFamily: 'Assistant',
                text: displayText,
                fontSize: fontSize,
                direction: "rtl",
                x: this.stageR,
                y: this.stageR,
                glyphRotation: glyphRotation,
                data: this.getPath({ring: ring,
                            startDeg: startDeg,
                            endDeg: endDeg,
                            group:this.textsGroup})
            });
        textShape.initialFontSize = fontSize;
        textShape.text = params.text;
        this.textsGroup.add(textShape);
        if (params.onClick != undefined) {
            textShape.on('click', params.onClick);
            arcShape.on('click', params.onClick);
        }
    },
};
