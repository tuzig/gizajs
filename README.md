# BioChronus

Licensed under GPLv2, a bit of javascript code to display a life's story.
Using [Konva.js](https://github.com/konvajs/konva), a thin HTML5 canvas to
display life's spans, photos thumbnails and images - using 
[PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe).

Other than that it's all plain javascript, without even jQuery to help.
If you're not sure how to do things in plain js, please use
(plainjs)[https://plainjs.com/] for samples and instruction.

## creating your own BioChronus

The biochronus gets his data from a single json file. This file contains the
personal data, life's spans and the images. You're invited to fork the project
and start working on your own local file which will be automaticlly loaded
and override grandma giza bio. 

```
$ cd bios
$ cp giza.js local.js
$ [edit local.js and make it your own]
$ firefox index.html
```

## Contribuiting

Just fork, fix|improve and open a Pull Request. If you're not sure where to
start there are always a few open issues marked [good first
issue](https://github.com/daonb/biochronus/labels/good%20first%20issue).
