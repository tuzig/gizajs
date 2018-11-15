TARGET=dist

test:
	npm run test

dev:
	npm run dev

install:
	npm install

build:
	mkdir -p $(TARGET)/css
	cp -a js $(TARGET)
	cp -a css $(TARGET)
	cp -a images $(TARGET)
	cp -a fonts $(TARGET)
	cp -a angleface.js $(TARGET)
	cp -a fscreen.js $(TARGET)
	cp -a giza.js $(TARGET)
	cp -a index.html $(TARGET)
	cp -a konva.min.js $(TARGET)
	cp -a photoswipe.min.js $(TARGET)
	cp -a photoswipe-ui-default.js $(TARGET)
	cp -a route.min.js $(TARGET)

clean:
	rm -rf $(TARGET)

deploy: clean build
	firebase deploy

