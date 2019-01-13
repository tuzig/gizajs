TARGET=dist

test:
	npm run test

dev:
	npm run dev

install:
	npm install

build:
	mkdir -p $(TARGET)/css
	mkdir -p $(TARGET)/lib
	webpack --mode production -o $(TARGET)/lib/giza.js
	cp -a lib $(TARGET)
	cp -a css $(TARGET)
	cp -a images $(TARGET)
	cp -a fonts $(TARGET)
	cp -a index.html $(TARGET)

clean:
	rm -rf $(TARGET)

deploy: clean build
	firebase deploy

