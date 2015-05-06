import re
from PIL import Image
from os import listdir
from os.path import isfile, join

base_w = 52
base_h = 29

# Build an ordered list of image files in the current directory
jpgs = [ f for f in listdir('.') if isfile(join('.',f)) and ".jpg" in f ]
jpgs.sort()

# Move no_image.jpg from the end of the list to the beginning
jpgs.insert(0, jpgs.pop())

# Max protons - largest numbered image, necessary for setting sprite map size
max_protons = int(re.findall(r"\d+",jpgs[len(jpgs)-1])[0])
print("Found " + str(len(jpgs)) + " jpgs, max protons: " + str(max_protons))

# Scaling for each thumb in the sprite (multiplier on minimum size of 52x29)
scale = 4

# Initialize full sprite map image
map_width = base_w * scale
map_height = (base_h * scale) * (max_protons + 1)
sprite_map = Image.new('RGBA', (map_width, map_height), (0, 0, 0, 0))
print("Initialized sprite map: " + str(map_width) + "x" + str(map_height))

# Walk the list of jpgs to scale and add each to the map
for jpg_path in jpgs:

    jpg = Image.open(jpg_path)
    jpg = jpg.resize((base_w * scale, base_h * scale), Image.ANTIALIAS)

    if jpg_path == 'no_image.jpg':
        offset = 0, 0
    else:
        protons = int(re.findall(r"\d+", jpg_path)[0])
        offset = 0, protons * base_h * scale

    print("Pasting " + jpg_path)
    sprite_map.paste(jpg, offset)

# Save the map as a PNG.
print("Writing final sprite map")
sprite_map.save("sprite_map.png")

print("Done.")
