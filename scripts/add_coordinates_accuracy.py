#!/usr/bin/env python3
"""DISC-008 Phase 1 — shrine_master に coordinates_accuracy 等 3 field 追加。

追加 field (3 種、DISC-008 採択):
- coordinates_accuracy:    exact / approximate / inferred / unknown
- coordinates_source:      OSM | Wikipedia | 公式サイト | 神社庁 | 国土地理院 | manual
- coordinates_verified_at: ISO8601

初期値ロジック:
- coordinates 入力済 & verified_status=verified → coordinates_accuracy='approximate',
  coordinates_source='manual'
- coordinates なし → 全 field 空

実行: python3 scripts/add_coordinates_accuracy.py
"""

from __future__ import annotations

import csv
import datetime
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'master' / 'shrine_master.tsv'

NEW_FIELDS = [
    'coordinates_accuracy',
    'coordinates_source',
    'coordinates_verified_at',
]

NOW = datetime.datetime(2026, 5, 25).isoformat()
COORD_RE = re.compile(r'^\d+\.\d+,\d+\.\d+$')


def main() -> int:
    if not SRC.exists():
        print(f'[ERROR] {SRC} not found', file=sys.stderr)
        return 1

    with SRC.open(encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    header = rows[0]

    if 'coordinates_accuracy' in header:
        print(f'[SKIP] {SRC}: 既に追加済')
        return 0

    new_header = header + NEW_FIELDS
    coord_idx = header.index('coordinates')
    verified_idx = header.index('verified_status')

    new_rows = [new_header]
    stats = {'with_coords': 0, 'without_coords': 0}
    for r in rows[1:]:
        coords = (r[coord_idx] or '').strip()
        vstatus = (r[verified_idx] or '').strip()
        if COORD_RE.match(coords) and vstatus == 'verified':
            extra = ['approximate', 'manual', NOW]
            stats['with_coords'] += 1
        else:
            extra = ['', '', '']
            stats['without_coords'] += 1
        new_rows.append(r + extra)

    with SRC.open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in new_rows:
            w.writerow(r)

    print(f'[OK] {SRC}: +3 field 追加')
    print(f'  coordinates あり (approximate 初期値): {stats["with_coords"]}')
    print(f'  coordinates なし (空値): {stats["without_coords"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
