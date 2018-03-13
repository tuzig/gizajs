# giza.js

    In memory of Giza Goldfarb, @daonb's grandmother may her sole rest in peace

This is a shot at displaying a life's story in a circle on an HTML5 canvas 
using [Konva.js](https://github.com/konvajs/konva) and
[PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) to display the photos.
Giza.js uses personal data, a breakdown of life's spans and images to draw
the canvas.

## creating your own BioChronus

The biochronus gets its data from a public url containins image files and 
three json files:

- bio.json
- images.json
- thumbs.json

There is a sample under the bios directory and it's probably best to start by
copying it to a fresh dir.  You need to edit the bio file using your favorite
editor. The images.json is generated using an include python script -
/scripts/list_images.py. It's only depndecy is Pillow so before runnig install
Pillow using `sudo pip3 install Pillow` and then run:

```
    $ scripts/list_images.py --url <public dir url> <images dir> > images.json
```

We use a sprite sheet to hold all the thumbnails and
[glue](https://github.com/jorgebastida/glue) the generate the
sheet and the acompanying thumbs.json:

```
    $ cd <image_dir>
    $ mkdir thumbs
    $ find . -maxdepth 1 -name "age_*" -exec convert -size 50 {} thumbs/{} \;
    $ glue --json --json-format hash thumbs sprites
```

The find command is used to locate all the files and convert them to a size no
longer than 50 and store the images under the thumb dir.  The glue commands 
collect all those fresh thumbs and build a sprite sheet and a json file named
thumbs.


## Contribuiting

Just fork, fix|improve and open a Pull Request. If you're not sure where to
start there are always a few open issues marked [good first
issue](https://github.com/daonb/biochronus/labels/good%20first%20issue).
