# 神話モチーフ relation 台帳

`docs/civilization/02_motif_relations.tsv` の集計と整合性検証結果。

## 1. 概要

| 項目 | 値 |
|---|---|
| 全件数 | **620** |
| 目標 | 500+ |
| 達成率 | **124%** |
| relation_type 種類 | 8 |
| 関連する motif (`docs/civilization/01_motif_db.tsv`) | 245 |
| ヘッダ含む TSV 行数 | 621 |
| カラム数 | 11 |

## 2. relation_type 分布

| relation_type | 件数 | 割合 | 内容 |
|---|---|---|---|
| evolved_into | 128 | 20.6% | 派生関係 |
| symbolically_related | 86 | 13.9% | 象徴対応 |
| associated_with | 74 | 11.9% | 緩い関連 |
| syncretized_with | 73 | 11.8% | 神仏習合・同体視 |
| regionally_related | 71 | 11.5% | 地域分布の対応 |
| ritual_related | 70 | 11.3% | 祭祀的関連 |
| transformed_into | 60 | 9.7% | 変身・転化 |
| politically_related | 58 | 9.4% | 政治的関連 |
| **合計** | **620** | **100%** | |

→ 8 relation_type すべてに 50 件以上が確保され、バランスが良い。

## 3. confidence_level / hypothesis_layer 分布

### 3.1 confidence_level

| level | 件数 | 割合 | 意味 |
|---|---|---|---|
| A | 375 | 60.5% | 史料・考古双方で裏付けあり |
| B | 147 | 23.7% | 文献記録あり |
| C | 76 | 12.3% | 神話・伝承 |
| D | 15 | 2.4% | 後世創作の可能性高 |
| E | 7 | 1.1% | 仮説・推測 |

### 3.2 hypothesis_layer

| layer | 件数 | 割合 | 意味 |
|---|---|---|---|
| L0 | 375 | 60.5% | 史料記載の整理 |
| L1 | 147 | 23.7% | 一般的研究解釈 |
| L2 | 76 | 12.3% | 複数研究者言及 |
| L3 | 15 | 2.4% | 民間・地域伝承 |
| L4 | 4 | 0.6% | 大胆仮説 |
| L5 | 3 | 0.5% | 思想的・構造的仮説 |

→ `docs/project/14_scaling.md` §11 KPI 「L0 比率 > 50%」「L4-L5 比率 < 10%」を達成。

### 3.3 整合性

`hypothesis_layer ∈ {L4, L5}` と `confidence_level = E` の対応:

- L4-L5 計 7 件 → 全件 confidence_level=E ✓
- 違反: 0 件

## 4. 採番

| 接頭辞 | relation_type | 範囲 | 件数 |
|---|---|---|---|
| `MR-EV-` | evolved_into | 001〜128 | 128 |
| `MR-SY-` | symbolically_related (S02) + syncretized_with (S06) | 001〜086, 101〜173 | 86 + 73 |
| `MR-RT-` | ritual_related | 001〜070 | 70 |
| `MR-PO-` | politically_related | 001〜058 | 58 |
| `MR-RG-` | regionally_related | 001〜071 | 71 |
| `MR-AS-` | associated_with | 001〜074 | 74 |
| `MR-TR-` | transformed_into | 001〜060 | 60 |

→ S02 (`symbolically_related`) と S06 (`syncretized_with`) は同接頭辞 `MR-SY-` を用いるが、S02 は 001〜086、S06 は 101〜173 と番号帯を分離して衝突回避。

## 5. 検証結果

### 5.1 重複(同 source_motif / relation_type / target_motif)
- **0 件**(`awk` 検査済)

### 5.2 列数
- 全 620 行で **11 列** ✓

### 5.3 必須カラム充足
- relation_id, source_motif, relation_type, target_motif, source_reference, confidence_level, hypothesis_layer の 7 カラムは全件記載

### 5.4 motif_id の存在確認
- source_motif, target_motif で参照される motif_id は `docs/civilization/01_motif_db.tsv`(MOTIF-001〜MOTIF-245)の範囲内

## 6. カバレッジ視点

### 6.1 主要モチーフの関係数(参考)

`MOTIF-001` 国譲り は他 motif との関係 19 本(source または target 側)。同様の主要モチーフ:
- 国譲り(MOTIF-001), 八岐大蛇(MOTIF-026), 大物主祟り(MOTIF-128) は祭祀史の核として高頻度
- 蛇神信仰(MOTIF-027), 山岳信仰(MOTIF-066), 御霊信仰(MOTIF-121) も総合性が高い
- カグツチ(MOTIF-091), 本地垂迹(MOTIF-166), 国学(MOTIF-218) は神仏習合・近世展開の中継点

### 6.2 未参照(orphan)motif

主要 245 motif のうち、完全に未参照の motif は順次補完予定(後続サブタスク or 別 issue)。

## 7. 後続作業

- **S10**: Gemini 反射監査(`docs/project/09_audit_issues.md` に従う)
  - 表記ゆれ・断定形・中央偏重 等の 10 観点で独立検証
  - 監査ログを `docs/audit/gemini/AUD-GM-XX_motif_relations.md` に記録

- **将来**: schema 拡張時(motif → 他 master node への接続)に `relations.tsv` (Layer C) への統合も視野
