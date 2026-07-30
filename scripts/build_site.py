#!/usr/bin/env python3
"""Build the deployable static portfolio with metadata and generated brand assets."""

from __future__ import annotations

import binascii
import re
import shutil
import struct
import zlib
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
OUT = ROOT / "_site"
ASSETS = OUT / "assets"

SITE_URL = "https://ghobi-a.github.io/Portfolio/"
SOCIAL_URL = f"{SITE_URL}assets/social-preview.png"

INK = (11, 13, 12)
PAPER = (232, 230, 223)
GRID = (218, 215, 206)
SAGE = (88, 100, 89)
RUST = (168, 68, 46)
LINE = (183, 179, 168)

FONT = {
    "A": ("01110","10001","10001","11111","10001","10001","10001"),
    "B": ("11110","10001","10001","11110","10001","10001","11110"),
    "C": ("01111","10000","10000","10000","10000","10000","01111"),
    "D": ("11110","10001","10001","10001","10001","10001","11110"),
    "E": ("11111","10000","10000","11110","10000","10000","11111"),
    "F": ("11111","10000","10000","11110","10000","10000","10000"),
    "G": ("01111","10000","10000","10111","10001","10001","01111"),
    "H": ("10001","10001","10001","11111","10001","10001","10001"),
    "I": ("11111","00100","00100","00100","00100","00100","11111"),
    "J": ("00111","00010","00010","00010","10010","10010","01100"),
    "K": ("10001","10010","10100","11000","10100","10010","10001"),
    "L": ("10000","10000","10000","10000","10000","10000","11111"),
    "M": ("10001","11011","10101","10101","10001","10001","10001"),
    "N": ("10001","11001","10101","10011","10001","10001","10001"),
    "O": ("01110","10001","10001","10001","10001","10001","01110"),
    "P": ("11110","10001","10001","11110","10000","10000","10000"),
    "Q": ("01110","10001","10001","10001","10101","10010","01101"),
    "R": ("11110","10001","10001","11110","10100","10010","10001"),
    "S": ("01111","10000","10000","01110","00001","00001","11110"),
    "T": ("11111","00100","00100","00100","00100","00100","00100"),
    "U": ("10001","10001","10001","10001","10001","10001","01110"),
    "V": ("10001","10001","10001","10001","10001","01010","00100"),
    "W": ("10001","10001","10001","10101","10101","11011","10001"),
    "X": ("10001","10001","01010","00100","01010","10001","10001"),
    "Y": ("10001","10001","01010","00100","00100","00100","00100"),
    "Z": ("11111","00001","00010","00100","01000","10000","11111"),
    "0": ("01110","10001","10011","10101","11001","10001","01110"),
    "1": ("00100","01100","00100","00100","00100","00100","01110"),
    "2": ("01110","10001","00001","00010","00100","01000","11111"),
    "3": ("11110","00001","00001","01110","00001","00001","11110"),
    "4": ("00010","00110","01010","10010","11111","00010","00010"),
    "5": ("11111","10000","10000","11110","00001","00001","11110"),
    "6": ("01110","10000","10000","11110","10001","10001","01110"),
    "7": ("11111","00001","00010","00100","01000","01000","01000"),
    "8": ("01110","10001","10001","01110","10001","10001","01110"),
    "9": ("01110","10001","10001","01111","00001","00001","01110"),
    "-": ("00000","00000","00000","11111","00000","00000","00000"),
    "/": ("00001","00010","00010","00100","01000","01000","10000"),
    ".": ("00000","00000","00000","00000","00000","00110","00110"),
    ",": ("00000","00000","00000","00000","00110","00110","00100"),
    ":": ("00000","00110","00110","00000","00110","00110","00000"),
    " ": ("00000",)*7,
}


def require_replace(text: str, old: str, new: str) -> str:
    if old not in text:
        raise RuntimeError(f"Expected source marker not found: {old[:80]!r}")
    return text.replace(old, new, 1)


def polish_html(source: str) -> str:
    html = source
    html = require_replace(html, '<html lang="en">', '<html lang="en-GB">')

    patterns = [
        r'<meta name="description"[^>]*>\n?',
        r'<meta name="theme-color"[^>]*>\n?',
        r'<meta property="og:title"[^>]*>\n?',
        r'<meta property="og:description"[^>]*>\n?',
        r'<meta property="og:type"[^>]*>\n?',
        r'<title>[^<]*</title>\n?',
    ]
    for pattern in patterns:
        html, count = re.subn(pattern, "", html, count=1)
        if count != 1:
            raise RuntimeError(f"Expected one metadata element matching {pattern!r}, found {count}")

    metadata = f"""<meta name="description" content="Ghobikan Aravindan's applied data science portfolio: evaluated machine-learning systems, behavioural demand intelligence, privacy auditing and deployed data products.">
<meta name="author" content="Ghobikan Aravindan">
<meta name="robots" content="index, follow">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#E8E6DF">
<link rel="canonical" href="{SITE_URL}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">

<meta property="og:title" content="Ghobikan Aravindan — Applied Data Scientist">
<meta property="og:description" content="Data products that turn messy signals into defensible decisions.">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE_URL}">
<meta property="og:site_name" content="Ghobikan Aravindan — Data Science Portfolio">
<meta property="og:locale" content="en_GB">
<meta property="og:image" content="{SOCIAL_URL}">
<meta property="og:image:secure_url" content="{SOCIAL_URL}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Ghobikan Aravindan, Applied Data Scientist — portfolio case file preview">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Ghobikan Aravindan — Applied Data Scientist">
<meta name="twitter:description" content="Data products that turn messy signals into defensible decisions.">
<meta name="twitter:image" content="{SOCIAL_URL}">
<meta name="twitter:image:alt" content="Ghobikan Aravindan, Applied Data Scientist — portfolio case file preview">

<title>Ghobikan Aravindan — Applied Data Scientist</title>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ghobikan Aravindan",
  "jobTitle": "Applied Data Scientist",
  "url": "{SITE_URL}",
  "email": "mailto:ghobikan15@hotmail.co.uk",
  "sameAs": [
    "https://github.com/Ghobi-A",
    "https://www.linkedin.com/in/ghobi/"
  ],
  "alumniOf": [
    {{
      "@type": "CollegeOrUniversity",
      "name": "City St George's, University of London"
    }}
  ],
  "knowsAbout": [
    "Python",
    "SQL",
    "Machine Learning",
    "Natural Language Processing",
    "Differential Privacy",
    "Data Engineering",
    "MLOps"
  ]
}}
</script>
"""
    viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    html = require_replace(html, viewport, viewport + metadata)

    css_polish = """
  .skip-link {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 100;
    padding: 10px 14px;
    background: var(--ink);
    color: var(--paper);
    text-decoration: none;
    transform: translateY(-160%);
    transition: transform 0.15s ease;
  }
  .skip-link:focus { transform: translateY(0); }
  h1, h2, h3 { text-wrap: balance; }
  p { text-wrap: pretty; }
"""
    html = require_replace(html, '  a { color: inherit; }\n', '  a { color: inherit; }\n' + css_polish)

    html = require_replace(
        html,
        '<body>\n\n<div class="noise"></div>',
        '<body>\n\n<a class="skip-link" href="#projects">Skip to selected work</a>\n<div class="noise" aria-hidden="true"></div>',
    )
    html = require_replace(html, '<section class="hero">', '<main>\n<section class="hero">')
    html = require_replace(
        html,
        '</section>\n\n<footer id="contact">',
        '</section>\n</main>\n\n<footer id="contact">',
    )

    def external_link(match: re.Match[str]) -> str:
        tag = match.group(0)
        if "target=" in tag:
            return tag
        return tag[:-1] + ' target="_blank" rel="noopener noreferrer">'

    html = re.sub(r'<a\b[^>]*\bhref="https?://[^"]+"[^>]*>', external_link, html)
    return html


def fill_rect(buf: bytearray, width: int, height: int, x0: int, y0: int, x1: int, y1: int, rgb: tuple[int, int, int]) -> None:
    x0, x1 = sorted((max(0, x0), min(width, x1)))
    y0, y1 = sorted((max(0, y0), min(height, y1)))
    row = bytes(rgb) * max(0, x1 - x0)
    for y in range(y0, y1):
        start = (y * width + x0) * 3
        buf[start:start + len(row)] = row


def stroke_rect(buf: bytearray, width: int, height: int, box: tuple[int, int, int, int], rgb: tuple[int, int, int], thickness: int = 1) -> None:
    x0, y0, x1, y1 = box
    fill_rect(buf, width, height, x0, y0, x1, y0 + thickness, rgb)
    fill_rect(buf, width, height, x0, y1 - thickness, x1, y1, rgb)
    fill_rect(buf, width, height, x0, y0, x0 + thickness, y1, rgb)
    fill_rect(buf, width, height, x1 - thickness, y0, x1, y1, rgb)


def draw_text(buf: bytearray, width: int, height: int, x: int, y: int, text: str, scale: int, rgb: tuple[int, int, int], tracking: int = 1) -> None:
    cursor = x
    for char in text.upper():
        glyph = FONT.get(char, FONT[" "])
        for row_idx, row in enumerate(glyph):
            for col_idx, on in enumerate(row):
                if on == "1":
                    fill_rect(
                        buf, width, height,
                        cursor + col_idx * scale,
                        y + row_idx * scale,
                        cursor + (col_idx + 1) * scale,
                        y + (row_idx + 1) * scale,
                        rgb,
                    )
        cursor += 5 * scale + tracking * scale


def png_bytes(width: int, height: int, pixels: bytearray) -> bytes:
    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", binascii.crc32(kind + data) & 0xFFFFFFFF)

    raw = bytearray()
    row_bytes = width * 3
    for y in range(height):
        raw.append(0)
        start = y * row_bytes
        raw.extend(pixels[start:start + row_bytes])

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), level=9))
        + chunk(b"IEND", b"")
    )


def make_social_preview() -> bytes:
    width, height = 1200, 630
    buf = bytearray(bytes(PAPER) * width * height)

    for x in range(60, width, 120):
        fill_rect(buf, width, height, x, 0, x + 1, height, GRID)
    for y in range(60, height, 90):
        fill_rect(buf, width, height, 0, y, width, y + 1, GRID)

    stroke_rect(buf, width, height, (38, 38, 1162, 592), INK, 3)
    fill_rect(buf, width, height, 38, 124, 1162, 127, INK)
    stroke_rect(buf, width, height, (70, 66, 430, 109), RUST, 3)
    draw_text(buf, width, height, 88, 76, "OPEN INVESTIGATION", 3, RUST, 1)
    draw_text(buf, width, height, 906, 76, "CASE GA-DS-01", 3, SAGE, 1)

    draw_text(buf, width, height, 74, 178, "GHOBIKAN ARAVINDAN", 9, INK, 1)
    draw_text(buf, width, height, 76, 274, "APPLIED DATA SCIENTIST", 6, SAGE, 1)
    draw_text(buf, width, height, 76, 364, "MESSY SIGNALS / DEFENSIBLE DECISIONS", 4, INK, 1)

    fill_rect(buf, width, height, 72, 452, 1128, 454, LINE)
    draw_text(buf, width, height, 76, 482, "METHODS", 3, RUST, 1)
    draw_text(buf, width, height, 76, 522, "PYTHON / SQL / ML / NLP", 2, INK, 1)
    draw_text(buf, width, height, 500, 482, "FOCUS", 3, RUST, 1)
    draw_text(buf, width, height, 500, 522, "EVALUATION / PRIVACY", 2, INK, 1)
    draw_text(buf, width, height, 900, 482, "LOCATION", 3, RUST, 1)
    draw_text(buf, width, height, 900, 522, "LONDON, UK", 3, INK, 1)

    for offset in range(54):
        fill_rect(buf, width, height, 1108 + offset, 38, 1162, 39 + offset, RUST)

    return png_bytes(width, height, buf)


def make_touch_icon() -> bytes:
    width = height = 180
    buf = bytearray(bytes(PAPER) * width * height)
    stroke_rect(buf, width, height, (8, 8, 172, 172), INK, 4)
    stroke_rect(buf, width, height, (24, 24, 156, 156), RUST, 3)
    draw_text(buf, width, height, 41, 56, "GA", 12, INK, 1)
    fill_rect(buf, width, height, 43, 138, 137, 142, SAGE)
    return png_bytes(width, height, buf)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    source_html = SOURCE.read_text(encoding="utf-8")
    polished_html = polish_html(source_html)

    if OUT.exists():
        shutil.rmtree(OUT)
    ASSETS.mkdir(parents=True)

    (OUT / "index.html").write_text(polished_html, encoding="utf-8")

    cv_source = ROOT / "assets" / "Ghobikan-Aravindan-CV.pdf"
    if not cv_source.is_file():
        raise FileNotFoundError(f"Portfolio CV asset is missing: {cv_source}")
    shutil.copy2(cv_source, ASSETS / cv_source.name)

    (ASSETS / "social-preview.png").write_bytes(make_social_preview())
    (ASSETS / "apple-touch-icon.png").write_bytes(make_touch_icon())
    (ASSETS / "favicon.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="8" fill="#E8E6DF"/>
<rect x="5" y="5" width="54" height="54" rx="5" fill="none" stroke="#0B0D0C" stroke-width="3"/>
<path d="M17 21h13v5h-7v12h7v5H17zM34 21h13v22h-6v-7h-5v7h-6zm2 5v5h5v-5z" fill="#A8442E"/>
</svg>
""",
        encoding="utf-8",
    )

    (OUT / "404.html").write_text(
        """<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=index.html">
  <title>Opening portfolio…</title>
  <script>window.location.replace(new URL("index.html", window.location.href).href);</script>
</head>
<body>
  <p>Opening <a href="index.html">Ghobikan Aravindan’s portfolio</a>…</p>
</body>
</html>
""",
        encoding="utf-8",
    )

    (OUT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}sitemap.xml\n",
        encoding="utf-8",
    )
    (OUT / "sitemap.xml").write_text(
        f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{SITE_URL}</loc>
    <lastmod>{date.today().isoformat()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
""",
        encoding="utf-8",
    )
    (OUT / ".nojekyll").write_text("", encoding="utf-8")

    print(f"Built polished portfolio at {OUT}")


if __name__ == "__main__":
    main()
