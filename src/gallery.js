/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva, PhotoSwipe, PhotoSwipeUI_Default, fscreen, AngleFace, firebase, route
*/
/*
 * giza.js - perpetuating lives since 2018
 */
"use strict";

export default function GalleryLayer(params) {
    var that = this;
    this.chronus = params.chronus;
    this.stage = params.stage;
    this.bio = params.bio;
    this.layer = new Konva.Layer();
    this.images = [];
    this.zoomedImage = null;
    this.animationOn = false;
    var hammertime = new Hammer(window, {});
    hammertime.get('pan').set({ enable: false});
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });


    hammertime.on('swipeleft', function () {
        if (window.chronus.state == 'zoom' && !that.animationOn)
            that.gotoPrevImage();
    });
    hammertime.on('swiperight', function () {
        if (window.chronus.state == 'zoom' && !that.animationOn)
            that.gotoNextImage();
    });
    hammertime.on('swipeup', function () {
        if (window.chronus.state == 'zoom' && !that.animationOn)
            that.unzoom();
    });
    window.addEventListener('keyup', function(e) {
        if (window.chronus.state == 'zoom' && !that.animationOn) {
            e.preventDefault();
            var next;
            switch(e.key) {

                case "h":
                case "ArrowLeft":
                    that.gotoPrevImage();
                    break;
                case " ":
                case "l":
                case "ArrowRight":
                    that.gotoNextImage();
                    break;
                case "Escape":
                case "ArrowUp":
                    // put it back down
                    that.unzoom();
                    return;
            }
        }
    });
};

GalleryLayer.prototype = {
    gotoPrevImage: function () {
        var prev = this.zoomedImage.i - 1;
        if (prev < 0 ) prev = this.images.length - 1;
        this.gotoPhoto(prev);
    },
    gotoNextImage: function () {
        var next = (this.zoomedImage.i + 1) % this.images.length;
        this.gotoPhoto(next);
    },
    scale: function (scale) {
        for (var i=0; i < this.images.length; i++) {
            this.positionImage(i, scale);
        }	
    },
    positionImage: function (i, scale) {
        var offset,
            imageScale,
            img = this.images[i],
            frame = window.chronus.gallery.images[i].spriteFrame.frame,
            loc = this.chronus.getPoint(img.age, img.ring);

        scale = scale || this.chronus.calcScale();
        offset = {x: -this.chronus.ringHeight*scale.x,
                  y: -this.chronus.ringHeight*scale.y};
        imageScale = Math.min(scale.x, scale.y);

        img.x(loc.x*scale.x + offset.x);
        img.y(loc.y*scale.y + offset.y);
        img.width(frame.w*imageScale);
        img.height(frame.h*imageScale);
        if (img.colorImage) {
            img.colorImage.position({
                x: this.chronus.stageRadius*scale.x - img.colorImage.width()/2,
                y: this.chronus.stageRadius*scale.y - img.colorImage.height()/2,
            });
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
        if (!img .fullImage) {
            img.fullImage = new Image(
                            psImage.w, psImage.h);
            img.fullImage.src = psImage.src;

            img.fullImage.onload = function () {
                if (!that.animationOn) {
                    img.setImage(this);
                    img.getLayer().draw();
                }
            };
        }
        
        var alpha = Math.atan2(psImage.h, psImage.w) - Math.PI;
        var beta = Math.PI - alpha;

        var zoomBy;
        if (psImage.w / psImage.h >
            this.chronus.stage.width() / this.chronus.stage.height())
            zoomBy = this.chronus.stageLen*scale.x*0.9 / img.width();
        else
            zoomBy = this.chronus.stageLen*scale.y*0.9 / img.height();

        var dest = {
            x: this.chronus.stageRadius*scale.x - zoomBy*img.width()/2,
            y: this.chronus.stageRadius*scale.y - zoomBy*img.height()/2,
        };
        this.zoomBy = zoomBy;
        this.zoomDistance = Math.hypot(dest.x-start.x, dest.y-start.y);
        var teta = this.teta = Math.atan2(dest.y-start.y, dest.x-start.x);
        var anim = new Konva.Animation(function(frame) {
            var duration = 1000,
                dist = that.zoomDistance * frame.timeDiff / duration,
                scale = zoomBy * frame.time / duration;

            img.move({x: Math.cos(teta) * dist,
                      y: Math.sin(teta) * dist});
            img.scaleX(scale);
            img.scaleY(scale);

            if (frame.time >=duration) {
                // load the image
                this.stop();
                img.colorImage = new Konva.Image({
                    width: img.width()*scale,
                    height: img.height()*scale,
                    strokeWidth: 10,
                    stroke: '#5B946B',
                    image: img.fullImage || img.getImage(),
                    shadowColor: 'black',
                    shadowBlur: 10,
                    shadowOffset: {x : 10, y : 10},
                    shadowOpacity: 0.3
                });
                that.chronus.state = "zoom";
                that.animationOn = false;
                that.zoomedImage = img;
                
                img.hide();
                img.colorImage.position(img.position());

                layer.add(img.colorImage);
                layer.draw();
            }
                        
        }, layer);
        layer.moveToTop();
        that.animationOn = true;

        anim.start();
    },
    unzoom: function (cb) {
        var that = this;
        var img = this.zoomedImage.colorImage;
        var anim = new Konva.Animation(function(frame) {
            var duration = 1000,
                teta = that.teta + Math.PI,
                dist = that.zoomDistance * frame.timeDiff / duration,
                scale = 1 - (1 - 1/that.zoomBy) * frame.time / duration;

            img.move({x: Math.cos(teta) * dist,
                      y: Math.sin(teta) * dist});
            img.scaleX(scale);
            img.scaleY(scale);

            if (frame.time >=duration) {
                // load the image
                var i = that.zoomedImage.i;
                this.stop();
                img.hide();
                that.zoomedImage.show();
                that.zoomedImage.scaleX(1);
                that.zoomedImage.scaleY(1);
                that.positionImage(i);
                that.chronus.state = "bio";
                that.animationOn = false;
                img.getLayer().draw();
                if (cb) {
                    cb();
                }
            }
                        
        }, img.getLayer());

        that.animationOn = true;
        anim.start();

    },
    gotoPhoto: function (i) {
        var that = this;

        if (this.chronus.state == "zoom")
            this.unzoom(function () {
                that.gotoPhoto(i);
            });
        else
            route('/'+window.chronus.bio.slug+'/photo/'+i);
    },
    draw: function () {
        var that = this;
        var ageRE = /^age_(\d+)/;
        var frames = this.bio.thumbs.frames;
        var scale = this.chronus.calcScale();
        var	imageScale = Math.min(scale.x, scale.y);
        var ringMin = 4,
            ringMax = 8,
            ring = ringMin;


        this.psImages = [];


        // create the array for PhotoSwipe
        for(var i=0; i < frames.length; i++) {
            var img,
                frame = frames[i],
                age = Number(frame.filename.match(ageRE)[1]);
            this.psImages.push(this.bio.images[frame.filename.slice(0,-4)]);
            img = new Konva.Image({
                width: frame.frame.w*imageScale,
                height: frame.frame.h*imageScale,
                strokeWidth: 3,
                stroke: '#5B946B',
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOffset: {x : 10, y : 10},
                shadowOpacity: 0.3
            });
            img.i = i;
            img.age = age;
            img.ring = (age == 0)? 1 : ring;
            img.spriteFrame = frame;
            img.scale = 1;
            img.on('click tap', function () {
                that.gotoPhoto(this.i);
            });
            this.images.push(img);
            var layer = new Konva.Layer();
            layer.add(img);
            that.stage.add(layer);
            ring++;
            if (ring === ringMax)
                ring = ringMin;
        }

        // create the sprite shhet element
        var spriteSheet = new Image(
                        this.bio.thumbs.meta.width, this.bio.thumbs.meta.width);
        spriteSheet.src = this.bio.thumbs.meta.sprite_url;

        // update stuff
        spriteSheet.onload = function () {
            var scale = that.chronus.calcScale(),
                loading = document.getElementById("loading"),
                i,
                loc,
                img;

            for (i = 0; i < frames.length; i++) {
                img =  that.images[i];
                img.setImage(spriteSheet);
                img.crop({
                        width: frames[i].frame.w,
                        height: frames[i].frame.h,
                        x: 0 - frames[i].frame.x,
                        y: 0 - frames[i].frame.y
                });
                img.scale = 1;
                that.positionImage(i);
                img.draw();
                img.on('click tap', function () {
                    that.gotoPhoto(this.i);
                });
            }
            loading.style.display = 'none';
        };
    }
};
