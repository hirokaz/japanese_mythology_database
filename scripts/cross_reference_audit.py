#!/usr/bin/env python3
"""DISC-012/013 cross-file 整合性検査。

新規 schema 群 (ritual_epoch / continuity_break / persistence_medium /
entity_version / narrative_layer / boundary_structure / sacred_landscape /
ritual_space / spatial_interpretation) の entity_id 参照と
schema 横断整合性を検査。

実行: python3 scripts/cross_reference_audit.py
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_ids(path: Path, id_field: str) -> set[str]:
    if not path.exists():
        return set()
    with path.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        return {r.get(id_field, '') for r in rdr if r.get(id_field)}


def load_rows(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding='utf-8') as f:
        return list(csv.DictReader(f, delimiter='\t'))


def main() -> int:
    print('=== Cross-file 整合性検査 (DISC-012/013) ===\n')

    shrine_ids = load_ids(ROOT / 'docs/master/shrine_master.tsv', 'master_id')
    deity_ids = load_ids(ROOT / 'docs/master/deity_master.tsv', 'master_id')
    motif_ids = load_ids(ROOT / 'docs/civilization/01_motif_db.tsv', 'motif_id')
    mtgm_ids = load_ids(ROOT / 'docs/civilization/02_mythologem_master.tsv', 'mythologem_id')
    festival_ids = load_ids(ROOT / 'docs/master/festival_master.tsv', 'festival_id')
    print(f'  Master IDs loaded: {len(shrine_ids)} shrine / {len(deity_ids)} deity / '
          f'{len(motif_ids)} motif / {len(mtgm_ids)} mythologem / {len(festival_ids)} festival')
    print()

    valid_entity_ids = shrine_ids | deity_ids | motif_ids | mtgm_ids | {'multi'}
    issues = 0

    epochs = load_rows(ROOT / 'docs/civilization/03_ritual_epoch.tsv')
    breaks = load_rows(ROOT / 'docs/civilization/04_continuity_break.tsv')
    pms = load_rows(ROOT / 'docs/civilization/05_persistence_medium.tsv')
    versions = load_rows(ROOT / 'docs/civilization/06_entity_version.tsv')
    narratives = load_rows(ROOT / 'docs/civilization/07_narrative_layer.tsv')
    boundaries = load_rows(ROOT / 'docs/civilization/08_boundary_structure.tsv')
    landscapes = load_rows(ROOT / 'docs/civilization/09_sacred_landscape.tsv')
    spaces = load_rows(ROOT / 'docs/civilization/10_ritual_space.tsv')
    spatials = load_rows(ROOT / 'docs/civilization/11_spatial_interpretation.tsv')

    print('--- 1. ritual_epoch.ritual_id -> festival_master ---')
    bad = [r for r in epochs if r.get('ritual_id') and r['ritual_id'] not in festival_ids]
    if bad:
        print(f'  [WARN] {len(bad)} dangling ritual_id')
        for r in bad[:5]:
            print(f'    {r["epoch_id"]}: ritual_id={r["ritual_id"]}')
        issues += len(bad)
    else:
        print(f'  [OK] {len(epochs)} epochs')

    for label, rows, idf in [
        ('2. continuity_break.entity_id', breaks, 'break_id'),
        ('3. persistence_medium.entity_id', pms, 'entry_id'),
        ('4. entity_version.entity_id', versions, 'version_id'),
        ('5. narrative_layer.entity_id', narratives, 'layer_id'),
        ('8. ritual_space.entity_id', spaces, 'space_id'),
    ]:
        print(f'\n--- {label} -> master ---')
        bad = []
        for r in rows:
            eid = (r.get('entity_id') or '').strip()
            if eid == 'multi' or not eid:
                continue
            if eid not in valid_entity_ids:
                bad.append(r)
        if bad:
            print(f'  [WARN] {len(bad)} dangling')
            for r in bad[:5]:
                print(f'    {r.get("entity_id")} ({r.get(idf, "?")})')
            issues += len(bad)
        else:
            print(f'  [OK] {len(rows)} all valid (or multi)')

    for label, rows, idf in [
        ('6. boundary_structure.entity_id', boundaries, 'boundary_id'),
        ('7. sacred_landscape.entity_id', landscapes, 'landscape_id'),
        ('9. spatial_interpretation.entity_id', spatials, 'interp_id'),
    ]:
        print(f'\n--- {label} -> shrine_master ---')
        bad = []
        for r in rows:
            eid = (r.get('entity_id') or '').strip()
            if eid == 'multi':
                continue
            if eid not in shrine_ids:
                bad.append(r)
        if bad:
            print(f'  [WARN] {len(bad)} dangling')
            for r in bad[:5]:
                print(f'    {r.get("entity_id")} ({r.get(idf, "?")})')
            issues += len(bad)
        else:
            print(f'  [OK] {len(rows)} all valid shrine refs (or multi)')

    VALID_INFERENCE = {'source_backed', 'inferential', 'speculative', 'symbolic'}
    print('\n--- 10. inference_type 値整合性 ---')
    bad_total = 0
    for fname, rows in [
        ('ritual_epoch', epochs), ('continuity_break', breaks),
        ('persistence_medium', pms), ('entity_version', versions),
        ('narrative_layer', narratives), ('boundary_structure', boundaries),
        ('sacred_landscape', landscapes), ('ritual_space', spaces),
        ('spatial_interpretation', spatials),
    ]:
        bad = [r for r in rows if r.get('inference_type') and r['inference_type'] not in VALID_INFERENCE]
        if bad:
            print(f'  [WARN] {fname}: {len(bad)} invalid')
            for r in bad[:3]:
                print(f'    {dict(list(r.items())[:2])}: inference_type={r["inference_type"]}')
            bad_total += len(bad)
    if bad_total == 0:
        print('  [OK] all schemas valid')

    VALID_EVIDENCE = {'direct', 'inferred', 'interpretive'}
    print('\n--- 11. evidence_type 値整合性 (DISC-013) ---')
    bad_total = 0
    for fname, rows in [
        ('boundary_structure', boundaries), ('sacred_landscape', landscapes),
        ('ritual_space', spaces), ('spatial_interpretation', spatials),
    ]:
        bad = [r for r in rows if r.get('evidence_type') and r['evidence_type'] not in VALID_EVIDENCE]
        if bad:
            print(f'  [WARN] {fname}: {len(bad)} invalid')
            for r in bad[:3]:
                print(f'    evidence_type={r["evidence_type"]}')
            bad_total += len(bad)
    if bad_total == 0:
        print('  [OK] all valid')

    VALID_OVERLAY = {'overlay', 'overwrite'}
    print('\n--- 12. is_overlay_or_overwrite 値整合性 ---')
    bad_total = 0
    for fname, rows in [('narrative_layer', narratives), ('spatial_interpretation', spatials)]:
        bad = [r for r in rows if r.get('is_overlay_or_overwrite') and r['is_overlay_or_overwrite'] not in VALID_OVERLAY]
        if bad:
            print(f'  [WARN] {fname}: {len(bad)} invalid')
            bad_total += len(bad)
    if bad_total == 0:
        print('  [OK] all valid')

    print('\n--- 13. web/data 同期確認 ---')
    sync_sources = [
        ('docs/civilization/03_ritual_epoch.tsv', 'web/data/ritual_epoch.tsv'),
        ('docs/civilization/04_continuity_break.tsv', 'web/data/continuity_break.tsv'),
        ('docs/civilization/05_persistence_medium.tsv', 'web/data/persistence_medium.tsv'),
        ('docs/civilization/06_entity_version.tsv', 'web/data/entity_version.tsv'),
        ('docs/civilization/07_narrative_layer.tsv', 'web/data/narrative_layer.tsv'),
        ('docs/civilization/08_boundary_structure.tsv', 'web/data/boundary_structure.tsv'),
        ('docs/civilization/09_sacred_landscape.tsv', 'web/data/sacred_landscape.tsv'),
        ('docs/civilization/10_ritual_space.tsv', 'web/data/ritual_space.tsv'),
        ('docs/civilization/11_spatial_interpretation.tsv', 'web/data/spatial_interpretation.tsv'),
    ]
    sync_issues = 0
    for src_rel, web_rel in sync_sources:
        src = ROOT / src_rel
        web = ROOT / web_rel
        if not src.exists():
            continue
        if not web.exists() or src.read_bytes() != web.read_bytes():
            print(f'  [WARN] {web_rel} out of sync')
            sync_issues += 1
    if sync_issues == 0:
        print(f'  [OK] all 9 files synced')

    print(f'\n{"="*60}')
    print(f'=== 総合判定 ===')
    print(f'{"="*60}')
    print(f'  dangling 参照: {issues} / web sync 問題: {sync_issues}')
    if issues == 0 and sync_issues == 0:
        print('\n  [PASS] 全 cross-reference 整合')
        return 0
    print(f'\n  [WARN] 要修正項目あり')
    return 1


if __name__ == '__main__':
    sys.exit(main())
