/*jslint white: true, browser: true, devel: true,  forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
/*global
 Konva, PhotoSwipe, PhotoSwipeUI_Default, fscreen, AngleFace, firebase, route
*/
/*
 * giza.js - perpetuating lives since 2018
 */
"use strict";
import Chronus from "./chronus";

function initGiza() {
	var fb_config = {
		apiKey: "AIzaSyD0d0qCzvALRaBWdVdgAgrLucodjgWNu0Y",
		authDomain: "bios-tuzig.firebaseapp.com",
		databaseURL: "https://bios-tuzig.firebaseio.com",
		projectId: "bios-tuzig",
		storageBucket: "bios-tuzig.appspot.com",
		messagingSenderId: "710538398471"
	};


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

	function requestFullScreen(element) {
		// Supports most browsers and their versions.
		var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

		if (requestMethod) { // Native full screen.
			requestMethod.call(element);
		}
	}


	function drawMyFamily() {
		var family = [['נויה דאון'],
					  ['ליבי דאון לבית בלודז',
					   'בני דאון'],
					  ['איזבלה בלודז לבית גינסבורג',
					   'דניאל בלודז',
					   'רחל דאון לבית רייכר',
					   'יצחק דאון לבית דואני']
					 ];
		var myFamily = document.getElementById('myFamily');
		var face = new AngleFace({container: 'myFamily',
								  scale: 8,
								  startAngle: 0,
								  rings: 8,
								  endAngle: 360,
								  fullScreen: true,
								  visible: true });
		var arc;getParameterByName('pid');

		face.addBorder();
		for (var r=0; r < family.length; r++) {
			var arcLength = 360 / Math.pow(2, r);
			for (var i=0; i < family[r].length; i++) {
				var name = family[r][i];
				arc = {text: name,
					   ring: (r==0)?0.5:r*3,
					   start: i*arcLength,
					   len: arcLength,
					   onClick: function (ev) {
						  // ev.dial is very usefull
						   route('/'+encodeURIComponent(ev.target.text));
					   }};
				face.addArc(arc);
			}
		}
		face.draw();
		myFamily.style.display = '';
	}

	route('/', function() {
		hideAllElements();
		document.getElementById('home-page').style.display = '';
		document.getElementById('back-to-top').style.display = '';
		$(".home-quote h1").slabText({"viewportBreakpoint":300});
	});

	route('/noya', function() {
		var welcome = document.getElementById('welcome');
		var myFamily = document.getElementById('myFamily');

		welcome.style.display = 'none';
		myFamily.style.display = '';
	});

	function hideAllElements(bio) {
		// hide all elements
		[document.getElementById('myFamily'),
		 document.getElementById('biochronus'),
		 document.getElementById('home-page'),
		 document.getElementById('back-to-top'),
		 document.getElementById('welcome')]
		.forEach(function (elm) {
			if (elm) elm.style.display = 'none';
		});
	}
	function initChronus(slug, cb) {
		hideAllElements();
		if (!window.chronus) {
			window.chronus = new Chronus(
				{container: 'biocFace', visible: true });
			window.addEventListener('resize', resizeBioChronus);
			// fscreen.addEventListener('fullscreenchange', resizeBioChronus);
		}
		if (window.chronus.slug != slug)
			window.chronus.get(slug, cb);
		else
			cb(window.chronus.bio);
	}
	route('/*', function(encodedName) {
		var name = decodeURIComponent(encodedName);
		var loading = document.getElementById("loading");
        loading.style.display = '';
		initChronus(name, function (bio) {
			var welcome = document.getElementById('welcome');
            window.chronus.state = "welcome";
			if (bio.date_of_passing)
				window.chronus.drawMemorial(welcome);
			else
				window.chronus.drawWelcome(welcome);
            loading.style.display = 'none';
			welcome.style.display = '';
			document.getElementsByName('enter').forEach(function (elm) {
				elm.addEventListener("click", function () {
					loading.style.display = '';
					window.chronus.state = "new";
				    fscreen.requestFullscreen(document.body);
				});
			});
		});
	});

	route(function(encodedName, chapter, id) {
        var name = decodeURIComponent(encodedName);
        var loading = document.getElementById("loading");
        loading.style.display = '';
        initChronus(name, function (bio) { 
            var biochronus = document.getElementById('biochronus');

            if (window.chronus.state == "new") {
                window.chronus.draw();
                resizeBioChronus();
            }
            window.chronus.state = chapter;

            biochronus.style.display = '';
            loading.style.display = 'none';

            if (chapter == 'photo') {
                window.chronus.gallery.zoom(Number(id));
            } 
        });
	});


	function resizeBioChronus() {
		var scale = window.chronus.calcScale();
		var loading = document.getElementById("loading");
		loading.style.display = '';
		window.chronus.scale(scale);
		if (window.chronus.state == "new") {
			route('/'+window.chronus.bio.slug+'/bio');
		}
        else
            loading.style.display = 'none';
	}

	// Initialize
	firebase.initializeApp(fb_config);
	route.base('/');
	document.addEventListener("DOMContentLoaded", function() {
		var container = document.getElementById('container');
		var myFamily = document.getElementById('myFamily');

		// -----------------------------
		// needs refactoring
		// drawMyFamily();
		// -----------------------------

		route.start(true);
	});
}
initGiza();
