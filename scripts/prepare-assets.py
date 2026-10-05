"""Menyiapkan aset dari ../assets ke public/assets (tidak mengubah file asli)."""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "assets"
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)


def find(prefix: str) -> Path:
    return next(SRC.glob(prefix + "*.jpg"))


def save(img: Image.Image, name: str, widths=(640, 1280, 1920)):
    img = img.convert("RGB")
    img.save(OUT / f"{name}.jpg", quality=88)
    for w in widths:
        if img.width >= w:
            img.resize((w, round(img.height * w / img.width))).save(OUT / f"{name}-{w}.webp", quality=80)
    img.save(OUT / f"{name}.webp", quality=82)


# Logo
logo = Image.open(find("Logo_ibra_jaya"))
save(logo, "logo", widths=(512,))
logo.convert("RGB").crop((190, 270, 860, 720)).save(OUT / "logo-crop.webp", quality=90)
# Ikon: kompas + bus
icon = logo.convert("RGB").crop((190, 270, 860, 568))
side = max(icon.size)
canvas = Image.new("RGB", (side, side), (255, 255, 255))
canvas.paste(icon, ((side - icon.width) // 2, (side - icon.height) // 2))
canvas.resize((512, 512)).save(ROOT / "src" / "app" / "icon.png")
canvas.resize((180, 180)).save(ROOT / "src" / "app" / "apple-icon.png")
# Open Graph 1200x630
og = Image.new("RGB", (1200, 630), (255, 255, 255))
l = logo.convert("RGB").crop((150, 220, 880, 730)).resize((860, 600))
og.paste(l, (170, 15))
og.save(OUT / "og-image.jpg", quality=88)

# Armada garasi: crop tanpa papan harga kiri, blur papan kecil di dinding
g = Image.open(find("Vehicles_available_for_rent")).convert("RGB")
wall = g.crop((380, 300, 640, 322)).resize((1, 1), Image.BOX).getpixel((0, 0))
g.paste(Image.new("RGB", (140, 74), wall).filter(ImageFilter.GaussianBlur(2)), (433, 320))
g = g.crop((350, 150, g.width, g.height))
save(g, "armada-garasi", widths=(640, 1200))

save(Image.open(find("Microbus_interior")), "interior-microbus", widths=(640, 1200))
save(Image.open(find("Making_image_of_car")), "hiace", widths=(640, 1200))
save(Image.open(find("Make_first_image_realistic")), "ilustrasi-bengkel", widths=(640, 1200))

# Warna dari logo
px = logo.convert("RGB")
for label, xy in {"teks": (230, 650), "biru": (600, 305), "oranye": (500, 528)}.items():
    print(label, "#%02x%02x%02x" % px.getpixel(xy))
