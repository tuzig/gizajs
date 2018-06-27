TARGET=dist

install:
	mkdir -p $(TARGET)/css
	cp -a js $(TARGET)
	cp -a css $(TARGET)
	cp -a images $(TARGET)
	cp -a fonts $(TARGET)
	cp -a favicon.ico $(TARGET)
	cp -a biochronus.css $(TARGET)/css
	cp -a home/index.html $(TARGET)/home.html
	cp -a angleface.js $(TARGET)
	cp -a background.jpg $(TARGET)/images
	cp -a fscreen.js $(TARGET)
	cp -a GitHub-Mark-32px.png $(TARGET)
	cp -a giza.js $(TARGET)
	cp -a index.html $(TARGET)
	cp -a konva.min.js $(TARGET)
	cp -a photoswipe.min.js $(TARGET)
	cp -a photoswipe-ui-default.js $(TARGET)
	cp -a route.min.js $(TARGET)
	cp -a skin.svg $(TARGET)/images

clean:
	rm -rf $(TARGET)

deploy: clean install
	firebase deploy

