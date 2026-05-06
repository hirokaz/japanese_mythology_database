# Relation 生成 Issue 設計(EPIC-26 詳細)

`docs/relations/relations.tsv`(Layer C)を **数万件規模で網羅生成** するための専用 Epic。relation_type ごとに専用 Issue を立て、地域・分野で分割並行する。

## 0. 全体方針

1. **relation_type ごとに専用 Issue** を立てる(混合禁止)
2. 各 Issue で該当 type を **網羅的に抽出** する(部分でなく全件)
3. 大量になる type は **地域 / 分野で更に分割**
4. 全 Issue 完了後、`docs/relations/relations.tsv` に **マージ統合**

## 1. relation_type → Issue マッピング(35 種を 11 グループに集約)

### G1. enshrined_at 系(Phase 3 P0)

| ID | Title | Effort | Dep | 想定行数 |
|---|---|---|---|---|
| RLN-EN-01 | 出雲系 deity → shrine enshrined_at 抽出 | M | M2.17, M2.18 | 200+ |
| RLN-EN-02 | 伊勢系 enshrined_at 抽出 | M | M2.18 | 150+ |
| RLN-EN-03 | 諏訪系 enshrined_at 抽出 | M | M2.18 | 150+ |
| RLN-EN-04 | 海人系 enshrined_at 抽出 | L | M2.18 | 300+ |
| RLN-EN-05 | 山岳・修験系 enshrined_at 抽出 | L | M2.18 | 250+ |
| RLN-EN-06 | 八幡・春日・熊野系 enshrined_at 抽出 | L | M2.18 | 600+ |
| RLN-EN-07 | 渡来系 enshrined_at 抽出 | M | M2.18 | 100+ |
| RLN-EN-08 | 残余 + 監査 + 主従区分(primary/secondary)精緻化 | L | RLN-EN-01〜07 | 統合 |

### G2. mentioned_in 系(Phase 3 P0)

| ID | Title | Effort | Dep | 想定行数 |
|---|---|---|---|---|
| RLN-MI-01 | 古事記 mentioned_in 抽出(全 myth_episode 対応) | L | MST-MY-* | 500+ |
| RLN-MI-02 | 日本書紀 mentioned_in 抽出(本伝+一書) | L | MST-MY-* | 800+ |
| RLN-MI-03 | 各風土記 mentioned_in 抽出 | L | MST-MY-* | 400+ |
| RLN-MI-04 | 延喜式神名帳 mentioned_in(全式内社) | L | MST-SH-01 | 2861 |
| RLN-MI-05 | 中世神道書(中臣祓・神道五部書 等) | M | MST-TX-02 | 200+ |
| RLN-MI-06 | 残余(続日本紀・三代実録・社伝) | L | M2.* | 統合 |

### G3. 系譜 系(parent_of / married_to / sibling_of)(Phase 3 P0)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-PA-01 | deity 親子関係(国生み・神生み) | M | MST-MY-01,02 |
| RLN-PA-02 | deity 婚姻・兄弟(国譲り神話の系譜) | M | MST-MY-03 |
| RLN-PA-03 | emperor 系譜(神武〜継体) | M | MST-EM-01 |
| RLN-PA-04 | emperor 系譜(継体〜後鳥羽) | L | MST-EM-02,03 |

### G4. descended_from / ancestor_deity_of(Phase 3 P0)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-DE-01 | 中央豪族 → 祖神 (中臣→アメノコヤネ等) | M | MST-CL-01 |
| RLN-DE-02 | 地方豪族 → 祖神 (出雲国造→アメノホヒ等) | L | MST-CL-02 |
| RLN-DE-03 | 祭祀・技術氏族 → 祖神 | M | MST-CL-03 |
| RLN-DE-04 | 渡来氏族 → 祖神 (秦氏→秦の始皇 等の伝承) | M | MST-CL-04 |

### G5. syncretized_with / 神仏習合(Phase 3 P1)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-SY-01 | 八幡 syncretization (八幡大菩薩・応神) | M | EPIC-27, USA-09 |
| RLN-SY-02 | 熊野 syncretization (熊野権現・本地仏) | M | EPIC-27, KMN-12 |
| RLN-SY-03 | 春日・山王・蔵王 syncretization | M | EPIC-27 |
| RLN-SY-04 | 牛頭天王・祇園・スサノオ系 | M | EPIC-27 |

### G6. same_as / has_alias / regional_variant_of(Phase 3 P1)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-SA-01 | 大国主・オオナムチ・オオモノヌシ系 同一/同体論争 | M | MST-DE-07 |
| RLN-SA-02 | アマテラス・ヒルコ・ワカヒルメ系 | M | MST-DE-07 |
| RLN-SA-03 | 各地の地方変異名(綿津見地方変異 等) | L | MST-DE-07 |

### G7. has_title(Phase 3 P2)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-TT-01 | deity → 神格カテゴリ (国魂神・農耕神 等) | M | MST-TT-01 |
| RLN-TT-02 | shrine → 社格 (式内社・一宮・明神大社 等) | L | MST-TT-01, MST-SH-01 |

### G8. controlled_by / ruled / served / allied_with / opposed_to(Phase 3 P1)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-CO-01 | 古代国造の支配 (clan → region) | M | MST-CL-02, MST-RG-01 |
| RLN-CO-02 | 大化以降 国司・郡司 | M | MST-EV-01 |
| RLN-CO-03 | clan 同盟・敵対 (蘇我↔物部 等) | M | MST-CL-01 |
| RLN-CO-04 | clan → emperor 仕奉関係 | M | MST-CL-01, MST-EM-* |

### G9. participated_in / occurred_in / triggered / variant_of(Phase 3 P0)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-PA-05 | deity / clan / emperor → myth_episode 参加 | L | MST-MY-* |
| RLN-PA-06 | myth_episode / event → region 発生地 | M | MST-MY-*, MST-RG-01 |
| RLN-PA-07 | myth_episode 因果連鎖 (triggered) | M | MST-MY-* |
| RLN-PA-08 | myth_episode 異伝関係 (variant_of) | M | MST-MY-* |

### G10. 考古関係(found_at / dated_to / archaeologically_linked)(Phase 3 P1)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-AL-01 | artifact → site 出土関係 | M | MST-ST-*, MST-AR-* |
| RLN-AL-02 | site / artifact → 時代帰属 | M | MST-ST-*, MST-AR-* |
| RLN-AL-03 | 神話との考古学的対応(草薙剣 ⇄ 銅剣文化等) | L | MST-MY-*, MST-AR-* |
| RLN-AL-04 | 縄文遺跡 ⇄ 縄文記憶神話(L4-L5 仮説) | L | EPIC-28 |

### G11. 祭祀(performed_at / reenacts / performed_by)(Phase 3 P1)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-PE-01 | ritual → shrine 実施場所 | M | MST-RT-01 |
| RLN-PE-02 | ritual → myth_episode 神話再演 | M | MST-RT-01, MST-MY-* |
| RLN-PE-03 | ritual → clan / emperor 主催 | M | MST-RT-01 |

### G12. 仮説関係(supports / contradicts / proposed_by)(Phase 3-4 P2)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-HY-01 | hypothesis → 支持事実 (supports) | L | MST-HY-* |
| RLN-HY-02 | hypothesis → 反証事実 (contradicts) | M | MST-HY-* |
| RLN-HY-03 | hypothesis → 提唱者 (proposed_by) | M | MST-HY-* |

### G13. メタ関係(merged_into / supersedes / renamed_to)(Phase 4)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-ME-01 | merged_into 一括発行(表記ゆれ統合の結果) | M | AUD-NM-* |
| RLN-ME-02 | renamed_to (神社改称・氏族改姓) | M | M2.* |
| RLN-ME-03 | supersedes (master 改訂履歴) | S | 必要時 |

---

## 2. relation 一括 Issue の標準フォーマット

```markdown
## 🎯 Issue ID: RLN-EN-04

## 🧭 Title
[RLN] 海人系 deity → shrine の enshrined_at 抽出

## 🎯 Purpose
海人族系神格を全国海洋系神社に対し enshrined_at で結合する。

## 📦 Scope
- deity_master の category=海神 + 海人族系祖神 (約 30+)
- 上記神格を主祭神 / 配祀とする神社全件
- 主従(primary/secondary)の区別

## 🚫 Out of Scope
- 神仏習合 (RLN-SY-* で別途)
- 山岳系・八幡系 (別 Issue)

## 📥 Input
- docs/master/deity_master.tsv
- docs/master/shrine_master.tsv
- 各社の社伝・延喜式

## 📤 Output
- docs/relations/relations_enshrined_at_marine.tsv

## 🔗 Dependencies
- 前提: M2.17 deity_master 600+, M2.18 shrine_master 800+
- 並行可: RLN-EN-01〜03,05〜08
- 後続: M3.1 統合 → relations.tsv マージ

## 🔥 Priority: P1
## ⏱ Estimated Effort: L (6-8h)

## ✅ Acceptance Criteria
- [ ] 必須カラム全件記載 (relation_id, source_id, source_type,
      relation_type, target_id, target_type, confidence_level,
      hypothesis_layer, source_reference)
- [ ] 主祭神 → primary_deity_of, 配祀 → secondary_deity_of
- [ ] 200 行以上
- [ ] 重複なし(同 source/type/target)
- [ ] confidence_level=A は社伝確定行のみ
- [ ] PR セルフレビュー通過

## 🔁 Suggested relation_types
- enshrined_at, primary_deity_of, secondary_deity_of, located_in

## 🧱 Suggested node_types
- deity, shrine, region

## 🏷 Labels
area:marine, type:relation, phase:3, priority:P1, effort:L, evidence:shrine_legend
```

---

## 3. relation 統合 Issue(M3.10/M3.11)

| ID | Title | Effort | Dep |
|---|---|---|---|
| RLN-MERGE-01 | 全 relations_*.tsv → relations.tsv 統合 | M | 全 RLN-* |
| RLN-MERGE-02 | relation_id を RLN-NNNNNN で再採番(全件) | S | RLN-MERGE-01 |
| RLN-MERGE-03 | 重複検出と統合(同 source/type/target) | M | RLN-MERGE-02 |
| RLN-MERGE-04 | confidence_level / hypothesis_layer のメタ整合 | M | RLN-MERGE-03 |
| RLN-MERGE-05 | relation_inventory.md 自動生成(type 別件数) | S | RLN-MERGE-04 |

---

## 4. relation 生成時の **絶対ルール**

1. **必須カラム欠損禁止**: source_id, source_type, relation_type, target_id, target_type, confidence_level, hypothesis_layer, source_reference
2. **逆向き記録禁止**: directed type は片方向のみ。クエリ時に逆引き。
3. **存在しない master_id 禁止**: source/target は必ず master TSV に存在
4. **同一 source/type/target 重複禁止**
5. **temporal がある場合は valid_from/valid_until を埋める**
6. **hypothesis_layer L4-L5 は必ず confidence_level E**
7. **mentioned_in は target が必ず text master**
8. **PR 1 つあたり 1 type 1 領域に限定** (混合禁止、レビュー困難回避)

---

## 5. relation 生成の自動化検討(将来)

```python
# 概念: master TSV → relation suggestion
# 1. deity_master.related_shrine_ids (任意カラム) を読む
# 2. そこから enshrined_at relation 候補を生成
# 3. 人手で confidence と hypothesis_layer を付与
# 4. TSV 出力
```

→ Phase 4-5 でスクリプト化検討(現段階では人手)。
