"use strict";
import TableLayer from "./table";
import ArticleLayer from "./article";
import GalleryLayer from "./gallery";

export default function Chronus (params) {
    this.params = params;
    this.state = "new";
    this.stageLen = 1000,
    this.stageRadius = this.stageLen / 2,
    this.ringHeight = this.stageRadius / 12.5,
    // todo: create the welcome and biochronus here and simplif index.html
    this.welcome = document.getElementById('welcome');
    
    this.stage = new Konva.Stage(params);
    this.scale(this.calcScale());
};

Chronus.prototype = {
    totalDeg: 350,
	theme: {
		fontFamily: 'Assistant',
		stroke_color: '#81aa8d',
		textColor: '#fffadf',
		fill_color: '#5B946B',
		cardColor: '#5B946B',
		articleSize: 0.8 // 1 is for full screen
	},
    getPoint: function (age, ring) {
        var rad = (age*this.years2deg-90) * Math.PI / 180;
        return {
            x: this.stageRadius+Math.round(Math.cos(rad)*this.ringHeight*ring),
            y: this.stageRadius+Math.round(Math.sin(rad)*this.ringHeight*ring)
        };
    },
    calcScale: function () {
        return {x: (window.innerWidth) / this.stageLen,
                y: (window.innerHeight * 0.92) / this.stageLen};
    },
    clear: function() {
        // clear the chronus display
        if (this.table)
            this.table.layer.destroyChildren();
        if (this.gallery)
            this.gallery.layer.destroyChildren();
    },
    scale: function(scale) {
        if (this.state == "welcome")
            return;

        this.stage.width(this.stageLen * scale.x);
        this.stage.height(this.stageLen * scale.y );
        if (this.table) this.table.scale(scale);
        if (this.gallery) this.gallery.scale(scale);
        if (this.article) this.article.scale(scale);
        this.stage.draw();
    },
    setMaxAge: function(age) {
		// TODO: these are globals, yacks!
		this.maxAge = age || 120; 
		this.years2deg = this.totalDeg / this.maxAge;
	},

    get: function(slug, cb) {
        // get a bio and display the chronus
        var that = this;
        // TODO: loading....
        this.readBio(slug, function (bio) {
            that.clear();
            that.slug = slug;
            that.bio = bio;
            document.title = bio.full_name;
            // TODO: that one is still a global make it a property
            var lastYear = parseInt(bio.date_of_passing.match(/\d{4}$/));
            var firstYear = parseInt(bio.date_of_birth.match(/\d{4}$/))
            if (!lastYear)
               lastYear = (new Date()).getFullYear();
            that.setMaxAge(lastYear - firstYear );
            var i, name, ring, layer, ringPeriods;

            // TODO: make the name konva based
            // TODO: create that element on object init
            var header = document.getElementById('biocHeader');
            header.innerHTML = '<h1>' + bio.full_name + '</h1>';
            that.createLayers({stage: that.stage,
                               bio: bio,
                               chronus: that,
                               theme: that.theme});
            cb(bio);
        });
    },
    createLayers: function(layerParams) {
        this.table = new TableLayer(layerParams);
        this.gallery = new GalleryLayer(layerParams);
        this.article = new ArticleLayer(layerParams);
    },
    draw: function() {
        this.table.draw();
        if (this.bio.thumbs)
            this.gallery.draw();
        this.stage.draw();
    },
    drawWelcome: function(container) {
        var section, elm;

        container.innerHTML='';
       
        section = document.createElement('section');
        section.style.paddingTop = '3em';
        section.className = 'centered welcome';
        elm = document.createElement('h1');
        elm.innerHTML = this.bio.full_name;
        section.appendChild(elm);
        elm = document.createElement('img');
        elm.width = 400;
        elm.src = this.bio.cover_photo;
        elm.alt = 'cover photo for '+this.bio.first_name;
        section.appendChild(elm);
        container.appendChild(section);
        section = document.createElement('section');
        section.style.textAlign = 'center';
        section.style.width = '100%';
        elm = document.createElement('button');
        elm.setAttribute('name', 'enter');
        elm.className = 'enter';
        elm.style.backgroundColor = theme.fill_color;
        elm.style.color = theme.textColor;
        elm.innerHTML = "הכנסו";
        section.appendChild(elm);
        container.appendChild(section);
        section = document.createElement('footer');
        section.className = 'centered';
        section.innerHTML = '\
            <div style="clear:both"></div>\
            <a href="https://github.com/daonb/biochronus"><img src="GitHub-Mark-32px.png" alt="GitHub logo"></a>';
        container.appendChild(section);
    },
    drawMemorial: function(container) {
        var section, elm, elm;

        container.innerHTML='';
       
        section = document.createElement('section');
        section.style.paddingTop = '3em';
        section.className = 'centered';
        elm = document.createElement('h1');
        elm.innerHTML = this.bio.full_name;
        section.appendChild(elm);
        if (this.bio.date_of_birth_he) {
            elm = document.createElement('h2');
            elm.className = 'hebrew-date';
            elm.innerHTML = this.bio.date_of_birth_he + ' - ' + this.bio.date_of_passing_he;
            section.appendChild(elm);
        }
        elm = document.createElement('h2');
        elm.style.direction = 'ltr';
        elm.innerHTML = this.bio.date_of_birth + ' - ' + this.bio.date_of_passing;
        section.appendChild(elm);
        elm = document.createElement('h2');
        elm.innerHTML = '&#10048;';
        section.appendChild(elm);
        elm = document.createElement('h2');
        elm.innerHTML = (this.bio.sex=='F')?'תהי נשמתה צרורה':'תהי נשמתו צרורה';
        section.appendChild(elm);
        elm = document.createElement('h2');
        elm.innerHTML = 'בצרור החיים';
        section.appendChild(elm);
        container.appendChild(section);
        /* begining of left section */
        var height = section.offsetHeight;
        section = document.createElement('section');
        section.className = 'centered';
        elm = document.createElement('img');
        elm.width = 400;
        elm.src = this.bio.cover_photo;
        elm.alt = 'cover photo for '+this.bio.first_name;
        section.appendChild(elm);
        container.appendChild(section);
        /* begining of bottom button section */
        section = document.createElement('section');
        section.style.textAlign = 'center';
        section.style.width = '100%';
        elm = document.createElement('button');
        elm.setAttribute('name', 'enter');
        elm.className = 'enter';
        elm.style.backgroundColor = theme.fill_color;
        elm.style.color = theme.textColor;
        elm.innerHTML = "הכנסו";
        section.appendChild(elm);
        container.appendChild(section);
        section = document.createElement('footer');
        section.className = 'centered';
        section.innerHTML = '\
            <div style="clear:both"></div>\
            <a href="https://github.com/daonb/biochronus"><img src="/images/GitHub-Mark-32px.png" alt="GitHub logo"></a>';
        container.appendChild(section);
    },
    showDescription: function(shape) {
        this.article.draw(shape.doc.description);
    },
    readBio: function(slug, cb) {
		// save the data we got. For now, it's the entire database as 
		// an array of bios.
		var ref = firebase.database().ref('bios/'+slug);
		ref.on('value', function (snapshot) {
			var bio = snapshot.val();
			bio.slug = slug;
			var spans = [];
			// to make it easier on the display we translate the spans into
			// an array of ring arrays.
			if (bio.spans !== undefined) {
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
			cb(bio);
		});
	}
};
/* end of Chronus */


