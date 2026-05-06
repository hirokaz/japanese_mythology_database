# 巨大 Knowledge Graph 全体スキーマ拡張(node 100+ / relation 300+)

本書は、`docs/schema/01_node_types.md`(13 node 種)と `docs/schema/02_relation_types.md`(35+ relation 種)を **正本として継承** しつつ、日本列島文明 OS 解析に必要な **node 100+ / relation 300+** へ拡張する設計を確定する。

> **正本** は `docs/schema/` 側であり、本書は **拡張提案 + 体系化**。schema 改訂時は両者を同期する規約とする(`docs/project/14_scaling.md` §10.1 参照)。

> 関連: `docs/civilization/07_knowledge_graph_final.md`(13 node × 39 relation の Neo4j 写像)、`docs/civilization/00_methodology.md`(祭祀OS論)、issue #122・#123(本書)。

## 0. 章立て

| 章 | 内容 | サブタスク |
|---|---|---|
| 1 | 既存 13 node 再確認 + 整合表 | S01(本 PR) |
| 2 | node 拡張 第1群: 神話文化層 30 種 | S02 |
| 3 | node 拡張 第2群: 祭祀ネットワーク層 30 種 | S03 |
| 4 | node 拡張 第3群: 政治・物的層 30 種 | S04 |
| 5 | relation 拡張 第1群: 神話派生 50 種 | S05 |
| 6 | relation 拡張 第2群: 祭祀権力 50 種 | S06 |
| 7 | relation 拡張 第3群: 政治・支配 50 種 | S07 |
| 8 | relation 拡張 第4群: 考古・物質 50 種 | S08 |
| 9 | relation 拡張 第5群: 時間・継承 50 種 | S09 |
| 10 | relation 拡張 第6群: 仮説・解釈 50 種 | S10 |
| 11 | relation strength / temporal / uncertainty 規程 | S11 |
| 12 | 全体整合性検証 + 統計表 | S12 |

→ S01-S12 完了で **node 13 + 90 = 103 種 / relation 39 + 300 = 339 種** を達成。

## 1. 既存 13 node 種 再確認(正本: `docs/schema/01_node_types.md`)

### 1.1 既存 13 node 種一覧

| ID | node_type | プレフィックス | Cypher ラベル | マスター TSV | 主たる用途 |
|---|---|---|---|---|---|
| N01 | deity | DEI | `:Deity` | `deity_master.tsv` | 神格 |
| N02 | shrine | SHR | `:Shrine` | `shrine_master.tsv` | 神社 |
| N03 | clan | CLN | `:Clan` | `clan_master.tsv` | 豪族・氏族 |
| N04 | emperor | EMP | `:Emperor` | `emperor_master.tsv` | 皇族 |
| N05 | myth_episode | MYTH | `:MythEpisode` | `myth_episode_master.tsv` | 神話エピソード |
| N06 | event | EVT | `:Event` | `event_master.tsv` | 歴史事象 |
| N07 | archaeological_site | SITE | `:Site` | `site_master.tsv` | 考古遺跡 |
| N08 | artifact | ART | `:Artifact` | `artifact_master.tsv` | 考古資料 |
| N09 | ritual | RIT | `:Ritual` | `ritual_master.tsv` | 祭祀 |
| N10 | region | REG | `:Region` | `region_master.tsv` | 地域 |
| N11 | text | TXT | `:Text` | `text_master.tsv` | 文献 |
| N12 | hypothesis | HYP | `:Hypothesis` | `hypothesis_master.tsv` | 仮説 |
| N13 | title | TTL | `:Title` | `title_master.tsv` | 称号・社格 |

→ **本書ではこれらを変更しない**。S02-S04 で追加 90 種を提案する。

### 1.2 既存 35+ relation 種(分類別グループ)

`docs/schema/02_relation_types.md` 準拠で、Cypher 写像は `docs/civilization/07_knowledge_graph_final.md` §2 にある。

| グループ | 既存件数 | 例 |
|---|---|---|
| 神社・祭祀関係 | 5 | enshrined_at / primary_deity_of / secondary_deity_of / has_subordinate_shrine / located_in |
| 系譜関係 | 6 | parent_of / child_of / sibling_of / married_to / descended_from / ancestor_deity_of |
| 神格・同体 | 5 | syncretized_with / same_as / has_alias / has_title / regional_variant_of |
| 政治・支配 | 6 | controlled_by / ruled / allied_with / opposed_to / served / renamed_to |
| 神話・出来事 | 4 | participated_in / occurred_in / triggered / variant_of |
| 文献・出典 | 3 | mentioned_in / primary_source_for / authored_by |
| 考古関係 | 3 | found_at / dated_to / archaeologically_linked |
| 祭祀関係 | 3 | performed_at / reenacts / performed_by |
| 仮説関係 | 3 | supports / contradicts / proposed_by |
| メタ関係 | 2 | merged_into / supersedes |
| **合計** | **40** | |

→ 本書ではこれらを **継承** し、S05-S10 で追加 300 種を提案する。

## 2. 拡張方針(全体)

### 2.1 拡張の動機

文明 OS 解析の以下を表現するため、既存 13 node × 40 relation では **粒度不足**:

1. **神話文化層**: motif / cosmology / sacred_object / sacred_tree / sacred_stone を独立 node 化
2. **祭祀ネットワーク層**: pilgrimage / festival / oracle / shrine_lineage / priest_role を独立 node 化
3. **政治・物的層**: battle / treaty / migration / seafaring_route / metal_workshop を独立 node 化
4. **時間軸の細分化**: 5 時間軸(`#124` で詳細)を relation で表現
5. **仮説の細分化**: 7 層(`#124` で詳細)を hypothesis 関連 relation で表現
6. **物質ネットワーク**: 海路・陸路・修験道・交易ルートの **path 化**

### 2.2 拡張時の絶対遵守事項

1. **既存 13 node は不変**(変更すると既存 master TSV / motif relations が破綻)
2. **既存 40 relation は不変**(同上)
3. **新規 node の master_id プレフィックス** は既存と衝突しない 3 文字以上
4. **新規 relation_type** は SCREAMING_SNAKE_CASE で Cypher 化
5. **必須プロパティ** に hypothesis_layer / confidence_level / source_reference を維持

### 2.3 拡張 node プレフィックス候補(予約)

| 候補 | プレフィックス | 用途 | 章 |
|---|---|---|---|
| motif | MTF | 神話モチーフ独立 node 化 | 2 |
| cosmology | CSM | 宇宙観・他界観 | 2 |
| sacred_object | SOB | 神宝・依代 | 2 |
| sacred_tree | STR | 神木 | 2 |
| sacred_stone | SST | 磐座・立石 | 2 |
| sacred_mountain | SMT | 神体山(独立) | 2 |
| sacred_water | SWT | 神聖な水(滝・井泉) | 2 |
| sacred_island | SIS | 神聖な島(沖ノ島・厳島) | 2 |
| pilgrimage | PIL | 巡礼路 | 3 |
| festival | FES | 祭礼(ritual との分離: 集合的祭事) | 3 |
| oracle | ORC | 託宣・占い | 3 |
| shrine_lineage | SLN | 神社系統(熊野系等) | 3 |
| priest_role | PRR | 神職役職(大祝・神長官等) | 3 |
| initiation | INT | 入門・成人儀礼 | 3 |
| battle | BTL | 戦・乱 | 4 |
| treaty | TRT | 盟約・条約 | 4 |
| migration | MGR | 移住・遷都 | 4 |
| seafaring_route | SFR | 海路 | 4 |
| trade_route | TRR | 陸上交易路 | 4 |
| metal_workshop | MWK | 製鉄遺跡(独立化) | 4 |
| sea_lane | SLN2 | (要検討、SLN との衝突回避) | 4 |

→ S02-S04 で 90 種に確定する。

### 2.4 拡張 relation 命名空間(予約 6 グループ × 50)

| グループ | 主題 | プレフィックス例 | 章 |
|---|---|---|---|
| G1 神話派生 | motif evolution / migration / syncretism | EVOLVED_FROM / MIGRATED_FROM / TRANSPLANTED_TO | 5 |
| G2 祭祀権力 | priest hierarchy / shrine network | DELEGATES_RITUAL_TO / SUBORDINATE_PRIEST / FESTIVAL_HOSTED_BY | 6 |
| G3 政治・支配 | battle / treaty / migration | FOUGHT_AGAINST / SIGNED_TREATY / MIGRATED_TO | 7 |
| G4 考古・物質 | site stratification / artifact context | STRATIFIED_ABOVE / CULTURAL_CONTEXT_OF / OBJECT_REPRESENTS | 8 |
| G5 時間・継承 | temporal precedence / cultural inheritance | PRECEDES / INHERITED_FROM / CONTEMPORARY_WITH | 9 |
| G6 仮説・解釈 | interpretation / falsification | INTERPRETS / FALSIFIES / ALTERNATIVE_TO | 10 |

→ S05-S10 で 300 種に確定する。

## 3. 既存スキーマとの整合表

### 3.1 既存 docs/schema/ 文書群との対応

| schema 文書 | 本書での扱い | 整合 |
|---|---|---|
| `00_id_scheme.md` | 既存 13 種 ID 体系を継承、新規 21 ラベル分のプレフィックスを §2.3 で予約 | ✅ |
| `01_node_types.md` | 13 node 不変、本書で 90+ 追加提案 | ✅(追加のみ) |
| `02_relation_types.md` | 40 relation 不変、本書で 300+ 追加提案 | ✅(追加のみ) |
| `03_deity_master_design.md` | 不変 | ✅ |
| `04_shrine_master_design.md` | 不変 | ✅ |
| `05_clan_master_design.md` | 不変 | ✅ |
| `06_time_axes.md` | `#124` で 5 軸へ拡張 | 連携 |
| `07_source_reliability.md` | A〜E を継承 | ✅ |
| `08_hypothesis_layer.md` | L0-L5 を継承、L5 超 を `#124` で扱う | 連携 |
| `09_relation_db.md` | 必須カラム継承、新規拡張時の追加カラムを §2.4 で予約 | ✅ |
| `10_future_architectures.md` | 本書および `#125` で具体化 | 連携 |

### 3.2 既存 motif_db / 02_motif_relations.tsv との整合

- `docs/civilization/01_motif_db.tsv`(245 motif): 本書で MTF プレフィックスを予約するが、当面は `MOTIF-NNN` を継続(後方互換)
- `docs/civilization/02_motif_relations.tsv`(620 relation): 本書 §5-§10 の新 relation を **追加** で拡張、既存は不変

### 3.3 既存 Cypher 写像(`07_knowledge_graph_final.md`)との整合

- 13 ラベル × 39 relationship type の写像は **正本のまま**
- `#125` で 100+ ラベル × 339+ relationship type の **拡張版** を別文書で作成

## 4. S02 以降の進行ガイド

### 4.1 各 PR の作業内容(雛形)

S02-S04(node 拡張)では各 PR で以下を含める:
- 章追加(本ファイルへ章 2/3/4 を追記)
- 30 node × 必須カラム(node_type / プレフィックス / Cypher ラベル / マスター TSV 候補 / 必須プロパティ / 任意プロパティ / 関連可能 node_type / 用途 / 既存との重複チェック)
- 既存 13 node との衝突がないことの宣言

S05-S10(relation 拡張)では各 PR で以下:
- 章追加(本ファイルへ章 5-10 を追記)
- 50 relation × 必須情報(relation_type / Cypher 写像 / source ラベル / target ラベル / directed / 意味 / 主要利用シナリオ / 既存との重複チェック)
- 既存 40 relation との衝突なし

### 4.2 各 PR の受入条件

- [ ] 該当章の追加のみ(他章の改変なし)
- [ ] 既存 13 node / 40 relation を **書き換えない**
- [ ] プレフィックス / 名称の重複検査(本書 §2.3-2.4 表 + grep `docs/schema/`)
- [ ] 必須カラム充足
- [ ] 出典(参照する schema/civilization/regional 文書)記載

### 4.3 並行可能性

- S02 / S03 / S04(node 拡張)は **本ファイルへの追記なので順次必須**
- S05-S10(relation 拡張)も同様
- 並行したい場合は relation_type 一覧を別 TSV(`docs/civilization/08_relation_extended.tsv` 等)に分離して merge する案を `#125` で検討

## 5. 進捗管理

### 5.1 進捗表(本書末尾で随時更新)

| サブタスク | 状態 | PR | 累計 node | 累計 relation |
|---|---|---|---|---|
| S01 章立て・整合表 | ✅(本 PR) | (Open) | 13 | 40 |
| S02 node 拡張 第1群 | 未着手 | - | 13 → 43 | 40 |
| S03 node 拡張 第2群 | 未着手 | - | 43 → 73 | 40 |
| S04 node 拡張 第3群 | 未着手 | - | 73 → 103 | 40 |
| S05 relation 拡張 第1群 | 未着手 | - | 103 | 40 → 90 |
| S06 relation 拡張 第2群 | 未着手 | - | 103 | 90 → 140 |
| S07 relation 拡張 第3群 | 未着手 | - | 103 | 140 → 190 |
| S08 relation 拡張 第4群 | 未着手 | - | 103 | 190 → 240 |
| S09 relation 拡張 第5群 | 未着手 | - | 103 | 240 → 290 |
| S10 relation 拡張 第6群 | 未着手 | - | 103 | 290 → 340 |
| S11 strength/temporal/uncertainty | 未着手 | - | 103 | 340 |
| S12 全体整合性 | 未着手 | - | 103 | 340 |

### 5.2 完了時の達成値

- node 種類: 103(13 既存 + 90 新規)
- relation 種類: 340(40 既存 + 300 新規)
- 既存 schema/civilization/master との整合: ✅
- `#125` Neo4j 拡張への引き継ぎ: 準備完了

## 6. 結論(S01 段階)

1. **既存 13 node × 40 relation を不変** とし、本書は **拡張提案** に徹する
2. S02-S04 で 90 node、S05-S10 で 300 relation、S11-S12 で品質確保
3. 各 PR は本ファイルへの **章追加** のみ(diff レビュー容易)
4. プレフィックス / 名称の **衝突回避** を §2.3-2.4 で先行予約
5. 既存 schema/civilization/Cypher 写像は **完全継承**
6. `#124`(時間構造・仮説層)、`#125`(Neo4j 拡張)と連携

---

## 7. node 拡張 第1群: 神話文化層 30 種(S02)

神話・モチーフ・宇宙観・聖物・聖地などを **独立 node 化** し、relation 経由で記述する層。

### 7.1 一覧表(30 種)

| # | node_type | プレフィックス | Cypher ラベル | 用途 |
|---|---|---|---|---|
| N14 | motif_abstract | MTF | `:MotifAbstract` | 抽象モチーフ(蛇神/太陽神型 等)。既存 MOTIF-NNN を独立 node 化 |
| N15 | mythic_episode_variant | MEV | `:MythVariant` | 神話エピソード異伝(古事記版/書紀版/風土記版 を別 node 化) |
| N16 | cosmology | CSM | `:Cosmology` | 宇宙観・他界観モデル(高天原/中津国/根の堅州/常世) |
| N17 | sacred_object | SOB | `:SacredObject` | 神宝・依代(草薙剣/八咫鏡/勾玉/七支刀 等) |
| N18 | sacred_tree | STR | `:SacredTree` | 神木(諏訪御柱原木/伊勢御杖代 等) |
| N19 | sacred_stone | SST | `:SacredStone` | 磐座・立石(三輪山磐座/那智の滝磐 等) |
| N20 | sacred_mountain | SMT | `:SacredMountain` | 神体山(三輪山/富士/出羽三山 等)— region/site と区別 |
| N21 | sacred_water | SWT | `:SacredWater` | 神聖な水(那智の滝/玉造温泉/井泉) |
| N22 | sacred_island | SIS | `:SacredIsland` | 神聖な島(沖ノ島/厳島/竹生島/江ノ島) |
| N23 | sacred_grove | SGV | `:SacredGrove` | 鎮守の杜(神社境内森) |
| N24 | sacred_cave | SCV | `:SacredCave` | 神聖な洞窟(天岩戸/伊勢神宮元宮 等) |
| N25 | sacred_fire | SFR2 | `:SacredFire` | 神聖な火(火継神事/大嘗祭斎火 等) |
| N26 | divine_marriage | DMG | `:DivineMarriage` | 神婚事象(三輪山型/海宮婚 等) |
| N27 | divine_birth | DBR | `:DivineBirth` | 神の誕生事象(誓約/禊/桃から) |
| N28 | divine_death | DDT | `:DivineDeath` | 神の死(イザナミ黄泉/ヤマトタケル) |
| N29 | divine_descent | DDS | `:DivineDescent` | 降臨(天孫降臨/神功皇后顕現) |
| N30 | divine_quest | DQS | `:DivineQuest` | 異界訪問(海宮訪問/根の堅州訪問) |
| N31 | divine_battle | DBT | `:DivineBattle` | 神戦(国譲り/神武東征/タケミカヅチ派遣) |
| N32 | divine_transformation | DTR | `:DivineTransformation` | 変身(オオモノヌシ蛇身/コノハナ火中出産) |
| N33 | divine_punishment | DPN | `:DivinePunishment` | 神罰(スサノオ追放/オロチ祟り) |
| N34 | divine_purification | DPF | `:DivinePurification` | 禊・祓 |
| N35 | curse | CRS | `:Curse` | 呪詛・祟り(大物主祟り/早良親王怨霊) |
| N36 | omen | OMN | `:Omen` | 兆し・予兆(諏訪御渡/月読託宣) |
| N37 | folk_motif | FMT | `:FolkMotif` | 民俗モチーフ(蛇婿入り/三人姉妹型) |
| N38 | comparative_motif | CMT | `:ComparativeMotif` | 比較神話モチーフ(オルフェウス型/洪水型) |
| N39 | symbol | SYM | `:Symbol` | 象徴(三本足烏/勾玉形/三巴) |
| N40 | mythic_creature | MCR | `:MythicCreature` | 神獣・妖怪(八咫烏/狛犬/河童/天狗) |
| N41 | mythic_food | MFD | `:MythicFood` | 神饌・神聖な食物(海幸山幸の獲物/桃) |
| N42 | mythic_weapon | MWP | `:MythicWeapon` | 神器武器(草薙剣/天叢雲剣/布都御魂) |
| N43 | mythic_garment | MGR2 | `:MythicGarment` | 神衣・装束(鳥装束/蓑笠) |

→ **N14-N43 で 30 種**(累計 13 + 30 = 43 種)

### 7.2 主要 node の必須プロパティ詳細

#### N14. motif_abstract(MTF — `:MotifAbstract`)

- **必須**: `master_id`(MTF-NNN)、`canonical_name`、`category`(王権神話/蛇神龍神/海洋海神 等の既存 motif_db カテゴリ継承)、`mythology_layer`(L0-L5)
- **任意**: `description`、`related_motif_ids`(List)、`source_reference`
- **既存との関係**: 既存 `MOTIF-001 〜 MOTIF-245` をそのまま `master_id` として継承可能(後方互換)
- **関連可能 node**: deity / shrine / region / clan / archaeological_site / hypothesis(対応 motif として)
- **代表 relation**: motif → deity(`:EMBODIED_BY`)、motif → motif(`:EVOLVED_FROM`、既存 MR-EV-* と整合)

#### N15. mythic_episode_variant(MEV — `:MythVariant`)

- **必須**: `master_id`、`canonical_name`、`parent_episode_id`(MYTH master_id への参照)、`source_text_id`(TXT master_id)
- **任意**: `variant_type`(主要本文/一書/異伝/民間口承)、`differs_from_parent`(差異記述)
- **設計判断**: 既存 `:MythEpisode` は神話エピソードの **抽象** を保持。本 node は各文献での **異伝** を独立化することで、古事記版/書紀第一段一書/書紀第七段六種 等の **対比** が可能になる
- **関連可能 node**: myth_episode(parent)、text(source)、deity(participating)

#### N16. cosmology(CSM — `:Cosmology`)

- **必須**: `master_id`、`canonical_name`、`cosmology_type`(垂直三層/海洋他界/山岳他界/中世神道宇宙論)
- **任意**: `layers`(高天原/葦原中津国/根の堅州 等のリスト)
- **代表事例**: 古事記宇宙観、出雲宇宙観(根の国中心)、補陀落浄土観、両部神道宇宙論、平田篤胤幽冥論

#### N17. sacred_object(SOB — `:SacredObject`)

- **必須**: `master_id`、`canonical_name`、`object_type`(剣/鏡/玉/鉾/楯)
- **任意**: `physical_existence`(現存/伝承のみ/失われた)、`current_location`(神社 master_id)、`material`、`discovery_year`
- **既存 artifact との分離**: artifact は **考古資料**(出土品)、sacred_object は **祭祀的に神聖視される物**。重複する場合は両 node を持ち、`syncretized_with` で結ぶ
- **代表事例**: 草薙剣(熱田)、八咫鏡(伊勢)、八尺瓊勾玉(皇都)、布都御魂(石上)、七支刀(石上、artifact でもある)

#### N18-N25. sacred_tree / stone / mountain / water / island / grove / cave / fire

- 共通必須: `master_id`、`canonical_name`、`region_id`(REG への参照)
- 山岳 (`SMT`)、島 (`SIS`) は既存 region/shrine と重複しうるが、**祭祀対象としての独立 node** を確保(物理的同一視は relation で表現)

#### N26-N34. divine_* 系(神事象 9 種)

- 共通必須: `master_id`、`canonical_name`、`participating_deity_ids`(List)、`location_region_id`、`source_text_ids`(List)
- 任意: `mythic_time`、`historicity_level`、`mythology_layer`
- 設計判断: 既存 `:MythEpisode` は **物語単位**(国譲り全体)、divine_* は **事象単位**(タケミカヅチ派遣 / コトシロヌシ服従 / タケミナカタ敗走 等)。物語 → 事象群で zoom in できる構造

#### N35. curse(CRS — `:Curse`)

- 既存 motif `MOTIF-127 祟り神` / `MOTIF-128 大物主祟り` / `MOTIF-121 御霊信仰` を独立 node 化
- 必須: `master_id`、`canonical_name`、`cursed_target`(任意 node)、`curse_source`(任意 node)、`historical_period`

#### N36. omen(OMN — `:Omen`)

- 諏訪御渡、彗星出現、地震 等の前兆現象
- 必須: `master_id`、`canonical_name`、`omen_type`(自然現象/夢告/託宣)、`occurred_at_region_id`

#### N37-N38. folk_motif / comparative_motif

- folk_motif: 民俗学的モチーフ(柳田・折口・南方の体系)
- comparative_motif: 比較神話学的モチーフ(オルフェウス型/洪水型/英雄旅型)
- 設計判断: motif_abstract と区別する理由は **学問領域別の出典・確度**(folk は地方伝承中心、comparative は世界神話との対比)

#### N39. symbol(SYM — `:Symbol`)

- 三本足烏、三巴紋、神紋、八咫鏡形象
- 必須: `master_id`、`canonical_name`、`symbol_type`(紋章/形象/数)、`representation_of`(任意 node、抽象/具体)

#### N40-N43. mythic_creature / food / weapon / garment

- creature: 八咫烏、河童、天狗、狛犬、麒麟、鳳凰
- food: 桃、海幸山幸の獲物、神饌米、神酒
- weapon: 既存神宝(剣・鉾)とは独立化(伝承上の武器全て)
- garment: 鳥装束、蓑笠、冠、装束

### 7.3 既存 13 node との重複チェック

| 拡張 node | 重複の可能性 | 解決 |
|---|---|---|
| N14 motif_abstract | 既存 motif_db (245) と概念重複 | master_id を継承(MOTIF-NNN そのまま MTF として運用)。後方互換 |
| N15 mythic_episode_variant | `:MythEpisode.variants`(プロパティ)と部分重複 | プロパティから node に **昇格**。既存 myth_episode はそのまま、variants 詳細を子 node 化 |
| N17 sacred_object | `:Artifact` と部分重複 | 考古資料 vs 祭祀対象物として **分離**。同一物は両 node + relation |
| N20 sacred_mountain | `:Region` / `:Shrine`(神体山祭祀社)と重複 | 祭祀対象としての山を独立 node。地理的山は region 側 |
| N22 sacred_island | `:Region` / `:Shrine` と重複 | 同上 |

### 7.4 主要追加 relation の予告(S05-S10 で詳細)

- `:EMBODIED_BY` (motif_abstract → deity) 
- `:VARIANT_OF_EPISODE` (mythic_episode_variant → myth_episode)
- `:RECORDED_IN_TEXT` (mythic_episode_variant → text)
- `:HOUSED_AT` (sacred_object → shrine)
- `:WORSHIPPED_AT` (sacred_mountain/island/water → shrine)
- `:CURSE_TARGETS` (curse → 任意 node)
- `:OMEN_PRECEDES` (omen → event/myth_episode)
- `:SYMBOLIZES` (symbol → 任意 node)

### 7.5 進捗更新

| サブタスク | 状態 | 累計 node | 累計 relation |
|---|---|---|---|
| S01 章立て・整合表 | ✅ | 13 | 40 |
| **S02 node 拡張 第1群(神話文化層)** | **✅(本 PR)** | **43** | 40 |
| S03 node 拡張 第2群(祭祀ネットワーク層) | 未着手 | 43 → 73 | 40 |
| S04 node 拡張 第3群(政治・物的層) | 未着手 | 73 → 103 | 40 |

---

## 8. node 拡張 第2群: 祭祀ネットワーク層 30 種(S03)

祭祀の **集合的・組織的・ネットワーク的** 側面を独立 node 化する層。既存 `:Ritual` は **個別祭祀** を保持し、本層は **巡礼路 / 祭礼 / 託宣 / 神社系統 / 神職役職 / 入門儀礼 / 講** を独立化する。

### 8.1 一覧表(30 種)

| # | node_type | プレフィックス | Cypher ラベル | 用途 |
|---|---|---|---|---|
| N44 | pilgrimage | PIL | `:Pilgrimage` | 巡礼路(熊野古道/伊勢参宮/西国三十三所) |
| N45 | pilgrimage_station | PLS | `:PilgrimageStation` | 巡礼路の駅(王子社/札所/番所) |
| N46 | festival | FES | `:Festival` | 大規模祭礼(神在祭/葵祭/祇園祭/御柱祭) |
| N47 | matsuri_pattern | MPT | `:MatsuriPattern` | 祭の類型(渡御祭/湯立祭/お練り) |
| N48 | oracle | ORC | `:Oracle` | 託宣事象(宇佐託宣/諏訪御渡託宣/出雲神在月) |
| N49 | divination | DVN | `:Divination` | 占い(亀卜/太占/鹿卜/夢占) |
| N50 | shrine_lineage | SLN | `:ShrineLineage` | 神社系統(熊野系/八幡系/春日系/稲荷系/天満宮系) |
| N51 | shrine_network | SNW | `:ShrineNetwork` | 神社ネットワーク(東国三社/出雲三社/伊勢別宮) |
| N52 | priest_role | PRR | `:PriestRole` | 神職役職(大祝/神長官/宮司/禰宜/権禰宜) |
| N53 | priest_lineage | PRL | `:PriestLineage` | 神職家系(度会家/荒木田家/守矢家/千家家/北島家) |
| N54 | initiation | INT | `:Initiation` | 入門・成人儀礼(物忌の元服/ノロ就任/聞得大君即位) |
| N55 | shamanic_role | SHR2 | `:ShamanicRole` | 巫女・シャーマン役割(斎宮/聞得大君/ノロ/ユタ/イタコ) |
| N56 | religious_school | RSK | `:ReligiousSchool` | 神道流派(吉田神道/伊勢神道/復古神道/教派神道) |
| N57 | shugenja_school | SGS | `:ShugenjaSchool` | 修験道派(本山派/当山派/羽黒派/英彦山派) |
| N58 | ritual_calendar | RCL | `:RitualCalendar` | 祭祀暦(節句/二十四節気/六輝) |
| N59 | ritual_object_class | ROC | `:RitualObjectClass` | 祭具類(玉串/榊/注連縄/幣帛/三方) |
| N60 | offering | OFR | `:Offering` | 神饌・奉納(初穂/酒/米/魚/絹) |
| N61 | sacrifice | SCR | `:Sacrifice` | 供犠(動物供犠/人身御供伝/即身仏) |
| N62 | taboo | TBO | `:Taboo` | 禁忌(物忌/血穢/死穢/女人禁制) |
| N63 | purification_method | PFM | `:PurificationMethod` | 禊・祓の方法(水垢離/塩/塩湯/火渡り) |
| N64 | sacred_dance | SDC | `:SacredDance` | 神楽・舞(岩戸神楽/巫女舞/獅子舞/田楽) |
| N65 | sacred_music | SMS | `:SacredMusic` | 雅楽・神事音楽(雅楽/篳篥/太鼓/鈴) |
| N66 | sacred_text_genre | STG | `:SacredTextGenre` | 祝詞・祭文類型(中臣祓/大祓詞/神賀詞) |
| N67 | shrine_architecture | SAR | `:ShrineArchitecture` | 社殿様式(神明造/大社造/春日造/流造) |
| N68 | sacred_garden | SGD | `:SacredGarden` | 神苑(伊勢神苑/出雲神苑) |
| N69 | torii_class | TRI | `:ToriiClass` | 鳥居様式(神明/明神/三輪/両部) |
| N70 | shimenawa_class | SMW | `:ShimenawaClass` | 注連縄様式(出雲式/伊勢式/大根締) |
| N71 | divine_servant | DSV | `:DivineServant` | 神使(春日鹿/熊野八咫烏/稲荷狐/天満宮牛) |
| N72 | confraternity | CFR | `:Confraternity` | 講(伊勢講/富士講/御嶽講/大師講) |
| N73 | pilgrimage_circuit | PCC | `:PilgrimageCircuit` | 巡礼霊場群(西国33観音/坂東33/四国88) |

→ **N44-N73 で 30 種**(累計 43 + 30 = 73 種)

### 8.2 既存 node との重複・分離規程

| 拡張 node | 重複の可能性 | 解決 |
|---|---|---|
| N46 festival | `:Ritual` と概念重複 | ritual = **個別祭祀の単位**(神嘗祭, 御柱祭 1 件)、festival = **大規模・集合祭礼イベント**(神在月全体)。重複時は両 node + `:RITUAL_PART_OF_FESTIVAL` |
| N48 oracle | `:Event` と部分重複 | event は政治・歴史事象、oracle は宗教託宣事象。重複時は両 node |
| N50 shrine_lineage | `:Title`(社格)と異なる | title=社格カテゴリ、shrine_lineage=系統(本社→末社の祭祀系譜) |
| N52 priest_role | `:Title` と部分重複 | title は神格カテゴリ・社格、priest_role は人事役職。役職継承を `:HOLDS_ROLE` で記述 |
| N53 priest_lineage | `:Clan` と部分重複 | clan = 政治氏族全体、priest_lineage = 神職継承家(社家)。一致しない場合あり(度会家は地方氏族の中の神職家) |
| N56 religious_school | `:Hypothesis` / `:Text` と異なる | school=思想流派(度会神道は「学派」)。代表 text を持つ |
| N57 shugenja_school | religious_school のサブ | religious_school の特殊化として並立 |
| N67 shrine_architecture | `:Shrine.notes` で記述可 | 様式が文化財として独立認識される場合に node 化(類型化対象) |

### 8.3 主要 node の必須プロパティ詳細

#### N44. pilgrimage(PIL — `:Pilgrimage`)

- **必須**: `master_id`、`canonical_name`、`route_type`(参詣/巡礼/廻国)、`primary_period`、`primary_text_ids`
- **任意**: `start_region_id`、`end_region_id`、`distance_km`、`unesco_status`、`station_count`
- **代表事例**: 熊野古道(中辺路/小辺路/大辺路/伊勢路/紀伊路)、伊勢参宮道、西国三十三所、坂東三十三観音、四国八十八ヶ所、出羽三山参詣、白山参詣

#### N45. pilgrimage_station(PLS — `:PilgrimageStation`)

- **必須**: `master_id`、`canonical_name`、`pilgrimage_id`(PIL master_id)、`shrine_or_temple_id`(SHR or 寺院 master_id)、`station_number`
- **任意**: `coordinates`、`mythic_attribution`、`legend_summary`
- **代表事例**: 熊野九十九王子(藤代王子/切目王子 等)、西国札所(青岸渡寺/紀三井寺 等)

#### N46. festival(FES — `:Festival`)

- **必須**: `master_id`、`canonical_name`、`host_shrine_ids`(List)、`schedule`(暦日 / 周期)、`scale`(全国/地方/集落)
- **任意**: `participating_clan_ids`、`origin_myth_id`、`historical_origin_period`、`current_status`
- **既存 ritual との関係**: festival は **集合的・大規模・神社横断**(神在祭は出雲三社で同時)、ritual は **単一神社の個別祭祀** という分担
- **代表事例**: 神在祭(出雲)、葵祭(賀茂)、祇園祭(八坂)、御柱祭(諏訪四宮)、神田祭、天神祭、ねぶた祭、那智の火祭

#### N48. oracle(ORC — `:Oracle`)

- **必須**: `master_id`、`canonical_name`、`oracle_giver_deity_id`(DEI)、`oracle_recipient_id`(EMP/CLN/任意)、`occurred_at_year`
- **任意**: `oracle_content`、`historical_consequence`、`source_text_ids`
- **代表事例**: 宇佐託宣(道鏡事件、769)、八幡神東大寺顕現(749)、諏訪御渡託宣(年占)、出雲神在月集合

#### N49. divination(DVN — `:Divination`)

- 占い手法を独立 node 化
- 代表事例: 亀卜(中臣)、太占(忌部)、鹿卜(諏訪御頭祭)、夢占、卜部の占い

#### N50. shrine_lineage(SLN — `:ShrineLineage`)

- **必須**: `master_id`、`canonical_name`、`origin_shrine_id`、`lineage_type`(本社→末社/分祀)
- **代表事例**: 熊野系(熊野権現分祀)、八幡系(宇佐→石清水→鶴岡)、春日系、稲荷系、天満宮系、諏訪系、白山系、富士浅間系、出雲系

#### N52-N53. priest_role / priest_lineage

- 役職: 大祝 / 神長官 / 宮司 / 禰宜 / 権禰宜 / 国造神職 / 物忌 / 斎宮 / 童女
- 系統: 度会家 / 荒木田家 / 守矢家 / 千家家 / 北島家 / 阿蘇家 / 卜部家 / 麻続部

#### N55. shamanic_role(SHR2 — `:ShamanicRole`)

- 巫女・シャーマン役割の類型化(役職の本人とは別)
- 代表事例: 斎宮、ノロ、ユタ、イタコ、巫女(中世以降)、聞得大君、童女

#### N56. religious_school(RSK — `:ReligiousSchool`)

- 神道流派・思想体系
- 代表事例: 吉田神道(卜部兼俱)、伊勢神道(度会神道)、復古神道(本居宣長/平田篤胤)、垂加神道(山崎闇斎)、両部神道(真言密教習合)、山王神道(天台習合)、教派神道13派(明治)

#### N57. shugenja_school(SGS — `:ShugenjaSchool`)

- 修験道派
- 代表事例: 本山派(聖護院、天台系)、当山派(三宝院、真言系)、羽黒派(出羽)、英彦山派(豊前)、京都修験(愛宕/鞍馬)

#### N62. taboo(TBO — `:Taboo`)

- 禁忌の独立 node 化(地域/神社/事象別)
- 代表事例: 物忌(伊勢)、血穢、死穢、女人禁制(高野山/大峰山/立山/沖ノ島)、産穢、火気の禁忌

#### N67. shrine_architecture(SAR — `:ShrineArchitecture`)

- 社殿様式
- 代表事例: 神明造(伊勢)、大社造(出雲)、春日造、流造、八幡造、住吉造、日吉造、権現造

#### N72. confraternity(CFR — `:Confraternity`)

- 講(信仰共同体)の独立 node 化
- 代表事例: 伊勢講、富士講、御嶽講、大師講、念仏講、地蔵講、弁天講、稲荷講、観音講

#### N73. pilgrimage_circuit(PCC — `:PilgrimageCircuit`)

- 巡礼霊場群(複数寺社をめぐる体系的巡礼)
- pilgrimage(PIL) との違い: PIL は **路**、PCC は **霊場群**(順序付き札所体系)
- 代表事例: 西国33観音、坂東33観音、秩父34観音、四国88、新四国八十八、伊予46

### 8.4 主要追加 relation の予告(S05-S10 で詳細)

- `:STATION_ON_PILGRIMAGE` (pilgrimage_station → pilgrimage)
- `:RITUAL_PART_OF_FESTIVAL` (ritual → festival)
- `:HOSTED_BY_SHRINE` (festival → shrine)
- `:ORACLE_GIVEN_BY` (oracle → deity)
- `:ORACLE_RECEIVED_BY` (oracle → emperor/clan/任意)
- `:USES_DIVINATION` (ritual → divination)
- `:LINEAGE_PARENT_OF` (shrine_lineage → shrine_lineage)
- `:HOLDS_ROLE` (clan → priest_role)
- `:ROLE_AT` (priest_role → shrine)
- `:LINEAGE_OF_ROLE` (priest_lineage → priest_role)
- `:SCHOOL_OF_THOUGHT_OF` (clan/emperor → religious_school)
- `:SHUGENJA_SCHOOL_OF` (priest_lineage → shugenja_school)
- `:HAS_ARCHITECTURE` (shrine → shrine_architecture)
- `:DIVINE_SERVANT_OF` (divine_servant → deity)
- `:DIVINE_SERVANT_AT` (divine_servant → shrine)
- `:CONFRATERNITY_DEVOTED_TO` (confraternity → deity/shrine/sacred_mountain)
- `:CIRCUIT_INCLUDES` (pilgrimage_circuit → shrine/pilgrimage_station)

### 8.5 進捗更新

| サブタスク | 状態 | 累計 node | 累計 relation |
|---|---|---|---|
| S01 章立て・整合表 | ✅ | 13 | 40 |
| S02 node 拡張 第1群(神話文化層) | ✅ | 43 | 40 |
| **S03 node 拡張 第2群(祭祀ネットワーク層)** | **✅(本 PR)** | **73** | 40 |
| S04 node 拡張 第3群(政治・物的層) | 未着手 | 73 → 103 | 40 |

---

## 9. node 拡張 第3群: 政治・物的層 30 種(S04)

政治史・経済史・物的ネットワークの **構造的事象** を独立 node 化する層。既存 `:Event` は **個別事件** を保持し、本層は **戦・盟約・移住・海路・陸路・工房・要害・交易品・政体** 等を独立化する。

### 9.1 一覧表(30 種)

| # | node_type | プレフィックス | Cypher ラベル | 用途 |
|---|---|---|---|---|
| N74 | battle | BTL | `:Battle` | 戦・乱(壬申の乱/丁未の乱/承平天慶の乱/元寇) |
| N75 | rebellion | RBL | `:Rebellion` | 反乱(将門の乱/田村麻呂征討/磐井の乱) |
| N76 | treaty | TRT | `:Treaty` | 盟約・条約(磐余の三輪盟約/出雲国造神賀詞奏上の儀礼条約) |
| N77 | political_alliance | PAL | `:PoliticalAlliance` | 政治同盟(大和×物部/大和×蘇我/大和×藤原) |
| N78 | migration | MGR | `:Migration` | 移住・遷都(神武東征/桓武遷都/応神朝渡来) |
| N79 | colonization | CLN2 | `:Colonization` | 開拓・開発(屯倉/国府/開発領主) |
| N80 | seafaring_route | SFR | `:SeafaringRoute` | 海路(玄界灘海北道/瀬戸内/日本海/太平洋) |
| N81 | trade_route | TRR | `:TradeRoute` | 陸上交易路(東山道/北陸道/海道/古道/塩の道) |
| N82 | metal_workshop | MWK | `:MetalWorkshop` | 製鉄・鍛冶遺跡(独立化:奥出雲たたら/吉備製鉄/筑紫遺跡) |
| N83 | metal_object_class | MOC | `:MetalObjectClass` | 金属遺物類型(銅鐸/銅剣/銅鉾/鉄剣/鉄鏃/銅鏡) |
| N84 | political_capital | PCP | `:PoliticalCapital` | 政治拠点(纒向/飛鳥/平城京/平安京) |
| N85 | regional_office | ROF | `:RegionalOffice` | 国府・郡衙(国府/評/評督) |
| N86 | shoen_estate | SEN | `:ShoenEstate` | 荘園(東大寺領/興福寺領/八条院領 等) |
| N87 | court_position | CPS | `:CourtPosition` | 朝廷職(太政大臣/左右大臣/大納言/参議/中納言) |
| N88 | military_post | MPT2 | `:MilitaryPost` | 軍事職(征夷大将軍/鎮守府将軍/防人/衛士) |
| N89 | tax_system | TXS | `:TaxSystem` | 税制(調庸/雑徭/田租/年貢/段銭) |
| N90 | land_system | LSY | `:LandSystem` | 土地制度(班田収授/三世一身/墾田永年/職田) |
| N91 | sumptuary_law | SLW | `:SumptuaryLaw` | 律令(大宝律令/養老律令/延喜式/類聚三代格) |
| N92 | political_reform | PRF | `:PoliticalReform` | 政治改革(大化改新/律令制/院政/武家政治) |
| N93 | dynastic_period | DPD | `:DynasticPeriod` | 王朝期(古墳期/飛鳥期/奈良期/平安期/院政期/鎌倉期) |
| N94 | regnal_era | RGE | `:RegnalEra` | 元号(大化/天武/和銅/延喜 等) |
| N95 | calendar_system | CSY | `:CalendarSystem` | 暦法(元嘉暦/儀鳳暦/宣明暦) |
| N96 | court_ceremony | CCR | `:CourtCeremony` | 宮中儀礼(即位礼/大嘗祭/朔旦冬至/朝賀) |
| N97 | imperial_burial | IBR | `:ImperialBurial` | 陵墓(大仙陵/箸墓/天武持統合葬陵) |
| N98 | mound_class | MCL | `:MoundClass` | 古墳類型(前方後円墳/円墳/方墳/上円下方墳/八角墳) |
| N99 | sea_lane | SEL | `:SeaLane` | 海上交易レーン(対朝鮮/対唐/対宋/対渤海) |
| N100 | port | PRT | `:Port` | 港湾(難波津/博多/敦賀/大輪田泊/平泉) |
| N101 | road_station | RDS | `:RoadStation` | 駅・宿(東山道駅/伝馬/関所) |
| N102 | tax_office | TOF | `:TaxOffice` | 税徴収拠点(大税官倉/正倉) |
| N103 | political_event | PEV | `:PoliticalEvent` | 政治事件(摂関政治確立/院政成立/承久の乱) |

→ **N74-N103 で 30 種**(累計 73 + 30 = **103 種** で目標達成)

### 9.2 既存 node との重複・分離規程

| 拡張 node | 重複の可能性 | 解決 |
|---|---|---|
| N74 battle / N75 rebellion / N103 political_event | `:Event` と概念重複 | event = 一般的事件、battle/rebellion/political_event は **特化サブクラス**。重複時は `:Event` を残し、特化 node を別途持つ |
| N76 treaty / N77 political_alliance | `:Event` / 既存 allied_with 関係と重複 | treaty/alliance は **永続的構造**(関係の集合)。event はその発生時点 |
| N78 migration / N79 colonization | `:Event` 内の事件として扱われがち | 特化 node 化(神武東征は migration、屯倉設置は colonization) |
| N80 seafaring_route / N81 trade_route | `:Region` と異なる(地理的 path) | 始点/終点は region、path 自体を独立 node 化 |
| N82 metal_workshop | `:Site`(archaeological_site)の特化 | site のサブセット。`:HAS_WORKSHOP_TYPE` で分類 |
| N83 metal_object_class | `:Artifact` の **類型**(個体ではなく分類) | 銅鐸 1 個は :Artifact(ART-001)、銅鐸 *類型* は :MetalObjectClass(MOC-001) |
| N84-N86 political_capital / regional_office / shoen_estate | `:Region` の特化 | 政治拠点は region のサブセット。`:LOCATED_AT_REGION` |
| N87 court_position / N88 military_post | `:Title` と部分重複 | title = 神格カテゴリ・社格、court_position = 朝廷職。両者は別系統 |
| N89-N91 tax/land/sumptuary | `:Text`(法文)と区別 | text は文献単位、これらは制度単位 |
| N93 dynastic_period | `:Region.era`(プロパティ)と区別 | dynastic_period = 独立 node、政治史の時代区分 |
| N94 regnal_era | `:Event.estimatedHistoricalTime` で記述可 | 元号は独立 node 化(複数年数年に渡るため node 化が便利) |
| N97 imperial_burial | `:Site`(古墳)と部分重複 | imperial_burial は **皇族陵墓** の特定。一般古墳との区別 |
| N98 mound_class | `:Artifact` ではなく `:Site` の類型 | 古墳 *類型* を独立 node 化 |
| N99 sea_lane | seafaring_route と部分重複 | sea_lane = 国際路線(対朝鮮等)、seafaring_route = 国内航路 |
| N100 port | `:Region` のサブセット | 港湾を独立 node 化(海路 path の端点) |

### 9.3 主要 node の必須プロパティ詳細

#### N74. battle(BTL — `:Battle`)

- **必須**: `master_id`、`canonical_name`、`occurred_year`、`location_region_id`
- **任意**: `participating_clan_ids` (List)、`outcome`、`source_text_ids`、`historicity_level`
- **代表事例**: 壬申の乱(672)、丁未の乱(587)、承平天慶の乱(935-941)、平治の乱(1159)、源平合戦、元寇(1274/1281)、磐井の乱(527)、乙巳の変(645、political_event 寄り)

#### N75. rebellion(RBL — `:Rebellion`)

- battle のサブクラスとして「反乱」性格を強調
- 代表事例: 平将門の乱、藤原純友の乱、田村麻呂による蝦夷征討(中央視点での反乱鎮圧)、阿弖流為の戦い(地方視点)、保元・平治の乱

#### N76. treaty(TRT — `:Treaty`)

- 盟約・条約・服属儀礼の独立 node 化
- 代表事例: 出雲国造神賀詞奏上(永続化された服属儀礼)、磐余の三輪盟約、白村江後の対唐和議、日宋貿易協定

#### N78. migration(MGR — `:Migration`)

- 集団移動を独立 node 化
- 代表事例: 神武東征(神話的 migration)、応神朝渡来(秦氏・東漢・西文の移住)、桓武遷都(平城→平安)、安曇族信濃移住、出雲族の出雲入植仮説

#### N80-N81. seafaring_route / trade_route

- 海路・陸路を **path 化**
- seafaring 代表: 玄界灘海北道、瀬戸内海路、日本海(出雲→北陸→東北)、太平洋(房総→紀伊)、那智補陀落航路
- trade 代表: 五畿七道(東海道/東山道/北陸道/山陰道/山陽道/南海道/西海道)、塩の道(信州)、能登街道、奥羽街道

#### N82. metal_workshop(MWK — `:MetalWorkshop`)

- 製鉄・鍛冶遺跡の独立 node 化
- 代表事例: 奥出雲菅谷たたら、吉備古代製鉄遺跡群、筑紫鍛冶遺跡、北部九州渡来製鉄炉、桜井茶臼山古墳鍛冶遺構

#### N83. metal_object_class(MOC — `:MetalObjectClass`)

- 金属遺物の **類型**(個体ではなく分類)
- 代表事例: 銅鐸(扁平鈕式/突線鈕式/見る銅鐸/聞く銅鐸)、銅剣(平形/中広形/中細形)、銅鉾、銅矛、神獣鏡、三角縁神獣鏡、画文帯神獣鏡、内行花文鏡、鉄剣、鉄鏃

#### N84-N86. 政治空間 3 種

- political_capital: 纒向、飛鳥京、藤原京、平城京、長岡京、平安京、福原京、鎌倉(武家)
- regional_office: 出雲国府、伊勢国府、武蔵国府、各国府(国衙)、評(後の郡衙)
- shoen_estate: 東大寺領(初期)、興福寺領、八条院領、平氏知行国、源氏知行国

#### N87-N88. 朝廷職・軍事職

- court_position: 太政大臣、左大臣、右大臣、内大臣、大納言、中納言、参議、八省卿、神祇官、太政官
- military_post: 征夷大将軍、鎮守府将軍、防人、衛士、滝口、検非違使

#### N89-N91. 制度系

- tax_system: 調(布)/庸(米)/雑徭/田租/正税/年貢/段銭/棟別銭
- land_system: 班田収授法、三世一身法、墾田永年私財法、口分田、職田、神田、寺田
- sumptuary_law: 大宝律令(701)、養老律令(718制定/757施行)、延喜式(927)、類聚三代格

#### N92. political_reform(PRF)

- 政治改革・体制変革
- 代表事例: 大化改新(645-)、律令制成立、班田制、墾田制移行、摂関政治確立(藤原良房 858)、院政開始(白河院 1086)、武家政治成立(源頼朝 1192)

#### N93-N95. 時間制度 3 種

- dynastic_period: 古墳期(3-7C)、飛鳥期(593-710)、奈良期(710-794)、平安期(794-1185)、院政期(1086-1192)、鎌倉期(1192-1333)
- regnal_era: 大化(645-650)、白雉(650-)、朱鳥(686)、大宝(701-)、和銅(708-)、延喜(901-) 等
- calendar_system: 元嘉暦、儀鳳暦、大衍暦、五紀暦、宣明暦(862-1684)

#### N96. court_ceremony(CCR)

- 宮中儀礼
- 代表事例: 即位礼、大嘗祭、新嘗祭、神嘗祭(伊勢)、朔旦冬至、朝賀、節会、御神楽

#### N97-N98. 古墳系

- imperial_burial: 大仙陵(伝仁徳)、箸墓(伝倭迹迹日百襲姫)、天武持統合葬陵、桓武陵
- mound_class: 前方後円墳、円墳、方墳、前方後方墳、上円下方墳、八角墳、双方中円墳

#### N99-N101. 海陸交通

- sea_lane: 対朝鮮(対馬経由)、対唐(東路/西路)、対宋(博多)、対渤海(能登/出羽経由)、対琉球
- port: 難波津、博多、敦賀、大輪田泊(平氏)、平泉(陸奥)、那珂湊、住吉津、生駒津
- road_station: 東山道駅、東海道駅、伝馬、関所(三関:逢坂・不破・鈴鹿)

#### N102-N103.

- tax_office: 大税官倉、正倉、国府正税倉
- political_event: 摂関政治確立、院政成立、平治の乱、保元の乱、承久の乱、文永弘安の役

### 9.4 主要追加 relation の予告(S05-S10 で詳細)

- `:FOUGHT_AGAINST` (clan/emperor → battle)
- `:OUTCOME_OF` (battle → political_reform)
- `:SIGNED_TREATY` (clan/emperor → treaty)
- `:MIGRATED_FROM_TO` (clan → migration → region)
- `:CONNECTS_REGIONS` (seafaring_route/trade_route → region × 2)
- `:WORKSHOP_PRODUCED` (metal_workshop → metal_object_class)
- `:OBJECT_CLASS_OF` (artifact → metal_object_class)
- `:CAPITAL_AT` (dynastic_period → political_capital)
- `:HOLDS_COURT_POSITION` (clan → court_position)
- `:GOVERNED_BY_TAX` (region → tax_system)
- `:LAND_OWNED_BY` (shoen_estate → clan/temple)
- `:DURING_ERA` (event/battle → regnal_era)
- `:BURIED_AT` (emperor → imperial_burial)
- `:MOUND_TYPE_OF` (imperial_burial → mound_class)
- `:PORT_AT_REGION` (port → region)
- `:CALENDAR_USED_IN` (calendar_system → dynastic_period)

### 9.5 進捗更新

| サブタスク | 状態 | 累計 node | 累計 relation |
|---|---|---|---|
| S01 章立て・整合表 | ✅ | 13 | 40 |
| S02 node 拡張 第1群(神話文化層) | ✅ | 43 | 40 |
| S03 node 拡張 第2群(祭祀ネットワーク層) | ✅ | 73 | 40 |
| **S04 node 拡張 第3群(政治・物的層)** | **✅(本 PR)** | **103 ✓** | 40 |
| S05 relation 拡張 第1群 | 未着手 | 103 | 40 → 90 |
| S06-S10 relation 拡張 | 未着手 | 103 | 90 → 340 |

→ **node 拡張完了**。100+ node 目標達成(13 既存 + 90 新規 = **103 種**)。
