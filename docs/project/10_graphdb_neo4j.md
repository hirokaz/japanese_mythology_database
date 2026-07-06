# Neo4j 化 最終工程 設計(EPIC-31〜EPIC-32)

Phase 5 における **TSV → Neo4j 知識グラフ** 移行の全工程設計。issue #83(文明解析 #7 知識グラフ最終構造案)とも連動する。

## 0. 全体パイプライン

```
[TSV] docs/master/*_master.tsv
       │
       ├── (1) 正規化  → staging/master/*.csv
       │
[TSV] docs/relations/*.tsv
       │
       ├── (2) 正規化  → staging/relations/*.csv
       │
       ▼
[Neo4j] CREATE CONSTRAINT
       │
       ├── (3) LOAD CSV (master)
       │
       ├── (4) LOAD CSV (relations)
       │
       ▼
[index] CREATE INDEX
       │
       ▼
[query] Cypher 50 種
       │
       ▼
[viz]   neovis.js / Bloom / d3
```

---

## 1. node_type → Neo4j ラベル写像

| node_type | Cypher ラベル | プロパティキー(camelCase) |
|---|---|---|
| deity | `:Deity` | masterId, canonicalName, canonicalReading, category, gender, mainTextAppearance, aliases, ... |
| shrine | `:Shrine` | masterId, canonicalName, canonicalReading, prefecture, address, coordinates, ... |
| clan | `:Clan` | masterId, canonicalName, clanType, peakPeriod, ... |
| emperor | `:Emperor` | masterId, canonicalName, reignPeriod, generation, historicityLevel, ... |
| myth_episode | `:MythEpisode` | masterId, canonicalName, mythicTime, ... |
| event | `:Event` | masterId, canonicalName, estimatedHistoricalTime, sourceReliability, ... |
| archaeological_site | `:Site` | masterId, canonicalName, prefecture, era, coordinates, ... |
| artifact | `:Artifact` | masterId, canonicalName, type, era, material, ... |
| ritual | `:Ritual` | masterId, canonicalName, schedule, hostShrineId, ... |
| region | `:Region` | masterId, canonicalName, regionType, era, ... |
| text | `:Text` | masterId, canonicalName, documentWrittenTime, textType, author, ... |
| hypothesis | `:Hypothesis` | masterId, canonicalName, layer, proposer, status, ... |
| title | `:Title` | masterId, canonicalName, titleType, ... |

### 共通プロパティ
- `masterId` — リポジトリの master_id(`DEI-001` 等)。**ユニーク制約**
- `canonicalName` — 正規名
- `aliases`(配列): カンマ区切り → `split(",")` で配列化
- `notes`
- `sourceReliability` — A〜E

---

## 2. relation_type → Neo4j relationship type 写像

スネークケース(小文字)→ 大文字スネークに変換。

| relation_type (TSV) | Cypher relationship | source ラベル | target ラベル | directed |
|---|---|---|---|---|
| enshrined_at | `:ENSHRINED_AT` | `:Deity` | `:Shrine` | yes |
| primary_deity_of | `:PRIMARY_DEITY_OF` | `:Deity` | `:Shrine` | yes |
| secondary_deity_of | `:SECONDARY_DEITY_OF` | `:Deity` | `:Shrine` | yes |
| has_subordinate_shrine | `:HAS_SUBORDINATE_SHRINE` | `:Shrine` | `:Shrine` | yes |
| located_in | `:LOCATED_IN` | `:Shrine`/`:Site` | `:Region` | yes |
| parent_of | `:PARENT_OF` | `:Deity`/`:Emperor` | `:Deity`/`:Emperor` | yes |
| sibling_of | `:SIBLING_OF` | (同上) | (同上) | undirected → 1 行のみ保存 |
| married_to | `:MARRIED_TO` | (同上) | (同上) | undirected → 1 行のみ保存 |
| descended_from | `:DESCENDED_FROM` | `:Clan` | `:Deity`/`:Clan` | yes |
| ancestor_deity_of | `:ANCESTOR_DEITY_OF` | `:Deity` | `:Clan` | yes |
| syncretized_with | `:SYNCRETIZED_WITH` | `:Deity` | `:Deity` | undirected |
| same_as | `:SAME_AS` | `:Deity` | `:Deity` | undirected |
| has_alias | `:HAS_ALIAS` | `:Deity` | `:Deity` | yes |
| has_title | `:HAS_TITLE` | `:Deity`/`:Shrine` | `:Title` | yes |
| regional_variant_of | `:REGIONAL_VARIANT_OF` | `:Deity` | `:Deity` | yes |
| controlled_by | `:CONTROLLED_BY` | `:Region`/`:Clan` | `:Clan`/`:Emperor` | yes |
| ruled | `:RULED` | `:Clan`/`:Emperor` | `:Region` | yes |
| allied_with | `:ALLIED_WITH` | `:Clan` | `:Clan` | undirected |
| opposed_to | `:OPPOSED_TO` | `:Clan`/`:Deity` | `:Clan`/`:Deity` | undirected |
| served | `:SERVED` | `:Clan`/`:Emperor` | `:Emperor` | yes |
| renamed_to | `:RENAMED_TO` | `:Clan`/`:Shrine` | `:Clan`/`:Shrine` | yes |
| participated_in | `:PARTICIPATED_IN` | `:Deity`/`:Clan`/`:Emperor` | `:MythEpisode`/`:Event` | yes |
| occurred_in | `:OCCURRED_IN` | `:MythEpisode`/`:Event` | `:Region` | yes |
| triggered | `:TRIGGERED` | (因果) | (因果) | yes |
| variant_of | `:VARIANT_OF` | `:MythEpisode` | `:MythEpisode` | yes |
| mentioned_in | `:MENTIONED_IN` | (任意) | `:Text` | yes |
| primary_source_for | `:PRIMARY_SOURCE_FOR` | `:Text` | (任意) | yes |
| authored_by | `:AUTHORED_BY` | `:Text` | `:Emperor`/`:Clan` | yes |
| found_at | `:FOUND_AT` | `:Artifact` | `:Site` | yes |
| dated_to | `:DATED_TO` | `:Artifact`/`:Site` | (period 文字列プロパティでも可) | yes |
| archaeologically_linked | `:ARCHAEOLOGICALLY_LINKED` | `:Site`/`:Artifact` | `:MythEpisode`/`:Deity` | yes |
| performed_at | `:PERFORMED_AT` | `:Ritual` | `:Shrine` | yes |
| reenacts | `:REENACTS` | `:Ritual` | `:MythEpisode` | yes |
| performed_by | `:PERFORMED_BY` | `:Ritual` | `:Clan`/`:Emperor` | yes |
| supports | `:SUPPORTS` | `:Hypothesis` | (任意) | yes |
| contradicts | `:CONTRADICTS` | `:Hypothesis` | (任意) | yes |
| proposed_by | `:PROPOSED_BY` | `:Hypothesis` | `:Text`/`:Clan`/`:Emperor` | yes |
| merged_into | `:MERGED_INTO` | (任意) | (任意) | yes |
| supersedes | `:SUPERSEDES` | (任意) | (任意) | yes |

### relationship 共通プロパティ

```
relationId        — RLN-NNNNNN
confidenceLevel   — A〜E
hypothesisLayer   — L0〜L5
temporalScope     — mythic / estimated / document
validFrom, validUntil  — 数値(西暦)
sourceReference   — 出典文字列
notes
```

---

## 3. Cypher 制約・インデックス(M5.1)

```cypher
// 13 ラベルに UNIQUENESS 制約
CREATE CONSTRAINT deity_id IF NOT EXISTS FOR (n:Deity) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT shrine_id IF NOT EXISTS FOR (n:Shrine) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT clan_id IF NOT EXISTS FOR (n:Clan) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT emperor_id IF NOT EXISTS FOR (n:Emperor) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT myth_id IF NOT EXISTS FOR (n:MythEpisode) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT event_id IF NOT EXISTS FOR (n:Event) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT site_id IF NOT EXISTS FOR (n:Site) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT artifact_id IF NOT EXISTS FOR (n:Artifact) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT ritual_id IF NOT EXISTS FOR (n:Ritual) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT region_id IF NOT EXISTS FOR (n:Region) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT text_id IF NOT EXISTS FOR (n:Text) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT hypothesis_id IF NOT EXISTS FOR (n:Hypothesis) REQUIRE n.masterId IS UNIQUE;
CREATE CONSTRAINT title_id IF NOT EXISTS FOR (n:Title) REQUIRE n.masterId IS UNIQUE;

// 検索高速化インデックス
CREATE INDEX deity_name IF NOT EXISTS FOR (n:Deity) ON (n.canonicalName);
CREATE INDEX shrine_name IF NOT EXISTS FOR (n:Shrine) ON (n.canonicalName);
CREATE INDEX shrine_pref IF NOT EXISTS FOR (n:Shrine) ON (n.prefecture);
CREATE INDEX region_name IF NOT EXISTS FOR (n:Region) ON (n.canonicalName);
CREATE INDEX text_name IF NOT EXISTS FOR (n:Text) ON (n.canonicalName);
CREATE INDEX clan_name IF NOT EXISTS FOR (n:Clan) ON (n.canonicalName);

// 関係プロパティのインデックス(将来クエリ最適化)
CREATE INDEX rln_layer IF NOT EXISTS FOR ()-[r]-() ON (r.hypothesisLayer);
CREATE INDEX rln_conf IF NOT EXISTS FOR ()-[r]-() ON (r.confidenceLevel);
```

---

## 4. LOAD CSV パイプライン(M5.2)

### 4.1 master ロードの典型(deity の例)

```cypher
LOAD CSV WITH HEADERS FROM 'file:///deity_master.csv' AS row
MERGE (d:Deity { masterId: row.master_id })
SET d.canonicalName       = row.canonical_name,
    d.canonicalReading    = row.canonical_reading,
    d.category            = row.category,
    d.gender              = row.gender,
    d.mainTextAppearance  = row.main_text_appearance,
    d.aliases             = split(coalesce(row.aliases,''), ','),
    d.aliasesReading      = split(coalesce(row.aliases_reading,''), ','),
    d.notes               = row.notes;
```

### 4.2 relations ロードの典型(enshrined_at)

```cypher
LOAD CSV WITH HEADERS FROM 'file:///relations.csv' AS row
WITH row WHERE row.relation_type = 'enshrined_at'
MATCH (s:Deity { masterId: row.source_id })
MATCH (t:Shrine { masterId: row.target_id })
MERGE (s)-[r:ENSHRINED_AT]->(t)
SET r.relationId       = row.relation_id,
    r.confidenceLevel  = row.confidence_level,
    r.hypothesisLayer  = row.hypothesis_layer,
    r.temporalScope    = row.temporal_scope,
    r.validFrom        = toInteger(row.valid_from),
    r.validUntil       = toInteger(row.valid_until),
    r.sourceReference  = row.source_reference,
    r.notes            = row.notes;
```

→ 全 35+ relation_type に対し同様の Cypher を生成(スクリプト自動化推奨)。

### 4.3 TSV → CSV 変換

```bash
# pipeline/tsv_to_csv.sh
for f in docs/master/*.tsv; do
  out="staging/master/$(basename "$f" .tsv).csv"
  python3 pipeline/tsv2csv.py "$f" "$out"
done
```

(`tsv2csv.py` は CSV エスケープ・改行処理・aliases のカンマ衝突回避のため `;` 区切りに変換等の前処理を含む)

---

## 5. Cypher クエリ集(M5.3 — 50 種)

### 5.1 神社 → 主祭神
```cypher
MATCH (s:Shrine {canonicalName: '出雲大社'})<-[r:PRIMARY_DEITY_OF]-(d:Deity)
RETURN d.canonicalName, r.sourceReference;
```

### 5.2 神 → 全配祀社
```cypher
MATCH (d:Deity {canonicalName: '大国主'})-[:ENSHRINED_AT]->(s:Shrine)
RETURN s.canonicalName, s.prefecture
ORDER BY s.prefecture;
```

### 5.3 神話エピソードの異伝列挙
```cypher
MATCH (m:MythEpisode {canonicalName: '国譲り'})-[:MENTIONED_IN]->(t:Text)
RETURN t.canonicalName, t.documentWrittenTime
ORDER BY t.documentWrittenTime;
```

### 5.4 ある氏族の祖神までの系譜
```cypher
MATCH p = (c:Clan {canonicalName: '出雲国造'})-[:DESCENDED_FROM*..5]->(d:Deity)
RETURN p;
```

### 5.5 中央神話 vs 地方異伝の比較
```cypher
MATCH (m:MythEpisode)-[:VARIANT_OF*0..1]-(v:MythEpisode)-[:MENTIONED_IN]->(t:Text)
WHERE t.textType IN ['風土記','神社縁起','地方伝承']
RETURN m.canonicalName, v.canonicalName, t.canonicalName;
```

### 5.6 仮説とその支持/反証事実
```cypher
MATCH (h:Hypothesis)-[s:SUPPORTS]->(n)
WHERE h.layer IN ['L1','L2']
RETURN h.canonicalName, type(s), labels(n), n.canonicalName;
```

### 5.7 神仏習合グラフ
```cypher
MATCH (d:Deity)-[:SYNCRETIZED_WITH*1..2]-(b:Deity)
WHERE d.category IS NOT NULL
RETURN d, b;
```

### 5.8 ある神社の祭祀 → 神話再演
```cypher
MATCH (s:Shrine {canonicalName: '諏訪大社'})<-[:PERFORMED_AT]-(r:Ritual)-[:REENACTS]->(m:MythEpisode)
RETURN r.canonicalName, m.canonicalName;
```

### 5.9 銅鐸出土遺跡 → 神話関連
```cypher
MATCH (a:Artifact {type:'銅鐸'})-[:FOUND_AT]->(s:Site)-[:ARCHAEOLOGICALLY_LINKED]->(m:MythEpisode)
RETURN s.canonicalName, m.canonicalName;
```

### 5.10 海人系祭神の地理分布
```cypher
MATCH (d:Deity {category:'海神'})-[:ENSHRINED_AT]->(s:Shrine)-[:LOCATED_IN]->(r:Region)
RETURN r.canonicalName, count(s) AS shrineCount
ORDER BY shrineCount DESC;
```

→ 残り 40 件の代表クエリは `docs/queries/*.cypher` に格納予定(M5.3 で完成)。

---

## 6. 可視化(M5.4)

### 6.1 系譜図(Emperor / Deity / Clan)

- 推奨: Neo4j Bloom or neovis.js
- ノード色: ラベルごと(Deity=赤、Emperor=金、Clan=青、Shrine=緑)
- フィルタ: `historicityLevel`, `mythicTime`

### 6.2 神社ネットワーク

- 推奨: d3.js force-layout、または Bloom geographic layout
- 軸: prefecture / clan / category

### 6.3 神話異伝グラフ

- 中心: MythEpisode
- 放射: MENTIONED_IN, VARIANT_OF, PARTICIPATED_IN
- 注釈: text の文献年

---

## 7. 公開エクスポート(M5.5)

### 7.1 JSON-LD

`schema.org` ベースの構造で公開。

```json
{
  "@context": "https://schema.org/",
  "@id": "japanmyth:DEI-001",
  "@type": "Person",
  "name": "大国主",
  "alternateName": ["オオナムチ", "大穴牟遅"],
  "japanmyth:category": "国魂神",
  "japanmyth:enshrinedAt": [
    { "@id": "japanmyth:SHR-001", "name": "出雲大社" }
  ]
}
```

### 7.2 Wikidata QID 突合

- 既知の主要神格・神社・天皇に Q ID を付与
- 突合ファイル: `docs/master/wikidata_mapping.tsv`(`master_id <tab> wikidata_qid`)

---

## 8. Issue 詳細(EPIC-31〜32)

### EPIC-31. Neo4j 化

| ID | Title | Effort | Priority | Dep |
|---|---|---|---|---|
| GR-NE-01 | ラベル・relationship type 写像表凍結 | M | P0 | M4.* |
| GR-NE-02 | Cypher 制約・インデックス | M | P0 | GR-NE-01 |
| GR-NE-03 | TSV→CSV 変換スクリプト | M | P0 | GR-NE-01 |
| GR-NE-04 | LOAD CSV パイプライン(全 13 master) | L | P0 | GR-NE-03 |
| GR-NE-05 | LOAD CSV パイプライン(全 35+ rel) | L | P0 | GR-NE-04 |
| GR-NE-06 | サンプル投入(出雲編サブセット) | M | P0 | GR-NE-05 |
| GR-NE-07 | 全 master 投入 | L | P0 | GR-NE-06 |
| GR-NE-08 | 全 relation 投入 | L | P0 | GR-NE-07 |
| GR-NE-09 | 投入後検証(node 数・edge 数・dangling 等) | M | P0 | GR-NE-08 |

### EPIC-32. 可視化・公開

| ID | Title | Effort | Priority | Dep |
|---|---|---|---|---|
| GR-VS-01 | 系譜図 デモ | M | P1 | GR-NE-09 |
| GR-VS-02 | 神社ネットワーク デモ | M | P1 | GR-NE-09 |
| GR-VS-03 | 神話異伝 デモ | M | P1 | GR-NE-09 |
| GR-VS-04 | 統合ダッシュボード | L | P2 | GR-VS-01-03 |
| GR-EX-01 | JSON-LD エクスポート | M | P2 | GR-NE-09 |
| GR-EX-02 | Wikidata QID 突合 | L | P2 | GR-NE-09 |
| GR-EX-03 | 公開リリース v1.0(README + ライセンス) | M | P0 | GR-* |

---

## 9. 出口品質(リリース基準)

- node 5,000+ / edge 30,000+ で投入成功
- 50 Cypher クエリ全件動作
- 可視化 3 種動作
- README にクイックスタート(Docker 1 コマンド推奨)
- ライセンス明示(コードは MIT、データは CC-BY 4.0 推奨。出典権利を尊重)
- 出典クレジットの集約ファイル
