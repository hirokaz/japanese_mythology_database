#!/usr/bin/env python3
"""全情報精査 — 多軸監査スクリプト。

audit_kpi.py を補完する深掘り検査:
1. 列数整合性 (全 TSV)
2. ID 形式整合性
3. dangling reference 詳細
4. inference_type 分布 (全 master + relations)
5. AI hallucination パターン残存検査
6. 文字エンコード / 改行コード
7. 必須 field の入力率
"""

from __future__ import annotations

import csv
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def section(title: str) -> None:
    print(f"\n{'=' * 60}\n{title}\n{'=' * 60}")


def check_column_consistency() -> dict:
    """全 TSV の列数整合性 (header と各行)。"""
    section("1. 列数整合性 (全 TSV)")
    issues = {}
    targets = sorted([
        *ROOT.glob('docs/master/*.tsv'),
        *ROOT.glob('docs/civilization/*.tsv'),
        ROOT / 'docs/relations/relations.tsv',
    ])
    for p in targets:
        with p.open(encoding='utf-8') as f:
            rows = list(csv.reader(f, delimiter='\t'))
        if not rows:
            print(f'  [SKIP] {p.relative_to(ROOT)}: empty')
            continue
        header_cols = len(rows[0])
        mismatches = [i for i, r in enumerate(rows[1:], 1) if len(r) != header_cols]
        if mismatches:
            issues[str(p.relative_to(ROOT))] = mismatches
            print(f'  [ERR] {p.relative_to(ROOT)}: {len(mismatches)} rows mismatch (header={header_cols} cols)')
        else:
            print(f'  [OK]  {p.relative_to(ROOT)}: {len(rows)-1} rows × {header_cols} cols')
    return issues


def check_id_format() -> dict:
    """ID 形式の整合性。"""
    section("2. ID 形式整合性")
    expected = {
        'docs/master/shrine_master.tsv': ('master_id', r'^SHR-\d{3,4}$'),
        'docs/master/deity_master.tsv': ('master_id', r'^DEI-\d{3,4}$'),
        'docs/master/clan_master.tsv': ('master_id', r'^CLN-\d{3,4}$'),
        'docs/master/text_master.tsv': ('text_id', r'^TXT-'),
        'docs/master/period_master.tsv': ('period_id', r'^PERIOD-'),
        'docs/master/rank_master.tsv': ('rank_id', r'^RANK-'),
        'docs/master/event_master.tsv': ('event_id', r'^EVENT-'),
        'docs/master/region_master.tsv': ('region_id', r'^(REG-|REGION-)'),
        'docs/master/festival_master.tsv': ('festival_id', r'^FES-'),
        'docs/master/emperor_master.tsv': ('emperor_id', r'^EMP-\d{3}$'),
        'docs/civilization/01_motif_db.tsv': ('motif_id', r'^MOTIF-\d{3,4}$'),
        'docs/civilization/02_mythologem_master.tsv': ('mythologem_id', r'^MTGM-\d{3}$'),
        'docs/civilization/03_ritual_epoch.tsv': ('epoch_id', r'^RTE-\d{3}$'),
        'docs/civilization/04_continuity_break.tsv': ('break_id', r'^(BRK|RTR)-\d{3}$'),
        'docs/civilization/05_persistence_medium.tsv': ('entry_id', r'^PM-\d{3}$'),
    }
    bad = {}
    for path_str, (field, pattern) in expected.items():
        p = ROOT / path_str
        if not p.exists():
            continue
        rx = re.compile(pattern)
        with p.open(encoding='utf-8') as f:
            rows = list(csv.DictReader(f, delimiter='\t'))
        violations = [r.get(field, '') for r in rows if not rx.match(r.get(field, '') or '')]
        if violations:
            bad[path_str] = violations[:5]
            print(f'  [ERR] {path_str}: {len(violations)} ID violate pattern {pattern}')
            for v in violations[:3]:
                print(f'        e.g. "{v}"')
        else:
            print(f'  [OK]  {path_str}: {len(rows)} IDs match {pattern}')
    return bad


def check_dangling_references() -> dict:
    """relations の source_id / target_id が master に存在するか詳細検査。"""
    section("3. dangling references (詳細)")
    # Load all master IDs
    id_sets: dict[str, set[str]] = {}
    for tsv, field in [
        ('docs/master/shrine_master.tsv', 'master_id'),
        ('docs/master/deity_master.tsv', 'master_id'),
        ('docs/master/clan_master.tsv', 'master_id'),
        ('docs/master/text_master.tsv', 'text_id'),
        ('docs/master/period_master.tsv', 'period_id'),
        ('docs/master/rank_master.tsv', 'rank_id'),
        ('docs/master/event_master.tsv', 'event_id'),
        ('docs/master/region_master.tsv', 'region_id'),
        ('docs/master/festival_master.tsv', 'festival_id'),
        ('docs/master/emperor_master.tsv', 'emperor_id'),
        ('docs/civilization/01_motif_db.tsv', 'motif_id'),
        ('docs/civilization/02_mythologem_master.tsv', 'mythologem_id'),
    ]:
        p = ROOT / tsv
        if not p.exists():
            continue
        with p.open(encoding='utf-8') as f:
            rdr = csv.DictReader(f, delimiter='\t')
            ids = {r.get(field, '') for r in rdr if r.get(field)}
        key = tsv.split('/')[-1].replace('_master.tsv', '').replace('.tsv', '').replace('01_motif_db', 'motif').replace('02_mythologem', 'mythologem')
        id_sets[key] = ids

    type_to_set = {
        'shrine': id_sets.get('shrine', set()),
        'deity': id_sets.get('deity', set()),
        'clan': id_sets.get('clan', set()),
        'text': id_sets.get('text', set()),
        'period': id_sets.get('period', set()),
        'rank': id_sets.get('rank', set()),
        'event': id_sets.get('event', set()),
        'region': id_sets.get('region', set()),
        'festival': id_sets.get('festival', set()),
        'motif': id_sets.get('motif', set()),
        'motif_abstract': id_sets.get('motif', set()),
        'mythologem': id_sets.get('mythologem', set()),
        'emperor': id_sets.get('emperor', set()),
    }

    rel_path = ROOT / 'docs/relations/relations.tsv'
    dangling: list[tuple[str, str, str, str]] = []
    with rel_path.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        for r in rdr:
            for side in ('source', 'target'):
                tid = r.get(f'{side}_id', '').strip()
                ttype = r.get(f'{side}_type', '').strip().lower()
                if not tid or not ttype:
                    continue
                if ttype not in type_to_set:
                    continue
                if tid not in type_to_set[ttype]:
                    dangling.append((r.get('relation_id', '?'), side, ttype, tid))

    if not dangling:
        print('  [OK] no dangling references')
    else:
        # 型別集計
        by_type: dict[str, list] = defaultdict(list)
        for rid, side, ttype, tid in dangling:
            by_type[ttype].append((rid, side, tid))
        print(f'  [WARN] {len(dangling)} dangling references')
        for ttype, items in sorted(by_type.items(), key=lambda x: -len(x[1])):
            print(f'  {ttype}: {len(items)} dangling')
            for rid, side, tid in items[:3]:
                print(f'    e.g. {rid} ({side}={tid})')
    return {'count': len(dangling), 'samples': dangling[:5]}


def check_inference_type_distribution() -> None:
    """master + relations の inference_type 分布。"""
    section("4. inference_type 分布")
    # relations
    rel_path = ROOT / 'docs/relations/relations.tsv'
    with rel_path.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        relations = list(rdr)
    if 'inference_type' in relations[0]:
        c = Counter(r.get('inference_type', '') for r in relations)
        total = len(relations)
        print(f'  relations.tsv ({total} 件):')
        for k, v in c.most_common():
            print(f'    {k or "(空)":15s}: {v:6d} ({v*100/total:.1f}%)')
    else:
        print('  [WARN] relations.tsv に inference_type field なし')

    # mythologem
    p = ROOT / 'docs/civilization/02_mythologem_master.tsv'
    if p.exists():
        with p.open(encoding='utf-8') as f:
            rows = list(csv.DictReader(f, delimiter='\t'))
        c = Counter(r.get('inference_type', '') for r in rows)
        print(f'\n  mythologem_master.tsv ({len(rows)} 件):')
        for k, v in c.most_common():
            print(f'    {k or "(空)":15s}: {v:3d}')


def check_hallucination_patterns() -> None:
    """既知 hallucination パターン残存検査 (DISC-009 連動)。"""
    section("5. AI hallucination パターン残存検査")
    p = ROOT / 'docs/master/shrine_master.tsv'
    if not p.exists():
        return
    with p.open(encoding='utf-8') as f:
        rows = list(csv.DictReader(f, delimiter='\t'))

    # Pattern 1: 旧国名×神格網羅
    OLD_PROV = ['陸奥','出羽','常陸','上総','下総','安房','武蔵','相模','駿河','遠江','三河','尾張','美濃','飛騨','信濃','上野','下野','越後','越中','能登','加賀','越前','若狭','近江','山城','丹波','丹後','但馬','因幡','伯耆','出雲','石見','播磨','美作','備前','備中','備後','安芸','周防','長門','紀伊','淡路','阿波','讃岐','伊予','土佐','筑前','筑後','豊前','豊後','肥前','肥後','日向','大隅','薩摩']
    deities = ['八幡','稲荷','天神','春日','住吉','神明','氷川']
    matches = []
    for r in rows:
        name = r.get('canonical_name', '')
        prov_match = next((p for p in OLD_PROV if p in name), None)
        deity_match = next((d for d in deities if d in name), None)
        if prov_match and deity_match and not any(
            (r.get('shrine_rank_ancient') or '').strip(),
            # 古代社格があれば真正
        ):
            features = sum([
                bool((r.get('shrine_rank_ancient') or '').strip()),
                bool((r.get('shrine_rank_modern') or '').strip()),
                len((r.get('alternative_names') or '')) >= 4,
                len((r.get('founding_legend') or '')) >= 20,
                len((r.get('notes') or '')) >= 20,
            ])
            if features == 0:
                matches.append((r['master_id'], name, prov_match, deity_match))

    if matches:
        print(f'  [WARN] 旧国名+神格 + distinctive feature なし: {len(matches)} 件')
        for mid, name, p, d in matches[:5]:
            print(f'    {mid}: {name} ({p}+{d})')
    else:
        print('  [OK] 旧国名×神格網羅パターン残存なし')


def check_required_fields() -> None:
    """主要 master の必須 field 入力率。"""
    section("6. 必須 field 入力率")
    targets = [
        ('docs/master/shrine_master.tsv', ['canonical_name', 'canonical_reading', 'prefecture', 'verified_status']),
        ('docs/master/deity_master.tsv', ['canonical_name', 'canonical_reading', 'verified_status']),
        ('docs/master/clan_master.tsv', ['canonical_name', 'canonical_reading', 'verified_status']),
        ('docs/relations/relations.tsv', ['source_id', 'source_type', 'relation_type', 'target_id', 'target_type', 'inference_type']),
    ]
    for path_str, required in targets:
        p = ROOT / path_str
        if not p.exists():
            continue
        with p.open(encoding='utf-8') as f:
            rows = list(csv.DictReader(f, delimiter='\t'))
        if not rows:
            continue
        n = len(rows)
        print(f'  {path_str} ({n} 行):')
        for field in required:
            if field not in rows[0]:
                print(f'    [ERR] field "{field}" 存在しない')
                continue
            filled = sum(1 for r in rows if r.get(field, '').strip() and r.get(field, '').strip() != '-')
            pct = filled * 100 / n
            status = '[OK] ' if pct == 100 else '[WARN]'
            print(f'    {status} {field:25s}: {filled}/{n} ({pct:.1f}%)')


def check_encoding_and_eol() -> None:
    """文字エンコード / 改行コード検査。"""
    section("7. エンコード / 改行コード")
    for p in sorted(ROOT.glob('docs/**/*.tsv')):
        with p.open('rb') as f:
            data = f.read()
        if b'\xef\xbb\xbf' in data[:3]:
            print(f'  [WARN] {p.relative_to(ROOT)}: BOM 検出')
        if b'\r\n' in data:
            print(f'  [WARN] {p.relative_to(ROOT)}: CRLF 検出')
        try:
            data.decode('utf-8')
        except UnicodeDecodeError as e:
            print(f'  [ERR] {p.relative_to(ROOT)}: UTF-8 decode error {e}')
    print('  [OK] UTF-8 / LF check (warnings above if any)')


def main() -> int:
    print("=== 全情報精査 (comprehensive audit) ===")
    col_issues = check_column_consistency()
    id_issues = check_id_format()
    dangling = check_dangling_references()
    check_inference_type_distribution()
    check_hallucination_patterns()
    check_required_fields()
    check_encoding_and_eol()

    print(f"\n{'=' * 60}\n=== 総合判定 ===\n{'=' * 60}")
    fail = bool(col_issues) or bool(id_issues) or dangling['count'] > 0
    print(f'  列数 mismatch: {len(col_issues)} files' if col_issues else '  列数 mismatch: 0')
    print(f'  ID 形式 violation: {len(id_issues)} files' if id_issues else '  ID 形式 violation: 0')
    print(f'  dangling references: {dangling["count"]}')
    if dangling['count'] == 0 and not col_issues and not id_issues:
        print('\n  [PASS] 整合性すべて達成')
        return 0
    else:
        print('\n  [WARN] 要修正項目あり')
        return 1


if __name__ == '__main__':
    sys.exit(main())
