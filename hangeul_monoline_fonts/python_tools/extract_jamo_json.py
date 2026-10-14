#!/usr/bin/env python3
"""Extract jamo-only data for the p5 Hangeul compositor.

Ingests the canonical SHX files in ../shx_sources, skips helper-only ASCII
sources, and writes p5_hangeul_compositor/jamo_fonts.js. The output is a
browser-loadable JavaScript assignment rather than fetched JSON so the
compositor can be opened directly from disk without a local server.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


HANGUL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = HANGUL_ROOT.parent
sys.path.insert(0, str(REPO_ROOT / "autocad_sxh_fonts" / "python"))

from shx_decoder import decode_file  # noqa: E402


L_JAMO = list("ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ")
V_JAMO = list("ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ")
T_JAMO = [
    "",
    "ㄱ",
    "ㄲ",
    "ㄳ",
    "ㄴ",
    "ㄵ",
    "ㄶ",
    "ㄷ",
    "ㄹ",
    "ㄺ",
    "ㄻ",
    "ㄼ",
    "ㄽ",
    "ㄾ",
    "ㄿ",
    "ㅀ",
    "ㅁ",
    "ㅂ",
    "ㅄ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
]

# These compatibility jamo are the complete source alphabet for composition.
CORE_JAMO = sorted(set(L_JAMO + V_JAMO + [j for j in T_JAMO if j]))
BASIC_COMPOSITION_JAMO = sorted(set(L_JAMO + V_JAMO))
HELPER_SHX_FILES = {"kosdices.shx", "simplex.shx"}


def bbox_from_paths(paths: list[list[dict]]) -> dict[str, float] | None:
    """Compute a glyph bounding box when the decoder did not provide one."""
    points = []
    for path in paths:
        for cmd in path:
            for x_key, y_key in (("x", "y"), ("x1", "y1"), ("x2", "y2")):
                if x_key in cmd and y_key in cmd:
                    points.append((cmd[x_key], cmd[y_key]))
    if not points:
        return None
    xs, ys = zip(*points)
    return {
        "min_x": min(xs),
        "min_y": min(ys),
        "max_x": max(xs),
        "max_y": max(ys),
    }


def glyph_payload(record) -> dict:
    """Serialize the subset of a decoded SHX record needed by p5."""
    return {
        "code": record.code,
        "paths": record.paths,
        "bbox": record.bbox or bbox_from_paths(record.paths),
        "advance": record.advance_width,
    }


def extract_font(path: Path) -> dict:
    """Extract every available compatibility jamo from one SHX font."""
    doc = decode_file(path)
    glyphs = {}
    for record in doc.records:
        char = record.unicode_char(doc.likely_font())
        if char in CORE_JAMO and record.paths:
            glyphs[char] = glyph_payload(record)

    missing = [char for char in CORE_JAMO if char not in glyphs]
    missing_basic = [char for char in BASIC_COMPOSITION_JAMO if char not in glyphs]
    return {
        "name": path.stem,
        "source_file": path.name,
        "record_count": doc.shape_count(),
        "classification": doc.classification,
        "glyphs": glyphs,
        "missing": missing,
        "missing_basic": missing_basic,
    }


def main() -> int:
    """Build the compositor's inline jamo data file from shx_sources."""
    source_dir = HANGUL_ROOT / "shx_sources"
    output_path = HANGUL_ROOT / "p5_hangeul_compositor" / "jamo_fonts.js"
    fonts = []
    skipped = []
    for path in sorted(source_dir.iterdir()):
        if path.suffix.lower() == ".shx" and path.name.lower() not in HELPER_SHX_FILES:
            font = extract_font(path)
            if font["missing_basic"]:
                skipped.append(font)
            else:
                fonts.append(font)

    payload = {
        "description": "Modern Hangeul compatibility Jamo extracted from selected AutoCAD SHX sources.",
        "unicode_model": {
            "syllable_start": "U+AC00",
            "syllable_count": 11172,
            "L": L_JAMO,
            "V": V_JAMO,
            "T": T_JAMO,
        },
        "required_jamo": CORE_JAMO,
        "required_basic_jamo": BASIC_COMPOSITION_JAMO,
        "fonts": fonts,
        "skipped_sources": [
            {
                "name": font["name"],
                "source_file": font["source_file"],
                "reason": "missing basic composition jamo",
                "missing_basic": "".join(font["missing_basic"]),
            }
            for font in skipped
        ],
    }
    output_path.write_text(
        "window.JAMO_FONTS_DATA="
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    for font in fonts:
        status = "complete" if not font["missing"] else f"missing {''.join(font['missing'])}"
        jamo_count = sum(1 for char in CORE_JAMO if char in font["glyphs"])
        print(f"{font['name']}: {jamo_count}/{len(CORE_JAMO)} jamo {status}")
    for font in skipped:
        print(f"skipped {font['name']}: missing basic jamo {''.join(font['missing_basic'])}")
    print(f"wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
