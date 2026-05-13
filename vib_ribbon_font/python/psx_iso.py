#!/usr/bin/env python3
"""Small PlayStation MODE2/2352 ISO-9660 extraction helper."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path


RAW_SECTOR = 2352
DATA_SECTOR = 2048
DATA_OFFSET = 24


@dataclass
class IsoFile:
    path: str
    extent: int
    size: int
    flags: int


def sector_payload(raw: bytes, sector: int) -> bytes:
    start = sector * RAW_SECTOR + DATA_OFFSET
    return raw[start : start + DATA_SECTOR]


def read_u32_both(data: bytes, off: int) -> int:
    return int.from_bytes(data[off : off + 4], "little")


def parse_dir(raw: bytes, extent: int, size: int, prefix: str = "") -> list[IsoFile]:
    out: list[IsoFile] = []
    remaining = size
    sector = extent
    while remaining > 0:
        block = sector_payload(raw, sector)
        pos = 0
        limit = min(DATA_SECTOR, remaining)
        while pos < limit:
            length = block[pos]
            if length == 0:
                break
            rec = block[pos : pos + length]
            rec_extent = read_u32_both(rec, 2)
            rec_size = read_u32_both(rec, 10)
            flags = rec[25]
            name_len = rec[32]
            name_bytes = rec[33 : 33 + name_len]
            if name_bytes in (b"\x00", b"\x01"):
                pos += length
                continue
            name = name_bytes.decode("ascii", errors="replace")
            name = name.split(";")[0]
            full = f"{prefix}/{name}" if prefix else name
            item = IsoFile(full, rec_extent, rec_size, flags)
            out.append(item)
            if flags & 0x02:
                out.extend(parse_dir(raw, rec_extent, rec_size, full))
            pos += length
        remaining -= DATA_SECTOR
        sector += 1
    return out


def list_files(raw: bytes) -> list[IsoFile]:
    pvd = sector_payload(raw, 16)
    if pvd[1:6] != b"CD001":
        raise ValueError("primary volume descriptor not found at sector 16")
    root = pvd[156:]
    root_extent = read_u32_both(root, 2)
    root_size = read_u32_both(root, 10)
    return parse_dir(raw, root_extent, root_size)


def extract_file(raw: bytes, item: IsoFile, root: Path) -> None:
    target = root / item.path
    if item.flags & 0x02:
        target.mkdir(parents=True, exist_ok=True)
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    chunks = []
    remaining = item.size
    sector = item.extent
    while remaining > 0:
        payload = sector_payload(raw, sector)
        take = min(DATA_SECTOR, remaining)
        chunks.append(payload[:take])
        remaining -= take
        sector += 1
    target.write_bytes(b"".join(chunks))


def strip_to_iso(raw: bytes, out_path: Path) -> None:
    sectors = len(raw) // RAW_SECTOR
    with out_path.open("wb") as f:
        for sector in range(sectors):
            f.write(sector_payload(raw, sector))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("track_bin", type=Path)
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--extract", type=Path)
    parser.add_argument("--strip", type=Path)
    args = parser.parse_args()

    raw = args.track_bin.read_bytes()
    if len(raw) % RAW_SECTOR:
        raise ValueError(f"unexpected raw track size {len(raw)}")

    if args.strip:
        strip_to_iso(raw, args.strip)
    if args.list or args.extract:
        items = list_files(raw)
        for item in items:
            kind = "dir " if item.flags & 0x02 else "file"
            print(f"{kind} {item.extent:6d} {item.size:9d} {item.path}")
        if args.extract:
            for item in items:
                extract_file(raw, item, args.extract)


if __name__ == "__main__":
    main()
