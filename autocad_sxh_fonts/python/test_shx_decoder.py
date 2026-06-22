#!/usr/bin/env python3

from __future__ import annotations

import re
import tempfile
import unittest
from pathlib import Path

import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shx_decoder import batch_decode, decode_file, write_svg_specimen  # noqa: E402


ROOT = Path(__file__).resolve().parents[2]
SHX_DIR = ROOT / "autocad_fonts_from_shx" / "shx"
NEW_SHX_DIR = ROOT / "autocad_fonts_from_shx" / "__NEW" / "shx"


class SHXDecoderTests(unittest.TestCase):
    def test_unifont_simplex_recovers_ascii_glyphs(self) -> None:
        doc = decode_file(SHX_DIR / "simplex.shx")
        self.assertTrue(doc.appears_autocad_shx)
        self.assertEqual(doc.format_kind, "unifont")
        self.assertGreater(doc.shape_count(), 300)
        glyph_a = doc.records_by_code()[0x41]
        self.assertTrue(glyph_a.paths)
        self.assertIsNotNone(glyph_a.bbox)

    def test_shapes_file_recovers_indexed_records(self) -> None:
        doc = decode_file(SHX_DIR / "simpfrac.shx")
        self.assertTrue(doc.appears_autocad_shx)
        self.assertEqual(doc.format_kind, "shapes")
        self.assertGreater(doc.shape_count(), 80)
        self.assertIn(0x20, doc.records_by_code())

    def test_bigfont_is_diagnostic_not_crash(self) -> None:
        bigfont_path = SHX_DIR / "special.shx"
        if not bigfont_path.exists():
            self.skipTest("optional bigfont sample special.shx is not present")
        doc = decode_file(bigfont_path)
        self.assertTrue(doc.appears_autocad_shx)
        self.assertEqual(doc.format_kind, "bigfont")
        self.assertTrue(doc.unsupported_format)

    def test_shape_execution_starts_pen_down(self) -> None:
        doc = decode_file(SHX_DIR / "HANDLETR.shx")
        records = doc.records_by_code()

        glyph_a = records[ord("A")]
        self.assertEqual(glyph_a.paths[0][0], {"type": "M", "x": 0.0, "y": 0.0})
        self.assertEqual(glyph_a.paths[0][1], {"type": "L", "x": 10, "y": 15})

        glyph_h = records[ord("h")]
        self.assertEqual(glyph_h.paths[0][0], {"type": "M", "x": 0.0, "y": 0.0})
        self.assertEqual(glyph_h.paths[0][1], {"type": "L", "x": 0.0, "y": 15})

        glyph_r = records[ord("r")]
        self.assertEqual(glyph_r.paths[0][1], {"type": "L", "x": 0.0, "y": 10})

        glyph_3 = records[ord("3")]
        self.assertEqual(glyph_3.paths[0][1], {"type": "L", "x": 3, "y": 0.0})

    def test_subshape_execution_starts_pen_down(self) -> None:
        doc = decode_file(SHX_DIR / "HANDLTR.SHX")
        records = doc.records_by_code()

        three_quarters = records[ord("[")]
        self.assertEqual(three_quarters.paths[1][0], {"type": "M", "x": -1, "y": 7})
        self.assertEqual(three_quarters.paths[1][1], {"type": "L", "x": 1, "y": 7})

        three_eighths = records[ord("{")]
        self.assertEqual(three_eighths.paths[1][0], {"type": "M", "x": 0.0, "y": 7})
        self.assertEqual(three_eighths.paths[1][1], {"type": "L", "x": 2, "y": 7})

    def test_batch_writes_expected_directories(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            docs = batch_decode(SHX_DIR, Path(tmp))
            self.assertGreaterEqual(len(docs), 10)
            self.assertTrue((Path(tmp) / "reports" / "simplex.report.md").exists())
            self.assertTrue((Path(tmp) / "json" / "simplex.json").exists())
            self.assertTrue((Path(tmp) / "svg" / "simplex_specimen.svg").exists())
            self.assertTrue((Path(tmp) / "shp" / "simplex_reconstructed.shp").exists())
            self.assertTrue((Path(tmp) / "logs" / "batch_log.txt").exists())

    def test_svg_specimen_uses_font_wide_scale(self) -> None:
        doc = decode_file(SHX_DIR / "simplex.shx")
        with tempfile.TemporaryDirectory() as tmp:
            svg_path = Path(tmp) / "simplex_specimen.svg"
            write_svg_specimen(doc, svg_path)
            svg_text = svg_path.read_text(encoding="utf-8")
            scales = re.findall(r"scale\(([0-9.]+) -[0-9.]+\)", svg_text)

        self.assertGreater(len(scales), 20)
        self.assertEqual(len(set(scales)), 1)
        self.assertIn("stroke-width:1;vector-effect:non-scaling-stroke", svg_text)

    def test_high_bit_clockwise_octant_arcs_do_not_add_extra_loops(self) -> None:
        isocp_path = NEW_SHX_DIR / "isocp.shx"
        if not isocp_path.exists():
            self.skipTest("optional __NEW isocp.shx fixture is not present")

        doc = decode_file(isocp_path)
        glyph_c = doc.records_by_code()[ord("C")]
        arc_commands = [command for command in glyph_c.raw_commands if command["op"] == "octant_arc"]

        self.assertEqual(glyph_c.curve_count, 2)
        self.assertEqual(glyph_c.bbox, {"min_x": 6, "min_y": 2, "max_x": 22, "max_y": 38})
        self.assertEqual(arc_commands[0]["raw_arc_byte"], 0xE2)


if __name__ == "__main__":
    unittest.main()
