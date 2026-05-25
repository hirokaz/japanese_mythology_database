#!/usr/bin/env python3
"""Phase 3 — relations.tsv に inference_type 列を追加 (DISC-005 / DISC-009 連動)。

各 relation を以下に分類:
- symbolic:       mythologem / motif / mentioned_in / linked_to_myth 等
- source_backed:  L0 + 古代社格保持 + 文献明示 (限定)
- speculative:    L4-L5
- inferential:    その他 (default)

実行: python3 scripts/add_inference_type.py
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'relations' / 'relations.tsv'

# Phase 1 ETL の RELATION_ONTOLOGY と同期 (symbolic category)
SYMBOLIC_RELATION_TYPES = {
    'linked_to_myth', 'derived_from_motif', 'associated_with',
    'mentioned_in', 'localized_via_shrine', 'participated_in',
    'motif_belongs_to_mythologem',
}

# 確実に source_backed (L0 + 制度的明示)
SOURCE_BACKED_RELATION_TYPES = {
    'has_rank',                # 神階授与 (三代実録等明示)
    'is_ichinomiya_of',        # 一宮制度
    'located_in_country',      # 律令制
}


def classify(r: dict) -> str:
    rtype = (r.get('relation_type') or '').strip()
    layer = (r.get('hypothesis_layer') or '').strip()
    conf = (r.get('confidence_level') or '').strip()

    # L4-L5 → speculative (DISC-005 採択)
    if layer in ('L4', 'L5'):
        return 'speculative'
    # SYMBOLIC category → symbolic
    if rtype in SYMBOLIC_RELATION_TYPES:
        return 'symbolic'
    # 限定 source_backed
    if rtype in SOURCE_BACKED_RELATION_TYPES and layer == 'L0' and conf in ('A', 'B'):
        return 'source_backed'
    # L0 + A/B confidence でも default は inferential (overconfidence 回避)
    if layer == 'L0' and conf == 'A':
        return 'source_backed'  # 文献明示+裏付け強
    if layer in ('L0', 'L1'):
        return 'inferential'
    if layer in ('L2', 'L3'):
        return 'inferential'  # 民間伝承も symbolic ではなく inferential 扱い
    return 'inferential'


def main() -> int:
    if not SRC.exists():
        print(f'[ERROR] {SRC} not found', file=sys.stderr)
        return 1

    with SRC.open(encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    header = rows[0]

    if 'inference_type' in header:
        print(f'[SKIP] {SRC}: 既に追加済')
        return 0

    new_header = header + ['inference_type']
    new_rows = [new_header]
    stats = {'source_backed': 0, 'inferential': 0, 'speculative': 0, 'symbolic': 0}
    for r in rows[1:]:
        d = dict(zip(header, r))
        itype = classify(d)
        new_rows.append(r + [itype])
        stats[itype] = stats.get(itype, 0) + 1

    with SRC.open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in new_rows:
            w.writerow(r)

    total = sum(stats.values())
    print(f'[OK] {SRC}: +1 field 追加 (total {total})')
    for k, v in stats.items():
        pct = v * 100 / total if total else 0
        print(f'  {k:15s}: {v:5d} ({pct:.1f}%)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
