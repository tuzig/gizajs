# giza.js

    In memory of Giza Goldfarb, @daonb's grandmother may her sole rest in peace

This is a shot at displaying a *Bio Chronus* - a life's chronology in
single screen.

The code draws arcs, labels and images on an HTML5 canvas, making it simple and
fast to scale and transition. We are following the KISS methodology keeping 
the number of libs to the bare minimum. Currently we're down to two 
[Konva.js](https://github.com/konvajs/konva) for the canvas and
[PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) to display the images.

## Creating your Bio-Chronus

If you have a family member, a friend or a hero you want to perpetuate please
fork the repo and make a Bio-Choruns for your hero.
   
    **WARNING:** We are still in alpha, things are likely to change and even
    break

### Installing Dependencies

We have just one simple python with a single dependency: Pillow. We also need
[Glue](), a python based cli commands the glues images together to create sprite
sheets. We are using [pipenv](https://docs.pipenv.org/)

If things break on you (and most chances they will) please **Don't Panic**
and open an issue.  Please detail what you tried to do what you expected 
and what you got instead making it easy to recreate the problem.


### Collecting the images

After electing the first person you want to perpetuate you need to research 
his life sory and get his images in digital format. Create a `local` directiory
under `bios` and store the images there (`/bios/local` in gitignore so it
won't be added to the repository).  When you're done collecting use
the file manager to view the files and rename(F2) them to `age_<age>_<serial>`.
Once all the images you want have valid names, open a shell at the project
root and run:

```bash
$ pushd bios
$ pipenv shell
$ ./build.sh local <public url of the images folder>
		age_14.jpg added to sprite
		age_2.jpg added to sprite
		age_41.jpg added to sprite
Processing 'thumbs':
Format 'json' for sprite 'thumbs' needs rebuild...
Format 'img' for sprite 'thumbs' needs rebuild...
$ popd
```

The script creates 4 new files: a bios sample, and images dictionary,
a thumbs sprite and thumbs json.

```
$ cd bios/local
$ ls -rt
...
bio.json
images.json
thumbs.png
thumbs.json
```

### Adding the text

In the above dir you got a `bio.json` file. This is a sample that the build
script copied in for you to use as a base. Edit it and key in the personal details
and the life spans of your hero.

## Runing it locally

To run it locally you need the simplest http server, like 
`python3 -m http.server`. Once the server is running, point your browser 
at http://localhost:8000 and start playing with your giza.

## Contribuiting

Just fork, fix|improve and open a Pull Request. If you're not sure where to
start there are always a few open issues marked [good first
issue](https://github.com/daonb/biochronus/labels/good%20first%20issue).
