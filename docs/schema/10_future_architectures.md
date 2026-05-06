# 将来的アーキテクチャ

本データベースを **Excel/TSV → 知識グラフ・統合プラットフォーム** へ発展させる際の推奨構造を整理する。

## 0. 共通前提

現状の TSV マスター(`docs/master/`)+ 関係性(`docs/relations/`)+ 編 TSV(`docs/<編>/`)を **正本(source of truth)** とし、各ターゲットへは **ETL(Extract-Transform-Load)** で派生させる。

```
[正本: TSV群]
     │
     │  ETL pipeline(Python/scripts)
     ▼
 ┌──────────────────────────────────┐
 │  各ターゲット(派生)              │
 │   - Neo4j                          │
 │   - GraphDB(RDF/SPARQL)           │
 │   - Obsidian(Markdown vault)       │
 │   - Notion(linked databases)       │
 │   - Web Atlas(D3/Sigma/Kepler)     │
 └──────────────────────────────────┘
```

正本を Markdown/Notion 直接入力にすると、版管理(Git)・LLM 統合・スキーマ検証が困難になる。**TSV を正本に保つ** ことが最重要設計判断。

---

## 1. Neo4j(プロパティグラフ DB)

### 1.1 推奨構造

#### ノードラベル
- `Deity`, `Shrine`, `Clan`, `Emperor`, `MythEpisode`, `Event`, `ArchaeologicalSite`, `Artifact`, `Ritual`, `Region`, `Text`, `Hypothesis`, `Title`(13 ラベル)
- マスター TSV の各行が 1 ノードに対応
- プロパティ: TSV のカラムを直接マッピング

#### リレーション
- `02_relation_types.md` の 40 type を Neo4j のリレーションタイプ(大文字スネークケース)に変換
  - 例: `enshrined_at` → `:ENSHRINED_AT`
- リレーションプロパティ: `confidence_level`, `hypothesis_layer`, `temporal_scope`, `valid_from`, `valid_until`, `source_reference`, `notes`

#### インデックス推奨
```cypher
CREATE INDEX deity_master_id FOR (d:Deity) ON (d.master_id);
CREATE INDEX shrine_master_id FOR (s:Shrine) ON (s.master_id);
CREATE FULLTEXT INDEX deity_names FOR (d:Deity) ON EACH [d.canonical_name, d.aliases];
```

### 1.2 ETL 例(Cypher)

```cypher
// マスター TSV を Cypher LOAD CSV でインポート
LOAD CSV WITH HEADERS FROM 'file:///deity_master.tsv' AS row FIELDTERMINATOR '\t'
CREATE (d:Deity {
  master_id: row.master_id,
  canonical_name: row.canonical_name,
  category: row.category,
  gender: row.gender
});

// 関係性
LOAD CSV WITH HEADERS FROM 'file:///relations_sample.tsv' AS row FIELDTERMINATOR '\t'
MATCH (s {master_id: row.source_id}), (t {master_id: row.target_id})
CALL apoc.create.relationship(s, row.relation_type, {
  confidence_level: row.confidence_level,
  hypothesis_layer: row.hypothesis_layer,
  source_reference: row.source_reference
}, t) YIELD rel
RETURN count(rel);
```

### 1.3 注意点
- aliases の `|` 区切り文字列を Cypher で扱う際は `split()` で配列化
- 仮説関係の表示時は `hypothesis_layer` で色分け推奨

---

## 2. GraphDB(RDF/OWL)

### 2.1 推奨構造

セマンティック Web 標準に準拠した RDF Schema / OWL オントロジーを構築する。

#### 名前空間
```
@prefix jmdb: <https://example.org/jmdb/> .
@prefix node: <https://example.org/jmdb/node/> .
@prefix rel: <https://example.org/jmdb/rel/> .
@prefix prop: <https://example.org/jmdb/prop/> .
```

#### クラス階層(OWL)
```
jmdb:Entity (上位クラス)
 ├── jmdb:Deity
 ├── jmdb:Shrine
 ├── jmdb:Clan
 ├── jmdb:Emperor
 ├── jmdb:MythEpisode
 ├── jmdb:Event
 ├── jmdb:ArchaeologicalSite
 ├── jmdb:Artifact
 ├── jmdb:Ritual
 ├── jmdb:Region
 ├── jmdb:Text
 ├── jmdb:Hypothesis
 └── jmdb:Title
```

#### プロパティ
- データプロパティ: `prop:canonicalName`, `prop:reading`, `prop:category` 等
- オブジェクトプロパティ: `rel:enshrinedAt`, `rel:descendedFrom` 等

### 2.2 SPARQL クエリ例

```sparql
# 大国主を祀る神社一覧
SELECT ?shrineName WHERE {
  ?deity prop:canonicalName "大国主神" .
  ?deity rel:enshrinedAt ?shrine .
  ?shrine prop:canonicalName ?shrineName .
}
```

### 2.3 注意点
- Reified Statements でメタデータ(confidence, hypothesis_layer)を扱う
- DBpedia/Wikidata 等の既存オントロジーと **連携可能なマッピング** を意識(将来 LOD 化視野)

---

## 3. Obsidian(Markdown vault)

### 3.1 推奨構造

各 master 行を 1 つの Markdown ファイルに展開し、Wiki link で関係性を表現する。

```
vault/
├── Deity/
│   ├── DEI-001 大国主神.md
│   ├── DEI-002 須佐之男命.md
│   └── ...
├── Shrine/
│   ├── SHR-001 出雲大社.md
│   └── ...
├── Clan/
├── MythEpisode/
├── Hypothesis/
└── Index.md
```

### 3.2 Markdown フォーマット例

```markdown
---
master_id: DEI-001
node_type: deity
canonical_name: 大国主神
canonical_reading: おおくにぬしのかみ
category: 王権神/国土神
aliases:
  - 大穴牟遅神
  - 八千矛神
  - 大物主?(同体論争)
syncretism: 大黒天
---

# 大国主神

## 別名
[[DEI-014 大物主大神]] と同体・別体の論争あり(L2)。

## 主な神社
- [[SHR-001 出雲大社]]
- [[SHR-019 神田明神]]

## 神話
- [[MYTH-001 国譲り神話]]
- [[MYTH-002 因幡の白兎]]
```

### 3.3 関係性の表現
- Wiki link `[[DEI-014 大物主大神]]` でノード間を繋ぐ
- `relation_type` を見出し(`## 別名`、`## 主な神社`)で表現
- メタデータは frontmatter(YAML)に保持

### 3.4 注意点
- Obsidian Graph View で全体構造を可視化可能
- Dataview プラグインで TSV と同等の表検索が可能
- 入力負荷は高いため、TSV → Markdown は ETL で自動生成推奨

---

## 4. Notion(リレーショナルデータベース)

### 4.1 推奨構造

各 master を Notion Database に対応させ、Relation プロパティで連結。

| Notion DB | 対応 master |
|---|---|
| `Deity DB` | `deity_master.tsv` |
| `Shrine DB` | `shrine_master.tsv` |
| `Clan DB` | `clan_master.tsv` |
| `Myth DB` | `myth_episode_master.tsv` |
| `Hypothesis DB` | `hypothesis_master.tsv` |
| `Relation DB`(中継) | `relations.tsv` |

### 4.2 Relation プロパティ設計

- `Deity DB` の `related_shrines` → `Shrine DB` への relation 列
- `Shrine DB` の `main_deity_ids` → `Deity DB` への relation 列(逆参照可能)

複雑な関係(`enshrined_at` の confidence_level など)は **`Relation DB` を中継** に。

### 4.3 View 設計
- Deity DB: Gallery view(画像と一覧)
- Shrine DB: Map view(coordinates 列で地図表示)
- Hypothesis DB: Layer 別 Filter view
- Relation DB: relation_type 別 Group view

### 4.4 注意点
- Notion API で TSV → Notion 同期可能(ETL)
- Notion 単体で版管理が弱い → Git の TSV を正本に
- スキーマ変更時の Notion 側更新コストに注意

---

## 5. Web Atlas(公開可視化)

### 5.1 推奨スタック

| 用途 | 推奨ライブラリ |
|---|---|
| グラフ可視化 | D3.js Force-directed graph、Sigma.js、Cytoscape.js |
| 地図可視化 | Leaflet、Mapbox GL、Kepler.gl |
| 時系列可視化 | Vis.js Timeline、TimelineJS |
| 統合フロント | React/Next.js + Recoil/Zustand |

### 5.2 推奨ビュー

#### グラフビュー
- ノード: master_id ベース、color = node_type
- エッジ: relation_type、太さ = confidence_level
- 仮説関係(L4-L5)は破線で区別
- フィルタ: node_type、relation_type、confidence、hypothesis_layer

#### 地図ビュー
- shrine_master + site_master の coordinates をマップにプロット
- 地域(region)でクラスタリング
- 時間スライダー(estimated_historical_time)で時系列推移

#### 時間軸ビュー
- mythic_time / estimated_historical_time / document_written_time の三軸
- 横軸: 時間、縦軸: イベント密度
- 三層を **三本の独立した時間軸** として描画

### 5.3 ETL パイプライン

```
TSV(正本)
   │
   │ Python(pandas + jsonschema validation)
   ▼
JSON Lines(API 用)
   │
   │ Next.js getStaticProps / API Routes
   ▼
React Frontend
   ├── /graph: D3 Force-directed
   ├── /map: Leaflet
   ├── /timeline: Vis.js Timeline
   └── /search: Algolia Lite + Fuzzy match
```

### 5.4 注意点
- LOD(Linked Open Data)化を視野に、URI 設計を Neo4j/RDF と一致させる
- 仮説レイヤーは **UI で必ず識別可能** に(色・記号・凡例)。一見しただけで「これが大胆仮説」と分かる視覚設計が重要

---

## 6. AI/LLM 統合の設計

### 6.1 RAG(Retrieval-Augmented Generation)

- 正本 TSV を Markdown 化(Obsidian と同じ ETL)
- ベクトル DB(Pinecone, Chroma, Weaviate)に embedding 化
- LLM(Claude API 等)が質問に対し関連 master を取得 → 構造化回答

### 6.2 Knowledge Graph QA

- Neo4j/GraphDB から Cypher/SPARQL クエリを LLM が生成
- 結果を自然言語化して返却

### 6.3 表記揺れ統合への活用

- LLM が新規入力を既存 master と照合(canonical_name + aliases)
- マッチしなければ提案・新規 ID 採番案を出力
- 編纂者が承認/拒否

### 6.4 注意点
- **LLM の出力は仮説レベル L5 として扱う**(検証なし)
- LLM 経由の主張は別カラムで明示(例: `lm_inferred=true`)

---

## 7. 段階的発展ロードマップ

| Phase | 目標 | 期間目安 |
|---|---|---|
| 1 | 出雲編+伊勢編+諏訪編の TSV 完成 | 短期 |
| 2 | マスター(deity/shrine/clan/myth/event)の各 100+ 件 | 中期 |
| 3 | relations.tsv 1000+ 件、ETL Python スクリプト整備 | 中期 |
| 4 | Obsidian vault 自動生成 | 中期 |
| 5 | Neo4j 構築、Cypher クエリで対話可能 | 中期〜長期 |
| 6 | Web Atlas 公開(地図+グラフ+時系列) | 長期 |
| 7 | RDF/LOD 化、Wikidata 連携 | 長期 |
| 8 | LLM RAG 統合、編纂支援 AI | 長期 |

---

## 8. アーキテクチャ判断のまとめ

| 判断 | 理由 |
|---|---|
| TSV を正本に | Git 版管理、LLM 解析容易性、Excel 編纂者の作業性 |
| ID 体系を全層で共通化 | ETL の単純化、相互参照の確実性 |
| 仮説を独立 node 化 | 史実と仮説の **完全分離**、L0-L5 で強度可視化 |
| 関係性に hypothesis_layer 必須 | エッジレベルで仮説強度を保持、可視化時に区別可能 |
| 三層時間軸 | 神話時間と史実時間の混同防止、神話学的厳密性 |

このアーキテクチャにより:
- **編纂段階(現在)**: Excel で表編纂、TSV で Git 管理
- **検索段階(中期)**: Obsidian/Notion で表記揺れ統合運用
- **公開段階(長期)**: Web Atlas で誰でも可視化、Neo4j で複雑クエリ
- **AI 統合(長期)**: LLM RAG で対話的探索、編纂支援

を **同じ正本** から実現できる。
