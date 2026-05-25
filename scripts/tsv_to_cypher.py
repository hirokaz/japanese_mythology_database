#!/usr/bin/env python3
"""DISC-010 採択 — TSV → Neo4j Cypher ETL (Phase 1)。

label-based node (multi-label) + relation ontology (6 category) で Cypher
import 文を生成する。

DISC-010 採択原則 (CLAUDE.md §4.8):
1. label-based node + multi-label: (:Entity:Shrine), (:Entity:Deity) ...
2. relation ontology 化 (6 category)
3. symbolic ↔ source-backed の query-layer 分離
4. hypothesis-aware query (4 軸属性を node/relation に常設)
5. temporal graph = evolving civilization graph
6. graph visualization の false coherence 警告

実行:
    # 全 master + relations を一括変換
    python3 scripts/tsv_to_cypher.py

    # 出力先指定
    python3 scripts/tsv_to_cypher.py --out neo4j_import.cypher

    # 統計のみ (dry-run)
    python3 scripts/tsv_to_cypher.py --dry-run
"""

from __future__ import annotations

import argparse
import csv
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DEFAULT = ROOT / 'web' / 'data' / 'neo4j_import.cypher'

# --- Master 定義 (TSV path, primary label, id field, optional label fields) ---

MASTERS = [
    ('docs/master/shrine_master.tsv',   'Shrine',    'master_id'),
    ('docs/master/deity_master.tsv',    'Deity',     'master_id'),
    ('docs/master/clan_master.tsv',     'Clan',      'master_id'),
    ('docs/master/text_master.tsv',     'Text',      'text_id'),
    ('docs/master/period_master.tsv',   'Period',    'period_id'),
    ('docs/master/rank_master.tsv',     'Rank',      'rank_id'),
    ('docs/master/event_master.tsv',    'Event',     'event_id'),
    ('docs/master/region_master.tsv',   'Region',    'region_id'),
    ('docs/master/festival_master.tsv', 'Festival',  'festival_id'),
    ('docs/civilization/01_motif_db.tsv', 'Motif',   'motif_id'),
    ('docs/civilization/02_mythologem_master.tsv', 'Mythologem', 'mythologem_id'),
    ('docs/master/emperor_master.tsv', 'Emperor', 'emperor_id'),
]

# --- Relation ontology (DISC-010 採択、6 category) ---
# relation_type を category へマップする。未知の relation_type は ASSOC へ fallback。

RELATION_ONTOLOGY = {
    # ritual: 祭祀関係
    'enshrined_at':           'RITUAL',
    'primary_deity_of':       'RITUAL',
    'secondary_deity_of':     'RITUAL',
    'performed_at':           'RITUAL',
    'performed_ritual':       'RITUAL',
    'has_festival':           'RITUAL',
    'host_shrine_of':         'RITUAL',
    'secondary_shrine_of':    'RITUAL',
    # lineage: 系譜関係
    'descended_from':         'LINEAGE',
    'parent_of':              'LINEAGE',
    'sibling_of':             'LINEAGE',
    'married_to':             'LINEAGE',
    'consort_of':             'LINEAGE',
    'syncretized_with':       'LINEAGE',
    'merged_into':            'LINEAGE',
    'founded_by':             'LINEAGE',
    'succeeded_by':           'LINEAGE',
    'predecessor_of':         'LINEAGE',
    # authority: 権威関係
    'has_rank':               'AUTHORITY',
    'controls':               'AUTHORITY',
    'controlled_by':          'AUTHORITY',
    'controls_shrine':        'AUTHORITY',
    'ruled':                  'AUTHORITY',
    'served':                 'AUTHORITY',
    'has_title':              'AUTHORITY',
    'is_ichinomiya_of':       'AUTHORITY',
    'has_subordinate_shrine': 'AUTHORITY',
    'rivaled':                'AUTHORITY',
    'allied_with':            'AUTHORITY',
    'destroyed_by':           'AUTHORITY',
    'awarded_rank_to':        'AUTHORITY',
    # geographic: 地理関係
    'located_near':           'GEOGRAPHIC',
    'located_in':             'GEOGRAPHIC',
    'located_in_country':     'GEOGRAPHIC',
    'sibling_shrine_of':      'GEOGRAPHIC',
    # symbolic: 象徴関係 (query default 除外候補)
    'linked_to_myth':         'SYMBOLIC',
    'derived_from_motif':     'SYMBOLIC',
    'associated_with':        'SYMBOLIC',
    'mentioned_in':           'SYMBOLIC',
    'localized_via_shrine':   'SYMBOLIC',
    'participated_in':        'SYMBOLIC',
    'motif_belongs_to_mythologem': 'SYMBOLIC',  # DISC-007 Level 2 抽象化
    # synchronization: 時間軸 (temporal graph / evolving civilization graph)
    'located_in_period':      'SYNCHRONIZATION',
    'preceded_by':            'SYNCHRONIZATION',
    'contemporaneous_with':   'SYNCHRONIZATION',
    'kanjo_from':             'SYNCHRONIZATION',  # DISC-008 採用予定
    'shinkai_to':             'SYNCHRONIZATION',  # DISC-008 採用予定
}

# source_type / target_type → Neo4j label
TYPE_TO_LABEL = {
    'shrine': 'Shrine', 'deity': 'Deity', 'clan': 'Clan', 'text': 'Text',
    'period': 'Period', 'rank': 'Rank', 'event': 'Event', 'region': 'Region',
    'festival': 'Festival', 'motif': 'Motif', 'motif_abstract': 'Motif',
    'mythologem': 'Mythologem',  # DISC-007 Level 2
    'emperor': 'Emperor',  # emperor_master.tsv で独立管理 (Phase 4)
    'country': 'Region',
}

# --- Cypher 文字列エスケープ ---

def cy_esc(v: str) -> str:
    """Cypher 文字列リテラル用 escape。"""
    if v is None:
        return 'null'
    s = str(v)
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('\r', '')


def prop(k: str, v: str) -> str | None:
    """空・ハイフン値は属性を出力しない。"""
    if v is None:
        return None
    s = str(v).strip()
    if s == '' or s == '-':
        return None
    return f"{k}: '{cy_esc(s)}'"


# --- ETL 本体 ---

def emit_constraints(out: list[str]) -> None:
    """unique constraint + index 定義。"""
    out.append('// ===== Constraints (idempotent) =====')
    out.append('CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (n:Entity) REQUIRE n.master_id IS UNIQUE;')
    out.append('')
    out.append('// ===== Indexes =====')
    out.append('CREATE INDEX entity_name IF NOT EXISTS FOR (n:Entity) ON (n.canonical_name);')
    out.append('CREATE INDEX entity_verified IF NOT EXISTS FOR (n:Entity) ON (n.verified_status);')
    out.append('CREATE INDEX shrine_pref IF NOT EXISTS FOR (n:Shrine) ON (n.prefecture);')
    out.append('CREATE INDEX shrine_rank_ancient IF NOT EXISTS FOR (n:Shrine) ON (n.shrine_rank_ancient);')
    out.append('CREATE FULLTEXT INDEX entityNames IF NOT EXISTS FOR (n:Entity) ON EACH [n.canonical_name, n.canonical_reading];')
    out.append('')


def emit_master(path: Path, primary_label: str, id_field: str,
                out: list[str], stats: Counter) -> None:
    """master TSV を MERGE 文に変換。"""
    if not path.exists():
        print(f'[SKIP] {path} not found', file=sys.stderr)
        return

    with path.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        rows = list(rdr)

    out.append(f'// ===== {primary_label} ({len(rows)} nodes from {path.name}) =====')
    for r in rows:
        mid = (r.get(id_field) or '').strip()
        if not mid:
            stats[f'{primary_label}_skip'] += 1
            continue

        props = [prop('master_id', mid)]
        # 主要 field を property 化 (None 除外)
        for k, v in r.items():
            if k == id_field:
                continue
            p = prop(k, v)
            if p:
                props.append(p)
        props_str = ', '.join(p for p in props if p)
        out.append(f"MERGE (n:Entity:{primary_label} {{master_id: '{cy_esc(mid)}'}})")
        out.append(f"  SET n += {{ {props_str} }};")
        stats[primary_label] += 1
    out.append('')


def normalize_relation_type(rtype: str) -> tuple[str, str]:
    """relation_type → (category, RELATION_NAME)。

    Neo4j relation type は大文字推奨。 'descended_from' → 'DESCENDED_FROM'。
    """
    if not rtype:
        return 'ASSOC', 'ASSOC'
    cat = RELATION_ONTOLOGY.get(rtype, 'ASSOC')
    name = rtype.upper().replace('-', '_')
    return cat, name


def emit_relations(path: Path, out: list[str], stats: Counter) -> None:
    """relations.tsv → MERGE [r:CATEGORY {relation_type: '...', ...}]"""
    if not path.exists():
        print(f'[SKIP] {path} not found', file=sys.stderr)
        return

    out.append(f'// ===== Relations (from {path.name}) =====')
    with path.open(encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        for r in rdr:
            rid = (r.get('relation_id') or '').strip()
            sid = (r.get('source_id') or '').strip()
            stype = (r.get('source_type') or '').strip().lower()
            rtype = (r.get('relation_type') or '').strip()
            tid = (r.get('target_id') or '').strip()
            ttype = (r.get('target_type') or '').strip().lower()

            # 列ズレ行 (R-AUTO-FIX 系) を skip
            if not (rid and sid and rtype and tid):
                stats['rel_skip_empty'] += 1
                continue
            # relation_type が ID 形式の場合は列ズレ
            if rtype.startswith(('SHR-', 'DEI-', 'CLN-', 'TXT-')):
                stats['rel_skip_malformed'] += 1
                continue

            slabel = TYPE_TO_LABEL.get(stype)
            tlabel = TYPE_TO_LABEL.get(ttype)
            if not slabel or not tlabel:
                stats['rel_skip_unknown_type'] += 1
                continue

            category, rel_name = normalize_relation_type(rtype)
            # 属性
            rel_props = [
                f"relation_id: '{cy_esc(rid)}'",
                f"relation_type: '{cy_esc(rtype)}'",
            ]
            for k in ('confidence_level', 'hypothesis_layer', 'temporal_scope',
                      'valid_from', 'valid_until', 'source_reference', 'notes'):
                p = prop(k, r.get(k))
                if p:
                    rel_props.append(p)
            # inference_type が未付与の場合は推定 (symbolic category なら symbolic、それ以外は inferential)
            if 'inference_type' not in r or not (r.get('inference_type') or '').strip():
                inferred = 'symbolic' if category == 'SYMBOLIC' else 'inferential'
                rel_props.append(f"inference_type: '{inferred}'")
                rel_props.append(f"inference_type_auto: true")

            props_str = ', '.join(rel_props)
            out.append(
                f"MATCH (s:{slabel} {{master_id: '{cy_esc(sid)}'}}), "
                f"(t:{tlabel} {{master_id: '{cy_esc(tid)}'}})"
            )
            out.append(f"  MERGE (s)-[r:{category} {{relation_id: '{cy_esc(rid)}'}}]->(t)")
            out.append(f"  SET r += {{ {props_str} }};")
            stats[f'rel_{category}'] += 1
    out.append('')


def main() -> int:
    ap = argparse.ArgumentParser(description='DISC-010 採択 TSV → Neo4j Cypher ETL')
    ap.add_argument('--out', type=str, default=str(OUT_DEFAULT),
                    help='出力 Cypher ファイル (default: web/data/neo4j_import.cypher)')
    ap.add_argument('--dry-run', action='store_true', help='ファイル書き込みせず統計のみ')
    args = ap.parse_args()

    out_lines: list[str] = []
    stats: Counter = Counter()

    out_lines.append('// Auto-generated by scripts/tsv_to_cypher.py')
    out_lines.append('// DISC-010 採択 (label-based multi-label + relation ontology 6 category)')
    out_lines.append('// CLAUDE.md §4.8 graph epistemics 原則準拠')
    out_lines.append('')

    emit_constraints(out_lines)

    for rel_path, primary_label, id_field in MASTERS:
        emit_master(ROOT / rel_path, primary_label, id_field, out_lines, stats)

    emit_relations(ROOT / 'docs' / 'relations' / 'relations.tsv', out_lines, stats)

    # 出力
    if not args.dry_run:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text('\n'.join(out_lines), encoding='utf-8')
        print(f'[OK] wrote {out_path} ({len(out_lines)} lines)')
    else:
        print('[DRY RUN] no file written')

    # 統計表示
    print('\n=== ETL 統計 ===')
    for k in sorted(stats):
        print(f'  {k:30s}: {stats[k]:6d}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
