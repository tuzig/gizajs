#!/bin/sh
cd $1
if [ ! -d thumbs ]
then
    mkdir thumbs
fi
../list_images.py --url $2 . > images.json
find . -maxdepth 1 -name "age_*" -exec convert -size 50 {} thumbs/{} \;
glue --json --json-format hash thumbs sprites
cp sprites/* .
rm -rf sprites
rm -rf thumbs
