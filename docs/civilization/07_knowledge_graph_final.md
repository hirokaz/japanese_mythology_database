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
