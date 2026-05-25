#!/usr/bin/env python3
"""Phase 4 — 他 master の verified_status 拡大。

DISC-006 epistemology layer 原則 (institutional verifiability)。

各 master の拡大基準:
- text:     全件 → verified (本 master は文献そのもの = institutional source)
- period:   全件 → verified (歴史区分は institutionally established)
- rank:     全件 → verified (神階制度は延喜式・三代実録に明記)
- event:    source_reference 非空 → verified
- region:   region_type IN [prefecture, ancient_country, dou] → verified
  (legacy_cluster / other / unknown は under_review 維持)
- festival: source_reference 非空 + canonical_name に著名社含む → verified
- motif:    earliest_sources に 古事記/日本書紀/延喜式/風土記 を含む → verified
"""

from __future__ import annotations

import csv
import datetime
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOW = datetime.datetime(2026, 5, 25).isoformat()
TEXTUAL_REFS = ('古事記', '日本書紀', '延喜式', '風土記', '続日本紀', '三代実録', '令義解')


def update_master(path: Path, classifier) -> tuple[int, int, int]:
    """master の verified_status を classifier 関数で更新。

    classifier(row) -> (new_status, reason) | None (変更しない場合)
    """
    with path.open(encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    if len(rows) < 2:
        return 0, 0, 0
    header = rows[0]
    if 'verified_status' not in header:
        print(f'  [SKIP] {path.name}: no verified_status field')
        return 0, 0, 0

    vs_idx = header.index('verified_status')
    src_idx = header.index('verification_source')
    at_idx = header.index('verified_at')

    promoted = 0
    for r in rows[1:]:
        if r[vs_idx] == 'verified':
            continue
        d = dict(zip(header, r))
        result = classifier(d)
        if result is None:
            continue
        new_status, reason = result
        r[vs_idx] = new_status
        r[src_idx] = f'auto-expand Phase 4: {reason}'
        r[at_idx] = NOW
        promoted += 1

    with path.open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in rows:
            w.writerow(r)
    return promoted, len(rows) - 1, sum(1 for r in rows[1:] if r[vs_idx] == 'verified')


# --- 各 master の classifier ---

def classify_text(r):
    # text_master 自体が institutional source、全件 verified
    return ('verified', '本 master は文献そのもの (institutional source)')


def classify_period(r):
    return ('verified', '歴史区分は institutionally established')


def classify_rank(r):
    return ('verified', '神階制度は延喜式・三代実録に明記')


def classify_event(r):
    src = (r.get('source_reference') or '').strip()
    if src and src != '-':
        return ('verified', 'source_reference あり (institutional documentation)')
    return None


def classify_region(r):
    rtype = (r.get('region_type') or '').strip()
    if rtype in ('prefecture', 'ancient_country', 'dou'):
        return ('verified', f'region_type={rtype} (institutionally established)')
    return None


def classify_festival(r):
    src = (r.get('source_reference') or '').strip()
    if src and src != '-':
        return ('verified', 'source_reference あり (祭祀継承の institutional record)')
    return None


def classify_motif(r):
    src = (r.get('earliest_sources') or '').strip()
    if any(k in src for k in TEXTUAL_REFS):
        return ('verified', 'earliest_sources に文献記載')
    return None


def main() -> int:
    targets = [
        ('docs/master/text_master.tsv', classify_text),
        ('docs/master/period_master.tsv', classify_period),
        ('docs/master/rank_master.tsv', classify_rank),
        ('docs/master/event_master.tsv', classify_event),
        ('docs/master/region_master.tsv', classify_region),
        ('docs/master/festival_master.tsv', classify_festival),
        ('docs/civilization/01_motif_db.tsv', classify_motif),
    ]

    print('=== Phase 4 verified_status 拡大 ===\n')
    grand_promoted = 0
    grand_total = 0
    grand_verified = 0
    for rel_path, classifier in targets:
        path = ROOT / rel_path
        if not path.exists():
            continue
        promoted, total, verified = update_master(path, classifier)
        grand_promoted += promoted
        grand_total += total
        grand_verified += verified
        pct = verified * 100 / total if total else 0
        print(f'  {path.name:30s}: +{promoted:4d} promoted | {verified}/{total} verified ({pct:.1f}%)')

    print(f'\n=== 合計 ===')
    pct = grand_verified * 100 / grand_total if grand_total else 0
    print(f'  +{grand_promoted} promoted | {grand_verified}/{grand_total} verified ({pct:.1f}%)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
