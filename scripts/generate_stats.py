#!/usr/bin/env python3
"""README 用の master / relations 件数統計を生成して標準出力に出す。

使用法:
    python3 scripts/generate_stats.py            # 件数表 (Markdown table) を表示
    python3 scripts/generate_stats.py --readme   # README.md 内の統計ブロックを置換
"""

import csv
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 集計対象 master 一覧 (順序は README の表示順)
TARGETS = [
    ("神格 (deity)", "docs/master/deity_master.tsv"),
    ("神社 (shrine)", "docs/master/shrine_master.tsv"),
    ("氏族 (clan)", "docs/master/clan_master.tsv"),
    ("モチーフ (motif)", "docs/civilization/01_motif_db.tsv"),
    ("文献 (text)", "docs/master/text_master.tsv"),
    ("時代 (period)", "docs/master/period_master.tsv"),
    ("社格 (rank)", "docs/master/rank_master.tsv"),
    ("事件 (event)", "docs/master/event_master.tsv"),
    ("地域 (region)", "docs/master/region_master.tsv"),
    ("祭事 (festival)", "docs/master/festival_master.tsv"),
]

RELATIONS = ("関係 (relations)", "docs/relations/relations.tsv")


def count_rows(path: Path) -> int:
    """ヘッダ除いた行数"""
    if not path.exists():
        return 0
    with open(path, encoding="utf-8") as f:
        return sum(1 for _ in f) - 1


def collect_stats():
    stats = []
    for label, rel in TARGETS:
        stats.append((label, count_rows(ROOT / rel)))
    rel_label, rel_path = RELATIONS
    rel_count = count_rows(ROOT / rel_path)
    return stats, (rel_label, rel_count)


def to_markdown(stats, rel_stat):
    out = []
    out.append("| エンティティ | 件数 |")
    out.append("|---|---|")
    for label, count in stats:
        out.append(f"| {label} | {count:,} |")
    out.append("| | |")
    out.append(f"| **{rel_stat[0]}** | **{rel_stat[1]:,}** |")
    return "\n".join(out)


def update_readme(stats, rel_stat):
    """README.md 内の統計テーブルを置換 (BEGIN/END マーカーで囲まれた範囲)。
    マーカーがない場合は WARNING を出す。"""
    readme = ROOT / "README.md"
    if not readme.exists():
        print("README.md not found", file=sys.stderr)
        return False
    text = readme.read_text(encoding="utf-8")
    BEGIN = "<!-- BEGIN:STATS -->"
    END = "<!-- END:STATS -->"
    block = f"{BEGIN}\n{to_markdown(stats, rel_stat)}\n{END}"
    if BEGIN in text and END in text:
        import re
        new = re.sub(
            re.escape(BEGIN) + r"[\s\S]*?" + re.escape(END),
            block,
            text,
        )
        readme.write_text(new, encoding="utf-8")
        print(f"README.md: 統計ブロック置換 ({len(stats)+1} 行)")
        return True
    else:
        print(f"WARNING: README.md に {BEGIN} / {END} マーカーが無いため置換しません。", file=sys.stderr)
        print("以下を README.md に貼り付けてください:", file=sys.stderr)
        print(block)
        return False


def main():
    stats, rel_stat = collect_stats()
    if "--readme" in sys.argv:
        update_readme(stats, rel_stat)
    else:
        print(to_markdown(stats, rel_stat))


if __name__ == "__main__":
    main()
