"""Generate favicon and logo-icon from favicon.jpg (clean IBRA diamond)."""
import numpy as np
from PIL import Image
import os

SRC = r"z:\Mywebsite\TRAVEL\assets\favicon.jpg"
OUT = r"z:\Mywebsite\TRAVEL\ibra-jaya\public\assets\brand"
APP = r"z:\Mywebsite\TRAVEL\ibra-jaya\src\app"

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print(f"Source: {w}x{h}")

# Remove white background -> transparent
arr = np.array(img)
r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

# White pixels (all channels > 240) -> transparent
is_white = (r > 235) & (g > 235) & (b > 235)
arr[is_white, 3] = 0

# Near-white (anti-alias edges): partial transparency
is_near_white = (r > 200) & (g > 200) & (b > 200) & ~is_white
darkness = 255 - np.minimum(np.minimum(r, g), b)
arr[is_near_white, 3] = np.clip(darkness[is_near_white] * 4, 0, 255).astype(np.uint8)

img_trans = Image.fromarray(arr, 'RGBA')

# Crop to content
bbox = img_trans.getbbox()
if bbox:
    m = 5
    img_trans = img_trans.crop((max(0,bbox[0]-m), max(0,bbox[1]-m), min(w,bbox[2]+m), min(h,bbox[3]+m)))

# Make square
cw, ch = img_trans.size
sq = max(cw, ch)
icon_sq = Image.new('RGBA', (sq, sq), (0,0,0,0))
icon_sq.paste(img_trans, ((sq-cw)//2, (sq-ch)//2))

print(f"Icon square: {sq}x{sq}")

# Save logo-icon-v2.png
icon_sq.save(os.path.join(OUT, "logo-icon-v2.png"), "PNG")

# icon-512
icon_512 = icon_sq.resize((512, 512), Image.LANCZOS)
icon_512.save(os.path.join(OUT, "icon-512-v2.png"), "PNG")
icon_512.save(os.path.join(APP, "icon.png"), "PNG")

# favicon.ico 32x32
icon_32 = icon_sq.resize((32, 32), Image.LANCZOS)
icon_32.save(os.path.join(OUT, "favicon-v2.ico"), format="ICO", sizes=[(32,32)])
icon_32.save(os.path.join(APP, "favicon.ico"), format="ICO", sizes=[(32,32)])

# icon-32 png
icon_32.save(os.path.join(OUT, "icon-32-v2.png"), "PNG")

# apple-touch-icon 180x180 (needs solid bg)
apple = Image.new('RGB', (180, 180), (255, 255, 255))
ic160 = icon_sq.resize((160, 160), Image.LANCZOS)
apple.paste(ic160, (10, 10), ic160)
apple.save(os.path.join(OUT, "apple-touch-icon-v2.png"), "PNG")
apple.save(os.path.join(APP, "apple-icon.png"), "PNG")

print("Done! All favicon/icon files regenerated from favicon.jpg")
