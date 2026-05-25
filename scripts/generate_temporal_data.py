#!/usr/bin/env python3
"""DISC-012 Phase 6 — temporal.html 用データ生成。

ritual_epoch / continuity_break / persistence_medium の 3 TSV を
web/data/ にコピーし、temporal.html から fetch 可能にする。

実行: python3 scripts/generate_temporal_data.py
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'web' / 'data'

SOURCES = [
    ('docs/civilization/03_ritual_epoch.tsv', 'ritual_epoch.tsv'),
    ('docs/civilization/04_continuity_break.tsv', 'continuity_break.tsv'),
    ('docs/civilization/05_persistence_medium.tsv', 'persistence_medium.tsv'),
    ('docs/civilization/06_entity_version.tsv', 'entity_version.tsv'),
    ('docs/civilization/07_narrative_layer.tsv', 'narrative_layer.tsv'),
    ('docs/civilization/08_boundary_structure.tsv', 'boundary_structure.tsv'),
    ('docs/civilization/09_sacred_landscape.tsv', 'sacred_landscape.tsv'),
    ('docs/civilization/10_ritual_space.tsv', 'ritual_space.tsv'),
    ('docs/civilization/11_spatial_interpretation.tsv', 'spatial_interpretation.tsv'),
]


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for src_rel, dest_name in SOURCES:
        src = ROOT / src_rel
        if not src.exists():
            print(f'[SKIP] {src_rel} not found', file=sys.stderr)
            continue
        dest = OUT_DIR / dest_name
        shutil.copy2(src, dest)
        # Count rows
        with src.open(encoding='utf-8') as f:
            rows = sum(1 for _ in f) - 1
        print(f'[OK] {src_rel} → web/data/{dest_name} ({rows} rows)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
