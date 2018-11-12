/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva, PhotoSwipe, PhotoSwipeUI_Default, fscreen, AngleFace, firebase, route
*/
/*
 * giza.js - perpetuating lives since 2018
 */
"use strict";

var GalleryLayer = function(params) {
    this.chronus = params.chronus;
    this.stage = params.stage;
    this.bio = params.bio;
    this.layer = new Konva.Layer();
    this.images = [];
};

GalleryLayer.prototype = {
    scale: function (scale) {
        var imageScale = Math.min(scale.x, scale.y);
        for (var i=0; i < this.images.length; i++) {
            this.images[i].x(this.images[i].loc.x*scale.x);
            this.images[i].y(this.images[i].loc.y*scale.y);
            this.images[i].width(this.images[i].spriteFrame.frame.w*imageScale);
            this.images[i].height(this.images[i].spriteFrame.frame.h*imageScale);
            this.images[i].getLayer().draw();
        }	
    },
    zoom: function(photoNumber) {
        var img, start;
        var that = this;

        try {
            img = this.images[photoNumber];
            start = img.position();
        } catch(error) {
            setTimeout(function() {
                that.zoom(photoNumber);
            }, 100);
            return;
        }

        var layer = img.getLayer();

        var scale = this.chronus.calcScale();

        var psImage = this.psImages[photoNumber];
        img.fullImage = new Image(
                        psImage.w, psImage.h);
        img.fullImage.src = psImage.src;

        /* TODO: handle the case where zooming finishes before the image laods 
        img.fullImage.onload = function () {
            img.setImage(this);
        }
        */
        
        var alpha = Math.atan2(psImage.h, psImage.w) - Math.PI;
        var beta = Math.PI - alpha;

        var zoomBy;
        if (psImage.w / psImage.h >
            this.chronus.stage.width() / this.chronus.stage.height())
            zoomBy = this.chronus.stageLen*scale.x*0.7 / img.width();
        else
            zoomBy = this.chronus.stageLen*scale.y*0.7 / img.height();

        var dest = {
            x: this.chronus.stageRadius*scale.x - zoomBy*img.width()/2,
            y: this.chronus.stageRadius*scale.y - zoomBy*img.height()/2,
        };
        var totalDistance = Math.hypot(dest.x-start.x, dest.y-start.y);
        var teta = Math.atan2(dest.y-start.y, dest.x-start.x);
        var anim = new Konva.Animation(function(frame) {
            var duration = 1000,
                dist = totalDistance * frame.timeDiff / duration,
                scale = zoomBy * frame.time / duration;

            img.move({x: Math.cos(teta) * dist,
                      y: Math.sin(teta) * dist});
            /* Playing woth Bezier curve animation
            var handle = {x:0, y:0};
            var duration = 5000,
                prev = (frame.time - frame.timeDiff) / duration,
                now = frame.time / duration;
            var moveTo = zoomAnimation(prev, now, start, handle, dest);
            console.log(prev, now, moveTo);
            img.move(moveTo);
            */
            img.scaleX(scale);
            img.scaleY(scale);

            if (frame.time >=duration) {
                // load the image
                this.stop();
                var colorImage = new Konva.Image({
                    width: img.width()*scale,
                    height: img.height()*scale,
                    strokeWidth: 10,
                    stroke: '#5B946B',
                    image: img.fullImage,
                    shadowColor: 'black',
                    shadowBlur: 10,
                    shadowOffset: {x : 10, y : 10},
                    shadowOpacity: 0.3
                });
                img.hide();
                colorImage.position(img.position());

                layer.add(colorImage);
                layer.draw();
            }
                        
        }, layer);
        layer.moveToTop();

        anim.start();
    },
    draw: function () {
        var that = this;
        var ageRE = /^age_(\d+)/;
        var spriteFrames = this.bio.thumbs.frames;
        var scale = this.chronus.calcScale();
        var	imageScale = Math.min(scale.x, scale.y);


        this.psImages = [];


        // create the array for PhotoSwipe
        for(var i=0; i < spriteFrames.length; i++)
            this.psImages.push(this.bio.images[spriteFrames[i].filename.slice(0,-4)]);

        // create the sprite shhet element
        var spriteSheet = new Image(
                        this.bio.thumbs.meta.width, this.bio.thumbs.meta.width);
        spriteSheet.src = this.bio.thumbs.meta.sprite_url;

        // update stuff
        spriteSheet.onload = function () {
            var ringMin = 5,
                ringMax = 8,
                ring = ringMin,
                i,
                age,
                loc,
                offset = {x:0, y:0},
                img;

            for (i = 0; i < spriteFrames.length; i++) {
                age = Number(spriteFrames[i].filename.match(ageRE)[1]);
                if (age == 0) {
                    loc = getPoint(0, 1);
                    offset = {x: 0, y: 0};
                    /*
                    offset = {x: -0.5 * spriteFrames[i].frame.w*imageScale,
                              y: -0.5 * spriteFrames[i].frame.h*imageScale};
                    */
                }
                else {
                    loc = that.chronus.getPoint(age, ring);
                }
                img = new Konva.Image({
                    x: (loc.x+offset.x)*scale.x,
                    y: (loc.y+offset.y)*scale.y,
                    width: spriteFrames[i].frame.w*imageScale,
                    height: spriteFrames[i].frame.h*imageScale,
                    strokeWidth: 3,
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
                img.chronus = {ring: ring, age: age};
                img.spriteFrame = spriteFrames[i];
                img.loc = loc;
                img.scale = 1;
                img.on('click tap', function () {
                    route('/'+window.chronus.bio.slug+'/photo/'+this.i);
                });
                that.images.push(img);
                var layer = new Konva.Layer();
                layer.add(img);
                that.stage.add(layer);
                layer.draw();
                ring++;
                if (ring === ringMax)
                    ring = ringMin;
            }
        };
    }
};
