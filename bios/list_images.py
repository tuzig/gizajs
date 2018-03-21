#!/usr/bin/python3
import argparse
import sys
import os
import json
import re
from PIL import Image

AGE_RE = re.compile('age_(\d+)')

o = {}
parser = argparse.ArgumentParser(description=('Process dir of images and'
                       ' output a JSON with the images width and height.'))
parser.add_argument('dir', help='where the age_* files are')
parser.add_argument('--url', help='public url of the images dir')
args = parser.parse_args()

BUCKET_URL = "http://galeds.s3-website.eu-central-1.amazonaws.com/giza/"

for filename in os.listdir(args.dir):
    if not filename.startswith('age_'):
        continue
    im = Image.open(os.path.join(args.dir, filename))
    o[filename] = {
        "src": '/'.join((args.url, filename)),
        "w": im.size[0],
        "h": im.size[1],
    }

sys.stdout.write(json.dumps(o))
