#!/usr/bin/env python3
"""Extract Vib-Ribbon PAK records using the leading offset table."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


NAME_RE = re.compile(rb"^[A-Z0-9_./-]+\.[A-Z0-9_]+$")


def clean_name(raw: bytes, index: int) -> str:
    name = raw.split(b"\0", 1)[0]
    if NAME_RE.match(name):
        return name.decode("ascii")
    return f"{index:04d}.bin"


def read_offsets(data: bytes) -> list[int]:
    count = int.from_bytes(data[:4], "little")
    table_size = 4 + count * 4
    if count <= 0 or table_size > len(data):
        raise ValueError("not a PAK offset table")
    offsets = [int.from_bytes(data[4 + i * 4 : 8 + i * 4], "little") for i in range(count)]
    if offsets[0] != table_size:
        raise ValueError(f"unexpected first offset {offsets[0]}, expected {table_size}")
    if offsets != sorted(offsets) or offsets[-1] > len(data):
        raise ValueError("invalid PAK offsets")
    return offsets + [len(data)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pak", type=Path)
    parser.add_argument("out_dir", type=Path)
    args = parser.parse_args()

    data = args.pak.read_bytes()
    offsets = read_offsets(data)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for i, (start, end) in enumerate(zip(offsets, offsets[1:])):
        chunk = data[start:end]
        name = clean_name(chunk, i)
        target = args.out_dir / f"{i:04d}_{name}"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(chunk)
        print(f"{i:04d} {start:8d} {end - start:8d} {name}")


if __name__ == "__main__":
    main()
