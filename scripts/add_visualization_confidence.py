#!/usr/bin/env python3
"""DISC-008 Phase 2 — shrine_master に visualization_confidence field 追加。

DISC-008 採択 (CLAUDE.md §4.6):
- archaeological (考古学根拠): 出土品・遺構との対応
- textual (文献根拠): 記紀・延喜式・社伝
- inferred (妥当な推論): 古代海運ルート推定等
- speculative (検証困難仮説): 中央構造線神社配置論等

初期値ロジック:
- coordinates あり & 古代社格 (式内/名神大社/一宮) 持ち → 'textual' (文献根拠)
- coordinates あり & 古代社格なし → 'inferred' (現存組織登録による推定)
- coordinates なし → 空値
"""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'master' / 'shrine_master.tsv'

NEW_FIELD = 'visualization_confidence'
COORD_RE = re.compile(r'^\d+\.\d+,\d+\.\d+$')
ANCIENT_RANKS = ('式内', '名神大社', '一宮', '二宮', '勅祭', '二十二社', '国造神賀詞奏上')


def main() -> int:
    if not SRC.exists():
        print(f'[ERROR] {SRC} not found', file=sys.stderr)
        return 1

    with SRC.open(encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    header = rows[0]

    if NEW_FIELD in header:
        print(f'[SKIP] {SRC}: 既に追加済')
        return 0

    new_header = header + [NEW_FIELD]
    coord_idx = header.index('coordinates')
    rank_anc_idx = header.index('shrine_rank_ancient')

    new_rows = [new_header]
    stats = {'textual': 0, 'inferred': 0, 'empty': 0}
    for r in rows[1:]:
        coords = (r[coord_idx] or '').strip()
        rank_anc = (r[rank_anc_idx] or '').strip()
        if not COORD_RE.match(coords):
            value = ''
            stats['empty'] += 1
        elif any(k in rank_anc for k in ANCIENT_RANKS):
            value = 'textual'
            stats['textual'] += 1
        else:
            value = 'inferred'
            stats['inferred'] += 1
        new_rows.append(r + [value])

    with SRC.open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in new_rows:
            w.writerow(r)

    print(f'[OK] {SRC}: +1 field 追加')
    for k, v in stats.items():
        print(f'  {k}: {v}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
