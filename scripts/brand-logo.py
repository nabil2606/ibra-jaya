"""Olah logo baru Ibra Jaya Trans -> public/assets/brand/ (file asli tidak diubah).

Langkah: hapus nomor telepon (area di bawah garis putih, kanan belah ketupat),
buang bingkai tepi, alpha dari kecerahan (latar hitam) + un-premultiply,
crop rapat, lalu buat varian main/dark/icon/favicon/og + pratinjau.
Pakai: python scripts/brand-logo.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "assets" / "logonew1.jpeg"
OUT = ROOT / "public" / "assets" / "brand"
APP = ROOT / "src" / "app"
DOCS = ROOT / "docs"
OUT.mkdir(parents=True, exist_ok=True)

src = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
H, W, _ = src.shape

# --- 1. Deteksi latar dari 4 sudut (di dalam bingkai) -----------------------
corners = [src[20, 20], src[20, W - 21], src[H - 21, 20], src[H - 21, W - 21]]
bg = np.mean(corners, axis=0)
print("latar sudut:", [tuple(int(v) for v in c) for c in corners])
assert bg.max() < 40, "Latar bukan hitam - metode harus disesuaikan"

img = src.copy()

# --- 2. Buang bingkai tipis di tepi -----------------------------------------
# Cari baris/kolom tepi yang terang (bingkai) lalu hitamkan sampai area latar.
mx = img.max(axis=2)
def edge_depth(profile):
    d = 0
    while d < 40 and profile[d] > 0.02:  # fraksi piksel terang di baris/kolom
        d += 1
    return d + 2
bright = mx > 60
top = edge_depth(bright.mean(axis=1))
bot = edge_depth(bright.mean(axis=1)[::-1])
lef = edge_depth(bright.mean(axis=0))
rig = edge_depth(bright.mean(axis=0)[::-1])
img[:top] = 0; img[H - bot:] = 0; img[:, :lef] = 0; img[:, W - rig:] = 0
print("bingkai dibuang (t,b,l,r):", top, bot, lef, rig)

# --- 3. Lokasi elemen ---------------------------------------------------------
r, g, b = img[..., 0], img[..., 1], img[..., 2]
red = (r > 150) & (g < 90) & (b < 90)
ry, rx = np.where(red)
dia_right = int(rx.max())
dia_bottom = int(ry.max())
red_hex = "#%02X%02X%02X" % tuple(int(v) for v in np.median(img[red], axis=0))
print("belah ketupat bbox:", rx.min(), ry.min(), dia_right, dia_bottom, "merah median:", red_hex)

white = (img.min(axis=2) > 170)
# Garis putih: baris dengan run putih panjang di kanan belah ketupat
cols = slice(dia_right + 20, W - rig - 5)
row_frac = white[:, cols].mean(axis=1)
line_rows = np.where(row_frac > 0.6)[0]
line_bot = int(line_rows.max())
line_top = line_bot
while line_top - 1 in set(line_rows.tolist()):
    line_top -= 1
print("garis putih baris:", line_top, "-", line_bot)

# --- 4. Hapus nomor telepon ---------------------------------------------------
# Area: x dari tepi kanan belah ketupat (+2px) s/d tepi kanan,
#       y dari sedikit di bawah garis (+4px) s/d tepi bawah.
x0, y0 = dia_right + 2, line_bot + 4
phone = img[y0:, x0:]
pys, pxs = np.where(phone.max(axis=2) > 60)
print("nomor telepon bbox:", x0 + pxs.min(), y0 + pys.min(), x0 + pxs.max(), y0 + pys.max())
img[y0:, x0:] = 0
# Verifikasi: area kiri (belah ketupat bawah) tidak tersentuh
assert np.array_equal(img[y0:H - bot, lef:x0], src[y0:H - bot, lef:x0])

# --- 5. Alpha dari kecerahan + un-premultiply -------------------------------
LO, HI = 18.0, 205.0  # di bawah LO = transparan; di atas HI = pekat
m = img.max(axis=2)
alpha = np.clip((m - LO) / (HI - LO), 0, 1)
with np.errstate(divide="ignore", invalid="ignore"):
    rgb = np.where(alpha[..., None] > 0, img / np.maximum(alpha[..., None], 1e-6), 0)
rgb = np.clip(rgb, 0, 255)
# Normalisasi: piksel yang jelas putih -> putih bersih, yang jelas merah -> merah sampel
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
main = Image.fromarray(rgba, "RGBA")

# --- 6. Crop rapat + margin kecil -------------------------------------------
def tight(im: Image.Image, margin_ratio=0.03) -> Image.Image:
    a = np.asarray(im)[..., 3]
    ys, xs = np.where(a > 8)
    x1, y1, x2, y2 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    mg = int(max(x2 - x1, y2 - y1) * margin_ratio)
    out = Image.new("RGBA", (x2 - x1 + 2 * mg, y2 - y1 + 2 * mg), (0, 0, 0, 0))
    out.paste(im.crop((x1, y1, x2, y2)), (mg, mg))
    return out

main_t = tight(main)
main_t.save(OUT / "logo-main.png", optimize=True)
print("logo-main.png", main_t.size)

# --- 7. Versi gelap (latar terang): putih -> #111111, merah tetap ------------
arr = np.asarray(main_t).astype(np.float32)
rr, gg, bb, aa = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
redness = np.clip((rr - np.maximum(gg, bb)) / 180.0, 0, 1)[..., None]
red_rgb = np.array([int(red_hex[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
char = np.array([17, 17, 17], np.float32)
dark_rgb = redness * red_rgb + (1 - redness) * char
dark = Image.fromarray(np.dstack([dark_rgb, aa]).astype(np.uint8), "RGBA")
dark.save(OUT / "logo-dark.png", optimize=True)

# --- 8. Ikon: belah ketupat "IBRA" ------------------------------------------
# Mask = convex hull piksel merah + pita teks IBRA di tengahnya.
full_rgba = np.asarray(main).copy()
mask = Image.new("L", (W, H), 0)
pts = np.column_stack([rx, ry])
# hull sederhana (monotone chain)
def hull(p):
    p = sorted(map(tuple, p))
    def half(seq):
        h = []
        for q in seq:
            while len(h) >= 2 and (h[-1][0]-h[-2][0])*(q[1]-h[-2][1]) - (h[-1][1]-h[-2][1])*(q[0]-h[-2][0]) <= 0:
                h.pop()
            h.append(q)
        return h
    lo, up = half(p), half(p[::-1])
    return lo[:-1] + up[:-1]
sub = pts[:: max(1, len(pts) // 20000)]
ImageDraw.Draw(mask).polygon(hull(sub), fill=255)
# Pita IBRA: baris tanpa merah di tengah belah ketupat, kolom sampai sedikit di luar hull
band_rows = [y for y in range(int(ry.min()), dia_bottom) if not red[y, rx.min():dia_right].any()]
by1, by2 = min(band_rows) - 2, max(band_rows) + 2
ImageDraw.Draw(mask).rectangle([int(rx.min()) - 25, by1, dia_right + 2, by2], fill=255)
mk = np.asarray(mask) > 0
full_rgba[..., 3] = np.where(mk, full_rgba[..., 3], 0)
# Alas arang di dalam mask (seperti latar hitam logo asli) agar "IBRA" putih
# tetap terbaca di latar terang.
backing = np.zeros_like(full_rgba)
backing[..., :3] = 17
backing[..., 3] = np.where(mk, 255, 0)
icon_img = Image.fromarray(backing)
icon_img.alpha_composite(Image.fromarray(full_rgba))
icon = tight(icon_img, 0.04)
side = max(icon.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(icon, ((side - icon.width) // 2, (side - icon.height) // 2))
sq.resize((512, 512), Image.LANCZOS).save(OUT / "logo-icon.png", optimize=True)
sq.resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png", optimize=True)
sq.resize((32, 32), Image.LANCZOS).save(OUT / "icon-32.png")
sq.resize((32, 32), Image.LANCZOS).save(APP / "icon.png")
sq.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
sq.save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
# apple-touch-icon: latar arang (iOS tidak mendukung transparan)
ap = Image.new("RGBA", (180, 180), (17, 17, 17, 255))
ic = sq.resize((150, 150), Image.LANCZOS)
ap.alpha_composite(ic, (15, 15))
ap.convert("RGB").save(OUT / "apple-touch-icon.png")
ap.convert("RGB").save(APP / "apple-icon.png")

# --- 9. Open Graph 1200x630 --------------------------------------------------
og = Image.new("RGBA", (1200, 630), (17, 17, 17, 255))
lw = 920
lg = main_t.resize((lw, round(main_t.height * lw / main_t.width)), Image.LANCZOS)
og.alpha_composite(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2))
og.convert("RGB").save(OUT / "og-image.png", optimize=True)

# --- 10. Pratinjau -------------------------------------------------------------
items = [("logo-main", main_t), ("logo-dark", dark), ("logo-icon", sq)]
bgs = [(17, 17, 17), (255, 255, 255), (250, 247, 242)]
cw, chh = 520, 300
prev = Image.new("RGB", (cw * 3, chh * len(items) + 340), (200, 200, 200))
for i, (_, im) in enumerate(items):
    for j, col in enumerate(bgs):
        cell = Image.new("RGBA", (cw, chh), col + (255,))
        s = min((cw - 40) / im.width, (chh - 40) / im.height)
        t = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        cell.alpha_composite(t, ((cw - t.width) // 2, (chh - t.height) // 2))
        prev.paste(cell.convert("RGB"), (j * cw, i * chh))
# baris favicon 32px (diperbesar 4x nearest agar terlihat) + og
y = chh * len(items) + 10
for j, col in enumerate(bgs):
    cell = Image.new("RGBA", (128, 128), col + (255,))
    cell.alpha_composite(sq.resize((32, 32), Image.LANCZOS).resize((128, 128), Image.NEAREST))
    prev.paste(cell.convert("RGB"), (j * 140 + 10, y))
ogs = og.convert("RGB").resize((600, 315))
prev.paste(ogs, (cw * 3 - 610, y))
prev.save(DOCS / "logo-preview.png")
print("selesai; merah sampel", red_hex)
