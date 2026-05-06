# Issue カタログ統括(文明 OS 解析、1100+ Issue)

本ディレクトリは issue #128-#132 で設計する **1100+ Issue カタログ** を保持する。

## 0. ディレクトリ構成

```
docs/project/17_issues_civilization_os/
├── 00_overview.md(本書、統括)
├── 01_regional.md(#128 地域祭祀圏 200+ Issue)
├── 02_clans.md(#129 豪族 250+ Issue)
├── 03_myths.md(#130 神話モチーフ 200+ Issue)
├── 04_shrines.md(#131 神社 250+ Issue)
└── 05_relations.md(#132 relation 生成 200+ Issue)
```

## 1. Issue 必須項目テンプレート

各 Issue は以下 17 項目を必ず含む(`docs/project/04_issue_template.md` 拡張):

```yaml
issue_id: AREA-NN-NN(EpicID + 連番)
epic: EPIC-NN(`02_epics.md` または `16_epics_civilization_os.md` 参照)
milestone: M2.X / M3.X(進行段階)
title: "[<Epic タグ>] <短い見出し>"
purpose: "1-3 文で目的"
scope: ["含む 1", "含む 2"]
out_of_scope: ["含まない 1"]
input:
  - schema: docs/schema/01_node_types.md
  - master: docs/master/<関連>_master.tsv
  - sources: ["古事記", "延喜式 等"]
output:
  - tsv: docs/<編>/<連番>_<トピック>.tsv
  - md: docs/civilization/<関連>.md
expected_relation_count: NN(整数推定)
expected_node_count: NN(整数推定)
suggested_sources: ["古事記 巻第〜段", "延喜式神名帳"]
suggested_query: |
  MATCH ...(着手前の Cypher 想定)
acceptance_criteria:
  - "29 列フォーマット遵守"
  - "出典 100% 記載"
  - "L4-L5 仮説に断定なし"
  - "Gemini 監査 OK"
risk:
  - assertion(L4-L5 断定)
  - bias-central(中央偏重)
  - source-weak(出典脆弱)
confidence_policy: "L0-L1 はマスター登録、L4-L5 は独立 hypothesis ノード"
estimated_effort: "S(2-3h) / M(4-5h) / L(6-8h)"
```

## 2. Issue 集計

| カテゴリ | 件数(目標) | 担当ファイル |
|---|---|---|
| 地域祭祀圏 | 200+ | `01_regional.md` |
| 豪族 | 250+ | `02_clans.md` |
| 神話モチーフ | 200+ | `03_myths.md` |
| 神社 | 250+ | `04_shrines.md` |
| relation 生成 | 200+ | `05_relations.md` |
| **合計** | **1100+** | |

→ `02_epics.md` / `16_epics_civilization_os.md` の Epic から派生。

## 3. 進め方

各カテゴリの詳細目録は `01_regional.md` 〜 `05_relations.md` で **代表的な Issue 10-30 件** を骨格化。残りは将来セッションで Epic ごとに展開:

1. Epic 単位で関連 Issue を起票(GitHub MCP 経由)
2. 各 Issue は本書 §1 テンプレート準拠
3. Claude が `claude-autonomous` ラベル付きで自律実行

## 4. 出力先

| Issue タイプ | 主な出力 |
|---|---|
| 地域祭祀圏 Issue | `docs/<編>/NN_*.tsv`(連表)+ master 投入 |
| 豪族 Issue | `docs/master/clan_master.tsv` 拡充 |
| 神話モチーフ Issue | `docs/civilization/01_motif_db.tsv` 拡充 + relation |
| 神社 Issue | `docs/master/shrine_master.tsv` 拡充 |
| relation 生成 Issue | `docs/relations/relations_<type>_<area>.tsv` |

## 5. 実行優先度

```
Phase 2 後半:
   ├── #128 地域祭祀圏(伊勢/諏訪/熊野/宗像/三輪山 を優先)
   ├── #129 豪族(中央 → 地方の順)
   └── #131 神社(式内大社 → 一宮 → 中世社)

Phase 3:
   ├── #130 神話モチーフ(motif → relation の順)
   └── #132 relation 生成(35 type × 地域別)
```
