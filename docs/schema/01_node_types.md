# ノード種別定義

知識グラフを構成する全 node_type を定義する。各 node_type は **Layer B(マスター)** の独立 TSV に対応する。

## 1. node_type 一覧(13 種)

| ID | node_type | プレフィックス | マスターファイル | 主たる用途 |
|---|---|---|---|---|
| N01 | deity | DEI | `deity_master.tsv` | 神格 |
| N02 | shrine | SHR | `shrine_master.tsv` | 神社 |
| N03 | clan | CLN | `clan_master.tsv` | 豪族・氏族 |
| N04 | emperor | EMP | `emperor_master.tsv` | 皇族 |
| N05 | myth_episode | MYTH | `myth_episode_master.tsv` | 神話エピソード |
| N06 | event | EVT | `event_master.tsv` | 歴史事象 |
| N07 | archaeological_site | SITE | `site_master.tsv` | 考古遺跡 |
| N08 | artifact | ART | `artifact_master.tsv` | 考古資料・遺物 |
| N09 | ritual | RIT | `ritual_master.tsv` | 祭祀・神事 |
| N10 | region | REG | `region_master.tsv` | 地域(地理空間) |
| N11 | text | TXT | `text_master.tsv` | 文献 |
| N12 | hypothesis | HYP | `hypothesis_master.tsv` | 仮説 |
| N13 | title | TTL | `title_master.tsv` | 称号・神格カテゴリ |

---

## 2. 各 node_type の詳細

### N01. deity(神)

- **定義**: 神格として認識される存在(神話的・祭祀的・歴史的)。
- **用途**: 全ての祭神・神話登場神を一元管理。神仏習合は別エンティティの `syncretized_with` 関係で表現。
- **必須カラム**:
  - `master_id`、`canonical_name`、`canonical_reading`、`category`(太陽神/海神/地母神/王権神/穀霊/工神/武神 等)、`gender`、`main_text_appearance`
- **任意カラム**:
  - `aliases`、`aliases_reading`、`parent_deity_ids`、`consort_deity_ids`、`syncretism`、`regional_variant`、`related_shrine_ids`、`related_myth_ids`、`merged_into`、`notes`
- **関連可能 node_type**: deity(parent/consort/同体)、shrine(enshrined_at)、clan(ancestor)、myth_episode(登場)、ritual(主神)、title(神格カテゴリ)

### N02. shrine(神社)

- **定義**: 物理的に存在する祭祀施設。式内社・新興社問わず。
- **用途**: 改称・別称・社格変遷を統合。本社・摂社・末社は別レコードまたは `parent_shrine_id`。
- **必須カラム**:
  - `master_id`、`canonical_name`、`canonical_reading`、`prefecture`、`address`、`main_deity_ids`
- **任意カラム**:
  - `old_names`、`alternative_names`、`coordinates`、`secondary_deity_ids`、`related_clan_ids`、`shrine_rank_ancient`、`shrine_rank_modern`、`founding_legend`、`founding_year_estimated`、`parent_shrine_id`、`notes`
- **関連可能 node_type**: deity(祭神)、clan(関係氏族)、region(所在地)、ritual(行われる祭祀)、myth_episode(由緒の元)、shrine(本社/末社)

### N03. clan(豪族・氏族)

- **定義**: 氏(うじ)単位の血縁・擬制血縁集団。
- **用途**: 改姓・カバネ・分家を統合。氏族単位で祭祀・支配域を辿る。
- **必須カラム**:
  - `master_id`、`canonical_name`、`canonical_reading`、`clan_type`(中央豪族/地方豪族/祭祀氏族/技術氏族/渡来氏族)
- **任意カラム**:
  - `aliases`(改姓・カバネ)、`ancestor_deity_id`、`related_shrine_ids`、`related_region_ids`、`related_emperor_ids`、`peak_period`、`notes`
- **関連可能 node_type**: deity(祖神)、shrine(祭祀)、region(支配域)、emperor(婚姻・服属)、event(関与)

### N04. emperor(皇族)

- **定義**: 天皇および皇族(后・皇太子・皇女など)。神武〜歴代天皇。
- **用途**: 系譜・治世・関連神社・関連事件の集約。
- **必須カラム**:
  - `master_id`、`canonical_name`、`canonical_reading`、`reign_period`(該当時)、`generation`(神武から数えた代数)
- **任意カラム**:
  - `aliases`(諡号・諱)、`parent_emperor_id`、`spouse_ids`、`related_shrine_ids`、`related_clan_ids`、`historicity_level`(神武〜開化は神話時代扱い)、`notes`
- **関連可能 node_type**: emperor(系譜)、deity(祖神)、clan(婚姻・服属)、event(治世事件)、shrine(関与)

### N05. myth_episode(神話エピソード)

- **定義**: 神話の独立した一場面・物語単位(国譲り、ヤマタノオロチ退治、因幡白兎 等)。
- **用途**: 同一エピソードを複数文献(古事記・書紀・風土記)で異伝併記する基点。
- **必須カラム**:
  - `master_id`、`canonical_name`、`canonical_reading`、`mythic_time`(神代/神武即位前 等)、`primary_text_ids`(古事記・書紀・風土記など)
- **任意カラム**:
  - `aliases`、`participating_deity_ids`、`location_region_ids`、`variants`(各文献の差を構造化)、`notes`
- **関連可能 node_type**: deity(登場)、text(記載)、ritual(祭祀的再演)、myth_episode(連結)、hypothesis(歴史的読解)

### N06. event(歴史事象)

- **定義**: 史料的に記録された(または推定される)事件・出来事。
- **用途**: 神賀詞奏上、寛文造営、平成大遷宮 など。
- **必須カラム**:
  - `master_id`、`canonical_name`、`estimated_historical_time`(西暦範囲)、`document_written_time`(出典年)、`source_reliability`
- **任意カラム**:
  - `aliases`、`participating_clan_ids`、`participating_emperor_ids`、`location_region_ids`、`source_text_ids`、`notes`
- **関連可能 node_type**: clan、emperor、region、text(出典)、shrine、event(連鎖)

### N07. archaeological_site(考古遺跡)

- **定義**: 物理的な遺跡(住居遺構、墳墓、祭祀遺構)。
- **用途**: 加茂岩倉、荒神谷、西谷墳墓群、纒向 等。
- **必須カラム**:
  - `master_id`、`canonical_name`、`prefecture`、`coordinates`、`era`(縄文/弥生/古墳 等)
- **任意カラム**:
  - `aliases`、`discovery_year`、`primary_findings`、`related_artifact_ids`、`related_region_ids`、`cultural_context`、`notes`
- **関連可能 node_type**: artifact(出土品)、region、myth_episode(対応可能性)、hypothesis

### N08. artifact(考古資料・遺物)

- **定義**: 出土遺物・考古資料(銅鐸、銅剣、勾玉、鏡、土偶 等)。具体的な個体または類型。
- **用途**: 神話モチーフ(草薙剣)と物質遺物を結ぶ。
- **必須カラム**:
  - `master_id`、`canonical_name`、`type`(銅鐸/銅剣/銅矛/鏡/土偶 等)、`found_at_site_id`(該当時)
- **任意カラム**:
  - `aliases`、`era`、`material`、`current_location`、`designation`(国宝・重文 等)、`notes`
- **関連可能 node_type**: archaeological_site、myth_episode(神器対応)、deity(神宝)、hypothesis

### N09. ritual(祭祀・神事)

- **定義**: 定期的・儀礼的に行われる祭祀。
- **用途**: 神在祭、御柱祭、青柴垣神事、火継神事 等。
- **必須カラム**:
  - `master_id`、`canonical_name`、`host_shrine_id`、`schedule`(暦日 or 周期)
- **任意カラム**:
  - `aliases`、`participating_deity_ids`、`origin_myth_id`、`historical_origin`、`notes`
- **関連可能 node_type**: shrine、deity、myth_episode(由来)、clan(主催)

### N10. region(地域)

- **定義**: 地理空間としての地域(古代国・郡・現代行政区)。
- **用途**: 出雲国、意宇郡、信濃国諏訪郡 など。
- **必須カラム**:
  - `master_id`、`canonical_name`、`region_type`(国/郡/郷/現代県/現代市町村)、`era`(古代/中世/現代)
- **任意カラム**:
  - `aliases`、`parent_region_id`、`coordinates`(中心点)、`bounding_polygon`(将来 GIS 連携用)、`notes`
- **関連可能 node_type**: region(階層)、shrine、site、clan(支配)、event(発生地)

### N11. text(文献)

- **定義**: 一次史料・二次史料・社伝・先行研究などの文献単位。
- **用途**: 出典の正規化。`mentioned_in` 関係の target になる。
- **必須カラム**:
  - `master_id`、`canonical_name`、`document_written_time`(成立年)、`text_type`(正史/神話/風土記/社伝/系譜資料/中世神道/近世資料/近代研究/現代研究 等)
- **任意カラム**:
  - `author`、`era`、`language`、`existing_format`(写本/刊本/電子)、`notes`
- **関連可能 node_type**: 全ての node に `mentioned_in` で結合可能

### N12. hypothesis(仮説)

- **定義**: 史料的事実から派生する解釈・仮説。学術仮説・地方伝承・大胆仮説を含む。
- **用途**: 「銅鐸祭祀終焉=国譲り神話対応説」など。レイヤー(L0〜L5)で強度を区別。
- **必須カラム**:
  - `master_id`、`canonical_name`、`layer`(L0〜L5)、`proposer`(該当時)、`source_text_ids`(初出文献)
- **任意カラム**:
  - `aliases`、`evidence_pro`(支持する事実 ID 配列)、`evidence_con`(矛盾する事実 ID 配列)、`status`(現代の評価)、`notes`
- **関連可能 node_type**: 任意の node を support / contradict 関係で結ぶ

### N13. title(称号・神格カテゴリ)

- **定義**: 個別の神でなく、神格や祭祀的な分類カテゴリ。
- **用途**: 「国魂神」「一宮」「明神大社」「八百万神」など。神社・神に対するメタ属性として機能。
- **必須カラム**:
  - `master_id`、`canonical_name`、`title_type`(神格カテゴリ/社格/集合名詞)
- **任意カラム**:
  - `aliases`、`era`(成立期)、`notes`
- **関連可能 node_type**: deity、shrine(`has_title` で結合)

---

## 3. 出雲編との対応(検証)

出雲編 161 行で扱われたエンティティを各 node_type で網羅できるか確認:

| 出雲編で出現 | 該当 node_type |
|---|---|
| 大国主、スサノオ等 | deity |
| 出雲大社、熊野大社等 | shrine |
| 出雲国造、千家氏 | clan |
| 崇神天皇、明治天皇 | emperor |
| 国譲り、ヤマタノオロチ | myth_episode |
| 神賀詞奏上、寛文造営 | event |
| 加茂岩倉、荒神谷 | archaeological_site |
| 銅鐸、銅剣、心御柱 | artifact |
| 神在祭、御柱祭、青柴垣神事 | ritual |
| 出雲、意宇、諏訪 | region |
| 古事記、出雲国風土記、続日本紀 | text |
| 国譲り政治史仮説、製鉄民移動説 | hypothesis |
| 国魂神、一宮 | title |

→ 全 161 行の主要エンティティが分類可能。ノード設計は妥当。

## 4. 設計上の判断

### 4.1 `deity` と `title` を分けた理由

「大物主」は固有神格(deity)だが、「国魂神」は分類カテゴリ(title)。両者を混同すると検索とリンク構造が破綻する。`大国主 has_title 国魂神` のように分離。

### 4.2 `myth_episode` を独立 node にした理由

国譲り神話は古事記・書紀・神賀詞で記述差がある。各文献記述を別レコードにせず、**1 つの myth_episode に対し複数 text を `mentioned_in` で結ぶ** 構造により、異伝の対比が可能になる。

### 4.3 `hypothesis` を独立 node にした理由

仮説は「事実の主張」ではなく「解釈の主張」。事実 node とは別に管理し、`supports`/`contradicts` 関係で事実ノードと結ぶ。これにより、L0(史料整理)と L5(大胆仮説)を一切混同しない。

### 4.4 `region` の階層化

国 > 郡 > 郷 の親子関係は `parent_region_id` で表現。GIS 連携(将来)を意識し `coordinates`/`bounding_polygon` を任意項目に確保。
