"""Build JDZ Sector from SVG-style polygon outlines.

Glyphs live as 1000-unit contours in this file; the same contours are emitted
as an SVG specimen so the design can be reviewed/edited without a font editor.

Run:
  python tools/build-font.py
"""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".tools"))

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

UPM = 1000
CAP = 720
STROKE = 165
W = 660
ADV = 700

OUT = ROOT / "public" / "fonts"
DESIGN = ROOT / "design" / "jdz-sector"
OUT.mkdir(parents=True, exist_ok=True)
DESIGN.mkdir(parents=True, exist_ok=True)


def chamfer(x0, y0, x1, y1, c):
    """Clockwise chamfered rectangle."""
    return [
        (x0 + c, y1),
        (x1 - c, y1),
        (x1, y1 - c),
        (x1, y0 + c),
        (x1 - c, y0),
        (x0 + c, y0),
        (x0, y0 + c),
        (x0, y1 - c),
    ]


def box(x0, y0, x1, y1, c=0):
    if c:
        return chamfer(x0, y0, x1, y1, c)
    return [(x0, y0), (x0, y1), (x1, y1), (x1, y0)]


def poly(*pts):
    return list(pts)


class HoleContour(list):
    """Marker so the builder flips this contour against the solid fill."""


def hole(points):
    return HoleContour(reversed(points))


def signed_area(points):
    total = 0
    for i, (x0, y0) in enumerate(points):
        x1, y1 = points[(i + 1) % len(points)]
        total += x0 * y1 - x1 * y0
    return total / 2


def oriented(points, clockwise):
    points = list(points)
    if (signed_area(points) < 0) != clockwise:
        points.reverse()
    return points


def glyph(*contours):
    cleaned = []
    for c in contours:
        if len(c) < 3:
            continue
        cleaned.append(oriented(c, clockwise=not isinstance(c, HoleContour)))
    return cleaned


# Every glyph is a list of contours. Outer/solid contours are clockwise;
# counters are appended reversed so the TrueType nonzero fill punches holes.
G = {}

G[" "] = (400, [])
G["I"] = (400, glyph(box(110, 0, 290, CAP, 24)))
G["H"] = (ADV, glyph(box(30, 0, 195, CAP, 24), box(465, 0, 630, CAP, 24), box(195, 285, 465, 430)))
G["T"] = (ADV, glyph(box(30, 570, 630, CAP, 34), box(240, 0, 420, 590, 18)))
G["L"] = (ADV, glyph(box(30, 0, 195, CAP, 24), box(30, 0, 630, 150, 28)))
G["E"] = (ADV, glyph(box(30, 0, 195, CAP, 24), box(30, 570, 630, CAP, 34), box(30, 300, 560, 420, 16), box(30, 0, 630, 145, 26)))
G["F"] = (ADV, glyph(box(30, 0, 195, CAP, 24), box(30, 570, 630, CAP, 34), box(30, 300, 545, 420, 16)))
G["N"] = (ADV, glyph(box(30, 0, 195, CAP, 24), box(465, 0, 630, CAP, 24), poly((30, CAP), (200, CAP), (630, 0), (460, 0))))
G["Z"] = (ADV, glyph(box(30, 570, 630, CAP, 34), box(30, 0, 630, 150, 30), poly((450, 570), (630, 570), (210, 150), (30, 150))))
G["X"] = (ADV, glyph(poly((30, CAP), (200, CAP), (630, 0), (460, 0)), poly((460, CAP), (630, CAP), (200, 0), (30, 0))))
G["V"] = (ADV, glyph(poly((30, CAP), (200, CAP), (330, 175), (460, CAP), (630, CAP), (430, 0), (230, 0))))
G["Y"] = (ADV, glyph(poly((30, CAP), (200, CAP), (315, 430), (430, CAP), (600, CAP), (390, 350), (390, 0), (240, 0), (240, 350))))
G["A"] = (ADV, glyph(
    poly((30, 0), (30, 430), (180, CAP), (480, CAP), (630, 430), (630, 0), (465, 0), (465, 255), (195, 255), (195, 0)),
    hole(poly((250, 400), (330, 565), (410, 400))),
))
G["B"] = (ADV, glyph(
    poly((30, 0), (30, CAP), (450, CAP), (600, 575), (600, 445), (545, 360), (600, 285), (600, 125), (450, 0)),
    hole(poly((200, 405), (410, 405), (435, 430), (435, 535), (410, 560), (200, 560))),
    hole(poly((200, 155), (410, 155), (435, 180), (435, 300), (410, 325), (200, 325))),
))
G["C"] = (ADV, glyph(poly((630, CAP), (180, CAP), (30, 570), (30, 150), (180, 0), (630, 0), (630, 165), (210, 165), (210, 555), (630, 555))))
G["D"] = (ADV, glyph(
    poly((30, 0), (30, CAP), (450, CAP), (630, 540), (630, 180), (450, 0)),
    hole(poly((200, 165), (200, 555), (410, 555), (465, 500), (465, 220), (410, 165))),
))
G["G"] = (ADV, glyph(poly((630, CAP), (180, CAP), (30, 570), (30, 150), (180, 0), (630, 0), (630, 150), (210, 150), (210, 555), (630, 555)), box(390, 300, 630, 430, 20), box(520, 0, 630, 430, 20)))
G["J"] = (ADV, glyph(poly((390, CAP), (585, CAP), (585, 170), (490, 65), (170, 65), (75, 160), (75, 300), (250, 300), (270, 270), (390, 270))))
G["K"] = (ADV, glyph(box(30, 0, 195, CAP, 24), poly((195, 360), (195, 525), (630, CAP), (630, 555)), poly((195, 360), (195, 195), (630, 0), (630, 165))))
G["M"] = (780, glyph(
    box(30, 0, 195, CAP, 24),
    box(465, 0, 630, CAP, 24),
    poly((30, CAP), (195, CAP), (330, 240), (165, 240)),
    poly((465, CAP), (630, CAP), (495, 240), (330, 240)),
))
G["O"] = (ADV, glyph(chamfer(30, 0, 630, CAP, 120), hole(chamfer(200, 160, 460, 560, 70))))
G["P"] = (ADV, glyph(
    poly((30, 0), (30, CAP), (450, CAP), (600, 565), (600, 395), (450, 250), (200, 250), (200, 0)),
    hole(poly((200, 400), (420, 400), (450, 430), (450, 535), (420, 565), (200, 565))),
))
G["Q"] = (ADV, glyph(chamfer(30, 0, 630, CAP, 120), hole(chamfer(200, 160, 460, 560, 70)), poly((390, 190), (620, -60), (650, 105), (500, 265))))
G["R"] = (ADV, glyph(
    poly((30, 0), (30, CAP), (450, CAP), (600, 565), (600, 395), (450, 250), (330, 250), (630, 0), (430, 0), (250, 250), (200, 250), (200, 0)),
    hole(poly((200, 400), (420, 400), (450, 430), (450, 535), (420, 565), (200, 565))),
))
G["S"] = (ADV, glyph(
    box(30, 570, 630, CAP, 36),
    box(30, 390, 180, 570, 18),
    box(30, 270, 630, 390, 18),
    box(480, 120, 630, 270, 18),
    box(30, 0, 630, 120, 32),
))
G["U"] = (ADV, glyph(poly((30, 0), (30, CAP), (195, CAP), (195, 160), (465, 160), (465, CAP), (630, CAP), (630, 120), (495, 0), (165, 0))))
G["W"] = (780, glyph(*[[(x, CAP - y) for x, y in c] for c in G["M"][1]]))

# Digits
G["0"] = G["O"]
G["1"] = (ADV, glyph(box(240, 0, 420, CAP, 24), poly((240, CAP), (420, CAP), (420, 570), (300, 615))))
G["2"] = (ADV, glyph(box(30, 570, 630, CAP, 34), box(450, 400, 630, 600, 24), box(30, 280, 630, 405, 14), box(30, 145, 195, 300, 16), box(30, 0, 630, 150, 30)))
G["3"] = (ADV, glyph(box(30, 570, 630, CAP, 34), box(450, 400, 630, 600, 24), box(30, 280, 630, 405, 14), box(450, 120, 630, 300, 20), box(30, 0, 630, 150, 30)))
G["4"] = (ADV, glyph(box(30, 280, 195, 720, 20), box(440, 0, 610, 720, 20), box(30, 280, 610, 405, 14)))
G["5"] = (ADV, glyph(box(30, 570, 630, CAP, 34), box(30, 400, 195, 600, 16), box(30, 280, 630, 405, 14), box(450, 120, 630, 300, 20), box(30, 0, 630, 150, 30)))
G["6"] = (ADV, glyph(box(30, 0, 195, CAP, 24), box(30, 570, 630, CAP, 34), box(30, 280, 630, 405, 14), box(450, 120, 630, 300, 20), box(30, 0, 630, 150, 30)))
G["7"] = (ADV, glyph(box(30, 570, 630, CAP, 34), poly((430, 570), (630, 570), (310, 0), (120, 0))))
G["8"] = G["B"]
G["9"] = (ADV, glyph(poly((30, 0), (30, 300), (180, CAP), (630, CAP), (630, 150), (450, 0), (195, 0)), hole(poly((200, 400), (450, 400), (465, 430), (465, 550), (450, 570), (200, 570))), hole(poly((200, 160), (450, 160), (465, 185), (465, 300), (450, 325), (200, 325)))))

# Punctuation
G["."] = (400, glyph(box(140, 0, 280, 140, 18)))
G[","] = (400, glyph(box(150, -90, 290, 120, 18)))
G[":"] = (400, glyph(box(140, 420, 280, 560, 18), box(140, 0, 280, 140, 18)))
G["/"] = (460, glyph(poly((20, -40), (180, -40), (430, 760), (270, 760))))
G["-"] = (460, glyph(box(40, 280, 420, 410, 16)))
G["+"] = (460, glyph(box(40, 280, 420, 410, 14), box(165, 155, 295, 535, 14)))
G["?"] = (ADV, glyph(box(30, 570, 630, CAP, 34), box(450, 400, 630, 600, 24), box(300, 240, 470, 420, 20), box(300, 0, 470, 150, 18)))
G["!"] = (400, glyph(box(140, 220, 280, CAP, 18), box(140, 0, 280, 140, 18)))
G["'"] = (300, glyph(box(100, 520, 220, 760, 12)))

CLOSE = str.maketrans({"<": "&lt;", ">": "&gt;", "&": "&amp;"})


def draw_glyph(pen, contours):
    for pts in contours:
        pen.moveTo(pts[0])
        for p in pts[1:]:
            pen.lineTo(p)
        pen.closePath()


def build():
    glyph_order = [".notdef"] + [f"uni{ord(ch):04X}" for ch in G]
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(glyph_order)

    glyphs = {}
    hmtx = {}
    notdef = oriented([(30, 0), (630, 0), (630, CAP), (30, CAP)], clockwise=True)
    specs = [(".notdef", 400, [notdef])]
    specs += [(f"uni{ord(ch):04X}", advance, contours) for ch, (advance, contours) in G.items()]
    for name, advance, contours in specs:
        pen = TTGlyphPen(None)
        draw_glyph(pen, contours)
        glyphs[name] = pen.glyph()
        minx = min((p[0] for c in contours for p in c), default=0)
        hmtx[name] = (advance, minx)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(hmtx)
    fb.setupHorizontalHeader(ascent=900, descent=-220, lineGap=0)

    cmap = {}
    for ch in G:
        cmap[ord(ch)] = f"uni{ord(ch):04X}"
        if ch.isalpha():
            cmap[ord(ch.lower())] = f"uni{ord(ch):04X}"
    fb.setupCharacterMap(cmap)

    names = {
        "familyName": "JDZ Sector",
        "styleName": "Black",
        "uniqueFontIdentifier": "JDZ Sector Black 1.000",
        "fullName": "JDZ Sector Black",
        "psName": "JDZSector-Black",
        "version": "Version 1.000",
        "copyright": "Designed for JDZone. SVG-origin outlines.",
    }
    fb.setupNameTable(names)
    fb.setupOS2(
        sTypoAscender=900,
        sTypoDescender=-220,
        sTypoLineGap=0,
        usWinAscent=900,
        usWinDescent=220,
        sxHeight=520,
        sCapHeight=720,
        usWeightClass=900,
        fsSelection=0b100000,
    )
    fb.setupPost(keepGlyphNames=True, underlinePosition=-80, underlineThickness=40, isFixedPitch=0)
    fb.setupMaxp()
    fb.font["head"].macStyle |= 0b1

    ttf_path = OUT / "jdz-sector.ttf"
    woff_path = OUT / "jdz-sector.woff2"
    fb.save(ttf_path)
    font = TTFont(ttf_path)
    font.flavor = "woff2"
    font.save(woff_path)

    # SVG specimen: the same contours, so the source is editable and reviewable.
    cell = 760
    cols = 7
    rows = (len(G) + cols - 1) // cols
    width = cols * cell
    height = rows * cell + 220
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="#05080c"/>',
        f'<text x="40" y="80" fill="#e8f33c" font-family="monospace" font-size="20" letter-spacing="6">JDZ SECTOR / BLACK / SVG GLYPH SHEET</text>',
    ]
    for idx, (ch, (_, contours)) in enumerate(G.items()):
        col = idx % cols
        row = idx // cols
        ox = col * cell + 80
        oy = row * cell + 170
        scale = 0.58
        d = []
        for pts in contours:
            d.append("M" + " L".join(f"{ox + x * scale:.1f},{oy + (CAP - y) * scale:.1f}" for x, y in pts) + " Z")
        parts.append(
            f'<path d="{" ".join(d)}" fill="#f2f5f7" fill-rule="evenodd"/>'
        )
        parts.append(
            f'<text x="{ox}" y="{oy + CAP * scale + 44}" fill="#8d99a5" font-family="monospace" font-size="18">{ch.translate(CLOSE)}  {G[ch][0]}</text>'
        )
    parts.append("</svg>")
    (DESIGN / "glyph-sheet.svg").write_text("\n".join(parts), encoding="utf-8")

    print(f"TTF  {ttf_path} ({ttf_path.stat().st_size} bytes)")
    print(f"WOFF2 {woff_path} ({woff_path.stat().st_size} bytes)")
    print(f"SVG  {DESIGN / 'glyph-sheet.svg'}")


if __name__ == "__main__":
    build()
