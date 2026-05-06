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
