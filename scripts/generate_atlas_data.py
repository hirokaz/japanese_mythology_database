#!/usr/bin/env python3
"""DISC-008 Phase 1 — Atlas hub データ生成。

shrine_master.tsv から coordinates を持つ verified 神社を抽出し、
web/data/atlas_hubs.tsv を生成する。

DISC-008 採択 Phase 1 = 30 件 demonstration (network hub)。

実行:
    python3 scripts/generate_atlas_data.py
"""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'master' / 'shrine_master.tsv'
OUT = ROOT / 'web' / 'data' / 'atlas_hubs.tsv'

# 出力 column (Phase 1 簡易版)
OUT_COLS = [
    'master_id', 'canonical_name', 'canonical_reading',
    'prefecture', 'address', 'coordinates',
    'shrine_rank_ancient', 'shrine_rank_modern',
    'main_deity_ids', 'verified_status',
]

COORD_RE = re.compile(r'^\d+\.\d+,\d+\.\d+$')


def main() -> int:
    if not SRC.exists():
        print(f'[ERROR] {SRC} が見つかりません', file=sys.stderr)
        return 1

    with SRC.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        rows = list(rdr)

    selected = []
    for r in rows:
        coords = (r.get('coordinates') or '').strip()
        if not coords or not COORD_RE.match(coords):
            continue
        if (r.get('verified_status') or '').strip() != 'verified':
            continue
        selected.append({k: (r.get(k) or '') for k in OUT_COLS})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=OUT_COLS, delimiter='\t', lineterminator='\n')
        w.writeheader()
        w.writerows(selected)

    print(f'[OK] wrote {OUT}: {len(selected)} hubs')

    # 統計
    rank_counts = {'myojin': 0, 'ichinomiya': 0, 'other': 0}
    for r in selected:
        rank = r['shrine_rank_ancient'] or ''
        if '名神大社' in rank:
            rank_counts['myojin'] += 1
        elif '一宮' in rank:
            rank_counts['ichinomiya'] += 1
        else:
            rank_counts['other'] += 1
    print(f'  名神大社: {rank_counts["myojin"]}')
    print(f'  一宮(非名神大社): {rank_counts["ichinomiya"]}')
    print(f'  その他 verified: {rank_counts["other"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
