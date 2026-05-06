# Master/Relation 拡張 実装計画(#133-#137)

本書は **#133-#137** の master・relation 大量拡張の **基盤・進捗管理** を整備する。実データ充填は本書の計画に沿って後続セッションで段階的実施。

> 関連: `08_civilization_os_schema.md`(103 node × 340 relation 設計)、`17_issues_civilization_os/`(1230+ Issue カタログ)、`18_long_term_autonomous.md`(自律運用)。

## 0. 拡張対象サマリ

| issue | master/データ | 目標規模 | 現状 | 担当領域 |
|---|---|---|---|---|
| **#133** | deity_master | 500+ | 部分 | 神格 |
| **#134** | shrine_master | 1000+ | 部分 | 神社 |
| **#135** | clan_master | 300+ | 部分 | 氏族 |
| **#136** | motif_db | 500+ | 245 既存 | 神話モチーフ |
| **#137** | relation_table | 5000+ | 620 既存 | 関係 |

## 1. #133 deity_master 拡張(500+)

### 1.1 必須カラム

```
master_id, canonical_name, canonical_reading, category, gender,
main_text_appearance, aliases, aliases_reading,
parent_deity_ids, consort_deity_ids, syncretism, regional_variant,
related_shrine_ids, related_myth_ids, merged_into, notes,
mythology_layer, source_reference, confidence_level
```

### 1.2 系統別 サブタスク(11 PR)

| サブタスク | 系統 | 目標件数 | 主要神格(代表) |
|---|---|---|---|
| S01 | 出雲系 | 50 | 大国主・スサノオ・コトシロヌシ・タケミナカタ・アメノホヒ・八束水臣津野命 |
| S02 | 伊勢系 | 50 | アマテラス・豊受・ツクヨミ・ニニギ・倭姫命 |
| S03 | 諏訪系 | 30 | タケミナカタ・八坂刀売・洩矢神・ミシャグジ・建御名方富命 |
| S04 | 鹿島香取・春日系 | 30 | タケミカヅチ・経津主・天児屋根・比売 |
| S05 | 宗像・海人系 | 60 | 田心姫・湍津姫・市杵島姫・ワタツミ三神・住吉三神・阿曇磯良 |
| S06 | 山岳・修験系 | 60 | 蔵王権現・熊野権現・白山妙理・富士浅間・大山祇・大山咋・役小角 |
| S07 | 鍛冶・製鉄系 | 30 | 金山彦・金屋子・天目一箇・天津麻羅・石凝姥命 |
| S08 | 八幡・宇佐系 | 30 | 八幡神・応神・神功皇后・比売大神 |
| S09 | 火山・火神系 | 30 | カグツチ・健磐龍命・コノハナサクヤ・浅間 |
| S10 | 渡来・地方在来系 | 70 | 秦氏祭神・東漢・百済王・アラハバキ・諸地方祖神 |
| S11 | 表記ゆれ統合(merged_into) | - | 全体監査 |

→ 各 PR で 30-70 神格、1 PR 当たり 6-8h。総計 11 PR で **500+ 達成**。

### 1.3 進捗管理

| サブタスク | 状態 | PR | 件数 |
|---|---|---|---|
| S01 出雲系 | 未着手 | - | 0/50 |
| S02 伊勢系 | 未着手 | - | 0/50 |
| ...(以下同様) | - | - | - |

## 2. #134 shrine_master 拡張(1000+)

### 2.1 必須カラム

```
master_id, canonical_name, canonical_reading, prefecture, address,
main_deity_ids, old_names, alternative_names, coordinates,
secondary_deity_ids, related_clan_ids, shrine_rank_ancient,
shrine_rank_modern, founding_legend, founding_year_estimated,
parent_shrine_id, mountain_network, maritime_network,
syncretism_history, political_role, ritual_role,
source_reference, confidence_level, merged_into, notes
```

### 2.2 七道別 サブタスク(20 PR)

| サブタスク | 領域 | 目標件数 |
|---|---|---|
| S01 | 畿内 5 国(大和・山城・河内・和泉・摂津) | 80 |
| S02 | 東海道 | 80 |
| S03 | 東山道 | 80 |
| S04 | 北陸道 | 60 |
| S05 | 山陰道 | 60 |
| S06 | 山陽道 | 60 |
| S07 | 南海道 | 50 |
| S08 | 西海道 | 70 |
| S09 | 熊野系全国分布(王子社・新宮社) | 60 |
| S10 | 八幡系全国分布 | 70 |
| S11 | 春日系全国分布 | 30 |
| S12 | 諏訪系全国分布(5000+ 社の核) | 50 |
| S13 | 稲荷系・天満宮系全国分布 | 70 |
| S14 | 修験霊場主要社 | 40 |
| S15 | 一宮 全国 68 国 | 70 |
| S16 | 二宮・三宮・総社 | 60 |
| S17 | 元伊勢・摂社・末社 | 40 |
| S18 | 神宮・近代官幣社 | 30 |
| S19 | 改称履歴(renamed_to)整理 | - |
| S20 | 表記ゆれ統合 | - |

→ **1000+ 達成**(20 PR)

## 3. #135 clan_master 拡張(300+)

### 3.1 5 分類 サブタスク(6 PR)

| サブタスク | 分類 | 目標件数 |
|---|---|---|
| S01 | 中央大豪族 | 50 |
| S02 | 地方国造系 | 60 |
| S03 | 祭祀氏族 | 50 |
| S04 | 技術氏族 | 40 |
| S05 | 渡来氏族 | 50 |
| S06 | 改姓・統合・descended_from 整備 | - |

→ **250-260 + 既存** で 300+ 達成(6 PR)

## 4. #136 motif_db 拡張(500+)

### 4.1 5 カテゴリ サブタスク(5 PR)

既存 245 件に加え:

| サブタスク | カテゴリ | 目標追加 |
|---|---|---|
| S01 | 王権神話・神話編集 motif | 60 |
| S02 | 在来縄文・地方神格 motif | 60 |
| S03 | 海洋・海人 motif | 50 |
| S04 | 山岳・修験・神仏習合 motif | 50 |
| S05 | 渡来・大陸由来 motif | 40 |

→ 既存 245 + 追加 260 = **500+ 達成**(5 PR)

## 5. #137 relation_table 拡張(5000+)

### 5.1 35 サブタスク(`#132 / 17_issues_civilization_os/05_relations.md` に詳細)

7 グループ × 平均 5 PR = **35 PR**

| グループ | 件数推定 |
|---|---|
| enshrined_at 系(8 PR) | 3000+ |
| mentioned_in 系(6 PR) | 6000+ |
| 系譜系(4 PR) | 2000+ |
| 神格・同体系(4 PR) | 1500+ |
| 政治・支配系(4 PR) | 1000+ |
| 神話・出来事系(4 PR) | 2000+ |
| 考古・祭祀・仮説系(5 PR) | 1500+ |
| **合計** | **17,000+ relation** |

→ **5000+ 大幅超過達成**(35 PR)

## 6. 実装優先度(後続セッション用)

### Sprint 1(最重要)
1. #135 S01 中央大豪族(50)
2. #133 S01-S03 出雲・伊勢・諏訪(130 神格)
3. #134 S01 畿内+S02 東海道(160 神社)
4. #136 S01 王権神話 motif(60)
5. #137 S01 enshrined_at 出雲系(200 relation)

### Sprint 2
- #133 S04-S08(150 神格)
- #134 S03-S08(380 神社)
- #135 S02-S03(110 氏族)
- #136 S02-S03(110 motif)
- #137 S02-S08(1500 relation)

### Sprint 3
- #133-#136 残り完成
- #137 残り 30 PR(15,000+ relation)

→ 各 Sprint 1-2 ヶ月、計 4-6 ヶ月で全完成。

## 7. 各 master/relation の品質基準(共通)

### 7.1 必須遵守項目

- 全レコードに sourceReference 記載
- L4-L5 仮説は confidence_level=E
- 偽書(F0)は textType='forgery' でマーク、master 登録禁止
- 表記ゆれは aliases 集約 or merged_into で統合
- 中央偏重で地方を矮小化しない

### 7.2 自動監査(`docs/audit/` 経由)

- master_id 重複検出
- canonical_name 編集距離 < 2 のペア(merged_into 候補)
- relation の dangling 検出
- L4-L5 ↔ confidence_level=E 整合性

### 7.3 Gemini 反射監査

各 master/relation 拡張完了時に Gemini 監査依頼:
- AUD-GM-133_deity_master.md
- AUD-GM-134_shrine_master.md
- AUD-GM-135_clan_master.md
- AUD-GM-136_motif_db.md
- AUD-GM-137_relations.md

## 8. 既存資産との統合方針

### 8.1 既存 motif_db.tsv (245)
- そのまま継承(MOTIF-001〜245 維持)
- #136 で MOTIF-246〜500+ 追加

### 8.2 既存 02_motif_relations.tsv (620)
- そのまま継承(MR-EV/SY/RT/PO/RG/AS/TR-* 維持)
- #137 で master 接続 relation を別ファイル分割

### 8.3 既存 deity_master / shrine_master / clan_master
- 既存レコード継承
- 新規追加で目標件数達成

## 9. 結論

| issue | 拡張計画 | 完了見込 |
|---|---|---|
| #133 deity 500+ | 11 PR | Sprint 2 |
| #134 shrine 1000+ | 20 PR | Sprint 3 |
| #135 clan 300+ | 6 PR | Sprint 1-2 |
| #136 motif 500+ | 5 PR | Sprint 1-2 |
| #137 relation 5000+→17000+ | 35 PR | Sprint 3+ |

→ **本書(基盤計画)で issue #133-#137 の設計完結**。実データ充填は本書 §6 Sprint に従って後続セッションで段階的実行。1230+ Issue カタログ(`#128-#132`)・103 node × 340 relation スキーマ(`#123`)・5×7 マトリクス監査(`#124`)・Cypher 写像(`#125`)・Web Atlas(`#126`)・100+ Epic(`#127`)・10 文明圏(`#138`)・5 ネットワーク(`#139`)・長期自律運用(`#140`)が **すべて確定済み**。

→ **#122 統括 issue の設計フェーズ完結**。Phase 5 実装フェーズへ移行可能。
