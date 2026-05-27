#!/usr/bin/env python3
"""text 中に言及されるが deity_master に単独 entry なき神格を抽出。

走査対象:
- docs/master/deity_master.tsv (notes, syncretism)
- docs/master/shrine_master.tsv (founding_legend, notes)
- docs/master/clan_master.tsv (notes)
- docs/master/festival_master.tsv (summary, history, ritual_content, notes)
- docs/civilization/01_motif_db.tsv (summary, related_folklore, notes)
- docs/civilization/02_mythologem_master.tsv (notes, typical_pattern)
- docs/civilization/07_narrative_layer.tsv (interpretation_text, notes)
- web/data/*_extended.tsv (extended_summary, history 等)
"""

from __future__ import annotations

import csv
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_deity_names() -> tuple[set[str], dict[str, str]]:
    path = ROOT / 'docs/master/deity_master.tsv'
    names = set()
    name_to_id = {}
    with path.open(encoding='utf-8') as f:
        for r in csv.DictReader(f, delimiter='\t'):
            mid = r.get('master_id', '')
            for field in ['canonical_name', 'aliases']:
                v = (r.get(field) or '').strip()
                if not v or v == '-':
                    continue
                for n in v.split('|'):
                    n = n.strip()
                    if n:
                        names.add(n)
                        if n not in name_to_id:
                            name_to_id[n] = mid
    return names, name_to_id


DEITY_PATTERNS = [
    r'([一-龥ぁ-んァ-ヶー々]{2,12}(?:命|尊))',
    r'([一-龥ァ-ヶー]{2,10}(?:大神|大御神|大命))',
    r'([一-龥ァ-ヶー]{2,8}神)(?:[^社宮寺殿院像道力石木]|$)',
    r'([一-龥ァ-ヶー]{2,10}(?:彦命?|姫命?))',
    r'([ァ-ヶー]{4,12})',
]

EXCLUDE_NAMES = {
    '宮司', '禰宜', '神主', '巫女', '大宮司', '神官', '社家',
    '神社', '神宮', '神道', '神話', '神事', '神饌', '神輿', '神体', '神格', '神威', '神名', '神階', '神祇',
    '本殿', '拝殿', '社殿', '神殿', '神域', '神門', '神火', '神奈備', '神在月', '神無月',
    '一神', '主神', '祭神', '主祭神', '配祀神', '相殿神', '末社神', '産土神', '氏神', '客神',
    '皇祖神', '皇祖', '皇統', '皇大神', '皇女神',
    '海神', '山神', '水神', '田神', '雷神', '風神', '土神', '火神', '木神', '石神',
    '蛇神', '龍神', '狐神', '猿神', '鹿神', '熊神', '虎神', '犬神',
    '太陽神', '月神', '星神', '一柱', '二柱', '三柱', '四柱', '五柱', '万神', '八百万',
    '権現', '明神', '大明神',
    '高天原', '葦原中国', '黄泉国', '常世国', '出雲国', '伊勢',
    '異名', '別名', '同神', '同体',
    '農耕神', '海洋神', '蛇神信仰', '海神信仰', '系祭神',
    '武神', '英雄神', '織物神', '稲荷神', '産霊神', '王権神', '海上守護神',
    '皇祖系祖神', '皇統神', '系祖神',
}


def extract_deity_names(text: str) -> set[str]:
    if not text or text == '-':
        return set()
    candidates = set()
    for pattern in DEITY_PATTERNS:
        for m in re.finditer(pattern, text):
            name = m.group(1).strip()
            if name in EXCLUDE_NAMES:
                continue
            if len(name) < 2:
                continue
            candidates.add(name)
    return candidates


def main() -> int:
    print('=== 神格名抽出: 既存 deity vs 文中言及 ===\n')

    existing_names, name_to_id = load_deity_names()
    print(f'既存 deity (canonical+aliases): {len(existing_names)} 名')

    targets = [
        ('docs/master/deity_master.tsv', ['notes', 'syncretism']),
        ('docs/master/shrine_master.tsv', ['founding_legend', 'notes']),
        ('docs/master/clan_master.tsv', ['notes']),
        ('docs/master/festival_master.tsv', ['summary', 'history', 'ritual_content', 'notes']),
        ('docs/civilization/01_motif_db.tsv', ['summary', 'related_folklore', 'notes']),
        ('docs/civilization/02_mythologem_master.tsv', ['notes', 'typical_pattern']),
        ('docs/civilization/07_narrative_layer.tsv', ['interpretation_text', 'notes']),
        ('web/data/deity_extended.tsv', ['extended_summary']),
        ('web/data/shrine_extended.tsv', ['extended_summary', 'history', 'rituals_culture']),
        ('web/data/clan_extended.tsv', ['extended_summary', 'history']),
    ]

    all_mentions = Counter()
    source_map = {}

    for path_str, fields in targets:
        path = ROOT / path_str
        if not path.exists():
            continue
        with path.open(encoding='utf-8') as f:
            rdr = csv.DictReader(f, delimiter='\t')
            for r in rdr:
                for fld in fields:
                    text = r.get(fld, '')
                    for name in extract_deity_names(text):
                        all_mentions[name] += 1
                        if name not in source_map:
                            id_col = next((k for k in r.keys() if k.endswith('_id') or k == 'master_id'), 'id')
                            source_map[name] = f'{path.name}::{r.get(id_col, "?")}::{fld}'

    print(f'文中 mentioned 神格候補: {len(all_mentions)} 名 (unique)')

    missing = {n: c for n, c in all_mentions.items() if n not in existing_names}
    print(f'\n=== 既存 deity に未登録の候補: {len(missing)} 名 ===\n')

    sorted_missing = sorted(missing.items(), key=lambda x: -x[1])
    print(f'上位 60 件 (mention count 順):\n')
    for name, count in sorted_missing[:60]:
        src = source_map.get(name, '?')
        print(f'  {count:3d} {name:25s} (e.g. {src[:80]})')

    return 0


if __name__ == '__main__':
    sys.exit(main())
