#!/bin/sh
cd $1
cp ../sample_bio.json bio.json
if [ ! -d thumbs ]
then
    mkdir thumbs
fi
if [ ! -d sprites ]
then
    mkdir sprites
fi
../list_images.py --url $2 . > images.json
find . -maxdepth 1 -name "age_*" -exec convert -monochrome -resize 50 {} thumbs/{} \;
glue --json -o sprites thumbs
cp sprites/* .
rm -rf sprites
rm -rf thumbs
