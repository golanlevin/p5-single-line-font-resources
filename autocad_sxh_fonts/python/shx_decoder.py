#!/usr/bin/env python3
"""Batch-oriented AutoCAD SHX/SHP stroke font decoder.

This module handles AutoCAD compiled SHX shape/font files, not ESRI .shx
spatial indexes. It favors partial recovery and archival output over exact
round-tripping.
"""

from __future__ import annotations

import html
import json
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple


SPECIAL_NAMES = {
    0: "end",
    1: "pen_down",
    2: "pen_up",
    3: "scale_div",
    4: "scale_mul",
    5: "push",
    6: "pop",
    7: "subshape",
    8: "move",
    9: "move_many",
    10: "octant_arc",
    11: "fraction_arc",
    12: "bulge_arc",
    13: "bulge_arc_many",
    14: "vertical_text",
}

NORMALIZED_CAP_HEIGHT = 21.0

VECTOR_DIRECTIONS = [
    (1.0, 0.0),
    (1.0, 0.5),
    (1.0, 1.0),
    (0.5, 1.0),
    (0.0, 1.0),
    (-0.5, 1.0),
    (-1.0, 1.0),
    (-1.0, 0.5),
    (-1.0, 0.0),
    (-1.0, -0.5),
    (-1.0, -1.0),
    (-0.5, -1.0),
    (0.0, -1.0),
    (0.5, -1.0),
    (1.0, -1.0),
    (1.0, -0.5),
]


def u16le(data: bytes, offset: int) -> int:
    if offset + 2 > len(data):
        raise ValueError("short uint16")
    return int.from_bytes(data[offset : offset + 2], "little")


def i8(value: int) -> int:
    return value - 256 if value >= 128 else value


def clean_number(value: float) -> float:
    if abs(value) < 1e-9:
        return 0.0
    rounded = round(value, 6)
    return int(rounded) if rounded == int(rounded) else rounded


def decode_latin1_name(data: bytes) -> str:
    return data.decode("latin1", errors="replace").strip("\x00")


def decode_arc_control_byte(arc_byte: int) -> Tuple[bool, int, int]:
    clockwise = bool(arc_byte & 0x80)
    value = arc_byte & 0x7F
    start_octant = (value >> 4) & 0x07
    octants = value & 0x0F
    if octants == 0:
        octants = 8
    return clockwise, start_octant, octants


@dataclass
class ShapeRecord:
    code: int
    byte_count: int
    body: bytes
    name: str = ""
    opcode_bytes: bytes = b""
    parse_errors: List[str] = field(default_factory=list)
    raw_commands: List[Dict[str, Any]] = field(default_factory=list)
    paths: List[List[Dict[str, Any]]] = field(default_factory=list)
    polylines: List[List[List[float]]] = field(default_factory=list)
    bbox: Optional[Dict[str, float]] = None
    advance_width: Optional[float] = None
    curve_count: int = 0
    unsupported_opcodes: List[int] = field(default_factory=list)

    def split_name_and_opcodes(self) -> None:
        if b"\x00" in self.body:
            name_bytes, opcodes = self.body.split(b"\x00", 1)
            self.name = decode_latin1_name(name_bytes)
            self.opcode_bytes = opcodes
        else:
            self.name = ""
            self.opcode_bytes = self.body

    def unicode_char(self, likely_font: bool) -> Optional[str]:
        if not likely_font:
            return None
        if 0 <= self.code <= 0x10FFFF:
            try:
                return chr(self.code)
            except ValueError:
                return None
        return None


@dataclass
class SHXDocument:
    source_path: Path
    appears_autocad_shx: bool
    signature: str
    format_kind: str
    classification: str
    header_info: Dict[str, Any]
    records: List[ShapeRecord]
    parse_errors: List[str] = field(default_factory=list)
    unsupported_format: bool = False

    def records_by_code(self) -> Dict[int, ShapeRecord]:
        return {record.code: record for record in self.records}

    def likely_font(self) -> bool:
        return "font" in self.classification

    def opcode_types(self) -> List[str]:
        seen = set()
        for record in self.records:
            for command in record.raw_commands:
                seen.add(command["op"])
        return sorted(seen)

    def unsupported_opcodes(self) -> List[int]:
        seen = set()
        for record in self.records:
            seen.update(record.unsupported_opcodes)
        return sorted(seen)

    def shape_count(self) -> int:
        return len(self.records)

    def to_json_obj(self) -> Dict[str, Any]:
        metrics = compute_font_metrics(self.records, self.likely_font())
        likely_font = self.likely_font()
        return {
            "source_file": self.source_path.name,
            "appears_autocad_shx": self.appears_autocad_shx,
            "format_kind": self.format_kind,
            "classification": self.classification,
            "signature": self.signature,
            "header_info": self.header_info,
            "metrics": metrics,
            "scale": metrics["scale"],
            "shape_count": self.shape_count(),
            "opcode_types": self.opcode_types(),
            "unsupported_opcodes": self.unsupported_opcodes(),
            "parse_errors": self.parse_errors,
            "glyphs": [record_to_json(record, likely_font) for record in self.records],
        }


def record_to_json(record: ShapeRecord, likely_font: bool) -> Dict[str, Any]:
    char = record.unicode_char(likely_font)
    return {
        "shape_number": record.code,
        "character_code": f"U+{record.code:04X}" if likely_font else None,
        "unicode": char,
        "name": record.name,
        "byte_count": record.byte_count,
        "advance_width": record.advance_width,
        "raw_opcode_bytes_hex": record.opcode_bytes.hex(" "),
        "raw_opcode_sequence": record.raw_commands,
        "decoded_stroke_geometry": record.paths,
        "polylines": record.polylines,
        "bounding_box": record.bbox,
        "unsupported_opcodes": sorted(set(record.unsupported_opcodes)),
        "parse_errors": record.parse_errors,
    }


def compute_font_metrics(records: List[ShapeRecord], likely_font: bool) -> Dict[str, Any]:
    boxes = [record.bbox for record in records if record.bbox]
    global_bbox = None
    if boxes:
        global_bbox = {
            "min_x": clean_number(min(box["min_x"] for box in boxes)),
            "min_y": clean_number(min(box["min_y"] for box in boxes)),
            "max_x": clean_number(max(box["max_x"] for box in boxes)),
            "max_y": clean_number(max(box["max_y"] for box in boxes)),
        }

    cap_heights: List[float] = []
    if likely_font:
        by_code = {record.code: record for record in records}
        for code in list(range(ord("A"), ord("Z") + 1)) + list(range(ord("0"), ord("9") + 1)):
            bbox = by_code.get(code).bbox if by_code.get(code) else None
            if bbox:
                cap_heights.append(float(bbox["max_y"] - bbox["min_y"]))

    if cap_heights:
        cap_heights.sort()
        source_cap_height = cap_heights[len(cap_heights) // 2]
    elif global_bbox:
        source_cap_height = float(global_bbox["max_y"] - global_bbox["min_y"])
    else:
        source_cap_height = None

    normalized_scale = NORMALIZED_CAP_HEIGHT / source_cap_height if source_cap_height else 1.0
    return {
        "source_cap_height": clean_number(source_cap_height) if source_cap_height else None,
        "normalized_cap_height": clean_number(NORMALIZED_CAP_HEIGHT),
        "normalized_scale": clean_number(normalized_scale),
        "scale": clean_number(normalized_scale),
        "scale_basis": "median height of A-Z and 0-9, targeting SIMPLEX cap height",
        "global_bbox": global_bbox,
    }


class SHXParser:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.data = self.path.read_bytes()
        self.errors: List[str] = []

    def parse(self) -> SHXDocument:
        marker = self.data.find(b"\x1a")
        if marker < 0:
            return SHXDocument(
                self.path,
                False,
                "",
                "unknown",
                "not AutoCAD SHX",
                {"error": "missing 0x1A signature terminator"},
                [],
                ["missing AutoCAD SHX signature terminator"],
                True,
            )

        signature = self.data[:marker].decode("latin1", errors="replace").strip()
        appears = signature.startswith("AutoCAD-86 ")
        format_kind = self._format_kind(signature)
        records: List[ShapeRecord] = []
        header_info: Dict[str, Any] = {"signature_marker_offset": marker}
        unsupported_format = False

        try:
            if format_kind == "unifont":
                records, header_info = self._parse_unifont(marker + 1)
            elif format_kind == "shapes":
                records, header_info = self._parse_shapes(marker + 1)
            elif format_kind == "bigfont":
                header_info = self._parse_bigfont_header(marker + 1)
                unsupported_format = True
                self.errors.append("bigfont index/data layout is recognized but not decoded in this pass")
            else:
                unsupported_format = True
                self.errors.append(f"unsupported AutoCAD SHX signature: {signature!r}")
        except Exception as exc:  # noqa: BLE001 - batch recovery should continue.
            unsupported_format = True
            self.errors.append(f"fatal parse error: {exc}")

        for record in records:
            record.split_name_and_opcodes()

        classification = classify_document(format_kind, records, unsupported_format)
        doc = SHXDocument(
            self.path,
            appears,
            signature,
            format_kind,
            classification,
            header_info,
            records,
            self.errors,
            unsupported_format,
        )
        self._decode_records(doc)
        return doc

    def _format_kind(self, signature: str) -> str:
        lowered = signature.lower()
        if "unifont" in lowered:
            return "unifont"
        if "bigfont" in lowered:
            return "bigfont"
        if "shapes" in lowered:
            return "shapes"
        return "unknown"

    def _parse_unifont(self, pos: int) -> Tuple[List[ShapeRecord], Dict[str, Any]]:
        declared_count = u16le(self.data, pos)
        pos += 2
        records: List[ShapeRecord] = []
        while pos + 4 <= len(self.data):
            code = u16le(self.data, pos)
            byte_count = u16le(self.data, pos + 2)
            pos += 4
            if byte_count < 0 or pos + byte_count > len(self.data):
                self.errors.append(f"record {code} exceeds file bounds at offset {pos}")
                break
            body = self.data[pos : pos + byte_count]
            pos += byte_count
            records.append(ShapeRecord(code=code, byte_count=byte_count, body=body))
        if len(records) != declared_count:
            self.errors.append(f"declared {declared_count} records, recovered {len(records)}")
        return records, {"declared_record_count": declared_count, "record_layout": "sequential"}

    def _parse_shapes(self, pos: int) -> Tuple[List[ShapeRecord], Dict[str, Any]]:
        first_shape = u16le(self.data, pos)
        last_shape = u16le(self.data, pos + 2)
        entry_count = u16le(self.data, pos + 4)
        table_start = pos + 6
        body_start = table_start + entry_count * 4
        records: List[ShapeRecord] = []
        if body_start > len(self.data):
            self.errors.append("shape index table extends beyond file")
            return records, {
                "first_shape": first_shape,
                "last_shape": last_shape,
                "declared_record_count": entry_count,
                "record_layout": "indexed",
            }

        body_pos = body_start
        for i in range(entry_count):
            entry = table_start + i * 4
            code = u16le(self.data, entry)
            byte_count = u16le(self.data, entry + 2)
            if body_pos + byte_count > len(self.data):
                body = self.data[body_pos:]
                self.errors.append(f"shape {code} exceeds file bounds at body offset {body_pos}")
                records.append(ShapeRecord(code=code, byte_count=byte_count, body=body))
                break
            body = self.data[body_pos : body_pos + byte_count]
            body_pos += byte_count
            records.append(ShapeRecord(code=code, byte_count=byte_count, body=body))

        return records, {
            "first_shape": first_shape,
            "last_shape": last_shape,
            "declared_record_count": entry_count,
            "body_offset": body_start,
            "record_layout": "indexed",
        }

    def _parse_bigfont_header(self, pos: int) -> Dict[str, Any]:
        vals = []
        for off in range(pos, min(pos + 16, len(self.data)), 2):
            if off + 2 <= len(self.data):
                vals.append(u16le(self.data, off))
        return {
            "record_layout": "bigfont-unsupported",
            "first_header_words": vals,
            "file_size": len(self.data),
        }

    def _decode_records(self, doc: SHXDocument) -> None:
        record_map = doc.records_by_code()
        for record in doc.records:
            if record.code == 0 and record.name:
                continue
            if not record.opcode_bytes:
                continue
            decoder = OpcodeDecoder(record_map, subshape_width=1 if doc.format_kind == "shapes" else 2)
            decoder.decode(record, record.opcode_bytes)


class OpcodeDecoder:
    def __init__(self, record_map: Dict[int, ShapeRecord], subshape_width: int = 2):
        self.record_map = record_map
        self.subshape_width = subshape_width

    def decode(self, record: ShapeRecord, data: bytes) -> None:
        state = GeometryState()
        commands = self._execute(data, state, record, depth=0)
        record.raw_commands = commands
        record.paths = normalize_paths(state.paths)
        record.polylines = paths_to_polylines(record.paths)
        record.bbox = compute_bbox(record.paths)
        record.advance_width = clean_number(state.x) if data else None
        record.curve_count = state.curve_count

    def _execute(
        self,
        data: bytes,
        state: "GeometryState",
        record: ShapeRecord,
        depth: int,
    ) -> List[Dict[str, Any]]:
        commands: List[Dict[str, Any]] = []
        if depth > 12:
            record.parse_errors.append("subshape recursion limit reached")
            return commands

        i = 0
        while i < len(data):
            offset = i
            op = data[i]
            i += 1

            if op == 0:
                commands.append({"offset": offset, "op": "end"})
                break
            if op == 1:
                state.pen_down = True
                commands.append({"offset": offset, "op": "pen_down"})
            elif op == 2:
                state.pen_down = False
                state.current_path = None
                commands.append({"offset": offset, "op": "pen_up"})
            elif op == 3:
                factor, i = read_u8_arg(data, i, record, "scale_div")
                if factor:
                    state.scale /= factor
                commands.append({"offset": offset, "op": "scale_div", "factor": factor})
            elif op == 4:
                factor, i = read_u8_arg(data, i, record, "scale_mul")
                if factor:
                    state.scale *= factor
                commands.append({"offset": offset, "op": "scale_mul", "factor": factor})
            elif op == 5:
                state.stack.append((state.x, state.y))
                commands.append({"offset": offset, "op": "push"})
            elif op == 6:
                if state.stack:
                    state.x, state.y = state.stack.pop()
                    state.current_path = None
                commands.append({"offset": offset, "op": "pop"})
            elif op == 7:
                if i + self.subshape_width > len(data):
                    record.parse_errors.append(f"short subshape at byte {offset}")
                    break
                if self.subshape_width == 1:
                    code = data[i]
                else:
                    code = u16le(data, i)
                i += self.subshape_width
                commands.append({"offset": offset, "op": "subshape", "shape_number": code})
                sub = self.record_map.get(code)
                if sub and sub.opcode_bytes:
                    parent_pen_down = state.pen_down
                    state.pen_down = True
                    state.current_path = None
                    self._execute(sub.opcode_bytes, state, record, depth + 1)
                    state.pen_down = parent_pen_down
                    state.current_path = None
            elif op == 8:
                if i + 2 > len(data):
                    record.parse_errors.append(f"short move at byte {offset}")
                    break
                dx, dy = i8(data[i]), i8(data[i + 1])
                i += 2
                state.move_by(dx, dy)
                commands.append({"offset": offset, "op": "move", "dx": dx, "dy": dy})
            elif op == 9:
                points = []
                while i + 2 <= len(data):
                    dx, dy = i8(data[i]), i8(data[i + 1])
                    i += 2
                    points.append([dx, dy])
                    if dx == 0 and dy == 0:
                        break
                    state.move_by(dx, dy)
                commands.append({"offset": offset, "op": "move_many", "deltas": points})
            elif op == 10:
                if i + 2 > len(data):
                    record.parse_errors.append(f"short octant arc at byte {offset}")
                    break
                radius, arc_byte = data[i], data[i + 1]
                i += 2
                state.octant_arc(radius, arc_byte)
                commands.append({
                    "offset": offset,
                    "op": "octant_arc",
                    "radius": radius,
                    "arc_byte": i8(arc_byte),
                    "raw_arc_byte": arc_byte,
                })
            elif op == 11:
                if i + 5 > len(data):
                    record.parse_errors.append(f"short fraction arc at byte {offset}")
                    break
                start_offset = data[i]
                end_offset = data[i + 1]
                high_radius = data[i + 2]
                radius = data[i + 3]
                arc_byte = data[i + 4]
                i += 5
                full_radius = high_radius * 256 + radius
                state.fraction_arc(full_radius, arc_byte, start_offset, end_offset)
                commands.append({
                    "offset": offset,
                    "op": "fraction_arc",
                    "radius": full_radius,
                    "arc_byte": i8(arc_byte),
                    "raw_arc_byte": arc_byte,
                    "start_offset": start_offset,
                    "end_offset": end_offset,
                    "approximate": True,
                })
            elif op == 12:
                if i + 3 > len(data):
                    record.parse_errors.append(f"short bulge arc at byte {offset}")
                    break
                dx, dy, bulge = i8(data[i]), i8(data[i + 1]), i8(data[i + 2])
                i += 3
                state.bulge_arc(dx, dy, bulge)
                commands.append({"offset": offset, "op": "bulge_arc", "dx": dx, "dy": dy, "bulge": bulge})
            elif op == 13:
                arcs = []
                while i + 2 <= len(data):
                    dx, dy = i8(data[i]), i8(data[i + 1])
                    i += 2
                    if dx == 0 and dy == 0:
                        break
                    if i >= len(data):
                        record.parse_errors.append(f"short bulge_arc_many bulge at byte {offset}")
                        break
                    bulge = i8(data[i])
                    i += 1
                    state.bulge_arc(dx, dy, bulge)
                    arcs.append({"dx": dx, "dy": dy, "bulge": bulge})
                commands.append({"offset": offset, "op": "bulge_arc_many", "arcs": arcs})
            elif op == 14:
                skip_to = skip_one_command(data, i)
                commands.append({"offset": offset, "op": "vertical_text", "skipped_bytes": list(data[i:skip_to])})
                i = skip_to
            else:
                length = op >> 4
                direction = op & 0x0F
                ux, uy = VECTOR_DIRECTIONS[direction]
                dx, dy = ux * length, uy * length
                state.move_by(dx, dy)
                commands.append({
                    "offset": offset,
                    "op": "vector",
                    "byte": op,
                    "length": length,
                    "direction": direction,
                    "dx": clean_number(dx),
                    "dy": clean_number(dy),
                })
        return commands


def read_u8_arg(data: bytes, pos: int, record: ShapeRecord, name: str) -> Tuple[int, int]:
    if pos >= len(data):
        record.parse_errors.append(f"short {name} argument")
        return 0, pos
    return data[pos], pos + 1


def skip_one_command(data: bytes, pos: int) -> int:
    if pos >= len(data):
        return pos
    op = data[pos]
    pos += 1
    if op in (3, 4):
        return min(len(data), pos + 1)
    if op == 7:
        return min(len(data), pos + 2)
    if op in (8, 10):
        return min(len(data), pos + 2)
    if op == 9:
        while pos + 2 <= len(data):
            dx, dy = data[pos], data[pos + 1]
            pos += 2
            if dx == 0 and dy == 0:
                break
        return pos
    if op == 12:
        return min(len(data), pos + 3)
    return pos


@dataclass
class GeometryState:
    x: float = 0.0
    y: float = 0.0
    scale: float = 1.0
    pen_down: bool = True
    stack: List[Tuple[float, float]] = field(default_factory=list)
    paths: List[List[Dict[str, Any]]] = field(default_factory=list)
    current_path: Optional[List[Dict[str, Any]]] = None
    curve_count: int = 0

    def ensure_path(self) -> None:
        if self.current_path is None:
            self.current_path = [{"type": "M", "x": self.x, "y": self.y}]
            self.paths.append(self.current_path)

    def move_by(self, dx: float, dy: float) -> None:
        x = self.x + dx * self.scale
        y = self.y + dy * self.scale
        if self.pen_down:
            self.ensure_path()
            self.current_path.append({"type": "L", "x": x, "y": y})
        self.x = x
        self.y = y

    def octant_arc(self, radius: int, arc_byte: int) -> None:
        if radius == 0:
            return
        clockwise, start_octant, octants = decode_arc_control_byte(arc_byte)
        direction = -1 if clockwise else 1
        r = radius * self.scale
        start = math.radians(start_octant * 45)
        sweep = math.radians(direction * octants * 45)
        cx = self.x - math.cos(start) * r
        cy = self.y - math.sin(start) * r
        self.arc_from_center(cx, cy, r, r, start, sweep)

    def fraction_arc(self, radius: int, arc_byte: int, start_offset: int, end_offset: int) -> None:
        if radius == 0:
            return
        clockwise, start_octant, octants = decode_arc_control_byte(arc_byte)

        direction = -1 if clockwise else 1
        start_fraction = start_offset / 256.0
        end_fraction = end_offset / 256.0
        start = math.radians((start_octant + direction * start_fraction) * 45)
        sweep_octants = max(0.001, octants - start_fraction + end_fraction)
        sweep = math.radians(direction * sweep_octants * 45)
        r = radius * self.scale
        cx = self.x - math.cos(start) * r
        cy = self.y - math.sin(start) * r
        self.arc_from_center(cx, cy, r, r, start, sweep)

    def bulge_arc(self, dx: int, dy: int, bulge_byte: int) -> None:
        if bulge_byte == 0:
            self.move_by(dx, dy)
            return
        x0, y0 = self.x, self.y
        x1 = x0 + dx * self.scale
        y1 = y0 + dy * self.scale
        chord = math.hypot(x1 - x0, y1 - y0)
        if chord == 0:
            return
        bulge = bulge_byte / 127.0
        theta = 4 * math.atan(bulge)
        radius = chord * (1 + bulge * bulge) / (4 * abs(bulge))
        mx, my = (x0 + x1) * 0.5, (y0 + y1) * 0.5
        nx, ny = -(y1 - y0) / chord, (x1 - x0) / chord
        center_offset = chord * (1 - bulge * bulge) / (4 * bulge)
        cx, cy = mx + nx * center_offset, my + ny * center_offset
        start = math.atan2(y0 - cy, x0 - cx)
        self.arc_from_center(cx, cy, radius, radius, start, theta)

    def arc_from_center(self, cx: float, cy: float, rx: float, ry: float, start: float, sweep: float) -> None:
        segments = max(1, math.ceil(abs(sweep) / (math.pi / 2)))
        delta = sweep / segments
        if self.pen_down:
            self.ensure_path()
        for idx in range(segments):
            a0 = start + delta * idx
            a1 = a0 + delta
            k = 4 / 3 * math.tan((a1 - a0) / 4)
            p0x = cx + rx * math.cos(a0)
            p0y = cy + ry * math.sin(a0)
            p1x = cx + rx * math.cos(a1)
            p1y = cy + ry * math.sin(a1)
            c1x = p0x - k * rx * math.sin(a0)
            c1y = p0y + k * ry * math.cos(a0)
            c2x = p1x + k * rx * math.sin(a1)
            c2y = p1y - k * ry * math.cos(a1)
            if self.pen_down:
                self.current_path.append({
                    "type": "C",
                    "x1": c1x,
                    "y1": c1y,
                    "x2": c2x,
                    "y2": c2y,
                    "x": p1x,
                    "y": p1y,
                })
                self.curve_count += 1
            self.x, self.y = p1x, p1y


def normalize_paths(paths: List[List[Dict[str, Any]]]) -> List[List[Dict[str, Any]]]:
    out: List[List[Dict[str, Any]]] = []
    for path in paths:
        new_path = []
        for cmd in path:
            new_cmd = {"type": cmd["type"]}
            for key, value in cmd.items():
                if key != "type":
                    new_cmd[key] = clean_number(float(value))
            new_path.append(new_cmd)
        out.append(new_path)
    return out


def paths_to_polylines(paths: List[List[Dict[str, Any]]], curve_steps: int = 12) -> List[List[List[float]]]:
    polylines: List[List[List[float]]] = []
    for path in paths:
        current: List[List[float]] = []
        last = (0.0, 0.0)
        for cmd in path:
            if cmd["type"] == "M":
                if current:
                    polylines.append(current)
                current = [[cmd["x"], cmd["y"]]]
                last = (cmd["x"], cmd["y"])
            elif cmd["type"] == "L":
                current.append([cmd["x"], cmd["y"]])
                last = (cmd["x"], cmd["y"])
            elif cmd["type"] == "C":
                for step in range(1, curve_steps + 1):
                    t = step / curve_steps
                    x, y = cubic_point(last, (cmd["x1"], cmd["y1"]), (cmd["x2"], cmd["y2"]), (cmd["x"], cmd["y"]), t)
                    current.append([clean_number(x), clean_number(y)])
                last = (cmd["x"], cmd["y"])
        if current:
            polylines.append(current)
    return polylines


def cubic_point(p0: Tuple[float, float], p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float], t: float) -> Tuple[float, float]:
    mt = 1 - t
    x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
    y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
    return x, y


def compute_bbox(paths: List[List[Dict[str, Any]]]) -> Optional[Dict[str, float]]:
    values: List[Tuple[float, float]] = []
    for path in paths:
        for cmd in path:
            for x_key, y_key in (("x", "y"), ("x1", "y1"), ("x2", "y2")):
                if x_key in cmd and y_key in cmd:
                    values.append((cmd[x_key], cmd[y_key]))
    if not values:
        return None
    xs, ys = zip(*values)
    return {
        "min_x": clean_number(min(xs)),
        "min_y": clean_number(min(ys)),
        "max_x": clean_number(max(xs)),
        "max_y": clean_number(max(ys)),
    }


def classify_document(format_kind: str, records: List[ShapeRecord], unsupported_format: bool) -> str:
    if unsupported_format and format_kind == "bigfont":
        return "bigfont text/symbol font (layout not decoded)"
    if format_kind == "unifont":
        return "text font"
    if format_kind == "shapes":
        codes = {record.code for record in records}
        printable = sum(1 for code in codes if 32 <= code <= 126)
        if printable >= 60:
            return "text font compiled as shape library"
        if printable >= 20:
            return "symbol font or partial text font"
        return "shape library"
    return "unknown"


def write_json(doc: SHXDocument, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(doc.to_json_obj(), indent=2, ensure_ascii=False), encoding="utf-8")


def write_report(doc: SHXDocument, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# {doc.source_path.name}",
        "",
        f"- Appears AutoCAD SHX: `{doc.appears_autocad_shx}`",
        f"- Signature: `{doc.signature}`",
        f"- Format kind: `{doc.format_kind}`",
        f"- Classification: `{doc.classification}`",
        f"- Shapes/glyphs found: `{doc.shape_count()}`",
        f"- Opcode types: `{', '.join(doc.opcode_types()) or 'none'}`",
        f"- Unsupported opcodes: `{', '.join(str(v) for v in doc.unsupported_opcodes()) or 'none'}`",
        "",
        "## Header",
        "",
        "```json",
        json.dumps(doc.header_info, indent=2, ensure_ascii=False),
        "```",
        "",
        "## Parse Errors",
        "",
    ]
    if doc.parse_errors:
        lines.extend(f"- {err}" for err in doc.parse_errors)
    else:
        lines.append("- none")
    bad_records = [record for record in doc.records if record.parse_errors or record.unsupported_opcodes]
    lines.extend(["", "## Record Warnings", ""])
    if bad_records:
        for record in bad_records[:200]:
            lines.append(
                f"- `{record.code}` / `0x{record.code:04X}`: "
                f"errors={record.parse_errors or []}; unsupported={sorted(set(record.unsupported_opcodes))}"
            )
    else:
        lines.append("- none")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_shp(doc: SHXDocument, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        ";;",
        f";;  Reconstructed SHP-like text from {doc.source_path.name}",
        ";;  This is archival/debug output, not guaranteed AutoCAD-round-trippable.",
        ";;",
        "",
    ]
    for record in doc.records:
        name = record.name if record.name else f"shape_{record.code:04X}"
        tokens = opcode_bytes_to_shp_tokens(record.opcode_bytes)
        lines.append(f"*{record.code:05X},{len(record.opcode_bytes)},{name}")
        lines.append(",".join(tokens) if tokens else "0")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def opcode_bytes_to_shp_tokens(data: bytes) -> List[str]:
    tokens: List[str] = []
    i = 0
    while i < len(data):
        op = data[i]
        i += 1
        if op in SPECIAL_NAMES:
            tokens.append(str(op))
            if op in (3, 4) and i < len(data):
                tokens.append(str(data[i]))
                i += 1
            elif op == 7 and i + 2 <= len(data):
                tokens.append(f"{u16le(data, i):05X}")
                i += 2
            elif op in (8, 10) and i + 2 <= len(data):
                a, b = i8(data[i]), i8(data[i + 1])
                i += 2
                if op == 10:
                    tokens.append(f"({a},{data[i - 1]:03X})")
                else:
                    tokens.append(f"({a},{b})")
            elif op == 9:
                while i + 2 <= len(data):
                    a, b = i8(data[i]), i8(data[i + 1])
                    i += 2
                    tokens.append(f"({a},{b})")
                    if a == 0 and b == 0:
                        break
            elif op == 12 and i + 3 <= len(data):
                a, b, c = i8(data[i]), i8(data[i + 1]), i8(data[i + 2])
                i += 3
                tokens.append(f"({a},{b},{c})")
            elif op == 11 and i + 5 <= len(data):
                a, b, c, d, e = data[i], data[i + 1], data[i + 2], data[i + 3], data[i + 4]
                i += 5
                tokens.append(f"({a},{b},{c},{d},{e:03X})")
            elif op == 13:
                while i + 2 <= len(data):
                    a, b = i8(data[i]), i8(data[i + 1])
                    i += 2
                    if a == 0 and b == 0:
                        tokens.append(f"({a},{b})")
                        break
                    if i >= len(data):
                        break
                    c = i8(data[i])
                    i += 1
                    tokens.append(f"({a},{b},{c})")
        else:
            tokens.append(f"{op:03X}")
    return tokens


def write_svg_specimen(doc: SHXDocument, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    records = [record for record in doc.records if record.code != 0]
    cols = 16
    cell_w, cell_h = 88, 106
    label_h = 18
    rows = max(1, math.ceil(len(records) / cols))
    width, height = cols * cell_w, rows * cell_h
    boxes = [record.bbox for record in records if record.bbox]
    if boxes:
        global_bbox = {
            "min_x": min(box["min_x"] for box in boxes),
            "min_y": min(box["min_y"] for box in boxes),
            "max_x": max(box["max_x"] for box in boxes),
            "max_y": max(box["max_y"] for box in boxes),
        }
    else:
        global_bbox = {"min_x": 0.0, "min_y": 0.0, "max_x": 1.0, "max_y": 1.0}
    global_w = max(1.0, global_bbox["max_x"] - global_bbox["min_x"])
    global_h = max(1.0, global_bbox["max_y"] - global_bbox["min_y"])
    specimen_scale = min((cell_w - 20) / global_w, (cell_h - label_h - 20) / global_h)
    global_cx = global_bbox["min_x"] + global_w / 2
    global_cy = global_bbox["min_y"] + global_h / 2
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="#111"/>',
        '<style>text{font:10px monospace;fill:#aaa}.box{fill:none;stroke:#333}.glyph{fill:none;stroke:#f4f1e8;stroke-width:1;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}.warn{stroke:#8a4;stroke-dasharray:3 3}</style>',
    ]
    for idx, record in enumerate(records):
        col, row = idx % cols, idx // cols
        x, y = col * cell_w, row * cell_h
        parts.append(f'<rect class="box" x="{x + 4}" y="{y + 4}" width="{cell_w - 8}" height="{cell_h - 8}"/>')
        label = f"{record.code:04X}"
        if doc.likely_font() and 32 <= record.code <= 0x10FFFF:
            ch = chr(record.code)
            if ch.isprintable() and not ch.isspace():
                label += f" {ch}"
        parts.append(f'<text x="{x + 8}" y="{y + label_h}">{html.escape(label)}</text>')
        if record.paths:
            d = svg_path_data(record.paths)
            tx = x + cell_w / 2 - global_cx * specimen_scale
            ty = y + label_h + (cell_h - label_h) / 2 + global_cy * specimen_scale
            parts.append(
                f'<path class="glyph" transform="translate({tx:.3f} {ty:.3f}) '
                f'scale({specimen_scale:.3f} {-specimen_scale:.3f})" d="{d}"/>'
            )
        else:
            cls = "box warn" if record.parse_errors or record.unsupported_opcodes else "box"
            parts.append(f'<rect class="{cls}" x="{x + 24}" y="{y + 34}" width="{cell_w - 48}" height="{cell_h - 58}"/>')
    parts.append("</svg>")
    path.write_text("\n".join(parts), encoding="utf-8")


def svg_path_data(paths: List[List[Dict[str, Any]]]) -> str:
    chunks: List[str] = []
    for path in paths:
        for cmd in path:
            if cmd["type"] == "M":
                chunks.append(f'M {cmd["x"]} {cmd["y"]}')
            elif cmd["type"] == "L":
                chunks.append(f'L {cmd["x"]} {cmd["y"]}')
            elif cmd["type"] == "C":
                chunks.append(f'C {cmd["x1"]} {cmd["y1"]} {cmd["x2"]} {cmd["y2"]} {cmd["x"]} {cmd["y"]}')
    return " ".join(chunks)


def decode_file(path: Path) -> SHXDocument:
    return SHXParser(path).parse()


def write_all_outputs(doc: SHXDocument, output_dir: Path) -> None:
    stem = doc.source_path.stem
    write_report(doc, output_dir / "reports" / f"{stem}.report.md")
    write_json(doc, output_dir / "json" / f"{stem}.json")
    write_svg_specimen(doc, output_dir / "svg" / f"{stem}_specimen.svg")
    write_shp(doc, output_dir / "shp" / f"{stem}_reconstructed.shp")


def batch_decode(input_dir: Path, output_dir: Path) -> List[SHXDocument]:
    paths = sorted(
        p for p in Path(input_dir).iterdir()
        if p.is_file() and p.suffix.lower() == ".shx"
    )
    docs: List[SHXDocument] = []
    log_lines = []
    for path in paths:
        doc = decode_file(path)
        write_all_outputs(doc, output_dir)
        docs.append(doc)
        log_lines.append(
            f"{path.name}: autocad={doc.appears_autocad_shx} kind={doc.format_kind} "
            f"class={doc.classification} shapes={doc.shape_count()} errors={len(doc.parse_errors)}"
        )
    log_path = output_dir / "logs" / "batch_log.txt"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.write_text("\n".join(log_lines) + ("\n" if log_lines else ""), encoding="utf-8")
    return docs
