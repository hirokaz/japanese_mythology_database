# 全体ロードマップ — Phase 1〜5

巨大研究 DB を **段階的に成長** させるための 5 フェーズ計画。各フェーズは **後続フェーズの前提を生成** する関係にあり、飛び越えての並行実行は禁止する(Phase 内の並行は可)。

## 0. ロードマップ俯瞰

| Phase | 名称 | 状態 | 期間目安 | 主成果物 |
|---|---|---|---|---|
| 1 | スキーマ確立 | ほぼ完了 | 1〜2 ヶ月 | node/relation/ID/出典 規程 |
| 2 | 地域編 + Master 投入 | 進行中 | 6〜12 ヶ月 | 全地域連表・全 Master 初版 |
| 3 | Relation 大量生成 | 未着手 | 4〜6 ヶ月 | 数万件 RLN |
| 4 | 監査・正規化・仮説層 | 部分着手 | 3〜6 ヶ月 | 重複統合・hypothesis 体系 |
| 5 | Neo4j 化・公開 | 未着手 | 2〜3 ヶ月 | グラフ DB・クエリ・可視化 |

---

## Phase 1: スキーマ確立(Foundation)

**ゴール**: あらゆる地域・テーマを取り込める **データ仕様** を凍結する。

### 目的
- node_type と relation_type を確定
- ID 体系の凍結
- 出典・仮説強度・史実性のレベル付け規程
- 既存出雲編で全分類が再現可能であることの実証

### 成果物
- `docs/schema/00_id_scheme.md`
- `docs/schema/01_node_types.md`
- `docs/schema/02_relation_types.md`
- `docs/schema/03〜05_*.md`(deity/shrine/clan master 設計)
- `docs/schema/06_time_axes.md`
- `docs/schema/07_source_reliability.md`
- `docs/schema/08_hypothesis_layer.md`
- `docs/schema/09_relation_db.md`
- `docs/templates/columns.md` / `empty.tsv`

### 依存関係
- 前提: なし
- 後続: Phase 2〜5 全てがここを参照

### 優先度 / 難易度 / 推定作業量
- 優先度: **必須(クリティカルパス)**
- 難易度: 高(設計ミスで全工程が壊れる)
- 作業量: 約 80h(完了済み)

### 完了条件
- [x] スキーマ全文書のレビュー完了
- [x] 出雲編 161 行を node/relation 分類で網羅可能
- [x] CLAUDE.md §3.2 の 29 列が固定
- [x] ID プレフィックスが node 13 種で衝突なし

→ **本 Phase は完了とみなす。残作業は §残課題 を参照**

### 残課題
- N04 emperor / N05 myth_episode / N06 event / N09 ritual / N10 region / N11 text / N13 title の master 設計文書の追補(現状 deity/shrine/clan のみ詳細設計済)
- relation_db の `valid_from/valid_until` 運用の実例追加

---

## Phase 2: 地域編 + Master 投入

**ゴール**: 全 15 編(出雲・伊勢・諏訪・鹿島香取・宗像・熊野・石上・三輪・宇佐・春日・海人・修験・東北・九州・琉球)を Layer A 連表で整備し、Layer B Master を初版完成させる。

### 目的
- 各編 100〜200 行の連表 TSV を作成
- 各編から master 候補を抽出 → master TSV へ正規化
- 編間で重複する神・氏族・神社を `merged_into` で統合

### 成果物
- `docs/<編>/` × 15 編
- `docs/master/deity_master.tsv`(目標 600+ レコード)
- `docs/master/shrine_master.tsv`(目標 800+ レコード)
- `docs/master/clan_master.tsv`(目標 250+ レコード)
- `docs/master/emperor_master.tsv`(全代)
- `docs/master/myth_episode_master.tsv`(目標 200+)
- `docs/master/event_master.tsv`
- `docs/master/site_master.tsv`
- `docs/master/artifact_master.tsv`
- `docs/master/ritual_master.tsv`
- `docs/master/region_master.tsv`(古代国/郡まで)
- `docs/master/text_master.tsv`
- `docs/master/title_master.tsv`
- `docs/master/hypothesis_master.tsv`

### 依存関係
- 前提: Phase 1 完了
- 並行: 編単位で完全並行可
- 後続: Phase 3 で全 master を relation の source/target として使用

### 優先度 / 難易度 / 推定作業量
- 優先度: **高**(コーパスの基盤)
- 難易度: 中〜高(出典確認が労働集約的)
- 作業量: 編 1 つあたり約 30〜50h × 15 編 = 約 600h

### 完了条件
- 全 15 編で Layer A 連表が存在し、CLAUDE.md §3.2 の 29 列を満たす
- 全 master TSV が存在し、各 node_type の必須カラムを満たす
- 各 master の `master_id` が一意
- 編間で同一エンティティが二重 master_id を持たない(または `merged_into` で統合済み)
- 各 master レコードが少なくとも 1 つの `mentioned_in` 関係を `relations.tsv` に持つ

### Phase 2 内のサブフェーズ

| サブ | 内容 | 状態 |
|---|---|---|
| 2.1 | 出雲編 | 完了 |
| 2.2 | 地方研究(神話 / 神社 / 海人 / 修験 / テーマ / relation 種) | 完了(汎地方層) |
| 2.3 | 伊勢編 | 未着手 |
| 2.4 | 諏訪編 | 未着手 |
| 2.5 | 鹿島・香取編 | 未着手 |
| 2.6 | 宗像編 | 未着手 |
| 2.7 | 熊野編 | 未着手 |
| 2.8 | 石上編 | 未着手 |
| 2.9 | 三輪編 | 未着手 |
| 2.10 | 宇佐編 | 未着手 |
| 2.11 | 春日編 | 未着手 |
| 2.12 | 海人編 | 部分(地方研究内) |
| 2.13 | 修験編 | 部分(地方研究内) |
| 2.14 | 東北編 | 未着手 |
| 2.15 | 九州編 | 未着手 |
| 2.16 | 琉球編 | 未着手 |
| 2.17 | Master 投入(deity / shrine / clan) | 部分 |
| 2.18 | Master 投入(残り 10 種) | 未着手 |

---

## Phase 3: Relation 大量生成

**ゴール**: Layer A 連表と Layer B Master から、`relations.tsv`(Layer C)を **数万件** 規模で生成する。

### 目的
- 全 master ノードを最低 1 本以上の関係でグラフ接続
- relation_type ごとに **批量生成** することで網羅性を保証
- `confidence_level`、`hypothesis_layer`、`source_reference` を全件に付与

### 成果物
- `docs/relations/relations.tsv`(目標 30,000+ 行)
- 関係種別ごとの分割ファイル(任意): `relations_enshrined_at.tsv`, `relations_mentioned_in.tsv` 等
- `docs/relations/relation_inventory.md`(関係種別ごとの件数台帳)

### 依存関係
- 前提: Phase 2 の master 確定
- 並行: relation_type 単位で並行可
- 後続: Phase 4 監査の対象

### 優先度 / 難易度 / 推定作業量
- 優先度: 高
- 難易度: 中(機械的だがエンティティ照合が骨)
- 作業量: relation_type ごとに 8〜30h × 約 35 種 = 約 500h

### 完了条件
- `relations.tsv` が `docs/schema/02_relation_types.md` の必須カラムを全件満たす
- 全 deity に `enshrined_at` が最低 1 本(主祭神不明の場合は除外)
- 全 myth_episode に `mentioned_in` が最低 1 本
- 全 hypothesis に `supports` または `contradicts` が最低 1 本
- 重複(同一 source / type / target)が 0
- ID 衝突 0

---

## Phase 4: 監査・正規化・仮説層

**ゴール**: Phase 2-3 の成果を **クリーンな知識ベース** に磨き上げ、横断的な仮説層を体系化する。

### 目的
- 表記ゆれ・重複の検出と統合
- 出典が脆弱な箇所の補強
- 「中央史観」への偏重監査
- 「仮説の断定化」の検出と層別化(L0〜L5 の再分類)
- 横断的仮説(縄文記憶・海人連合・銅鐸祭祀文化圏 等)の体系化

### 成果物
- `docs/audit/10_*.md` 以降の追加監査レポート
- 統合済み master(`merged_into` で統合された痕跡を保持)
- `docs/master/hypothesis_master.tsv` の充実(目標 100+ レコード)
- `docs/civilization/` 配下の解析文書群(現 #1〜#7 完成)

### 依存関係
- 前提: Phase 2-3 で十分なデータが集積していること
- 並行: 監査軸ごとに並行可
- 後続: Phase 5 でグラフ化前のクリーニング基準

### 優先度 / 難易度 / 推定作業量
- 優先度: 中〜高
- 難易度: 高(判断を要する)
- 作業量: 監査軸 1 つあたり 10〜40h × 約 12 軸 = 約 200h

### 完了条件
- 全 master の表記ゆれ監査済み
- 全 relation の出典監査済み
- 重複 master が `merged_into` で全て解消
- L4-L5 仮説が独立 hypothesis ノードに分離済み
- `docs/civilization/` 全 7 文書完成

---

## Phase 5: Neo4j 化・公開

**ゴール**: TSV から **Neo4j グラフ DB** へ載せ、クエリ・可視化・公開エクスポートを整備する。

### 目的
- TSV → Cypher LOAD CSV のパイプライン構築
- Neo4j スキーマ確定(`:Deity`, `:Shrine` 等のラベル設計)
- 主要クエリパターン 50 種を整備
- 可視化(neovis.js / d3.js / Bloom)
- 公開用フォーマット(JSON-LD / RDF / Wikidata QID 突き合わせ)

### 成果物
- `pipeline/load_neo4j.cypher`
- `pipeline/export_jsonld.py`
- `docs/queries/`(Cypher クエリ集)
- `docs/graph_visualization/`(可視化サンプル)
- `docs/civilization/07_knowledge_graph_final.md`(本リポジトリの #83 issue で言及)

### 依存関係
- 前提: Phase 4 完了(クリーン化済み)
- 後続: 一般公開・論文化・教育利用

### 優先度 / 難易度 / 推定作業量
- 優先度: 中
- 難易度: 中
- 作業量: 約 150h

### 完了条件
- Neo4j に全 master と relations を投入し、ID 衝突なくロード成功
- 主要クエリ 50 件が動作
- 可視化デモが少なくとも 3 パターン(系譜図 / 神社ネットワーク / 神話異伝)
- README にクイックスタート手順
- ライセンス・出典明記

---

## クリティカルパス

```
Phase1 ──→ Phase2.1〜2.16 (並行) ──→ Phase2.17-2.18 (Master) ──┐
                                                                   ├─→ Phase3 ──→ Phase4 ──→ Phase5
                                       Phase4 一部 (監査軸) ───────┘
```

- 出雲編は Phase 1 と並行で先行完了済(参照実装)
- 地方研究は地域編横断のため Phase 2 と並行
- 監査の一部(出典・表記)は Phase 2 完了を待たず開始可

## 次の 90 日アクション

| Sprint | 期間 | 焦点 |
|---|---|---|
| S1 | 30 日 | 文明解析 #2〜#7 完了 / 伊勢編 着手 |
| S2 | 30 日 | 諏訪 / 鹿島香取 / 三輪 編着手(並行 3 編) |
| S3 | 30 日 | deity_master 600 件突破 / shrine_master 800 件突破 |
