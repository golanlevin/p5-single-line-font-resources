#!/usr/bin/env python3
"""CLI for batch-decoding AutoCAD SHX files."""

from __future__ import annotations

import argparse
from pathlib import Path

from shx_decoder import batch_decode


# TEMPORARY for the large incoming font batch. Revert this defaulting behavior
# after the __NEW/shx conversion pass is complete.
PROJECT_DIR = Path(__file__).resolve().parents[1]
TEMP_DEFAULT_INPUT = PROJECT_DIR / "__NEW" / "shx"
TEMP_DEFAULT_OUTPUT = PROJECT_DIR / "__NEW" / "output"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Decode AutoCAD compiled SHX shape/font files into JSON, reports, SVG specimens, and SHP-like text."
    )
    parser.add_argument("input_shx_folder", type=Path, nargs="?", default=TEMP_DEFAULT_INPUT)
    parser.add_argument("output_folder", type=Path, nargs="?", default=TEMP_DEFAULT_OUTPUT)
    args = parser.parse_args()

    docs = batch_decode(args.input_shx_folder, args.output_folder)
    print(f"Decoded {len(docs)} SHX files into {args.output_folder}")
    for doc in docs:
        status = "ok" if not doc.parse_errors else f"{len(doc.parse_errors)} errors"
        print(f"- {doc.source_path.name}: {doc.format_kind}, {doc.classification}, {doc.shape_count()} records, {status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
