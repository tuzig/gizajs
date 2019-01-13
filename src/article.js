export default function ArticleLayer(params) {
    this.params = params;
    this.stage = params.stage;
    this.theme = params.theme;
    this.layer = new Konva.Layer();
    this.layer.on('click tap', function(ev) {
        ev.evt.stopPropagation();
        window.chronus.article.draw();
    });
    this.layer.getCanvas()._canvas.setAttribute('dir', 'rtl');
    this.stage.add(this.layer);
};


ArticleLayer.prototype = {
    scale: function(scale) {
        this.w = this.stage.width();
        this.h = this.stage.height();
        this.draw(this.text);
    },
    width: function() {
        this.w = this.stage.width();
        return (this.w > 600 / this.theme.articleSize)? 600
               : this.w * this.theme.articleSize;
    },
    draw: function(text) {
        /* draws text in a box. pass a false to clear */
        this.text = text;
        var h, w, pos;
        this.layer.destroyChildren();

        if (text) {

            this.konvaText = new Konva.Text({
                                    x: 0,
                                    y: 0,
                                    text: text,
                                    fontSize: 22,
                                    fontFamily: this.theme.fontFamily,
                                    fill: this.theme.textColor,
                                    width: this.width(),
                                    padding: 20,
                                    align: 'right'
            });
            h = this.konvaText.getHeight();
            w = this.konvaText.getWidth();

            pos = {x: (this.w - w) / 2,
                   y: (this.stage.height() - h) / 2};
            if (pos.y < 200) {
                this.oldStageHeight = this.stage.height();
                this.stage.height(this.stage.height()+h-650);
                pos.y = 200;
            }

            this.konvaBox = new Konva.Rect({
              stroke: this.theme.stroke_color,
              strokeWidth: 5,
              fill: this.theme.fill_color,
              width: w,
              height: h,
              shadowColor: 'black',
              shadowBlur: 20,
              shadowOffset: {x : 10, y : 10},
              shadowOpacity: 0.3,
              cornerRadius: 10
            });

            this.konvaBack = new Konva.Rect({
              fill: this.theme.fill_color,
              width: this.w,
              height: this.stage.height(),
              opacity: 0.4
            });
            // fix the position based on size so it'll be centerd


            this.konvaText.position(pos);
            this.konvaBox.position(pos);
            this.layer.add(this.konvaBack);
            this.layer.add(this.konvaBox);
            this.layer.add(this.konvaText);
            this.layer.moveToTop();
        }
        else {
            if (this.oldStageHeight) this.stage.height(this.oldStageHeight);
        }
        this.layer.draw();
    }
};


