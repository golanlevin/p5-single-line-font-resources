#!/usr/bin/env python3
"""Extract Vib-Ribbon line glyphs from FONT/01_FONT.TMD."""

from __future__ import annotations

import argparse
import struct
import zlib
import json
from pathlib import Path


ASCII_TABLE_OFFSET = 0x54AF4
ESCAPE_TABLE_OFFSET = 0x54B34
JAPANESE_TABLE_OFFSET = 0x54A94

JAPANESE_KATAKANA_MAP = {
    "ア": 20,
    "イ": 21,
    "ウ": 22,
    "エ": 23,
    "オ": 24,
    "ャ": 25,
    "ュ": 26,
    "ョ": 27,
    "ッ": 28,
    "ァ": 29,
    "ィ": 30,
    "ゥ": 31,
    "ェ": 32,
    "ォ": 33,
    "カ": 34,
    "キ": 35,
    "ク": 36,
    "ケ": 37,
    "コ": 38,
    "サ": 39,
    "シ": 40,
    "ス": 41,
    "セ": 42,
    "ソ": 43,
    "タ": 44,
    "チ": 45,
    "ツ": 46,
    "テ": 47,
    "ト": 48,
    "ナ": 49,
    "ニ": 50,
    "ヌ": 51,
    "ネ": 52,
    "ノ": 53,
    "ハ": 54,
    "ヒ": 55,
    "フ": 56,
    "ヘ": 57,
    "ホ": 58,
    "マ": 59,
    "ミ": 60,
    "ム": 61,
    "メ": 62,
    "モ": 63,
    "ヤ": 64,
    "ユ": 65,
    "ヨ": 66,
    "ラ": 67,
    "リ": 68,
    "ル": 69,
    "レ": 70,
    "ロ": 71,
    "ワ": 72,
    "ン": 73,
    "゛": 74,
    "゜": 75,
}

ACCENT_LABELS = {
    "A": "À",
    "B": "Á",
    "C": "Ä",
    "D": "à",
    "E": "â",
    "F": "á",
    "G": "ä",
    "H": "ß",
    "I": "Ç",
    "J": "ç",
    "K": "È",
    "L": "É",
    "M": "è",
    "N": "é",
    "O": "ê",
    "P": "Í",
    "Q": "Ì",
    "R": "î",
    "S": "ì",
    "T": "í",
    "U": "Ñ",
    "V": "ñ",
    "W": "Ò",
    "X": "Ó",
    "Y": "Ö",
    "Z": "Ô",
    "a": "ò",
    "b": "ó",
    "c": "ö",
    "d": "Ù",
    "e": "Ú",
    "f": "Ü",
    "g": "ù",
    "h": "û",
    "i": "ú",
    "j": "ü",
    "m": "¡",
    "n": "¿",
}

DEFAULT_ORDER = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?!&.',-()"


def read_u32(data: bytes, off: int) -> int:
    return int.from_bytes(data[off : off + 4], "little")


def read_i16(data: bytes, off: int) -> int:
    return int.from_bytes(data[off : off + 2], "little", signed=True)


def find_tmd_offset(data: bytes) -> int:
    for off in range(0, min(0x40, len(data) - 12), 4):
        if read_u32(data, off) == 0x41 and read_u32(data, off + 4) == 0:
            nobj = read_u32(data, off + 8)
            table_end = off + 12 + nobj * 28
            if 0 < nobj < 256 and table_end < len(data):
                return off
    raise ValueError("TMD header not found")


def parse_font(path: Path) -> list[dict]:
    data = path.read_bytes()
    tmd = find_tmd_offset(data)
    nobj = read_u32(data, tmd + 8)
    table = tmd + 12
    glyphs = []
    for glyph_index in range(nobj):
        rec = table + glyph_index * 28
        vert_top = read_u32(data, rec)
        vert_count = read_u32(data, rec + 4)
        prim_top = read_u32(data, rec + 16)
        prim_count = read_u32(data, rec + 20)

        vertices = []
        for i in range(vert_count):
            off = table + vert_top + i * 8
            vertices.append([read_i16(data, off), read_i16(data, off + 2)])

        strokes = []
        for i in range(prim_count):
            off = table + prim_top + i * 12
            header = data[off : off + 4]
            if header != b"\x03\x02\x01\x40":
                raise ValueError(
                    f"unexpected line primitive header {header.hex()} at {off:#x}"
                )
            a = int.from_bytes(data[off + 8 : off + 10], "little")
            b = int.from_bytes(data[off + 10 : off + 12], "little")
            strokes.append([vertices[a], vertices[b]])

        xs = [p[0] for p in vertices] or [0]
        ys = [p[1] for p in vertices] or [0]
        glyphs.append(
            {
                "index": glyph_index,
                "vertices": vertices,
                "strokes": strokes,
                "bounds": {
                    "min_x": min(xs),
                    "min_y": min(ys),
                    "max_x": max(xs),
                    "max_y": max(ys),
                },
            }
        )
    return glyphs


def flip_y_glyph(glyph: dict) -> dict:
    def flip_point(point: list[int]) -> list[int]:
        return [point[0], -point[1]]

    vertices = [flip_point(point) for point in glyph["vertices"]]
    strokes = [[flip_point(a), flip_point(b)] for a, b in glyph["strokes"]]
    xs = [p[0] for p in vertices] or [0]
    ys = [p[1] for p in vertices] or [0]
    return {
        **glyph,
        "vertices": vertices,
        "strokes": strokes,
        "bounds": {
            "min_x": min(xs),
            "min_y": min(ys),
            "max_x": max(xs),
            "max_y": max(ys),
        },
    }


def table_mapping(exe: Path | None, offset: int, include_zero_for: set[str] | None = None) -> dict[str, int]:
    include_zero_for = include_zero_for or set()
    if exe is None:
        return {}
    data = exe.read_bytes()
    table = data[offset : offset + 128]
    out = {}
    for code, glyph_index in enumerate(table):
        if 32 <= code < 127 and (glyph_index or chr(code) in include_zero_for):
            out[chr(code)] = glyph_index
    return out


def table_inverse(exe: Path | None, offset: int, include_zero_for: set[str] | None = None) -> dict[str, list[str]]:
    inverse: dict[str, list[str]] = {}
    for char, glyph_index in table_mapping(exe, offset, include_zero_for).items():
        inverse.setdefault(str(glyph_index), []).append(char)
    return inverse


def japanese_tentative_mapping(glyph_count: int) -> dict[str, int]:
    mapping = {str(i): i for i in range(min(10, glyph_count))}
    for char, glyph_index in JAPANESE_KATAKANA_MAP.items():
        if glyph_index < glyph_count:
            mapping[char] = glyph_index
    return mapping


def with_order_mapping(glyphs: list[dict], order: str) -> dict:
    mapped = {}
    for i, glyph in enumerate(glyphs):
        char = order[i] if i < len(order) else None
        key = char if char is not None else f"index_{i:02d}"
        mapped[key] = {
            "index": glyph["index"],
            "codepoint": ord(char) if char is not None else None,
            "bounds": glyph["bounds"],
            "strokes": glyph["strokes"],
        }
    return mapped


def with_table_mapping(glyphs: list[dict], mapping: dict[str, int]) -> dict:
    mapped = {}
    for char, glyph_index in sorted(mapping.items(), key=lambda item: (ord(item[0]), item[0])):
        if glyph_index >= len(glyphs):
            continue
        glyph = glyphs[glyph_index]
        mapped[char] = {
            "index": glyph_index,
            "codepoint": ord(char),
            "bounds": glyph["bounds"],
            "strokes": glyph["strokes"],
        }
    return mapped


def draw_line(img: bytearray, width: int, height: int, p0: tuple[int, int], p1: tuple[int, int]) -> None:
    x0, y0 = p0
    x1, y1 = p1
    dx = abs(x1 - x0)
    dy = -abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx + dy
    while True:
        if 0 <= x0 < width and 0 <= y0 < height:
            pos = (y0 * width + x0) * 3
            img[pos : pos + 3] = b"\x00\x00\x00"
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x0 += sx
        if e2 <= dx:
            err += dx
            y0 += sy


def save_preview(glyphs: list[dict], order: str, out: Path) -> None:
    cell_w, cell_h = 140, 190
    cols = 10
    rows = (len(glyphs) + cols - 1) // cols
    width, height = cols * cell_w, rows * cell_h
    img = bytearray(b"\xff\xff\xff" * width * height)

    # Light gray cell grid.
    for x in range(width):
        for y in range(0, height, cell_h):
            pos = (y * width + x) * 3
            img[pos : pos + 3] = b"\xdd\xdd\xdd"
    for y in range(height):
        for x in range(0, width, cell_w):
            pos = (y * width + x) * 3
            img[pos : pos + 3] = b"\xdd\xdd\xdd"

    for i, glyph in enumerate(glyphs):
        col = i % cols
        row = i // cols
        ox = col * cell_w + cell_w // 2
        oy = row * cell_h + 130
        scale = 0.45
        char = order[i] if i < len(order) else "?"
        # Minimal bitmap-ish label ticks: draw the index as vertical bars.
        for bit in range(7):
            if i & (1 << bit):
                x = col * cell_w + 8 + bit * 4
                for yy in range(row * cell_h + 8, row * cell_h + 24):
                    pos = (yy * width + x) * 3
                    img[pos : pos + 3] = b"\x88\x88\x88"
        if char:
            # Draw a small baseline marker under each cell.
            for x in range(col * cell_w + 8, col * cell_w + 24):
                y = row * cell_h + 28
                pos = (y * width + x) * 3
                img[pos : pos + 3] = b"\xaa\xaa\xaa"

        for stroke in glyph["strokes"]:
            (x0, y0), (x1, y1) = stroke
            p0 = (round(ox + x0 * scale), round(oy - y0 * scale))
            p1 = (round(ox + x1 * scale), round(oy - y1 * scale))
            draw_line(img, width, height, p0, p1)

    if out.suffix.lower() == ".png":
        write_png(out, width, height, img)
    else:
        with out.open("wb") as f:
            f.write(f"P6\n{width} {height}\n255\n".encode("ascii"))
            f.write(img)


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    body = kind + payload
    return struct.pack(">I", len(payload)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def write_png(out: Path, width: int, height: int, rgb: bytearray) -> None:
    rows = []
    stride = width * 3
    for y in range(height):
        rows.append(b"\x00" + bytes(rgb[y * stride : (y + 1) * stride]))
    payload = b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)),
            png_chunk(b"IDAT", zlib.compress(b"".join(rows), 9)),
            png_chunk(b"IEND", b""),
        ]
    )
    out.write_bytes(payload)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("font_tmd", type=Path)
    parser.add_argument("--json", type=Path)
    parser.add_argument("--preview", type=Path)
    parser.add_argument("--order", default=DEFAULT_ORDER)
    parser.add_argument("--exe", type=Path)
    parser.add_argument("--flip-y", action="store_true")
    parser.add_argument("--japanese-map", action="store_true")
    args = parser.parse_args()

    glyphs = parse_font(args.font_tmd)
    raw_glyphs = glyphs
    if args.flip_y:
        glyphs = [flip_y_glyph(glyph) for glyph in glyphs]
    if args.json:
        ascii_mapping = {} if args.japanese_map else table_mapping(args.exe, ASCII_TABLE_OFFSET, {"0"})
        escape_mapping = {} if args.japanese_map else table_mapping(args.exe, ESCAPE_TABLE_OFFSET)
        escape_sequences = {}
        inferred_chars = {}
        for escape_char, glyph_index in escape_mapping.items():
            glyph = glyphs[glyph_index] if glyph_index < len(glyphs) else None
            item = {
                "escape": f"~{escape_char}",
                "index": glyph_index,
                "inferred_char": ACCENT_LABELS.get(escape_char),
            }
            if glyph is not None:
                item["bounds"] = glyph["bounds"]
                item["strokes"] = glyph["strokes"]
            escape_sequences[f"~{escape_char}"] = item
            if escape_char in ACCENT_LABELS and glyph is not None:
                inferred_chars[ACCENT_LABELS[escape_char]] = {
                    "index": glyph_index,
                    "codepoint": ord(ACCENT_LABELS[escape_char]),
                    "escape": f"~{escape_char}",
                    "bounds": glyph["bounds"],
                    "strokes": glyph["strokes"],
                }
        if args.japanese_map:
            glyph_mapping = japanese_tentative_mapping(len(glyphs))
            mapping_status = "tentative"
            mapping_notes = (
                "Digits 0-9 are visually confirmed. Japanese glyph mapping was "
                "revised by visual inspection: 20-24 are アイウエオ, 25-33 are "
                "small kana, 34-73 are the main katakana sequence from カ through "
                "ン, and 74-75 are dakuten/handakuten marks. The ROM confirms "
                "the glyph geometry and the custom one-byte lookup table, but I "
                "did not find an unambiguous Shift-JIS/Unicode table."
            )
        else:
            glyph_mapping = ascii_mapping if ascii_mapping else None
            mapping_status = "executable table" if ascii_mapping else "order guess"
            mapping_notes = None

        payload = {
            "source": str(args.font_tmd),
            "format": "Vib-Ribbon TMD line-primitive stroke font",
            "coordinate_system": {
                "origin": "glyph-local origin; intended for upper-left/screen-style drawing",
                "x": "signed 16-bit PlayStation TMD vertex x; positive is right",
                "y": "raw TMD y multiplied by -1; positive is up" if args.flip_y else "raw signed 16-bit PlayStation TMD vertex y; positive is down",
            },
            "mapping_status": mapping_status,
            "mapping_notes": mapping_notes,
            "ascii_table_source": str(args.exe) if args.exe and not args.japanese_map else None,
            "ascii_table_offset": f"{ASCII_TABLE_OFFSET:#x}" if args.exe and not args.japanese_map else None,
            "escape_table_offset": f"{ESCAPE_TABLE_OFFSET:#x}" if args.exe and not args.japanese_map else None,
            "japanese_custom_table_offset": f"{JAPANESE_TABLE_OFFSET:#x}" if args.japanese_map and args.exe else None,
            "japanese_custom_table_inverse": table_inverse(args.exe, JAPANESE_TABLE_OFFSET, {"0"}) if args.japanese_map and args.exe else None,
            "glyph_order_guess": args.order,
            "glyphs": with_table_mapping(glyphs, glyph_mapping) if glyph_mapping else with_order_mapping(glyphs, args.order),
            "inferred_accented_glyphs": inferred_chars,
            "escape_sequences": escape_sequences,
            "glyphs_by_index": glyphs,
            "raw_glyphs_by_index": raw_glyphs,
        }
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        save_preview(glyphs, args.order, args.preview)
    print(f"extracted {len(glyphs)} glyphs")


if __name__ == "__main__":
    main()
