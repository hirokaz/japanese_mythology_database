# AUD-GM-79 — Gemini 反射監査: 神話モチーフ relation 620件

## 0. 監査対象

| 項目 | 値 |
|---|---|
| 対象 issue | #79 文明解析 #3 神話モチーフ relation_table |
| 対象 PR | #86, #87, #88, #89, #90, #91, #92, #93, #94 |
| 対象ファイル | `docs/civilization/02_motif_relations.tsv` (620 行) |
| 対象台帳 | `docs/civilization/02_motif_relations_inventory.md` |
| 監査日 | 2026-05-06 |
| 監査担当 | Claude(Layer A セルフ)+ Gemini(Layer B、未実施) |

## 1. 構造監査(Layer A: Claude セルフ)

### 1.1 必須カラム充足
- [x] 全 620 行で `relation_id`, `source_motif`, `relation_type`, `target_motif`, `source_reference`, `confidence_level`, `hypothesis_layer` を記載
- [x] 列数 11 で全行揃う
- [x] ヘッダ行 1 行 + データ行 620 行 = 621 行

### 1.2 重複(同 source_motif / relation_type / target_motif)
- [x] **0 件**(`awk` 検査済)

### 1.3 採番衝突
- [x] `MR-EV-`, `MR-RT-`, `MR-PO-`, `MR-RG-`, `MR-AS-`, `MR-TR-` は relation_type ごとに専用接頭辞
- [x] `MR-SY-` のみ S02 (`symbolically_related`) と S06 (`syncretized_with`) で共有 → 番号帯分離(001-086 / 101-173)で衝突回避

### 1.4 hypothesis_layer / confidence_level 整合
- [x] L4-L5 計 7 件 → 全件 `confidence_level=E` ✓
- [x] L0 → 主に `confidence_level ∈ {A}` (一部 B)

### 1.5 motif_id 参照
- [x] source_motif, target_motif は `MOTIF-001 〜 MOTIF-245` の範囲(`docs/civilization/01_motif_db.tsv` 内)

### 1.6 KPI(`docs/project/14_scaling.md` §11)
- [x] L0 比率: 60.5% (> 50% 達成)
- [x] L4-L5 比率: 1.1% (< 10% 達成)
- [x] confidence A 比率: 60.5% (> 30% 達成)
- [x] confidence E 比率: 1.1% (< 15% 達成)

## 2. 内容監査(Layer A: Claude セルフ)

### 2.1 表記ゆれ
- ✅ `motif_id` ベースで参照しているため、表記ゆれは発生しにくい構造
- ⚠ `notes` カラムには「ヤマタノオロチ」「八岐大蛇」などの表記混在あり(motif_id では一意)
- 対応: `notes` の表記は MOTIF master の `motif_name` を優先し、Layer B 監査時に統一

### 2.2 出典
- ✅ 全 620 行に `source_reference` 記載
- ⚠ 「諸記録」「諸民俗」など曖昧出典が一部存在(L4-L5 仮説に集中)
- 対応: Phase 4 の出典監査時に具体化候補を抽出

### 2.3 断定形
- ✅ L0 行は史料記載に基づき断定形を許容
- ✅ L4-L5 は `confidence_level=E` で断定不可を明示
- ⚠ `notes` カラムでの言い切り表現を Gemini 監査で再点検

### 2.4 神話成立年代と神話描写時代の混同
- ✅ MOTIF-206 古事記編纂(712)/ MOTIF-207 日本書紀編纂(720)を独立 motif として分離
- ✅ 描写時代と編纂年代の関係を notes で明記する行あり(MR-PO-017 等)

### 2.5 中央偏重
- ✅ `MR-PO-007` 「出雲国譲り(被征服側)」、`MR-RG-001` 「国譲り(中央)= 出雲国引き(地方)」など視点反転を明示
- ✅ 諏訪在来層(ミシャグジ・洩矢神)、東北アラハバキを独立 motif で扱う

### 2.6 地方軽視
- ✅ 諏訪・出雲・東北・九州・琉球などの地方祭祀 motif と多数の relation あり
- ✅ 各地方 motif の relation 数: 諏訪系 ~30本、出雲系 ~50本、東北系 ~10本

## 3. Gemini 反射監査(Layer B、未実施)

### 3.1 監査依頼プロンプト

```
以下の GitHub リポジトリ:
https://github.com/hirokaz/japanese_mythology_database

の特定 PR (#86, #87, #88, #89, #90, #91, #92, #93, #94) と
最終ファイル `docs/civilization/02_motif_relations.tsv` (620 行) について、
独立した第三者として以下の観点で監査せよ:

1. 表記ゆれ: 同一エンティティに複数表記がないか(notes カラム特に注意)
2. 出典: 「諸記録」「諸民俗」が曖昧でないか、具体化が必要な行
3. 断定: 仮説を断定形で書いていないか(L1-L5 で「である」「である」)
4. 中央偏重: 地方伝承の独立性を尊重しているか(視点反転の有無)
5. relation 妥当性: source_motif/target_motif の関係が定義通りか
6. hypothesis_layer: 仮説強度 L0-L5 が適切か(楽観過大の検出)
7. confidence_level: A-E の判定が妥当か
8. 神話成立年代と神話が描く時代の混同がないか
9. 神仏習合・本地垂迹の関係が relation で表現されているか
10. 文献の編纂年・編纂背景を踏まえているか

各観点について:
- 問題ありなら relation_id と理由
- なしなら「OK」と書く
- 全体総評を最後に付ける

回答は markdown で。本リポジトリの
docs/audit/gemini/AUD-GM-79_motif_relations.md
の §3.2 として追記可能な形式とする。
```

### 3.2 Gemini 回答(未取得)

> **TODO**: Gemini に上記プロンプトを投げ、回答をここに追記する。
> 必要なら issue #79 のサブタスク S10 として人間が実施 → 結果コメント。

## 4. 監査結論(Layer A 段階)

| 観点 | 結果 |
|---|---|
| 構造 | ✅ 全 6 項目クリア |
| 整合 | ✅ 重複/採番/参照すべてクリア |
| KPI | ✅ 4 項目すべて目標達成 |
| 内容 | ⚠ Gemini 監査推奨(notes 表記ゆれ、曖昧出典の具体化) |

→ **Layer A セルフ監査では発見された重大欠陥なし**。Layer B(Gemini)監査を推奨し issue close 可。

## 5. 後続フォロー

1. Gemini API でプロンプト実行(人間オペレータ実施)
2. 結果を §3.2 に追記
3. 指摘があれば修正 PR を起票(`issue/79-fix-after-gemini`)
4. 重大指摘なし → 本ファイル状態のまま finalize
