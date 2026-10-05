"""
Process logonew1.jpeg: remove phone number, remove background, generate variants.
V2: precise phone number removal based on pixel analysis.
"""

import numpy as np
from PIL import Image
import os

SRC = r"z:\Mywebsite\TRAVEL\assets\logonew1.jpeg"
OUT = r"z:\Mywebsite\TRAVEL\ibra-jaya\public\assets\brand"
DOCS = r"z:\Mywebsite\TRAVEL\ibra-jaya\docs"
APP = r"z:\Mywebsite\TRAVEL\ibra-jaya\src\app"

os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
w, h = img.size
arr = np.array(img)
print(f"Source: {w}x{h}")

# === STEP 1: Remove phone number ===
# From pixel analysis:
#   - White horizontal line (logo element): y ≈ 628, spans x=142..1431
#   - Phone number "081230666300": y ≈ 640..728, x ≈ 400..1430
#   - Below the horizontal line, there's the phone text and some residual diamond pixels
# We want to keep: car silhouette (top), diamond+IBRA (left), Jaya Trans (right), horizontal line
# We want to remove: phone number below the line

# Method: paint black everything below y=635 that is to the right of x=430
# (left side below line has bottom of red diamond which we keep)
phone_y_start = 635
for y in range(phone_y_start, h):
    for x in range(430, w):
        arr[y, x] = [0, 0, 0]

# Also clean up the area below the diamond bottom (left side, below y=748)
for y in range(748, h):
    for x in range(0, 430):
        arr[y, x] = [0, 0, 0]

img_clean = Image.fromarray(arr)
print("Phone number removed")

# === STEP 2: Remove black background → transparent ===
arr_f = arr.astype(np.float64)
max_ch = np.max(arr_f, axis=2)

# Alpha from brightness: dark=transparent, bright=opaque
# Ramp: below 20 → transparent, above 60 → opaque
alpha = np.clip((max_ch - 15) / 45 * 255, 0, 255).astype(np.uint8)

# Un-premultiply to recover true colors
safe_alpha = np.maximum(alpha.astype(np.float64), 1)
r = np.clip(arr_f[:,:,0] * 255.0 / safe_alpha, 0, 255).astype(np.uint8)
g = np.clip(arr_f[:,:,1] * 255.0 / safe_alpha, 0, 255).astype(np.uint8)
b = np.clip(arr_f[:,:,2] * 255.0 / safe_alpha, 0, 255).astype(np.uint8)

# Red pixels: keep original color, fully opaque
is_red = (arr_f[:,:,0] > 80) & (arr_f[:,:,1] < 70) & (arr_f[:,:,2] < 70)
r[is_red] = arr[is_red, 0]
g[is_red] = arr[is_red, 1]
b[is_red] = arr[is_red, 2]
alpha[is_red] = 255

# White/bright pixels: keep original, fully opaque
is_bright = max_ch > 150
r[is_bright] = arr[is_bright, 0]
g[is_bright] = arr[is_bright, 1]
b[is_bright] = arr[is_bright, 2]
alpha[is_bright] = 255

# Semi-bright (anti-aliased edges): partial opacity
is_edge = (max_ch > 40) & (max_ch <= 150)
# Scale alpha for these
alpha[is_edge] = np.clip(max_ch[is_edge] * 255 / 200, 50, 255).astype(np.uint8)
r[is_edge] = arr[is_edge, 0]
g[is_edge] = arr[is_edge, 1]
b[is_edge] = arr[is_edge, 2]

rgba = np.dstack([r, g, b, alpha])
img_trans = Image.fromarray(rgba, mode='RGBA')

# Crop to content
bbox = img_trans.getbbox()
if bbox:
    m = 10  # margin
    img_trans = img_trans.crop((max(0, bbox[0]-m), max(0, bbox[1]-m), min(w, bbox[2]+m), min(h, bbox[3]+m)))

tw, th = img_trans.size
print(f"Transparent: {tw}x{th}")

# === Save logo-main-v2.png ===
img_trans.save(os.path.join(OUT, "logo-main-v2.png"), "PNG")
print("✓ logo-main-v2.png")

# === logo-dark-v2.png: white→#111 ===
arr_d = np.array(img_trans)
light = (arr_d[:,:,0] > 170) & (arr_d[:,:,1] > 170) & (arr_d[:,:,2] > 170) & (arr_d[:,:,3] > 50)
arr_d[light, 0:3] = [0x11, 0x11, 0x11]
# Also convert gray/semi-white to dark
gray = (arr_d[:,:,0] > 100) & (arr_d[:,:,1] > 100) & (arr_d[:,:,2] > 100) & ~is_red[:th,:tw] & (arr_d[:,:,3] > 50)
arr_d[gray, 0:3] = [0x11, 0x11, 0x11]
img_dark = Image.fromarray(arr_d, mode='RGBA')
img_dark.save(os.path.join(OUT, "logo-dark-v2.png"), "PNG")
print("✓ logo-dark-v2.png")

# === logo-icon-v2.png: diamond+car portion ===
# Left 45% = diamond area + car above
icon_crop = img_trans.crop((0, 0, int(tw * 0.40), th))
iw, ih = icon_crop.size
sq = max(iw, ih)
icon_sq = Image.new('RGBA', (sq, sq), (0, 0, 0, 0))
icon_sq.paste(icon_crop, ((sq-iw)//2, (sq-ih)//2))
icon_sq.save(os.path.join(OUT, "logo-icon-v2.png"), "PNG")
print(f"✓ logo-icon-v2.png ({sq}x{sq})")

# === Favicons ===
icon_512 = icon_sq.resize((512, 512), Image.LANCZOS)
icon_512.save(os.path.join(OUT, "icon-512-v2.png"), "PNG")
icon_512.save(os.path.join(APP, "icon.png"), "PNG")

icon_32 = icon_sq.resize((32, 32), Image.LANCZOS)
icon_32.save(os.path.join(OUT, "favicon-v2.ico"), format="ICO", sizes=[(32,32)])
icon_32.save(os.path.join(APP, "favicon.ico"), format="ICO", sizes=[(32,32)])

apple = Image.new('RGB', (180, 180), (17, 17, 17))
ic180 = icon_sq.resize((160, 160), Image.LANCZOS)
apple.paste(ic180, (10, 10), ic180)
apple.save(os.path.join(OUT, "apple-touch-icon-v2.png"), "PNG")
apple.save(os.path.join(APP, "apple-icon.png"), "PNG")
print("✓ favicon, icon-32, icon-512, apple-touch-icon")

# === og-image-v2.png ===
og = Image.new('RGB', (1200, 630), (17, 17, 17))
sc = 300 / img_trans.size[1]
logo_og = img_trans.resize((int(img_trans.size[0]*sc), 300), Image.LANCZOS)
ox = (1200 - logo_og.size[0]) // 2
oy = (630 - 300) // 2
og.paste(logo_og, (ox, oy), logo_og)
og.save(os.path.join(OUT, "og-image-v2.png"), "PNG")
print("✓ og-image-v2.png")

# === Preview ===
pw, ph = 1200, 400
preview = Image.new('RGB', (pw, ph))
pp = pw // 3
bgs = [(17,17,17), (255,255,255), (250,247,242)]
logos = [img_trans, img_dark, img_dark]
for i, (bg, lv) in enumerate(zip(bgs, logos)):
    panel = Image.new('RGBA', (pp, ph), bg + (255,))
    mh = int(ph * 0.55)
    sc = mh / lv.size[1]
    lw2 = int(lv.size[0] * sc)
    lr = lv.resize((lw2, mh), Image.LANCZOS)
    panel.paste(lr, ((pp-lw2)//2, (ph-mh)//2), lr)
    preview.paste(panel.convert('RGB'), (i*pp, 0))
preview.save(os.path.join(DOCS, "logo-preview.png"), "PNG")
print("✓ logo-preview.png")

print("\n✅ All done!")
