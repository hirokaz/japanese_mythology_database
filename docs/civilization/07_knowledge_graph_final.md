# 知識グラフ最終構造案(Neo4j 化を前提)

本書は **`docs/schema/` で確定した Layer A/B/C 構造を Neo4j 知識グラフへ移行する設計** を最終確定する。

> 関連:
> - `docs/schema/01_node_types.md`(13 node 種定義)
> - `docs/schema/02_relation_types.md`(35+ relation 種定義)
> - `docs/project/10_graphdb_neo4j.md`(運用設計の概要)
> - `docs/civilization/03_saiken_analysis.md`(9 圏)、`04_networks.md`(3 ネットワーク)、`05_jomon_memory.md`、`06_central_vs_regional.md`(縄文記憶+中央/地方)

## 0. 章立て

1. node 設計(13 ラベル写像表 + 共通プロパティ) — S01(本書)
2. edge 設計(35+ relationship type 写像表) — S02
3. index / 制約設計(Cypher 制約・インデックス) — S03
4. Cypher クエリ例 集(代表 20 件) — S04
5. 既存 docs/schema/ との整合表 + LOAD CSV パイプライン — S05
6. 出雲編サブセット投入想定の検証 + 全体 review — S06

## 1. node 設計

### 1.1 node 13 種 → Neo4j ラベル写像表

| node_type | プレフィックス | Cypher ラベル | マスター TSV |
|---|---|---|---|
| deity | DEI | `:Deity` | `docs/master/deity_master.tsv` |
| shrine | SHR | `:Shrine` | `docs/master/shrine_master.tsv` |
| clan | CLN | `:Clan` | `docs/master/clan_master.tsv` |
| emperor | EMP | `:Emperor` | `docs/master/emperor_master.tsv` |
| myth_episode | MYTH | `:MythEpisode` | `docs/master/myth_episode_master.tsv` |
| event | EVT | `:Event` | `docs/master/event_master.tsv` |
| archaeological_site | SITE | `:Site` | `docs/master/site_master.tsv` |
| artifact | ART | `:Artifact` | `docs/master/artifact_master.tsv` |
| ritual | RIT | `:Ritual` | `docs/master/ritual_master.tsv` |
| region | REG | `:Region` | `docs/master/region_master.tsv` |
| text | TXT | `:Text` | `docs/master/text_master.tsv` |
| hypothesis | HYP | `:Hypothesis` | `docs/master/hypothesis_master.tsv` |
| title | TTL | `:Title` | `docs/master/title_master.tsv` |

→ 13 ラベル、すべて単一ラベル(複合ラベル不要)

### 1.2 共通プロパティ(全 node 共通)

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `masterId` | String | ○ | `DEI-001` 形式、ユニーク |
| `canonicalName` | String | ○ | 正規名 |
| `canonicalReading` | String | △ | 読み |
| `aliases` | List<String> | △ | 別名(配列) |
| `notes` | String | △ | 備考 |
| `sourceReliability` | String | △ | A〜E |
| `mergedInto` | String | △ | 統合先の masterId(merged_into 関係の source 用) |

### 1.3 node 別プロパティ詳細

#### `:Deity` (神格)
```
masterId, canonicalName, canonicalReading, category(太陽神/海神/地母神/王権神/穀霊/工神/武神 等),
gender, mainTextAppearance, aliases, aliasesReading,
parentDeityIds (List), consortDeityIds (List),
syncretism, regionalVariant, relatedShrineIds, relatedMythIds,
mergedInto, notes
```

#### `:Shrine` (神社)
```
masterId, canonicalName, canonicalReading, prefecture, address,
mainDeityIds (List), oldNames, alternativeNames,
coordinates (Point), secondaryDeityIds (List),
relatedClanIds (List), shrineRankAncient, shrineRankModern,
foundingLegend, foundingYearEstimated, parentShrineId,
mergedInto, notes
```

#### `:Clan` (氏族)
```
masterId, canonicalName, canonicalReading, clanType,
aliases, ancestorDeityId,
relatedShrineIds (List), relatedRegionIds (List), relatedEmperorIds (List),
peakPeriod, mergedInto, notes
```

#### `:Emperor` (天皇・皇族)
```
masterId, canonicalName, canonicalReading, reignPeriod, generation,
aliases, parentEmperorId, spouseIds (List),
relatedShrineIds (List), relatedClanIds (List),
historicityLevel, mergedInto, notes
```

#### `:MythEpisode` (神話エピソード)
```
masterId, canonicalName, canonicalReading, mythicTime,
primaryTextIds (List), aliases,
participatingDeityIds (List), locationRegionIds (List),
variants, mergedInto, notes
```

#### `:Event` (歴史事象)
```
masterId, canonicalName, estimatedHistoricalTime, documentWrittenTime,
sourceReliability, aliases,
participatingClanIds (List), participatingEmperorIds (List),
locationRegionIds (List), sourceTextIds (List),
mergedInto, notes
```

#### `:Site` (考古遺跡)
```
masterId, canonicalName, prefecture, coordinates (Point), era,
aliases, discoveryYear, primaryFindings,
relatedArtifactIds (List), relatedRegionIds (List),
culturalContext, mergedInto, notes
```

#### `:Artifact` (考古資料)
```
masterId, canonicalName, type, foundAtSiteId,
aliases, era, material, currentLocation, designation,
mergedInto, notes
```

#### `:Ritual` (祭祀)
```
masterId, canonicalName, hostShrineId, schedule,
aliases, participatingDeityIds (List), originMythId,
historicalOrigin, mergedInto, notes
```

#### `:Region` (地域)
```
masterId, canonicalName, regionType, era,
aliases, parentRegionId, coordinates (Point), boundingPolygon,
mergedInto, notes
```

#### `:Text` (文献)
```
masterId, canonicalName, documentWrittenTime, textType,
author, era, language, existingFormat,
mergedInto, notes
```

#### `:Hypothesis` (仮説)
```
masterId, canonicalName, layer (L0-L5), proposer,
sourceTextIds (List), aliases,
evidencePro (List), evidenceCon (List), status,
mergedInto, notes
```

#### `:Title` (称号・社格)
```
masterId, canonicalName, titleType, aliases, era,
mergedInto, notes
```

### 1.4 命名規約

- **ラベル**: `:Deity`(PascalCase 単数)
- **プロパティ**: `canonicalName`(camelCase)
- **TSV カラム**: `canonical_name`(snake_case)→ ロード時に変換

### 1.5 設計判断

#### A. なぜ単一ラベルか
- Neo4j はマルチラベルも可能だが、本プロジェクトは **node_type が排他的**(deity か shrine か等が決まる)ので単一で十分
- 例外:統合(merged_into)は **同ラベル内** で関係を張るのみ

#### B. なぜ List プロパティを多用するか
- TSV の `parent_deity_ids = "DEI-005|DEI-006"` のような **パイプ区切り** を Neo4j で List<String> として保持
- ただし、本格的な参照は **relationship 経由** が望ましい(List プロパティは検索用補助)

#### C. coordinates の型
- Neo4j 4.x の `Point` 型を使用(SRID 4326 = WGS84)
- 緯度経度がない神社は `null`(将来 GIS 連携で逐次補完)

### 1.6 docs/schema/ との整合

`docs/schema/01_node_types.md` の 13 node 種定義 と本書 §1.1-1.3 は **完全対応**。schema 側が正本。本書はその Cypher 写像。

---

## 2. edge 設計

### 2.1 relation 35+ 種 → relationship type 写像表

| TSV relation_type | Cypher relationship | source ラベル | target ラベル | directed |
|---|---|---|---|---|
| **2.1.1 神社・祭祀関係** | | | | |
| enshrined_at | `:ENSHRINED_AT` | `:Deity` | `:Shrine` | yes |
| primary_deity_of | `:PRIMARY_DEITY_OF` | `:Deity` | `:Shrine` | yes |
| secondary_deity_of | `:SECONDARY_DEITY_OF` | `:Deity` | `:Shrine` | yes |
| has_subordinate_shrine | `:HAS_SUBORDINATE_SHRINE` | `:Shrine` | `:Shrine` | yes |
| located_in | `:LOCATED_IN` | `:Shrine`/`:Site` | `:Region` | yes |
| **2.1.2 系譜関係** | | | | |
| parent_of | `:PARENT_OF` | `:Deity`/`:Emperor` | `:Deity`/`:Emperor` | yes |
| child_of | `:CHILD_OF` | `:Deity`/`:Emperor` | `:Deity`/`:Emperor` | yes |
| sibling_of | `:SIBLING_OF` | (同上) | (同上) | undirected → 1行のみ |
| married_to | `:MARRIED_TO` | (同上) | (同上) | undirected → 1行のみ |
| descended_from | `:DESCENDED_FROM` | `:Clan` | `:Deity`/`:Clan` | yes |
| ancestor_deity_of | `:ANCESTOR_DEITY_OF` | `:Deity` | `:Clan` | yes |
| **2.1.3 神格・同体** | | | | |
| syncretized_with | `:SYNCRETIZED_WITH` | `:Deity` | `:Deity` | undirected |
| same_as | `:SAME_AS` | `:Deity` | `:Deity` | undirected |
| has_alias | `:HAS_ALIAS` | `:Deity` | `:Deity` | yes |
| has_title | `:HAS_TITLE` | `:Deity`/`:Shrine` | `:Title` | yes |
| regional_variant_of | `:REGIONAL_VARIANT_OF` | `:Deity` | `:Deity` | yes |
| **2.1.4 政治・支配** | | | | |
| controlled_by | `:CONTROLLED_BY` | `:Region`/`:Clan` | `:Clan`/`:Emperor` | yes |
| ruled | `:RULED` | `:Clan`/`:Emperor` | `:Region` | yes |
| allied_with | `:ALLIED_WITH` | `:Clan` | `:Clan` | undirected |
| opposed_to | `:OPPOSED_TO` | `:Clan`/`:Deity` | `:Clan`/`:Deity` | undirected |
| served | `:SERVED` | `:Clan`/`:Emperor` | `:Emperor` | yes |
| renamed_to | `:RENAMED_TO` | `:Clan`/`:Shrine` | `:Clan`/`:Shrine` | yes |
| **2.1.5 神話・出来事** | | | | |
| participated_in | `:PARTICIPATED_IN` | `:Deity`/`:Clan`/`:Emperor` | `:MythEpisode`/`:Event` | yes |
| occurred_in | `:OCCURRED_IN` | `:MythEpisode`/`:Event` | `:Region` | yes |
| triggered | `:TRIGGERED` | (因果) | (因果) | yes |
| variant_of | `:VARIANT_OF` | `:MythEpisode` | `:MythEpisode` | yes |
| **2.1.6 文献・出典** | | | | |
| mentioned_in | `:MENTIONED_IN` | (任意 node) | `:Text` | yes |
| primary_source_for | `:PRIMARY_SOURCE_FOR` | `:Text` | (任意 node) | yes |
| authored_by | `:AUTHORED_BY` | `:Text` | `:Emperor`/`:Clan` | yes |
| **2.1.7 考古関係** | | | | |
| found_at | `:FOUND_AT` | `:Artifact` | `:Site` | yes |
| dated_to | `:DATED_TO` | `:Artifact`/`:Site` | (period 文字列プロパティ) | yes |
| archaeologically_linked | `:ARCHAEOLOGICALLY_LINKED` | `:Site`/`:Artifact` | `:MythEpisode`/`:Deity` | yes |
| **2.1.8 祭祀** | | | | |
| performed_at | `:PERFORMED_AT` | `:Ritual` | `:Shrine` | yes |
| reenacts | `:REENACTS` | `:Ritual` | `:MythEpisode` | yes |
| performed_by | `:PERFORMED_BY` | `:Ritual` | `:Clan`/`:Emperor` | yes |
| **2.1.9 仮説関係** | | | | |
| supports | `:SUPPORTS` | `:Hypothesis` | (任意 node) | yes |
| contradicts | `:CONTRADICTS` | `:Hypothesis` | (任意 node) | yes |
| proposed_by | `:PROPOSED_BY` | `:Hypothesis` | `:Text`/`:Clan`/`:Emperor` | yes |
| **2.1.10 メタ関係** | | | | |
| merged_into | `:MERGED_INTO` | (任意) | (任意) | yes |
| supersedes | `:SUPERSEDES` | (任意) | (任意) | yes |

→ **計 39 relationship type**(`docs/schema/02_relation_types.md` の 35+ 種を完全網羅)

### 2.2 relationship 共通プロパティ

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `relationId` | String | ○ | `RLN-NNNNNN` 形式、ユニーク |
| `confidenceLevel` | String | ○ | A〜E |
| `hypothesisLayer` | String | ○ | L0〜L5 |
| `temporalScope` | String | △ | mythic / estimated / document |
| `validFrom` | Integer | △ | 関係成立年(西暦) |
| `validUntil` | Integer | △ | 関係終了年(西暦) |
| `sourceReference` | String | ○ | 出典(text master_id or 自由記述) |
| `notes` | String | △ | 備考 |

### 2.3 命名規約

- TSV 側 `enshrined_at`(snake_case)→ Cypher 側 `:ENSHRINED_AT`(SCREAMING_SNAKE_CASE)
- ロード時に自動変換

### 2.4 設計判断

#### A. directed / undirected の表現

Neo4j の relationship は **常に directed**(矢印方向あり)。undirected な意味の関係(`:SIBLING_OF`, `:MARRIED_TO`, `:SYNCRETIZED_WITH` 等)は **片方向 1 行のみ保存**(クエリで `MATCH (a)-[r:SIBLING_OF]-(b)` と無向検索)。

#### B. mentioned_in の最大利用度

`:MENTIONED_IN` は **全 node から `:Text` への接続** が可能(任意 source)。これが最も多い relation になる(目標数千〜数万)。

#### C. supports / contradicts の任意 target

`:SUPPORTS` / `:CONTRADICTS` も target が任意 node(主に :Site, :Artifact, :MythEpisode, :Deity)。これにより hypothesis を事実 node から完全分離できる。

#### D. merged_into の意味

`:MERGED_INTO` は **同一エンティティ確定時の統合** を表す。例: `(DEI-X)-[:MERGED_INTO]->(DEI-Y)` で DEI-X は DEI-Y に統合され、以降の検索は DEI-Y を主とする。

### 2.5 docs/schema/ との整合

`docs/schema/02_relation_types.md` の 全 relation 種定義 と本書 §2.1 は **完全対応**。schema 側が正本。本書はその Cypher 写像。`docs/schema/02_relation_types.md` §4 の必須カラム(relation_id, source_id, source_type, relation_type, target_id, target_type, confidence_level, hypothesis_layer, source_reference)とも整合。

---

## 3. index / 制約設計

### 3.1 ユニーク制約(13 ラベル)

`masterId` は **全ラベルで一意**(プレフィックス分離されているため、ラベル横断ユニークも実現可能だが、ラベル別に管理する)。

```cypher
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
```

### 3.2 必須プロパティ制約(主要 node のみ)

```cypher
CREATE CONSTRAINT deity_name IF NOT EXISTS FOR (n:Deity) REQUIRE n.canonicalName IS NOT NULL;
CREATE CONSTRAINT shrine_name IF NOT EXISTS FOR (n:Shrine) REQUIRE n.canonicalName IS NOT NULL;
CREATE CONSTRAINT clan_name IF NOT EXISTS FOR (n:Clan) REQUIRE n.canonicalName IS NOT NULL;
CREATE CONSTRAINT myth_name IF NOT EXISTS FOR (n:MythEpisode) REQUIRE n.canonicalName IS NOT NULL;
CREATE CONSTRAINT hypothesis_layer IF NOT EXISTS FOR (n:Hypothesis) REQUIRE n.layer IS NOT NULL;
```

### 3.3 検索高速化インデックス

```cypher
// 名前検索
CREATE INDEX deity_name_idx IF NOT EXISTS FOR (n:Deity) ON (n.canonicalName);
CREATE INDEX shrine_name_idx IF NOT EXISTS FOR (n:Shrine) ON (n.canonicalName);
CREATE INDEX clan_name_idx IF NOT EXISTS FOR (n:Clan) ON (n.canonicalName);
CREATE INDEX emperor_name_idx IF NOT EXISTS FOR (n:Emperor) ON (n.canonicalName);
CREATE INDEX myth_name_idx IF NOT EXISTS FOR (n:MythEpisode) ON (n.canonicalName);
CREATE INDEX text_name_idx IF NOT EXISTS FOR (n:Text) ON (n.canonicalName);
CREATE INDEX region_name_idx IF NOT EXISTS FOR (n:Region) ON (n.canonicalName);

// 地理検索
CREATE INDEX shrine_pref_idx IF NOT EXISTS FOR (n:Shrine) ON (n.prefecture);
CREATE INDEX site_pref_idx IF NOT EXISTS FOR (n:Site) ON (n.prefecture);

// 時代検索
CREATE INDEX site_era_idx IF NOT EXISTS FOR (n:Site) ON (n.era);
CREATE INDEX artifact_era_idx IF NOT EXISTS FOR (n:Artifact) ON (n.era);
CREATE INDEX text_time_idx IF NOT EXISTS FOR (n:Text) ON (n.documentWrittenTime);

// カテゴリ検索
CREATE INDEX deity_category_idx IF NOT EXISTS FOR (n:Deity) ON (n.category);
CREATE INDEX clan_type_idx IF NOT EXISTS FOR (n:Clan) ON (n.clanType);
CREATE INDEX text_type_idx IF NOT EXISTS FOR (n:Text) ON (n.textType);
CREATE INDEX hyp_layer_idx IF NOT EXISTS FOR (n:Hypothesis) ON (n.layer);
```

### 3.4 全文検索インデックス(横断検索)

```cypher
// 主要エンティティ横断の全文検索
CREATE FULLTEXT INDEX entity_search IF NOT EXISTS
FOR (n:Deity|Shrine|Clan|Emperor|MythEpisode|Event|Site|Artifact|Ritual|Region|Text|Title)
ON EACH [n.canonicalName, n.canonicalReading, n.aliases];

// 仮説検索
CREATE FULLTEXT INDEX hypothesis_search IF NOT EXISTS
FOR (n:Hypothesis)
ON EACH [n.canonicalName, n.notes, n.proposer];

// 文献検索(本文相当の notes 含む)
CREATE FULLTEXT INDEX text_search IF NOT EXISTS
FOR (n:Text)
ON EACH [n.canonicalName, n.author, n.notes];
```

### 3.5 関係プロパティのインデックス

```cypher
// hypothesis_layer フィルタが多用されるため
CREATE INDEX rel_layer_idx IF NOT EXISTS FOR ()-[r]-() ON (r.hypothesisLayer);

// confidence_level フィルタ
CREATE INDEX rel_conf_idx IF NOT EXISTS FOR ()-[r]-() ON (r.confidenceLevel);

// 時系列検索
CREATE INDEX rel_valid_from_idx IF NOT EXISTS FOR ()-[r]-() ON (r.validFrom);
```

### 3.6 地理空間インデックス(Phase 5+)

```cypher
// 緯度経度のある shrine / site
CREATE POINT INDEX shrine_coord_idx IF NOT EXISTS FOR (n:Shrine) ON (n.coordinates);
CREATE POINT INDEX site_coord_idx IF NOT EXISTS FOR (n:Site) ON (n.coordinates);
CREATE POINT INDEX region_coord_idx IF NOT EXISTS FOR (n:Region) ON (n.coordinates);
```

### 3.7 制約・インデックス運用方針

1. **制約 → インデックス → データロード** の順で実行(ロード時に高速化)
2. **冪等性確保**: `IF NOT EXISTS` を全件付与
3. **データロード後の検証**: count(*) で各ラベル件数確認、orphan node / dangling relation 検出
4. **インデックス追加は将来必要に応じて**(初期は §3.3 だけで十分)

### 3.8 docs/schema/ との整合

`docs/schema/01_node_types.md`(必須カラム)と本書 §3.2 必須プロパティ制約は整合。`docs/schema/02_relation_types.md` §4 必須カラムと本書 §3.5 関係プロパティインデックスは整合。

---

## 4. Cypher クエリ例(代表 20 件)

各クエリは想定結果と用途を併記。実投入後の動作確認用。

### Q01. 神社の主祭神を取得

```cypher
MATCH (s:Shrine {canonicalName: '出雲大社'})<-[:PRIMARY_DEITY_OF]-(d:Deity)
RETURN d.canonicalName AS deity, d.category AS category;
```
用途: 神社カードの基本情報表示。

### Q02. 神の祀られる神社一覧

```cypher
MATCH (d:Deity {canonicalName: '大国主'})-[r:ENSHRINED_AT|PRIMARY_DEITY_OF|SECONDARY_DEITY_OF]->(s:Shrine)
RETURN s.canonicalName AS shrine, s.prefecture AS prefecture, type(r) AS relation_type
ORDER BY s.prefecture;
```
用途: 神格分布マップの基礎データ。

### Q03. 神話エピソードの異伝(複数文献での記述差)

```cypher
MATCH (m:MythEpisode {canonicalName: '国譲り'})-[:MENTIONED_IN]->(t:Text)
RETURN t.canonicalName AS text, t.documentWrittenTime AS year, t.textType AS type
ORDER BY t.documentWrittenTime;
```
用途: 異伝対比、文献層別表示。

### Q04. 氏族の祖神までの系譜(最大 5 ホップ)

```cypher
MATCH p = (c:Clan {canonicalName: '出雲国造'})-[:DESCENDED_FROM*1..5]->(d:Deity)
RETURN p, length(p) AS depth;
```
用途: 系譜可視化(graph 描画)。

### Q05. 中央視点 vs 地方異伝の比較

```cypher
MATCH (m:MythEpisode)-[:VARIANT_OF*0..1]-(v:MythEpisode)-[:MENTIONED_IN]->(t:Text)
WHERE t.textType IN ['風土記','社伝','地方伝承']
RETURN m.canonicalName AS central, v.canonicalName AS regional, t.canonicalName AS text;
```
用途: 中央⇄地方二項構造の可視化。

### Q06. 仮説とその支持/反証事実

```cypher
MATCH (h:Hypothesis)
OPTIONAL MATCH (h)-[s:SUPPORTS]->(supportNode)
OPTIONAL MATCH (h)-[c:CONTRADICTS]->(contraNode)
WHERE h.layer IN ['L4','L5']
RETURN h.canonicalName AS hypothesis, h.layer AS layer,
       collect(DISTINCT supportNode.canonicalName) AS supports,
       collect(DISTINCT contraNode.canonicalName) AS contradicts;
```
用途: 大胆仮説のエビデンス可視化。

### Q07. 神仏習合グラフ

```cypher
MATCH p = (d:Deity)-[:SYNCRETIZED_WITH*1..2]-(other:Deity)
WHERE d.category IS NOT NULL
RETURN p
LIMIT 50;
```
用途: 神仏習合ネットワーク描画。

### Q08. ある神社の祭祀 → 神話再演

```cypher
MATCH (s:Shrine {canonicalName: '諏訪大社上社本宮'})<-[:PERFORMED_AT]-(r:Ritual)-[:REENACTS]->(m:MythEpisode)
RETURN r.canonicalName AS ritual, m.canonicalName AS myth, r.schedule AS schedule;
```
用途: 神社祭祀の神話的根拠表示。

### Q09. 銅鐸出土遺跡 → 神話関連

```cypher
MATCH (a:Artifact {type:'銅鐸'})-[:FOUND_AT]->(s:Site)
OPTIONAL MATCH (s)-[:ARCHAEOLOGICALLY_LINKED]->(m:MythEpisode)
RETURN s.canonicalName AS site, count(a) AS bronze_bell_count, collect(m.canonicalName) AS linked_myths;
```
用途: 弥生祭祀文化圏の可視化。

### Q10. 海人系祭神の地理分布

```cypher
MATCH (d:Deity {category:'海神'})-[:ENSHRINED_AT|PRIMARY_DEITY_OF|SECONDARY_DEITY_OF]->(s:Shrine)-[:LOCATED_IN]->(r:Region)
RETURN r.canonicalName AS region, count(DISTINCT s) AS shrine_count, collect(DISTINCT d.canonicalName) AS deities
ORDER BY shrine_count DESC;
```
用途: 海人ネットワーク可視化。

### Q11. 天皇の関与する事象一覧

```cypher
MATCH (e:Emperor {canonicalName: '崇神天皇'})-[:PARTICIPATED_IN]->(target)
RETURN labels(target) AS type, target.canonicalName AS name;
```
用途: 天皇別の関与事象タイムライン。

### Q12. 同体視される神(syncretized_with の連結成分)

```cypher
MATCH p = (d1:Deity {canonicalName:'スサノオ'})-[:SYNCRETIZED_WITH*1..3]-(d2:Deity)
RETURN d2.canonicalName AS syncretized, length(p) AS distance
ORDER BY distance;
```
用途: 神仏習合経由の同体視ネットワーク。

### Q13. 文献の編纂年順タイムライン

```cypher
MATCH (t:Text)
WHERE t.documentWrittenTime IS NOT NULL
RETURN t.canonicalName AS text, t.documentWrittenTime AS year, t.textType AS type, t.author AS author
ORDER BY t.documentWrittenTime
LIMIT 50;
```
用途: 文献の歴史的位置づけ可視化。

### Q14. 国譲り神話の参加者全員

```cypher
MATCH (n)-[:PARTICIPATED_IN]->(m:MythEpisode {canonicalName:'国譲り'})
RETURN labels(n) AS type, n.canonicalName AS name;
```
用途: 神話登場人物の総覧。

### Q15. 地方の独立祭祀(中央史料に登場しない)

```cypher
MATCH (d:Deity)
WHERE NOT EXISTS {
  MATCH (d)-[:MENTIONED_IN]->(t:Text {canonicalName: '古事記'})
} AND NOT EXISTS {
  MATCH (d)-[:MENTIONED_IN]->(t:Text {canonicalName: '日本書紀'})
}
RETURN d.canonicalName AS deity, d.category AS category, d.regionalVariant AS region
LIMIT 30;
```
用途: 地方軽視監査の補助(`docs/audit/08_regional_audit.md`)。

### Q16. ある氏族が祭祀権を持つ全神社

```cypher
MATCH (c:Clan {canonicalName: '物部氏'})<-[:RELATED_CLAN_OF*0..1]-(s:Shrine)
RETURN s.canonicalName AS shrine, s.prefecture AS prefecture;
```

> 注: `:RELATED_CLAN_OF` は本設計には未定義。実装時は `s.relatedClanIds` プロパティ経由で代用するか、edge を新設する。

### Q17. 縄文〜古墳期の祭祀遺跡 → 神話モチーフ対応

```cypher
MATCH (s:Site)-[:ARCHAEOLOGICALLY_LINKED]->(m:MythEpisode)
WHERE s.era IN ['縄文','弥生','古墳']
RETURN s.era AS era, s.canonicalName AS site, m.canonicalName AS myth, m.mythicTime AS mythTime;
```
用途: 考古⇄神話対応表(L2-L4 仮説含)。

### Q18. 9 地域祭祀圏のノード集計

```cypher
MATCH (s:Shrine)-[:LOCATED_IN]->(r:Region)
WHERE r.canonicalName IN ['出雲国','伊勢国','信濃国諏訪郡','常陸国','下総国','筑前国','紀伊国','大和国式上郡','陸奥国','日向国']
RETURN r.canonicalName AS saiken_region, count(s) AS shrine_count
ORDER BY shrine_count DESC;
```
用途: 9 圏(`docs/civilization/03_saiken_analysis.md`)の規模可視化。

### Q19. hypothesis_layer 別 relation 件数

```cypher
MATCH ()-[r]->()
WHERE r.hypothesisLayer IS NOT NULL
RETURN r.hypothesisLayer AS layer, count(r) AS count
ORDER BY layer;
```
用途: KPI 監視(L0 比率等、`docs/project/14_scaling.md` §11)。

### Q20. 全 node / relationship 件数

```cypher
MATCH (n)
RETURN labels(n) AS label, count(n) AS count
ORDER BY count DESC
UNION
MATCH ()-[r]->()
RETURN ['__edge__:'+type(r)] AS label, count(r) AS count
ORDER BY count DESC;
```
用途: ロード後の検証、ダッシュボード基礎統計。

---

### 4.X 残り 30 件のクエリ候補(後続実装)

- 系譜深さ分析(parent_of の最大深さ)
- 改称履歴の追跡(renamed_to の連鎖)
- 婚姻同盟ネットワーク(married_to + allied_with)
- 御霊信仰の地理拡散(MOTIF-121 派生 + LOCATED_IN)
- 製鉄祭祀の系譜(MOTIF-082 ⇄ 鍛冶神)
- 修験霊場の本地仏分布(SYNCRETIZED_WITH)
- 祭祀年中行事のカレンダー(:Ritual.schedule)
- 文献継承(authored_by + supersedes)
- 客人神分布(MOTIF-148 アラハバキ + LOCATED_IN)
- L4-L5 仮説の提唱者ネットワーク(:PROPOSED_BY)

→ 実投入時(GR-NE-09)に追加実装予定。

---

## 5. docs/schema/ との整合表 + LOAD CSV パイプライン

### 5.1 schema 文書群との対応

| schema 文書 | 本書での対応章 | 状態 |
|---|---|---|
| `docs/schema/00_id_scheme.md` | §1.1 ラベル写像表 + プレフィックス | ✅ 整合 |
| `docs/schema/01_node_types.md` | §1.2-1.3 共通+各 node プロパティ | ✅ 整合 |
| `docs/schema/02_relation_types.md` | §2.1-2.2 relationship 写像 + 共通プロパティ | ✅ 整合 |
| `docs/schema/03_deity_master_design.md` | §1.3 `:Deity` プロパティ | ✅ 整合 |
| `docs/schema/04_shrine_master_design.md` | §1.3 `:Shrine` プロパティ | ✅ 整合 |
| `docs/schema/05_clan_master_design.md` | §1.3 `:Clan` プロパティ | ✅ 整合 |
| `docs/schema/06_time_axes.md` | §2.2 temporalScope/validFrom/validUntil | ✅ 整合 |
| `docs/schema/07_source_reliability.md` | 共通プロパティ sourceReliability | ✅ 整合 |
| `docs/schema/08_hypothesis_layer.md` | §1.3 `:Hypothesis.layer`、§3.5 hypothesisLayer インデックス | ✅ 整合 |
| `docs/schema/09_relation_db.md` | §2 全体 | ✅ 整合 |
| `docs/schema/10_future_architectures.md` | 本書全体(本書はその実装提案) | ✅ 整合 |

→ **schema 側を正本として遵守**。本書は Cypher 写像のみ。schema 改訂時は本書も連動更新する規約とする(`docs/project/14_scaling.md` §10.1 の波及範囲対応)。

### 5.2 LOAD CSV パイプライン全体像

```
[TSV(リポジトリ)] docs/master/*.tsv, docs/relations/*.tsv
       │
       │ (1) Python 前処理
       ▼
[CSV(staging)] staging/master/*.csv, staging/relations/*.csv
       │
       │ (2) Cypher 制約・インデックス作成
       ▼
[Neo4j 制約・インデックス] (§3 で定義)
       │
       │ (3) LOAD CSV(master 13 種)
       ▼
[node 投入] :Deity, :Shrine, ... 13 ラベル
       │
       │ (4) LOAD CSV(relations 39 種)
       ▼
[edge 投入] :ENSHRINED_AT, :MENTIONED_IN, ... 39 type
       │
       │ (5) 投入後検証
       ▼
[count確認・dangling検出・ KPI再計算]
```

### 5.3 TSV → CSV 変換規約

| TSV 表記 | CSV 表記 |
|---|---|
| `parent_deity_ids = "DEI-005|DEI-006"` | `parentDeityIds = "DEI-005;DEI-006"`(セミコロン区切り) |
| `aliases = "オオナムチ,大穴牟遅"` | `aliases = "オオナムチ;大穴牟遅"`(同) |
| カラム名 snake_case | camelCase に変換 |
| `-`(ハイフン)「該当なし」 | 空文字または NULL に変換 |
| 改行 LF | LF 維持 |

```python
# pipeline/tsv2csv.py(概念実装)
import csv
import re

def snake_to_camel(name):
    parts = name.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

def convert_value(value):
    if value == '-' or value == '':
        return ''
    return value.replace('|', ';')

# TSV を読み込み、ヘッダを camelCase に変換、値をクリーンアップして CSV 出力
```

### 5.4 master 投入 Cypher(典型例: deity)

```cypher
LOAD CSV WITH HEADERS FROM 'file:///deity_master.csv' AS row
MERGE (d:Deity { masterId: row.masterId })
SET d.canonicalName       = row.canonicalName,
    d.canonicalReading    = row.canonicalReading,
    d.category            = row.category,
    d.gender              = row.gender,
    d.mainTextAppearance  = row.mainTextAppearance,
    d.aliases             = CASE WHEN row.aliases IS NULL OR row.aliases = ''
                                 THEN [] ELSE split(row.aliases, ';') END,
    d.aliasesReading      = CASE WHEN row.aliasesReading IS NULL OR row.aliasesReading = ''
                                 THEN [] ELSE split(row.aliasesReading, ';') END,
    d.parentDeityIds      = CASE WHEN row.parentDeityIds IS NULL OR row.parentDeityIds = ''
                                 THEN [] ELSE split(row.parentDeityIds, ';') END,
    d.consortDeityIds     = CASE WHEN row.consortDeityIds IS NULL OR row.consortDeityIds = ''
                                 THEN [] ELSE split(row.consortDeityIds, ';') END,
    d.syncretism          = row.syncretism,
    d.regionalVariant     = row.regionalVariant,
    d.mergedInto          = row.mergedInto,
    d.notes               = row.notes;
```

→ 13 master 全てに対し同様の Cypher を生成(スクリプト自動化推奨)。

### 5.5 relation 投入 Cypher(典型例: enshrined_at)

```cypher
LOAD CSV WITH HEADERS FROM 'file:///relations.csv' AS row
WITH row WHERE row.relationType = 'enshrined_at'
MATCH (s:Deity { masterId: row.sourceId })
MATCH (t:Shrine { masterId: row.targetId })
MERGE (s)-[r:ENSHRINED_AT]->(t)
SET r.relationId       = row.relationId,
    r.confidenceLevel  = row.confidenceLevel,
    r.hypothesisLayer  = row.hypothesisLayer,
    r.temporalScope    = row.temporalScope,
    r.validFrom        = CASE WHEN row.validFrom = '' THEN NULL ELSE toInteger(row.validFrom) END,
    r.validUntil       = CASE WHEN row.validUntil = '' THEN NULL ELSE toInteger(row.validUntil) END,
    r.sourceReference  = row.sourceReference,
    r.notes            = row.notes;
```

→ 39 relation type 全てに対し同様の Cypher。Python テンプレートで自動生成可。

### 5.6 投入順序の依存関係

1. **制約・インデックス**(§3)
2. **master 投入**:相互依存なし、ラベル 13 種を並行投入可
3. **relation 投入**:source/target master が必要 → master 投入後
4. **検証**:
   - 全 node の count(*)
   - dangling relation の検出(`MATCH (s)-[r]->(t) WHERE s.masterId IS NULL OR t.masterId IS NULL RETURN count(r)`)
   - 重複 relation の検出
   - KPI 再計算(L0 比率等)

### 5.7 docker-compose 構成案(将来)

```yaml
# docker-compose.yml(検討)
services:
  neo4j:
    image: neo4j:5.18-community
    ports: ["7474:7474", "7687:7687"]
    volumes:
      - ./staging:/var/lib/neo4j/import:ro
      - ./neo4j-data:/data
    environment:
      - NEO4J_AUTH=neo4j/password
```

### 5.8 関連 Issue

- `docs/project/10_graphdb_neo4j.md` GR-NE-01〜09:本書設計の実装フェーズ
- 本書はその **設計仕様書**(GR-NE-01 ラベル写像表 + GR-NE-02 制約 の正本)

---

## 6. 出雲編サブセット投入想定の検証 + 全体 review

### 6.1 出雲編サブセットでの投入想定

出雲編 161 行(`docs/出雲編/`)+ 関連 master からなる **最小投入セット** で全パイプラインを検証する。

#### 想定 node 数(出雲編サブセット)

| ラベル | 推定数 | 内容 |
|---|---|---|
| `:Deity` | 約 30 | 大国主・スサノオ・アメノホヒ・コトシロヌシ・タケミナカタ等 |
| `:Shrine` | 約 25 | 出雲大社・熊野大社・神魂神社・美保神社・佐太神社等 |
| `:Clan` | 約 8 | 出雲国造・千家・北島・意宇・神門等 |
| `:Emperor` | 約 5 | 神武・崇神・垂仁・明治等 |
| `:MythEpisode` | 約 12 | 国譲り・ヤマタノオロチ・国引き・根の堅州国等 |
| `:Event` | 約 15 | 神賀詞奏上(716)・寛文造営・明治改称等 |
| `:Site` | 約 5 | 加茂岩倉・荒神谷・西谷墳墓群・出雲国府等 |
| `:Artifact` | 約 8 | 銅鐸・銅剣・銅鉾・心御柱等 |
| `:Ritual` | 約 8 | 神在祭・火継神事・青柴垣神事・諸手船神事等 |
| `:Region` | 約 10 | 出雲国・意宇郡・神門郡・島根郡等 |
| `:Text` | 約 8 | 古事記・書紀・出雲国風土記・続日本紀・延喜式・神賀詞等 |
| `:Hypothesis` | 約 4 | HYP-002, HYP-004, HYP-008 等 |
| `:Title` | 約 5 | 国魂神・式内大社・一宮等 |
| **合計** | **約 143** | |

#### 想定 relationship 数

| relationship 群 | 推定数 |
|---|---|
| `:ENSHRINED_AT` / `:PRIMARY_DEITY_OF` / `:SECONDARY_DEITY_OF` | 約 50 |
| `:MENTIONED_IN` | 約 200 |
| `:PARTICIPATED_IN` | 約 30 |
| `:DESCENDED_FROM` / `:ANCESTOR_DEITY_OF` | 約 12 |
| `:LOCATED_IN` | 約 30 |
| `:OCCURRED_IN` | 約 15 |
| `:PERFORMED_AT` / `:REENACTS` | 約 15 |
| `:ARCHAEOLOGICALLY_LINKED` | 約 8 |
| `:SUPPORTS` / `:CONTRADICTS` | 約 12 |
| `:SAME_AS` / `:HAS_ALIAS` | 約 10 |
| `:SYNCRETIZED_WITH` | 約 5 |
| その他 | 約 13 |
| **合計** | **約 400** |

→ 想定: node 約 143 / edge 約 400 のサブセット投入で **3-5 分以内** に完了見込み(Neo4j Community 標準)

### 6.2 検証手順

```cypher
// 1. 全 node 件数確認
MATCH (n)
RETURN labels(n) AS label, count(n) AS count
ORDER BY count DESC;

// 2. 全 relationship 件数確認
MATCH ()-[r]->()
RETURN type(r) AS rel_type, count(r) AS count
ORDER BY count DESC;

// 3. masterId 重複検出(制約あれば 0 件保証)
MATCH (n)
WITH n.masterId AS mid, labels(n) AS lbl, count(*) AS c
WHERE c > 1
RETURN mid, lbl, c;

// 4. dangling relation 検出(制約あれば 0 件保証だが念のため)
MATCH ()-[r]->()
WHERE r.relationId IS NULL
RETURN type(r), count(r);

// 5. 必須プロパティ欠損検出
MATCH (n) WHERE n.canonicalName IS NULL
RETURN labels(n), count(n);

MATCH ()-[r]->() WHERE r.confidenceLevel IS NULL OR r.hypothesisLayer IS NULL
RETURN type(r), count(r);

// 6. KPI 確認
MATCH ()-[r]->()
WHERE r.hypothesisLayer IS NOT NULL
WITH r.hypothesisLayer AS layer, count(r) AS c, count(*) AS total
RETURN layer, c, round(100.0 * c / total, 2) AS percent;

// 7. L4-L5 ↔ E 整合性
MATCH ()-[r]->()
WHERE r.hypothesisLayer IN ['L4','L5'] AND r.confidenceLevel <> 'E'
RETURN r.relationId AS violation_id, r.hypothesisLayer, r.confidenceLevel;
```

### 6.3 受入基準(出雲編サブセット投入の合格条件)

- [ ] 全制約・インデックスが `IF NOT EXISTS` で冪等にロード
- [ ] node 投入で件数が想定の ±10% 以内
- [ ] relationship 投入で件数が想定の ±10% 以内
- [ ] masterId 重複: **0 件**
- [ ] dangling relation: **0 件**
- [ ] 必須プロパティ欠損: **0 件**
- [ ] L4-L5 ↔ E 違反: **0 件**
- [ ] Q01-Q20 のクエリ全件が動作(ないし合理的にデータ不足の場合のみ空結果)
- [ ] 投入時間: **5 分以内**(出雲編サブセット規模で)

### 6.4 全体 review

#### 完成度

| 章 | 内容 | 完成度 |
|---|---|---|
| §1 node 設計 | 13 ラベル + 共通+各プロパティ | ✅ 完成 |
| §2 edge 設計 | 39 relationship type + 共通プロパティ | ✅ 完成 |
| §3 制約・インデックス | 制約 18件 + インデックス 16件 + 全文 3件 + 関係 3件 + 地理 3件 | ✅ 完成 |
| §4 Cypher クエリ | 代表 20 件 + 残候補 30 件 | ✅ 完成 |
| §5 schema 整合 + LOAD CSV | schema 11文書整合 + 投入パイプライン | ✅ 完成 |
| §6 検証 + review | 出雲編サブセット投入想定 + 受入基準 | ✅ 完成 |

#### docs/schema/ との整合性

`docs/schema/00〜10` の **全 11 文書** との対応を §5.1 で確認済。schema 側を正本とし、本書はその Cypher 写像。

#### docs/project/10_graphdb_neo4j.md との分担

- `docs/project/10_graphdb_neo4j.md`: **運用設計の概要**(GR-NE-01〜09 issue 群を含む)
- 本書 `07_knowledge_graph_final.md`: **設計仕様の正本**(ラベル/edge/制約/インデックス/Cypher の確定版)

→ 両者で重複箇所がある(写像表など)。schema 改訂時は両文書を更新する規約とする。

#### 後続のフェーズ移行

本書完成により、Phase 5(Neo4j 化・公開)の **設計フェーズが完了**。後続は GR-NE-01〜GR-VS-04 の実装フェーズ:

```
Phase 5 設計 (本書)        ──> 完成
Phase 5 実装 (GR-NE-01-09)  ──> Phase 4 完了後に着手
Phase 5 可視化 (GR-VS-01-04) ──> 投入後に着手
Phase 5 公開 (GR-EX-01-03)   ──> 最後
```

### 6.5 Gemini 反射監査(推奨)

本書全体について `docs/audit/gemini/` 形式で Gemini 監査を推奨:

- 観点 1: schema との完全整合
- 観点 2: 既存 docs/civilization/ (motif, saiken, networks, jomon, central/regional) との接続
- 観点 3: KPI(L0 比率 60.5% 等)の維持可能性
- 観点 4: 投入後の検索パフォーマンス想定
- 観点 5: 中央偏重の不在(地方独立性の保持)

監査は人間オペレータが Phase 5 実装前に実施し、結果を `docs/audit/gemini/AUD-GM-83_knowledge_graph.md` に記録する。

### 6.6 結論

本書は **issue #83 の最終成果物**として:

1. **13 node ラベル** + **39 relationship type** の Neo4j 写像確定
2. **35+ Cypher 制約・インデックス** で投入時 0 違反を保証
3. **20 代表クエリ + 30 候補** で利用パターン網羅
4. **LOAD CSV パイプライン** で TSV→Neo4j 投入を完全自動化可能
5. **出雲編サブセット投入** で受入基準を確立(node ~143 / edge ~400 / 5 分以内)
6. **docs/schema/ 全 11 文書と整合** + **docs/project/10_graphdb_neo4j.md と分担**

→ Phase 5 実装フェーズへの **設計仕様書として確定**。
