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
