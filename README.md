# giza.js

    In memory of Giza Goldfarb, @daonb's grandmother may her sole rest in peace

This is a shot at displaying a *Bio Chronus* - a life's story in single screen.

The code draws arcs, labels and images on an HTML5 canvas, making it simple and
fast to scale and transition. We are following the KISS methodology keeping 
the number of libs to the bare minimum. Currently we're down to two great
turtles: [Konva.js](https://github.com/konvajs/konva) for the canvas and
[PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) to display the images.

## Creating your Bio-Chronus

If you have a family member, a friend or a hero you want to perpetuate you are
invited to fork this project and make a Bio-Choruns for your hero.
It's still pretty rough - you have to be able to
edit json files and publish directories to cloud storage.

### Installing Dependencies

We need just a little bit of off-line scripting and we use python for it.
Like all sane humans, we are using [pipenv](https://docs.pipenv.org/)
to manage our python enviornment. Once you have it installed just run
`pypenv shell` and you'll be ready to start.

If things break on you (and most chances they will) please **Don't Panic**
and open an issue.  Please detail what you tried to do what you expected 
and what you got instead making it easy to recreate the problem.


### Collecting the images

After electing the first person you want to perpetuate you need to research 
his life sory and get his images in digital format. Collect them under 
`bios/local`. Use the file manager to view the files and rename them to 
`age_<age>_<serial>` (F2 rules). Once you've dates all the images you want
to upload open a shell at the project root and run:

```bash
$ cd bios
$ ./build.sh local <public url of the images folder>
		age_14.jpg added to sprite
		age_2.jpg added to sprite
		age_41.jpg added to sprite
Processing 'thumbs':
Format 'json' for sprite 'thumbs' needs rebuild...
Format 'img' for sprite 'thumbs' needs rebuild...
```

The script creates 4 new files: a bios sample, and images dictionary,
a thumbs sprite and thumbs json.

```
bios/local
|  thumbs.png
|  thumbs.json
|  images.json
|  bio.json
|  age_41.jpg
|  age_14.jpg
|  age_2.jpg
```

### Adding the text

In the above dir you got a `bio.json` file. This is a sample that the build
script copied in for you to use as a base. Edit it and key in the personal details
and the life spans of your hero.

## Runing it locally

To run it locally you need a simple http server, like 
`python3 -m http.server`. Once the server is running, point your browser 
at http://localhost:8000 and start playing with gizajs.

## Contribuiting

Just fork, fix|improve and open a Pull Request. If you're not sure where to
start there are always a few open issues marked [good first
issue](https://github.com/daonb/biochronus/labels/good%20first%20issue).
