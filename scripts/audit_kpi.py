#!/usr/bin/env python3
"""KPI / 整合性監査スクリプト(Sprint 2 末で導入)。

実行:
    python3 scripts/audit_kpi.py

検査項目:
1. master_id 重複検出(deity / shrine / clan / motif)
2. relation_id 重複検出
3. dangling reference 検出(relation の source/target が master に未登録)
4. KPI 計測:L0 比率、L4-L5 比率、列数統一
5. confidence_level ↔ hypothesis_layer 整合(L4-L5 は confidence=E 必須)

ゼロ依存(標準ライブラリのみ)。
"""

from __future__ import annotations

import csv
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTERS = {
    "deity": ROOT / "docs" / "master" / "deity_master.tsv",
    "shrine": ROOT / "docs" / "master" / "shrine_master.tsv",
    "clan": ROOT / "docs" / "master" / "clan_master.tsv",
    "motif": ROOT / "docs" / "civilization" / "01_motif_db.tsv",
    "text": ROOT / "docs" / "master" / "text_master.tsv",
    "period": ROOT / "docs" / "master" / "period_master.tsv",
    "rank": ROOT / "docs" / "master" / "rank_master.tsv",
    "event": ROOT / "docs" / "master" / "event_master.tsv",
    "region": ROOT / "docs" / "master" / "region_master.tsv",
    "festival": ROOT / "docs" / "master" / "festival_master.tsv",
}
RELATIONS = ROOT / "docs" / "relations" / "relations.tsv"


def read_tsv(path: Path) -> tuple[list[str], list[list[str]]]:
    with path.open(encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        rows = list(reader)
    if not rows:
        return [], []
    return rows[0], rows[1:]


def check_master_ids() -> tuple[dict[str, set[str]], int]:
    """Return master_id sets and number of duplicates."""
    sets: dict[str, set[str]] = {}
    dup_count = 0
    for kind, path in MASTERS.items():
        if not path.exists():
            print(f"[SKIP] {kind}: {path} not found")
            continue
        _, rows = read_tsv(path)
        ids = [r[0] for r in rows if r and r[0]]
        counts = Counter(ids)
        dups = {i: c for i, c in counts.items() if c > 1}
        if dups:
            print(f"[DUP] {kind}_master.tsv duplicates: {dups}")
            dup_count += sum(c - 1 for c in dups.values())
        sets[kind] = set(ids)
        print(f"[OK]  {kind}_master.tsv: {len(ids)} records, {len(set(ids))} unique")
    return sets, dup_count


def check_relations(master_sets: dict[str, set[str]]) -> dict[str, int]:
    """Return KPI dict and detect dangling references / layer issues."""
    if not RELATIONS.exists():
        print(f"[SKIP] relations.tsv not found")
        return {}
    header, rows = read_tsv(RELATIONS)
    cols = len(header)
    bad_cols = sum(1 for r in rows if len(r) != cols)
    if bad_cols:
        print(f"[ERR] relations.tsv: {bad_cols} rows with column-count mismatch")

    # Column indices
    idx = {h: i for i, h in enumerate(header)}
    rel_id_i = idx["relation_id"]
    src_i = idx["source_id"]
    src_t_i = idx["source_type"]
    tgt_i = idx["target_id"]
    tgt_t_i = idx["target_type"]
    conf_i = idx["confidence_level"]
    hyp_i = idx["hypothesis_layer"]

    # Duplicate relation_id
    rel_ids = [r[rel_id_i] for r in rows]
    rel_dup = {i: c for i, c in Counter(rel_ids).items() if c > 1}
    if rel_dup:
        print(f"[DUP] relation_id duplicates: {len(rel_dup)} keys")

    # Dangling check: relation source/target referencing master
    # NOTE: 'site', 'hypothesis' は別 master 整備中のため除外
    type_to_master = {
        "deity": master_sets.get("deity", set()),
        "shrine": master_sets.get("shrine", set()),
        "clan": master_sets.get("clan", set()),
        "motif": master_sets.get("motif", set()),
        "motif_abstract": master_sets.get("motif", set()),
        "text": master_sets.get("text", set()),
        "period": master_sets.get("period", set()),
        "rank": master_sets.get("rank", set()),
        "event": master_sets.get("event", set()),
        "region": master_sets.get("region", set()),
        "festival": master_sets.get("festival", set()),
    }
    dangling = 0
    dangling_examples: list[str] = []
    for r in rows:
        for id_col, type_col in ((src_i, src_t_i), (tgt_i, tgt_t_i)):
            t = r[type_col]
            v = r[id_col]
            if t in type_to_master and v not in type_to_master[t]:
                dangling += 1
                if len(dangling_examples) < 5:
                    dangling_examples.append(f"{r[rel_id_i]}: {t}={v}")
    if dangling:
        print(f"[WARN] dangling references: {dangling}")
        for ex in dangling_examples:
            print(f"        e.g. {ex}")

    # KPI: hypothesis layer distribution
    layer_counts = Counter(r[hyp_i] for r in rows)
    total = len(rows)
    l0 = layer_counts.get("L0", 0)
    l45 = sum(layer_counts.get(k, 0) for k in ("L4", "L5"))
    l3 = layer_counts.get("L3", 0)
    print(f"\n=== KPI ===")
    print(f"  total relations    : {total}")
    for k in sorted(layer_counts):
        c = layer_counts[k]
        print(f"  {k:4s}              : {c:5d} ({c*100/total:.1f}%)")
    l0_pct = l0 * 100 / total
    l45_pct = l45 * 100 / total
    print(f"  L0 ratio           : {l0_pct:.1f}%   (KPI > 50%) {'PASS' if l0_pct > 50 else 'FAIL'}")
    print(f"  L4-L5 ratio        : {l45_pct:.2f}%  (KPI < 10%) {'PASS' if l45_pct < 10 else 'FAIL'}")

    # Layer-confidence integrity
    bad_pairs = 0
    for r in rows:
        if r[hyp_i] in ("L4", "L5") and r[conf_i] != "E":
            bad_pairs += 1
    if bad_pairs:
        print(f"[ERR] L4-L5 with confidence != E: {bad_pairs}")
    else:
        print(f"  L4-L5↔E integrity  : PASS")

    # verified_status KPI (DISC-006 採用)
    print(f"\n=== verified_status KPI (DISC-006) ===")
    from collections import Counter as _Counter
    verified_targets = [
        "docs/master/shrine_master.tsv",
        "docs/master/deity_master.tsv",
        "docs/master/clan_master.tsv",
    ]
    overall = _Counter()
    for path in verified_targets:
        full = ROOT / path
        if not full.exists():
            continue
        with open(full, encoding="utf-8") as f:
            rdr = list(csv.DictReader(f, delimiter="\t"))
        if not rdr or "verified_status" not in rdr[0]:
            continue
        c = _Counter(r.get("verified_status", "") for r in rdr)
        v = c.get("verified", 0)
        ur = c.get("under_review", 0)
        kf = c.get("known_fabrication", 0)
        n = len(rdr)
        v_pct = (v / n * 100) if n else 0
        print(f"  {path.split('/')[-1]}: verified={v} ({v_pct:.1f}%) / under_review={ur} / known_fabrication={kf} / total={n}")
        for k, vv in c.items():
            overall[k] += vv
    total_all = sum(overall.values())
    if total_all:
        v_pct_all = overall.get("verified", 0) / total_all * 100
        print(f"  合計: verified={overall.get('verified', 0)} ({v_pct_all:.1f}%) / under_review={overall.get('under_review', 0)} / known_fabrication={overall.get('known_fabrication', 0)} / total={total_all}")
        print(f"  verified 比率: {v_pct_all:.1f}% (KPI 参考値、初期段階は 25-35% 想定)")

    return {
        "total": total,
        "l0_pct": l0_pct,
        "l45_pct": l45_pct,
        "dangling": dangling,
        "bad_cols": bad_cols,
        "rel_dup": len(rel_dup),
        "bad_pairs": bad_pairs,
    }


def main() -> int:
    print("=== japanese_mythology_database 監査 ===\n")
    print("--- master 重複チェック ---")
    sets, master_dup = check_master_ids()
    print()
    print("--- relations 整合 + KPI ---")
    kpi = check_relations(sets)

    print("\n=== 監査結果 ===")
    fail = (
        master_dup > 0
        or kpi.get("bad_cols", 0) > 0
        or kpi.get("rel_dup", 0) > 0
        or kpi.get("bad_pairs", 0) > 0
        or kpi.get("l0_pct", 0) <= 50
        or kpi.get("l45_pct", 100) >= 10
    )
    if fail:
        print("FAIL: 上記の問題を確認してください")
        return 1
    print("PASS: KPI / 整合性すべて達成")
    return 0


if __name__ == "__main__":
    sys.exit(main())
