TARGET=dist

install: clean
	mkdir -p $(TARGET)/css
	cp -r home/js $(TARGET)
	cp -r home/images $(TARGET)
	ln -s ../bios $(TARGET)              # link to local content
	cp style.css $(TARGET)/css
	cp home/css/*.css $(TARGET)/css
	cp home/index.html $(TARGET)/home.html
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

clean:
	rm -rf $(TARGET)

deploy: install
	firebase deploy

