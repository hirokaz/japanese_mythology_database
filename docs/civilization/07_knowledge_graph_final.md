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
