#!/usr/bin/env python3
"""Export Hangeul SHX-derived data as SVG 1.1 font files.

Wansung exports contain the native 2350 completed-form syllables present in the
source SHX files. Johab exports contain all 11,172 modern Hangul syllables, but
only for sources that have their own basic jamo for composition; fonts such as
HANGEUL.SHX that contain Wansung syllables but no jamo are exported as Wansung
only.

Ingests p5_hangeul_full/data/hangeul_full_fonts.json.zip, then writes SVG 1.1 font
files and a manifest into p5_hangeul_svgfonts/svg_fonts. The generated fonts
preserve Unicode codepoints so the SVG font viewer can display Hangul without
running the p5 compositor.
"""

from __future__ import annotations

import json
import zipfile
from html import escape
from pathlib import Path


HANGUL_ROOT = Path(__file__).resolve().parents[1]
HANGUL_BASE = 0xAC00
HANGUL_COUNT = 11172
UNITS_PER_EM = 1000
ASCENT = 900
DESCENT = -100
HANGUL_ADVANCE = 1000
ASCII_HEIGHT_RATIO = 0.81
ASCII_BASELINE_RAISE_RATIO = 0.14

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

FINAL_CLUSTERS = {
    "ㄳ": ("ㄱ", "ㅅ"),
    "ㄵ": ("ㄴ", "ㅈ"),
    "ㄶ": ("ㄴ", "ㅎ"),
    "ㄺ": ("ㄹ", "ㄱ"),
    "ㄻ": ("ㄹ", "ㅁ"),
    "ㄼ": ("ㄹ", "ㅂ"),
    "ㄽ": ("ㄹ", "ㅅ"),
    "ㄾ": ("ㄹ", "ㅌ"),
    "ㄿ": ("ㄹ", "ㅍ"),
    "ㅀ": ("ㄹ", "ㅎ"),
    "ㅄ": ("ㅂ", "ㅅ"),
}

SIMPLE_FINAL_TOP_RATIO = 0.68
CLUSTER_FINAL_TOP_RATIO = 0.58
SIMPLE_FINAL_INSET_RATIO = 0.08
CLUSTER_FINAL_INSET_RATIO = 0.02
CLUSTER_FINAL_MIN_ASPECT = 1.8
VERTICAL_VOWELS = set("ㅏㅐㅑㅒㅓㅔㅕㅖㅣ")
HORIZONTAL_VOWELS = set("ㅗㅛㅜㅠㅡ")
BASIC_ASCII = [chr(code) for code in range(32, 127)]
COMPATIBILITY_JAMO = sorted(set(L_JAMO + V_JAMO + [j for j in T_JAMO if j]))
BASIC_COMPOSITION_JAMO = sorted(set(L_JAMO + V_JAMO))


def glyph_bbox(glyph: dict) -> dict | None:
    """Return a serialized glyph's bounding box, if one exists."""
    return glyph.get("bbox")


def transform_glyph(glyph: dict, x: float, y: float, w: float, h: float, fit_bbox: dict | None = None) -> list[list[dict]]:
    """Fit a serialized glyph into an output box while preserving aspect."""
    bbox = fit_bbox or glyph_bbox(glyph)
    if not bbox:
        return []
    gw = max(1.0, bbox["max_x"] - bbox["min_x"])
    gh = max(1.0, bbox["max_y"] - bbox["min_y"])
    scale = min((w * 0.86) / gw, (h * 0.86) / gh)
    ox = x + w / 2 - (bbox["min_x"] + gw / 2) * scale
    oy = y + h / 2 - (bbox["min_y"] + gh / 2) * scale
    return transform_paths(glyph.get("paths", []), ox, oy, scale)


def transform_paths(paths: list[list[dict]], ox: float, oy: float, scale: float) -> list[list[dict]]:
    """Apply a simple scale/translate transform to serialized path commands."""
    out = []
    for path in paths:
        new_path = []
        for cmd in path:
            if cmd["type"] in {"M", "L"}:
                new_path.append({"type": cmd["type"], "x": ox + cmd["x"] * scale, "y": oy + cmd["y"] * scale})
            elif cmd["type"] == "C":
                new_path.append(
                    {
                        "type": "C",
                        "x1": ox + cmd["x1"] * scale,
                        "y1": oy + cmd["y1"] * scale,
                        "x2": ox + cmd["x2"] * scale,
                        "y2": oy + cmd["y2"] * scale,
                        "x": ox + cmd["x"] * scale,
                        "y": oy + cmd["y"] * scale,
                    }
                )
        if new_path:
            out.append(new_path)
    return out


def compose_syllable(font: dict, ch: str) -> list[list[dict]]:
    """Compose a missing Hangul syllable from compatibility jamo glyphs."""
    parts = decompose_hangul(ch)
    if not parts:
        return []

    pad = HANGUL_ADVANCE * 0.09
    box = {"x": pad, "y": pad, "w": HANGUL_ADVANCE - pad * 2, "h": HANGUL_ADVANCE - pad * 2}
    has_final = parts["t"] != ""
    has_cluster_final = parts["t"] in FINAL_CLUSTERS
    top_h = box["h"]
    if has_final:
        top_h = box["h"] * (CLUSTER_FINAL_TOP_RATIO if has_cluster_final else SIMPLE_FINAL_TOP_RATIO)

    top = {"x": box["x"], "y": box["y"], "w": box["w"], "h": top_h}
    final_box = {"x": box["x"], "y": box["y"] + top_h, "w": box["w"], "h": box["h"] - top_h}
    mode = vowel_mode_for(parts["v"])
    paths: list[list[dict]] = []

    if mode == "vertical":
        paths.extend(fitted_jamo(font, parts["l"], top["x"], top["y"], top["w"] * 0.54, top["h"]))
        paths.extend(fitted_jamo(font, parts["v"], top["x"] + top["w"] * 0.50, top["y"], top["w"] * 0.50, top["h"]))
    elif mode == "horizontal":
        paths.extend(fitted_jamo(font, parts["l"], top["x"], top["y"], top["w"], top["h"] * 0.58))
        paths.extend(fitted_jamo(font, parts["v"], top["x"], top["y"] + top["h"] * 0.46, top["w"], top["h"] * 0.52))
    else:
        paths.extend(fitted_jamo(font, parts["l"], top["x"], top["y"], top["w"] * 0.54, top["h"] * 0.68))
        paths.extend(fitted_jamo(font, parts["v"], top["x"] + top["w"] * 0.40, top["y"], top["w"] * 0.60, top["h"]))

    if has_final:
        inset = CLUSTER_FINAL_INSET_RATIO if has_cluster_final else SIMPLE_FINAL_INSET_RATIO
        paths.extend(draw_final(font, parts["t"], final_box["x"] + final_box["w"] * inset, final_box["y"], final_box["w"] * (1 - inset * 2), final_box["h"]))

    return paths


def fitted_jamo(font: dict, char: str, x: float, y: float, w: float, h: float) -> list[list[dict]]:
    """Fit one jamo glyph into a compositor slot."""
    glyph = font["glyphs"].get(char)
    return transform_glyph(glyph, x, y, w, h) if glyph else []


def draw_final(font: dict, char: str, x: float, y: float, w: float, h: float) -> list[list[dict]]:
    """Draw a final consonant, splitting cluster finals if no glyph exists."""
    if char in font["glyphs"] and not should_split_cluster_final(font, char):
        return fitted_jamo(font, char, x, y, w, h)
    cluster = FINAL_CLUSTERS.get(char)
    if not cluster:
        return []
    return [
        *fitted_jamo(font, cluster[0], x, y, w * 0.48, h),
        *fitted_jamo(font, cluster[1], x + w * 0.52, y, w * 0.48, h),
    ]


def should_split_cluster_final(font: dict, char: str) -> bool:
    """Return true when a combined cluster final is too vertical for the basement."""
    if char not in FINAL_CLUSTERS:
        return False
    bbox = glyph_bbox(font["glyphs"].get(char, {}))
    if not bbox:
        return True
    width = bbox["max_x"] - bbox["min_x"]
    height = bbox["max_y"] - bbox["min_y"]
    return height <= 0 or width / height < CLUSTER_FINAL_MIN_ASPECT


def decompose_hangul(ch: str) -> dict | None:
    """Decompose a modern Hangul syllable into L/V/T compatibility jamo."""
    code = ord(ch)
    if code < HANGUL_BASE or code >= HANGUL_BASE + HANGUL_COUNT:
        return None
    s = code - HANGUL_BASE
    return {"l": L_JAMO[s // 588], "v": V_JAMO[(s % 588) // 28], "t": T_JAMO[s % 28]}


def vowel_mode_for(vowel: str) -> str:
    """Classify a vowel so the compositor can choose a syllable layout."""
    if vowel in VERTICAL_VOWELS:
        return "vertical"
    if vowel in HORIZONTAL_VOWELS:
        return "horizontal"
    return "mixed"


def path_to_d(paths: list[list[dict]]) -> str:
    """Convert serialized paths into an SVG glyph d attribute."""
    pieces = []
    for path in paths:
        for cmd in path:
            if cmd["type"] in {"M", "L"}:
                pieces.append(f'{cmd["type"]}{fmt(cmd["x"])} {fmt(cmd["y"])}')
            elif cmd["type"] == "C":
                pieces.append(
                    f'C{fmt(cmd["x1"])} {fmt(cmd["y1"])} {fmt(cmd["x2"])} {fmt(cmd["y2"])} {fmt(cmd["x"])} {fmt(cmd["y"])}'
                )
    return " ".join(pieces)


def fmt(value: float) -> str:
    """Format coordinates compactly while avoiding negative zero."""
    value = round(value, 3)
    if abs(value) < 0.0005:
        value = 0
    return f"{value:g}"


def unicode_ref(ch: str) -> str:
    """Return an XML-safe numeric character reference for an SVG glyph."""
    return f"&#x{ord(ch):04X};"


def glyph_name(ch: str) -> str:
    """Return a conventional uniXXXX glyph name."""
    return f"uni{ord(ch):04X}"


def glyph_element(ch: str, paths: list[list[dict]], advance: int = HANGUL_ADVANCE) -> str:
    """Serialize one SVG 1.1 <glyph> element."""
    attrs = [
        f'glyph-name="{glyph_name(ch)}"',
        f'unicode="{unicode_ref(ch)}"',
        f'horiz-adv-x="{advance}"',
    ]
    d = path_to_d(paths)
    if d:
        attrs.append(f'd="{escape(d, quote=True)}"')
    return "    <glyph " + " ".join(attrs) + " />"


def transformed_source_glyph(font: dict, ch: str, advance: int = HANGUL_ADVANCE, fit_bbox: dict | None = None) -> list[list[dict]]:
    """Normalize a source glyph into the SVG font coordinate space."""
    glyph = font["glyphs"].get(ch)
    if not glyph:
        return []
    return transform_glyph(glyph, 0, 0, advance, HANGUL_ADVANCE, fit_bbox)


def wansung_glyphs(font: dict) -> list[tuple[str, list[list[dict]], int]]:
    """Return only native precomposed Hangul syllables for Wansung export."""
    out = []
    for code in range(HANGUL_BASE, HANGUL_BASE + HANGUL_COUNT):
        ch = chr(code)
        if ch in font["glyphs"]:
            out.append((ch, transformed_source_glyph(font, ch), HANGUL_ADVANCE))
    return out


def johab_glyphs(font: dict) -> list[tuple[str, list[list[dict]], int]]:
    """Return all modern Hangul syllables, preferring native source glyphs."""
    out = []
    for code in range(HANGUL_BASE, HANGUL_BASE + HANGUL_COUNT):
        ch = chr(code)
        if ch in font["glyphs"]:
            out.append((ch, transformed_source_glyph(font, ch), HANGUL_ADVANCE))
        else:
            out.append((ch, compose_syllable(font, ch), HANGUL_ADVANCE))
    return out


def can_export_johab(font: dict) -> bool:
    """Return true when a font can compose Johab syllables from its own jamo."""
    # Cluster finals such as ㄳ can be drawn by splitting them into basic jamo,
    # so the hard requirement is the 19 leading consonants plus 21 vowels. This
    # deliberately excludes Wansung-only sources such as HANGEUL.SHX and
    # consonant-only helper sets such as HL_WIN.SHX.
    return all(char in font["glyphs"] for char in BASIC_COMPOSITION_JAMO)


def supplemental_glyphs(font: dict) -> list[tuple[str, list[list[dict]], int]]:
    """Return ASCII and standalone jamo glyphs to include beside Hangul."""
    out = []
    seen = set()
    for ch in [*BASIC_ASCII, *COMPATIBILITY_JAMO]:
        if ch in seen:
            continue
        seen.add(ch)
        glyph = font["glyphs"].get(ch)
        if not glyph:
            continue
        if ch == " ":
            out.append((ch, [], 420))
            continue
        if ord(ch) < 128:
            paths, advance = transformed_ascii_glyph(font, ch)
            out.append((ch, paths, advance))
        else:
            out.append((ch, transformed_source_glyph(font, ch), HANGUL_ADVANCE))
    return out


def transformed_ascii_glyph(font: dict, ch: str) -> tuple[list[list[dict]], int]:
    """Normalize ASCII glyphs so they match the Hangul font scale."""
    glyph = font["glyphs"].get(ch)
    metrics = font.get("ascii_metrics") or glyph_bbox(glyph)
    if not glyph or not metrics:
        return [], 420

    em_height = max(1.0, metrics["max_y"] - min(0.0, metrics["min_y"]))
    scale = (UNITS_PER_EM * ASCII_HEIGHT_RATIO) / em_height
    left = glyph["bbox"]["min_x"] if glyph.get("bbox") else 0.0
    ox = -left * scale
    oy = UNITS_PER_EM * ASCII_BASELINE_RAISE_RATIO
    advance = max(160, int(round((glyph.get("advance") or metrics["max_x"]) * scale)))
    return transform_paths(glyph.get("paths", []), ox, oy, scale), advance


def write_svg_font(font: dict, kind: str, glyphs: list[tuple[str, list[list[dict]], int]], output_path: Path) -> None:
    """Write one complete SVG 1.1 font file."""
    family = f"{font['name']} {kind.upper()} Single Line"
    lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">',
        "  <metadata>",
        f"    Generated from {escape(font['source_file'])} by python_tools/export_svg_fonts.py.",
        "    Hangul syllables are encoded at their modern Unicode codepoints.",
        "  </metadata>",
        "  <defs>",
        f'  <font id="{escape(font["name"])}_{kind}" horiz-adv-x="{HANGUL_ADVANCE}">',
        (
            f'    <font-face font-family="{escape(family)}" units-per-em="{UNITS_PER_EM}" '
            f'ascent="{ASCENT}" descent="{DESCENT}" bbox="0 0 {HANGUL_ADVANCE} {HANGUL_ADVANCE}" />'
        ),
        "    <missing-glyph />",
    ]

    for ch, paths, advance in supplemental_glyphs(font):
        lines.append(glyph_element(ch, paths, advance))
    for ch, paths, advance in glyphs:
        lines.append(glyph_element(ch, paths, advance))

    lines.extend(["  </font>", "  </defs>", "</svg>", ""])
    output_path.write_text("\n".join(lines), encoding="utf-8")


def load_full_font_data(data_path: Path) -> dict:
    """Load the zipped full-font JSON used by the p5 full app."""
    with zipfile.ZipFile(data_path) as zip_file:
        return json.loads(zip_file.read("hangeul_full_fonts.json").decode("utf-8"))


def main() -> int:
    """Export Wansung and Johab SVG fonts for every full-app font."""
    data_path = HANGUL_ROOT / "p5_hangeul_full" / "data" / "hangeul_full_fonts.json.zip"
    output_dir = HANGUL_ROOT / "p5_hangeul_svgfonts" / "svg_fonts"
    output_dir.mkdir(parents=True, exist_ok=True)

    data = load_full_font_data(data_path)

    for stale_font in output_dir.glob("*_svgfont.svg"):
        stale_font.unlink()

    manifest = {
        "description": "SVG 1.1 single-line Hangeul fonts exported from SHX sources.",
        "units_per_em": UNITS_PER_EM,
        "ascent": ASCENT,
        "descent": DESCENT,
        "fonts": [],
        "skipped_johab": [],
    }

    for font in data["fonts"]:
        print(f"Exporting {font['name']}...")
        wansung = wansung_glyphs(font)
        exports = [("wansung", wansung)]
        if can_export_johab(font):
            exports.append(("johab", johab_glyphs(font)))
        else:
            missing = [char for char in BASIC_COMPOSITION_JAMO if char not in font["glyphs"]]
            manifest["skipped_johab"].append(
                {
                    "name": font["name"],
                    "source": font["source_file"],
                    "reason": "missing basic composition jamo",
                    "missing_jamo": "".join(missing),
                }
            )
            print(f"  skipped Johab: missing basic jamo {''.join(missing)}")

        for kind, glyphs in exports:
            file_name = f"{font['name']}_{kind}_svgfont.svg"
            write_svg_font(font, kind, glyphs, output_dir / file_name)
            manifest["fonts"].append(
                {
                    "name": f"{font['name']} {kind.upper()}",
                    "source": font["source_file"],
                    "kind": kind,
                    "file": f"svg_fonts/{file_name}",
                    "hangul_glyphs": len(glyphs),
                    "supplemental_glyphs": len(supplemental_glyphs(font)),
                }
            )
            print(f"  wrote {file_name}: {len(glyphs)} Hangul glyphs")

    (output_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {output_dir / 'manifest.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
