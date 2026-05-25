#!/usr/bin/env python3
"""DISC-009 anti-hallucination architecture Phase 1 — warning only checker.

新規 master エントリ (PR の diff、または引数で指定された TSV) に対し、
AI hallucination 圧力を抑制する suspiciousness scoring を実施する。

Phase 1 方針 (DISC-009 採択):
- **warning only**: merge gate にはしない (false positive 懸念)
- escalation review 用 score 蓄積
- 各 PR の suspicious ratio を可視化

検出 7 原則 (DISC-009):
1. plausibility ≠ evidence
2. fingerprint detection → escalation review
3. too systematic = suspicious (旧国名網羅・対称性)
4. feature provenance > feature quantity
5. relation hallucination は将来 Phase 2 で対応
6. CI Phase 1 = warning only
7. epistemic anomaly detection は Phase 3+

実行:
    # PR diff 対象 (default、`git diff origin/main` で新規行を抽出)
    python3 scripts/check_new_entries.py

    # 任意 TSV 全体スキャン
    python3 scripts/check_new_entries.py --file docs/master/shrine_master.tsv

    # 終了コードを 0 固定 (warning only)、--strict で score 閾値超過時に exit 1
    python3 scripts/check_new_entries.py --strict
"""

from __future__ import annotations

import argparse
import csv
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# --- 検出パターン ---

# 旧国名 (令制国、AI 網羅生成の典型署名)
OLD_PROVINCE_NAMES = [
    '陸奥', '出羽', '常陸', '上総', '下総', '安房', '武蔵', '相模', '甲斐', '伊豆',
    '駿河', '遠江', '三河', '尾張', '美濃', '飛騨', '信濃', '上野', '下野', '越後',
    '佐渡', '越中', '能登', '加賀', '越前', '若狭', '近江', '山城', '丹波', '丹後',
    '但馬', '因幡', '伯耆', '出雲', '石見', '隠岐', '播磨', '美作', '備前', '備中',
    '備後', '安芸', '周防', '長門', '紀伊', '淡路', '阿波', '讃岐', '伊予', '土佐',
    '筑前', '筑後', '豊前', '豊後', '肥前', '肥後', '日向', '大隅', '薩摩', '壱岐',
    '対馬', '河内', '和泉', '摂津', '大和', '伊賀', '伊勢', '志摩',
]

# 神格キーワード (AI が旧国名と組み合わせやすい)
DEITY_KEYWORDS = [
    '八幡', '稲荷', '天神', '春日', '住吉', '熊野', '日吉', '日枝', '白山',
    '浅間', '愛宕', '貴船', '香取', '鹿島', '宗像', '宇佐', '出雲', '諏訪',
    '三輪', '伊勢', '石上', '賀茂', '神明', '氷川', '荒神', '天照',
]

# 「(地名)+(神格)+(神社/宮)」型合成名の suffix
SHRINE_SUFFIXES = ['神社', '宮', '大社', '神宮']

# distinctive feature 必須項目 (どれか 1 つは具体的内容必須)
# (column_name, label, min_length, optional_match_pattern)
SHRINE_FEATURE_FIELDS = [
    ('shrine_rank_ancient', '古代社格', 1, None),
    ('shrine_rank_modern', '近代社格', 1, None),
    ('alternative_names', '別名/古名', 4, None),
    ('old_names', '古名', 4, None),
    ('founding_legend', 'founding_legend', 20, None),
    ('notes', 'notes', 20, None),
    ('address', '町字を含む詳細住所', 1, r'(町|大字|字|丁目|番地)'),
]


def warn(msg: str) -> None:
    print(f'[WARN] {msg}')


def info(msg: str) -> None:
    print(f'[INFO] {msg}')


def get_diff_new_rows(master_path: Path) -> list[dict]:
    """`git diff origin/main` で新規追加された master 行を抽出。

    fallback: origin/main が見つからない場合は空 list を返す。
    """
    try:
        diff = subprocess.run(
            ['git', 'diff', 'origin/main', '--', str(master_path.relative_to(ROOT))],
            capture_output=True, text=True, cwd=ROOT, check=True,
        ).stdout
    except subprocess.CalledProcessError:
        return []

    with open(master_path, encoding='utf-8') as f:
        header = next(csv.reader(f, delimiter='\t'))

    rows: list[dict] = []
    for line in diff.splitlines():
        if not line.startswith('+') or line.startswith('+++'):
            continue
        body = line[1:]
        if not body or body.startswith('master_id'):
            continue
        cells = body.split('\t')
        if len(cells) < len(header):
            continue
        rows.append(dict(zip(header, cells)))
    return rows


def load_all_rows(master_path: Path) -> list[dict]:
    """master ファイル全体を dict 列で読み込む。"""
    with open(master_path, encoding='utf-8') as f:
        rdr = csv.DictReader(f, delimiter='\t')
        return list(rdr)


# --- 検出ロジック ---

def check_distinctive_feature(row: dict) -> tuple[int, list[str]]:
    """distinctive feature が 1 つ以上満たされているかチェック。0 件なら score+10。"""
    issues: list[str] = []
    matched = []
    for col, label, min_len, pattern in SHRINE_FEATURE_FIELDS:
        v = (row.get(col) or '').strip()
        if not v or v == '-':
            continue
        if len(v) < min_len:
            continue
        if pattern and not re.search(pattern, v):
            continue
        matched.append(label)
    if not matched:
        issues.append('distinctive feature が 1 つも満たされない (古代社格/近代社格/別名/founding_legend 20字+/notes 20字+/詳細住所)')
        return 10, issues
    return 0, issues


def check_composite_name(row: dict) -> tuple[int, list[str]]:
    """「(地名)+(神格)+(神社/宮)」型合成名を検出。distinctive feature と組合せ判定。"""
    name = (row.get('canonical_name') or '').strip()
    if not name:
        return 0, []
    issues: list[str] = []
    matched_province = next((p for p in OLD_PROVINCE_NAMES if p in name), None)
    matched_deity = next((d for d in DEITY_KEYWORDS if d in name), None)
    matched_suffix = next((s for s in SHRINE_SUFFIXES if name.endswith(s)), None)
    if matched_province and matched_deity and matched_suffix:
        issues.append(
            f'合成名パターン候補 ({matched_province}+{matched_deity}+{matched_suffix}) — 実在検証必須'
        )
        return 5, issues
    return 0, issues


def check_fingerprint_collision(rows: list[dict]) -> dict[str, int]:
    """主祭神 + 社格 + founded + notes 簡略 hash の衝突を検出。

    返り値: fingerprint → 衝突件数 (5+ のみ)
    """
    fps: Counter[str] = Counter()
    fp_to_ids: defaultdict[str, list[str]] = defaultdict(list)
    for r in rows:
        notes = (r.get('notes') or '')[:30]
        fp = '|'.join([
            (r.get('main_deity_ids') or '').strip(),
            (r.get('shrine_rank_ancient') or '').strip(),
            (r.get('shrine_rank_modern') or '').strip(),
            (r.get('founding_year_estimated') or '').strip(),
            notes,
        ])
        if fp == '||||':
            continue
        fps[fp] += 1
        fp_to_ids[fp].append(r.get('master_id', ''))
    return {fp: c for fp, c in fps.items() if c >= 5}


def check_old_province_systematic(rows: list[dict]) -> tuple[int, list[str]]:
    """新規追加に対し、旧国名の網羅率を計算 (too systematic = suspicious)。"""
    if len(rows) < 5:
        return 0, []
    name_provinces: set[str] = set()
    for r in rows:
        name = (r.get('canonical_name') or '')
        for p in OLD_PROVINCE_NAMES:
            if p in name:
                name_provinces.add(p)
                break
    coverage = len(name_provinces) / len(OLD_PROVINCE_NAMES)
    issues: list[str] = []
    score = 0
    if coverage > 0.5:
        issues.append(
            f'旧国名網羅率 {coverage*100:.0f}% ({len(name_provinces)}/{len(OLD_PROVINCE_NAMES)}) — too systematic = suspicious'
        )
        score = 15
    elif coverage > 0.25:
        issues.append(
            f'旧国名カバー {coverage*100:.0f}% ({len(name_provinces)}/{len(OLD_PROVINCE_NAMES)}) — escalation review 推奨'
        )
        score = 5
    return score, issues


def check_pr_size(rows: list[dict]) -> tuple[int, list[str]]:
    """1 PR あたり 20 件超過は要・分割理由 (CLAUDE.md §4.2)。"""
    if len(rows) > 20:
        return 5, [f'追加件数 {len(rows)} 件 (CLAUDE.md §4.2 推奨 20 件以下) — 分割理由を PR description に明記してください']
    return 0, []


def check_verification_provenance(row: dict) -> tuple[int, list[str]]:
    """verified_status / verification_source の入力チェック (DISC-006 連動)。"""
    vs = (row.get('verified_status') or '').strip()
    src = (row.get('verification_source') or '').strip()
    issues: list[str] = []
    if not vs:
        issues.append('verified_status 未入力 (DISC-006)')
    if not src:
        issues.append('verification_source 未入力 (feature provenance、DISC-009 原則 4)')
    return 3 * len(issues), issues


# --- メイン ---

def scan(rows: list[dict], label: str = '') -> int:
    """rows をスキャンし、累積 score を返す。"""
    if not rows:
        info(f'{label}: 対象行なし')
        return 0

    total_score = 0
    per_row_warnings: list[tuple[str, int, list[str]]] = []
    fp_dups = check_fingerprint_collision(rows)
    pr_score, pr_issues = check_pr_size(rows)
    province_score, province_issues = check_old_province_systematic(rows)

    for r in rows:
        mid = r.get('master_id', '?')
        s1, i1 = check_distinctive_feature(r)
        s2, i2 = check_composite_name(r)
        s3, i3 = check_verification_provenance(r)
        row_score = s1 + s2 + s3
        row_issues = i1 + i2 + i3
        if row_issues:
            per_row_warnings.append((mid, row_score, row_issues))
        total_score += row_score

    # 集計表示
    info(f'{label}: scan 対象 {len(rows)} 件')
    if pr_issues:
        for msg in pr_issues:
            warn(f'[PR size] {msg}')
    if province_issues:
        for msg in province_issues:
            warn(f'[systematic] {msg}')
    if fp_dups:
        warn(f'[fingerprint] 同一指紋 {len(fp_dups)} パターンで 5+ 件複製 — escalation review 推奨')
    if per_row_warnings:
        warn(f'[per-row] suspicious score >0 の行: {len(per_row_warnings)} 件')
        for mid, sc, issues in per_row_warnings[:20]:
            warn(f'  - {mid} (score={sc}): {" / ".join(issues)}')
        if len(per_row_warnings) > 20:
            warn(f'  ... 他 {len(per_row_warnings)-20} 件 (詳細省略)')

    total_score += pr_score + province_score + sum(c-1 for c in fp_dups.values())
    info(f'{label}: 累積 suspiciousness score = {total_score}')
    return total_score


def main() -> int:
    ap = argparse.ArgumentParser(description='DISC-009 anti-hallucination Phase 1 checker (warning only)')
    ap.add_argument('--file', type=str, default=None, help='対象 TSV (省略時は git diff origin/main で master 新規行を全部スキャン)')
    ap.add_argument('--strict', action='store_true', help='累積 score が threshold 超過時に exit 1')
    ap.add_argument('--threshold', type=int, default=50, help='strict モードの score 閾値')
    args = ap.parse_args()

    print('=== DISC-009 anti-hallucination checker (Phase 1: warning only) ===')

    total = 0
    if args.file:
        path = Path(args.file)
        if not path.is_absolute():
            path = ROOT / path
        rows = load_all_rows(path)
        total = scan(rows, label=path.name)
    else:
        masters = [
            ROOT / 'docs/master/shrine_master.tsv',
            ROOT / 'docs/master/deity_master.tsv',
            ROOT / 'docs/master/clan_master.tsv',
        ]
        for m in masters:
            if not m.exists():
                continue
            rows = get_diff_new_rows(m)
            total += scan(rows, label=f'{m.name} (diff)')

    print(f'\n=== 合計 suspiciousness score = {total} ===')
    if args.strict and total > args.threshold:
        print(f'[STRICT] threshold {args.threshold} を超過しました')
        return 1
    print('[OK] Phase 1 = warning only、merge gate にはしません')
    return 0


if __name__ == '__main__':
    sys.exit(main())
