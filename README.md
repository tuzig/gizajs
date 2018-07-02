# giza.js

    In memory of Giza Goldfarb, @daonb's grandmother may her soul rest in peace

This is a shot at displaying a *Bio Chronus* - a life's chronology in
single screen.

The code draws arcs, labels and images on an HTML5 canvas, making it simple and
fast to scale and transition. We are following the KISS methodology keeping 
the number of libs to the bare minimum. Here is what we have:

- [Konva.js](https://github.com/daonb/konva) for the canvas 
- [PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) to display images
- [riot/route](https://github.com/riot/route) for url routing


## Running a dev server

```bash

$ npm install live-server
$ node server.js
```

## Testing

```bash

$ cd test
$ pipenv shell
$ python tests.py
```


## Contribuiting

Just fork, fix or/and improve and open a Pull Request. If you're not sure where to
start there are always a few open issues marked [good first
issue](https://github.com/daonb/biochronus/labels/good%20first%20issue).

Many 
