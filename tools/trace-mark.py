"""Trace the reference's top-left JDZ mark into a clean SVG.

The reference is a 1672x941 render. The mark is acid-yellow on a dark field, so
a colour threshold isolates it; contours are polygon-approximated and emitted as
a single currentColor path with even-odd counters.
"""

from pathlib import Path
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".tools"))

import cv2
import numpy as np

# The user-supplied reference is not committed (it is a large raster).
# Point REFERENCE_IMAGE at it when re-tracing the mark.
SRC = Path(os.environ.get("REFERENCE_IMAGE", ROOT / "design" / "reference" / "cinematic.jpg"))
if not SRC.exists():
    raise SystemExit(f"Reference image not found: {SRC}\nSet REFERENCE_IMAGE to the 1672x941 source image.")
OUT = ROOT / "public" / "brand" / "jdz-mark.svg"
OUT.parent.mkdir(parents=True, exist_ok=True)

img = cv2.imread(str(SRC))
# top-left strip containing the mark but not the wordmark
crop = img[12:96, 42:250]
b, g, r = cv2.split(crop)
mask = ((r > 70) & (g > 70) & (b < 0.8 * g) & (g > b * 1.4)).astype(np.uint8) * 255
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))

contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
if not contours:
    raise SystemExit("no yellow mark found")

ys, xs = np.where(mask > 0)
x0, x1 = xs.min(), xs.max()
y0, y1 = ys.min(), ys.max()
pad = 2
x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
x1, y1 = min(mask.shape[1] - 1, x1 + pad), min(mask.shape[0] - 1, y1 + pad)

paths = []
for idx, contour in enumerate(contours):
    area = cv2.contourArea(contour)
    if area < 8:
        continue
    eps = 0.8
    approx = cv2.approxPolyDP(contour, eps, True).reshape(-1, 2)
    if len(approx) < 3:
        continue
    pts = [f"{int(x - x0)},{int(y - y0)}" for x, y in approx]
    paths.append("M" + " L".join(pts) + "Z")
    print(f"  contour {idx}: area={area:.0f}, points={len(approx)}, hierarchy={hierarchy[0][idx].tolist()}")

w, h = x1 - x0 + 1, y1 - y0 + 1
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
    f'role="img" aria-label="JDZ">\n'
    f'  <path fill="#E8F33C" fill-rule="evenodd" d="{" ".join(paths)}"/>\n'
    f"</svg>\n"
)
OUT.write_text(svg, encoding="utf-8")
print(f"{OUT} viewBox 0 0 {w} {h}, {len(paths)} contours, {OUT.stat().st_size} bytes")
