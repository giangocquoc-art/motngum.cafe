import sys
from pathlib import Path

import fitz
from PIL import Image, ImageDraw

pdf_path = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)
pdf = fitz.open(pdf_path)
for index, page in enumerate(pdf, start=1):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pix.save(out_dir / f"page-{index:03}.png")

pages = [Image.open(out_dir / f"page-{i:03}.png").convert("RGB") for i in range(1, len(pdf) + 1)]
thumb_w = 310
thumbs = []
for i, image in enumerate(pages, start=1):
    thumb_h = round(image.height * thumb_w / image.width)
    thumb = image.resize((thumb_w, thumb_h))
    canvas = Image.new("RGB", (thumb_w + 20, thumb_h + 36), "white")
    ImageDraw.Draw(canvas).text((10, 8), f"Trang {i}", fill="black")
    canvas.paste(thumb, (10, 26))
    thumbs.append(canvas)
for sheet_no, start in enumerate(range(0, len(thumbs), 4), start=1):
    group = thumbs[start:start + 4]
    sheet_h = max(t.height for t in group)
    sheet = Image.new("RGB", ((thumb_w + 20) * len(group), sheet_h), "#eeeeee")
    for col, thumb in enumerate(group):
        sheet.paste(thumb, (col * (thumb_w + 20), 0))
    sheet.save(out_dir / f"contact-sheet-{sheet_no:03}.png")
print(f"Rendered {len(pdf)} pages to {out_dir}")
