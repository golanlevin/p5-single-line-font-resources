#!/usr/bin/env python3
"""Extract full Hangeul data for the hybrid p5 viewer/export pipeline.

Ingests the canonical SHX files in ../shx_sources, keeping only Hangul fonts
that contain at least the 2350 Wansung precomposed syllables. It also ingests
KOSDICES.shx and simplex.shx as ASCII helper sources. The output JSON in
p5_hangeul_full/data/hangeul_full_fonts.json.zip is used by the full p5 app and
the SVG 1.1 font exporter.
"""

from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path


HANGUL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = HANGUL_ROOT.parent
sys.path.insert(0, str(REPO_ROOT / "autocad_sxh_fonts" / "python"))

from shx_decoder import decode_file  # noqa: E402


HANGUL_BASE = 0xAC00
HANGUL_END = 0xD7A3
MIN_PRECOMPOSED = 2350

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

# These compatibility jamo are needed when the viewer/exporter must compose a
# syllable that is missing from a source font's precomposed Wansung set.
CORE_JAMO = sorted(set(L_JAMO + V_JAMO + [j for j in T_JAMO if j]))
BASIC_ASCII = [chr(code) for code in range(33, 127)]
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
    """Serialize the subset of a decoded SHX record needed by p5/exporters."""
    return {
        "code": record.code,
        "paths": record.paths,
        "bbox": record.bbox or bbox_from_paths(record.paths),
        "advance": record.advance_width,
    }


def metrics_for_chars(glyphs: dict, chars: list[str]) -> dict[str, float] | None:
    """Measure a representative set of glyphs for consistent ASCII scaling."""
    boxes = [glyphs[char]["bbox"] for char in chars if char in glyphs and glyphs[char].get("bbox")]
    if not boxes:
        return None
    return {
        "min_x": min(box["min_x"] for box in boxes),
        "min_y": min(box["min_y"] for box in boxes),
        "max_x": max(box["max_x"] for box in boxes),
        "max_y": max(box["max_y"] for box in boxes),
    }


def ascii_glyphs_from_file(path: Path) -> dict:
    """Extract printable ASCII glyphs from a helper or source SHX file."""
    doc = decode_file(path)
    glyphs = {}
    for record in doc.records:
        char = record.unicode_char(doc.likely_font())
        if char in BASIC_ASCII and record.paths:
            glyphs[char] = glyph_payload(record)
    return glyphs


def transform_glyph_payload(glyph: dict, scale: float, dx: float = 0.0, dy: float = 0.0) -> dict:
    """Scale/translate a serialized glyph payload, used for ASCII patching."""
    paths = []
    for path in glyph.get("paths", []):
        new_path = []
        for cmd in path:
            if cmd["type"] in {"M", "L"}:
                new_path.append({"type": cmd["type"], "x": cmd["x"] * scale + dx, "y": cmd["y"] * scale + dy})
            elif cmd["type"] == "C":
                new_path.append(
                    {
                        "type": "C",
                        "x1": cmd["x1"] * scale + dx,
                        "y1": cmd["y1"] * scale + dy,
                        "x2": cmd["x2"] * scale + dx,
                        "y2": cmd["y2"] * scale + dy,
                        "x": cmd["x"] * scale + dx,
                        "y": cmd["y"] * scale + dy,
                    }
                )
        if new_path:
            paths.append(new_path)

    return {
        "code": glyph["code"],
        "paths": paths,
        "bbox": bbox_from_paths(paths),
        "advance": glyph["advance"] * scale if glyph.get("advance") is not None else None,
    }


def ascii_fallback_glyphs(primary_path: Path, backup_path: Path | None = None) -> tuple[dict, dict[str, float] | None, list[str]]:
    """Build the shared ASCII fallback set, patching missing chars if needed."""
    glyphs = ascii_glyphs_from_file(primary_path)
    backup_glyphs = ascii_glyphs_from_file(backup_path) if backup_path else {}
    primary_metrics = metrics_for_chars(glyphs, list("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"))
    backup_metrics = metrics_for_chars(backup_glyphs, list("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"))
    patched_chars = []

    for char in BASIC_ASCII:
        if char not in glyphs and char in backup_glyphs:
            glyph = backup_glyphs[char]
            if primary_metrics and backup_metrics:
                primary_h = primary_metrics["max_y"] - primary_metrics["min_y"]
                backup_h = backup_metrics["max_y"] - backup_metrics["min_y"]
                scale = primary_h / backup_h if backup_h else 1.0
                dy = primary_metrics["max_y"] - backup_metrics["max_y"] * scale
                glyph = transform_glyph_payload(glyph, scale, 0.0, dy)
            glyphs[char] = glyph
            patched_chars.append(char)

    return glyphs, primary_metrics or metrics_for_chars(glyphs, list("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")), patched_chars


def decoded_char_and_source(code: int) -> tuple[str | None, str | None]:
    """Decode SHX record codes as Korean encodings before trying Unicode."""
    if 0x8080 <= code <= 0xFFFF:
        encoded = bytes([(code >> 8) & 0xFF, code & 0xFF])
        for encoding in ("euc_kr", "cp949"):
            try:
                return encoded.decode(encoding), encoding
            except UnicodeDecodeError:
                pass
    if 0 <= code <= 0x10FFFF and not (0xD800 <= code <= 0xDFFF):
        try:
            return chr(code), "unicode"
        except ValueError:
            return None, None
    return None, None


def is_precomposed_hangul(char: str) -> bool:
    """Return true for modern precomposed Hangul syllable codepoints."""
    code = ord(char)
    return HANGUL_BASE <= code <= HANGUL_END


def extract_font(path: Path, fallback_ascii: dict, fallback_metrics: dict[str, float] | None, fallback_name: str) -> dict | None:
    """Extract one usable full Hangul font, or skip it if below threshold."""
    doc = decode_file(path)
    glyphs = {}
    native_ascii = {}
    native_syllables = set()

    for record in doc.records:
        char, source = decoded_char_and_source(record.code)
        if not char or not record.paths:
            continue
        if char in CORE_JAMO:
            glyphs[char] = glyph_payload(record)
        elif is_precomposed_hangul(char) and source in {"euc_kr", "cp949"}:
            glyphs[char] = glyph_payload(record)
            native_syllables.add(char)
        elif char in BASIC_ASCII:
            native_ascii[char] = glyph_payload(record)

    if len(native_syllables) < MIN_PRECOMPOSED:
        return None

    ascii_source = path.name if native_ascii else fallback_name
    ascii_glyphs = native_ascii or fallback_ascii
    glyphs.update(ascii_glyphs)

    return {
        "name": path.stem,
        "source_file": path.name,
        "record_count": doc.shape_count(),
        "classification": doc.classification,
        "native_syllable_count": len(native_syllables),
        "jamo_count": sum(1 for char in CORE_JAMO if char in glyphs),
        "ascii_source_file": ascii_source,
        "ascii_metrics": metrics_for_chars(ascii_glyphs, list("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")) or fallback_metrics,
        "glyphs": glyphs,
        "missing_jamo": [char for char in CORE_JAMO if char not in glyphs],
    }


def main() -> int:
    """Build the zipped full-app JSON from canonical SHX sources."""
    source_dir = HANGUL_ROOT / "shx_sources"
    output_path = HANGUL_ROOT / "p5_hangeul_full" / "data" / "hangeul_full_fonts.json.zip"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    fallback_path = source_dir / "KOSDICES.shx"
    backup_fallback_path = source_dir / "simplex.shx"
    fallback_ascii, fallback_metrics, patched_ascii = ascii_fallback_glyphs(fallback_path, backup_fallback_path)

    fonts = []
    skipped = []
    for path in sorted(source_dir.iterdir()):
        if path.suffix.lower() != ".shx":
            continue
        if path.name.lower() in HELPER_SHX_FILES:
            continue
        font = extract_font(path, fallback_ascii, fallback_metrics, fallback_path.name)
        if font:
            fonts.append(font)
        else:
            skipped.append(path.name)

    payload = {
        "description": "Hangeul SHX fonts with native precomposed syllables preferred, plus jamo compositor fallback.",
        "min_precomposed_syllables": MIN_PRECOMPOSED,
        "basic_ascii": BASIC_ASCII,
        "ascii_fallback_source": fallback_path.name,
        "ascii_fallback_patched_from": backup_fallback_path.name,
        "ascii_fallback_patched_chars": patched_ascii,
        "unicode_model": {
            "syllable_start": "U+AC00",
            "syllable_count": 11172,
            "L": L_JAMO,
            "V": V_JAMO,
            "T": T_JAMO,
        },
        "required_jamo": CORE_JAMO,
        "fonts": fonts,
        "skipped_sources": skipped,
    }
    json_text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zip_file:
        zip_file.writestr("hangeul_full_fonts.json", json_text)

    for font in fonts:
        print(
            f"{font['name']}: {font['native_syllable_count']} native syllables; "
            f"{font['jamo_count']}/{len(CORE_JAMO)} jamo; ASCII from {font['ascii_source_file']}"
        )
    if skipped:
        print("skipped below threshold:", ", ".join(skipped))
    if patched_ascii:
        print(f"patched missing ASCII from {backup_fallback_path.name}: {''.join(patched_ascii)}")
    print(f"wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
