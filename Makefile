clean:
	rm -rf build
	mkdir build

build: clean
	cp angleface.js build
	ln -s ../bios build
	cp background.jpg build
	cp fscreen.js build
	cp GitHub-Mark-32px.png build
	cp giza.js build
	cp index.html build
	cp konva.min.js build
	cp photoswipe.min.js build
	cp photoswipe-ui-default.js build
	cp route.min.js build
	cp skin.svg build
	cp style.css build

deploy: clean build
	firebase deploy
