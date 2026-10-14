#!/usr/bin/env python3
"""Render compact visual specimens for Korean AutoCAD SHX fonts.

Ingests one or more .SHX files or directories supplied on the command line,
decodes them with the shared AutoCAD SHX parser, and writes small SVG/PNG
contact sheets plus a JSON summary. This is an exploratory inspection tool:
the generated specimen folders are not inputs to the p5 apps or SVG font
export pipeline.
"""

from __future__ import annotations

import argparse
import html
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path


HANGUL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = HANGUL_ROOT.parent
sys.path.insert(0, str(REPO_ROOT / "autocad_sxh_fonts" / "python"))

from shx_decoder import SHXDocument, ShapeRecord, decode_file, svg_path_data  # noqa: E402


# Prefer recognizable Hangul samples when a font contains encoded Korean glyphs.
SAMPLE_CHARS = "가나다라마바사아자차카타파하한글한국건축도면서울"


def glyph_char(record: ShapeRecord, doc: SHXDocument) -> str | None:
    """Return the printable Unicode character represented by a shape record."""
    char = record.unicode_char(doc.likely_font())
    if char and char.isprintable() and not char.isspace():
        return char
    return None


def char_priority(char: str) -> int:
    """Rank characters so Hangul appears before ASCII/CJK miscellany."""
    code = ord(char)
    if 0xAC00 <= code <= 0xD7A3:
        return 0
    if 0x3130 <= code <= 0x318F:
        return 1
    if 0x1100 <= code <= 0x11FF or 0xA960 <= code <= 0xA97F or 0xD7B0 <= code <= 0xD7FF:
        return 2
    if 0x20 <= code <= 0x7E:
        return 3
    if 0x4E00 <= code <= 0x9FFF or 0x3400 <= code <= 0x4DBF:
        return 4
    return 5


def select_records(doc: SHXDocument, limit: int = 40) -> list[ShapeRecord]:
    """Choose a compact, representative set of records for a specimen sheet."""
    by_char = {}
    for record in doc.records:
        char = glyph_char(record, doc)
        if char and record.paths:
            by_char.setdefault(char, record)

    selected = []
    seen = set()
    for char in SAMPLE_CHARS:
        record = by_char.get(char)
        if record and record.code not in seen:
            selected.append(record)
            seen.add(record.code)

    candidates = []
    for index, record in enumerate(doc.records):
        if record.code == 0 or not record.paths or record.code in seen:
            continue
        char = glyph_char(record, doc)
        if char:
            candidates.append((char_priority(char), index, record))
        elif doc.format_kind != "bigfont":
            candidates.append((6, index, record))

    for _, _, record in sorted(candidates, key=lambda item: (item[0], item[1])):
        selected.append(record)
        seen.add(record.code)
        if len(selected) >= limit:
            break

    return selected[:limit]


def record_label(record: ShapeRecord, doc: SHXDocument) -> str:
    """Build the small text label shown above each specimen cell."""
    char = glyph_char(record, doc)
    if char:
        return f"{char} {record.code:04X}"
    if record.name:
        return f"{record.name} {record.code:04X}"
    return f"{record.code:04X}"


def bbox_for_records(records: list[ShapeRecord]) -> dict[str, float]:
    """Return a combined bounding box for a set of decoded shape records."""
    boxes = [record.bbox for record in records if record.bbox]
    if not boxes:
        return {"min_x": 0.0, "min_y": 0.0, "max_x": 1.0, "max_y": 1.0}
    return {
        "min_x": min(box["min_x"] for box in boxes),
        "min_y": min(box["min_y"] for box in boxes),
        "max_x": max(box["max_x"] for box in boxes),
        "max_y": max(box["max_y"] for box in boxes),
    }


def render_svg(doc: SHXDocument, svg_path: Path) -> dict[str, object]:
    """Write one compact SVG contact sheet and return summary metadata."""
    records = select_records(doc)
    cols = 8
    cell_w = 112
    cell_h = 118
    title_h = 44
    rows = max(1, math.ceil(len(records) / cols))
    width = cols * cell_w
    height = title_h + rows * cell_h
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="#faf9f4"/>',
        "<style>",
        "text{font-family:Menlo,Consolas,monospace;fill:#222}",
        ".title{font-size:18px;font-weight:700}.meta{font-size:11px;fill:#555}.label{font-size:10px;fill:#666}",
        ".cell{fill:#fff;stroke:#ddd}.glyph{fill:none;stroke:#111;stroke-width:1.6;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}",
        "</style>",
        f'<text class="title" x="16" y="24">{html.escape(doc.source_path.name)}</text>',
        f'<text class="meta" x="16" y="39">{doc.format_kind}; {doc.shape_count()} records; {html.escape(doc.classification)}</text>',
    ]
    for idx, record in enumerate(records):
        col = idx % cols
        row = idx // cols
        x = col * cell_w
        y = title_h + row * cell_h
        parts.append(f'<rect class="cell" x="{x + 5}" y="{y + 5}" width="{cell_w - 10}" height="{cell_h - 10}" rx="2"/>')
        parts.append(f'<text class="label" x="{x + 10}" y="{y + 20}">{html.escape(record_label(record, doc))}</text>')
        if record.paths and record.bbox:
            bbox = record.bbox
            glyph_w = max(1.0, bbox["max_x"] - bbox["min_x"])
            glyph_h = max(1.0, bbox["max_y"] - bbox["min_y"])
            scale = min((cell_w - 30) / glyph_w, (cell_h - 46) / glyph_h)
            cx = bbox["min_x"] + glyph_w / 2
            cy = bbox["min_y"] + glyph_h / 2
            d = svg_path_data(record.paths)
            tx = x + cell_w / 2 - cx * scale
            ty = y + 22 + (cell_h - 30) / 2 + cy * scale
            parts.append(f'<path class="glyph" transform="translate({tx:.3f} {ty:.3f}) scale({scale:.3f} {-scale:.3f})" d="{d}"/>')
    parts.append("</svg>")
    svg_path.parent.mkdir(parents=True, exist_ok=True)
    svg_path.write_text("\n".join(parts) + "\n", encoding="utf-8")
    return {
        "font": doc.source_path.name,
        "format_kind": doc.format_kind,
        "classification": doc.classification,
        "record_count": doc.shape_count(),
        "sample_count": len(records),
        "curve_count": sum(record.curve_count for record in doc.records),
        "path_count": sum(len(record.paths) for record in doc.records if record.code != 0),
        "parse_error_count": len(doc.parse_errors),
    }


def render_png(svg_path: Path, png_path: Path) -> None:
    """Convert an SVG specimen to PNG using rsvg-convert."""
    converter = shutil.which("rsvg-convert")
    if not converter:
        raise RuntimeError("rsvg-convert is required to write PNG specimens")
    png_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([converter, str(svg_path), "-o", str(png_path)], check=True)


def iter_shx(paths: list[Path]) -> list[Path]:
    """Expand command-line inputs into a flat list of .SHX files."""
    out = []
    for path in paths:
        if path.is_dir():
            out.extend(sorted(p for p in path.iterdir() if p.suffix.lower() == ".shx"))
        elif path.suffix.lower() == ".shx":
            out.append(path)
    return out


def main() -> int:
    """Parse CLI arguments and render specimens for every requested SHX file."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument("--out", type=Path, default=HANGUL_ROOT / "png_specimens")
    parser.add_argument("--svg-out", type=Path, default=HANGUL_ROOT / "svg_specimens_compact")
    args = parser.parse_args()

    summary = []
    for shx_path in iter_shx(args.inputs):
        doc = decode_file(shx_path)
        stem = shx_path.stem
        svg_path = args.svg_out / f"{stem}_sample.svg"
        png_path = args.out / f"{stem}_sample.png"
        row = render_svg(doc, svg_path)
        render_png(svg_path, png_path)
        row["png"] = str(png_path)
        summary.append(row)
        print(f"wrote {png_path}")

    summary_path = args.out / "summary.json"
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
