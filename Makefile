TARGET=dist

install:
	rm -rf $(TARGET)
	mkdir -p $(TARGET)/css
	cp style.css $(TARGET)/css
	cp home/css/*.css $(TARGET)/css
	ln -s ../bios $(TARGET)              # link to local content
	cp angleface.js $(TARGET)
	cp background.jpg $(TARGET)
	cp fscreen.js $(TARGET)
	cp GitHub-Mark-32px.png $(TARGET)
	cp giza.js $(TARGET)
	cp index.html $(TARGET)
	cp konva.min.js $(TARGET)
	cp photoswipe.min.js $(TARGET)
	cp photoswipe-ui-default.js $(TARGET)
	cp route.min.js $(TARGET)
	cp skin.svg $(TARGET)

deploy: install
	firebase deploy
