#!/usr/bin/env python3
"""Phase 3 — verified_status 拡大 (under_review → verified)。

DISC-006 採択 epistemology layer 原則:
- verified_status = institutional verifiability (制度・史料・現存組織により確認可能)
- ≠ historical truth

拡大基準 (Phase 3 で厳格化):
- deity: main_text_appearance に 古事記/日本書紀/延喜式/風土記 を含む → verified
- clan: notes に 系譜資料 (新撰姓氏録/公卿補任/尊卑分脈/古事記/日本書紀)
        または ancestor_deity_id ありかつ verified deity の祖神 → verified

実行: python3 scripts/expand_verified_status.py
"""

from __future__ import annotations

import csv
import datetime
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NOW = datetime.datetime(2026, 5, 25).isoformat()
TEXTUAL_REFS = ('古事記', '日本書紀', '延喜式', '風土記')
GENEALOGY_REFS = ('新撰姓氏録', '公卿補任', '尊卑分脈', '古事記', '日本書紀', '風土記', '延喜式')


def expand_deity() -> tuple[int, int]:
    """deity_master.tsv の verified 拡大。"""
    path = ROOT / 'docs' / 'master' / 'deity_master.tsv'
    with path.open(encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    header = rows[0]
    main_text_idx = header.index('main_text_appearance')
    vs_idx = header.index('verified_status')
    src_idx = header.index('verification_source')
    at_idx = header.index('verified_at')

    promoted = 0
    for r in rows[1:]:
        if r[vs_idx] == 'verified':
            continue
        main_text = r[main_text_idx] or ''
        if any(k in main_text for k in TEXTUAL_REFS):
            r[vs_idx] = 'verified'
            r[src_idx] = 'auto-expand Phase 3: main_text_appearance に文献記載'
            r[at_idx] = NOW
            promoted += 1

    with path.open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in rows:
            w.writerow(r)

    return promoted, len(rows) - 1


def expand_clan(verified_deities: set[str]) -> tuple[int, int]:
    """clan_master.tsv の verified 拡大。"""
    path = ROOT / 'docs' / 'master' / 'clan_master.tsv'
    with path.open(encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    header = rows[0]
    notes_idx = header.index('notes')
    ancestor_idx = header.index('ancestor_deity_id')
    vs_idx = header.index('verified_status')
    src_idx = header.index('verification_source')
    at_idx = header.index('verified_at')

    promoted = 0
    for r in rows[1:]:
        if r[vs_idx] == 'verified':
            continue
        notes = r[notes_idx] or ''
        ancestor = (r[ancestor_idx] or '').strip()
        # 系譜資料への明示参照
        if any(k in notes for k in GENEALOGY_REFS):
            r[vs_idx] = 'verified'
            r[src_idx] = 'auto-expand Phase 3: notes に系譜資料参照'
            r[at_idx] = NOW
            promoted += 1
            continue
        # verified deity を祖神に持つ場合
        if ancestor in verified_deities and ancestor:
            r[vs_idx] = 'verified'
            r[src_idx] = f'auto-expand Phase 3: 祖神 {ancestor} が verified'
            r[at_idx] = NOW
            promoted += 1

    with path.open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in rows:
            w.writerow(r)

    return promoted, len(rows) - 1


def get_verified_deities() -> set[str]:
    path = ROOT / 'docs' / 'master' / 'deity_master.tsv'
    with path.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        return {r['master_id'] for r in rdr if r.get('verified_status') == 'verified'}


def main() -> int:
    print('=== verified_status 拡大 Phase 3 ===')

    print('\n--- deity ---')
    promoted_d, total_d = expand_deity()
    print(f'  +{promoted_d} / {total_d} promoted to verified')

    # deity を反映した後に verified deity 一覧を取得
    verified_deities = get_verified_deities()
    print(f'  verified deities (after expand): {len(verified_deities)}')

    print('\n--- clan ---')
    promoted_c, total_c = expand_clan(verified_deities)
    print(f'  +{promoted_c} / {total_c} promoted to verified')

    return 0


if __name__ == '__main__':
    sys.exit(main())
