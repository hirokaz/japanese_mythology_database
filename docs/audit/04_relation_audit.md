# relation_type 根拠強度監査

**監査日**: 2026-05-06
**監査対象**: `docs/schema/02_relation_types.md`(40 type)、`docs/relations/relations_sample.tsv`(18件)

---

## 1. relation_type の根拠強度分類

40 relation types を **5 段階の根拠強度** で分類。

### 強度ラベル

| ラベル | 意味 |
|---|---|
| 強い根拠あり | 史料的に確実、誤用しにくい |
| 一般説 | 学界・社家で広く認められる、一定の検証あり |
| 弱い | 史料的根拠は限定的、慎重な運用が必要 |
| 仮説 | 学術仮説の領域、必ず hypothesis_layer 付与 |
| 要注意 | 暴走しやすい、誤用例多い、特別な運用ガイドが必要 |

---

### 1.1 神社祭祀カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `enshrined_at` | **強い根拠あり** | 現代の社誌・延喜式・社伝で確定可能 | 低。中世祭神交代期は valid_from/until で時間幅明示 |
| `primary_deity_of` | **強い根拠あり** | 同上 | 低 |
| `secondary_deity_of` | **強い根拠あり** | 配祀神の確定は社誌依存 | 低 |
| `has_subordinate_shrine` | 一般説 | 摂社・末社の親子関係は社制で確定 | 低 |
| `located_in` | **強い根拠あり** | 物理的所在で疑義なし | なし |

### 1.2 系譜カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `parent_of` / `child_of` | **強い根拠あり**(史実)/ 仮説(神代) | 神代の系譜は古事記書紀の異伝多数 | 中。古事記/書紀でズレる場合は別 relation で記録 |
| `sibling_of` | 強い根拠あり / 仮説(神代) | 同上 | 中 |
| `married_to` | 強い根拠あり / 仮説(神代) | 政治婚と神話婚を分離 | 中 |
| `descended_from` | 一般説 | 系譜資料(新撰姓氏録、先代旧事本紀)依存。後世の家伝による補強多い | 高。後世創作の祖伝を盲信しないこと |
| `ancestor_deity_of` | 一般説 | 祖神化は後世の整理が多い | 高。同上 |

### 1.3 神格・同体カテゴリ(**特に要注意**)

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `syncretized_with` | **要注意** | 神仏習合・同体視は L1+ の仮説 | **高**。本ライブラリで最も誤用されやすい。hypothesis_layer 必須、根拠文献を source_reference に必須 |
| `same_as` | 仮説 | 確定したと思える同一視も学術論争の余地 | **高**。可能な限り `syncretized_with` か `has_alias` で慎重に。`same_as` は最も慎重に |
| `has_alias` | 一般説 | 古事記/書紀の異表記レベルは強根拠、後世の異名は注意 | 中 |
| `has_title` | **強い根拠あり** | 神格カテゴリ(国魂神、一宮 等)の付与 | 低 |
| `regional_variant_of` | 仮説 | 地方変異は学術仮説 | 中 |

**運用ガイダンス**:
- `same_as` は **個別の史料で確定的に同一視されている場合のみ**。例: 古事記「大穴牟遅=大国主」明記
- `syncretized_with` は **習合の事実**(中世神道書での同一視等)を記録、神格的同一性は別途 hypothesis 化
- 同体論争(大国主=大物主)は `syncretized_with` + L2 仮説関係の併用

### 1.4 政治支配カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `controlled_by` | 一般説 | 国造制下の地方支配等は史料記載 | 中 |
| `ruled` | 一般説 | 同上 | 中 |
| `allied_with` | 仮説 | 古代の同盟関係は神話的記述が多い | 中 |
| `opposed_to` | 一般説 / 仮説(神代) | 神話的敵対と史実敵対を分離 | 中 |
| `served` | 一般説 | 仕官関係は系譜資料で記録 | 低 |
| `renamed_to` | **強い根拠あり** | 改称の史実(中臣→藤原 等)は確定 | 低 |

### 1.5 神話事象カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `participated_in` | **強い根拠あり**(神話内) | 古事記書紀記載で確定 | 低 |
| `occurred_in` | 一般説 | 神話の場所比定は地方伝承で複数説 | 中 |
| `triggered` | 一般説 | 因果関係は記述順依存 | 中 |
| `variant_of` | **強い根拠あり** | 古事記/書紀/風土記の異伝関係は明確 | 低 |

### 1.6 文献出典カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `mentioned_in` | **強い根拠あり** | 文献記載の有無は確定 | なし |
| `primary_source_for` | 一般説 | 「主出典」の判定に主観混入 | 低 |
| `authored_by` | **強い根拠あり**(古事記=太安万侶等) | 偽撰問題のある文献は注意 | 中 |

### 1.7 考古カテゴリ(**仮説中心**)

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `found_at` | **強い根拠あり** | 出土地は発掘記録で確定 | なし |
| `dated_to` | 一般説 / 仮説 | 年代測定論争のある資料あり(IZM-001 砂原遺跡) | 中 |
| `archaeologically_linked` | **要注意** | 神話との対応は仮説 | **高**。hypothesis_layer 必須、断定回避 |

### 1.8 祭祀カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `performed_at` | **強い根拠あり** | 祭祀の場所は社誌で確定 | なし |
| `reenacts` | 一般説 | 神話の祭祀的再演は社伝で記録 | 低 |
| `performed_by` | **強い根拠あり** | 主催者は記録される | 低 |

### 1.9 仮説カテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `supports` | 仮説 | 仮説 → 事実の支持関係 | 低(構造的に明確) |
| `contradicts` | 仮説 | 仮説 ← 事実の矛盾関係 | 低 |
| `proposed_by` | **強い根拠あり** | 提唱者は文献で確定 | なし |

### 1.10 メタカテゴリ

| relation_type | 根拠強度 | 注意事項 | 暴走リスク |
|---|---|---|---|
| `merged_into` | **強い根拠あり**(編集判断) | データ統合のメタ情報 | なし |
| `supersedes` | **強い根拠あり**(編集判断) | 同上 | なし |

---

## 2. 強度別サマリ

| ラベル | 件数 | 主な type |
|---|---|---|
| 強い根拠あり | 14 | enshrined_at, located_in, found_at, mentioned_in, performed_at, renamed_to, has_title, merged_into 等 |
| 一般説 | 13 | descended_from, has_subordinate_shrine, controlled_by, ruled, opposed_to, occurred_in 等 |
| 弱い | 0 | (本表では「仮説」と統合) |
| 仮説 | 8 | same_as, regional_variant_of, allied_with, dated_to(年代論争時), supports, contradicts 等 |
| **要注意** | 5 | **syncretized_with, same_as(再掲), descended_from(再掲), ancestor_deity_of(再掲), archaeologically_linked** |

---

## 3. 既存サンプル(relations_sample.tsv 18件)の妥当性検証

| RLN-ID | 関係 | 監査評価 | 問題点 | 修正提案 |
|---|---|---|---|---|
| RLN-000001 | DEI-001 → primary_deity_of → SHR-001 | ○ 妥当 | confidence A、layer L0 適切 | - |
| RLN-000002 | DEI-013 → ancestor_deity_of → CLN-001 | △ 要注意 | 祖神化は後世の整理。confidence B、layer L1 は妥当だが、source_reference を「古事記\|日本書紀\|出雲国造神賀詞」と複数併記しており良好 | - |
| RLN-000003 | CLN-005 → descended_from → DEI-013 | △ 要注意 | 同上、後世系譜資料依存 | 妥当 |
| RLN-000004 | DEI-002 ↔ syncretized_with ↔ DEI-030 | ○ 良好 | layer L1、習合の史実として妥当 | - |
| RLN-000005 | SHR-001 → renamed_to → SHR-001(自己参照) | △ 表現工夫 | 改称履歴を同一 ID で表現する方法だが、relation グラフでは循環参照になる | 古名・新名で別レコード化、または relations の notes で「old_name=杵築大社」と明示する方が綺麗 |
| RLN-000006 | DEI-010 → opposed_to → DEI-011 | ○ 妥当 | 神代の対立、layer L0 で古事記記載 | - |
| RLN-000007 | DEI-001 ↔ married_to ↔ DEI-022 | ○ 妥当 | 神代婚姻、layer L0 | - |
| RLN-000008 | HYP-004 → supports → IZM-009 | ○ 良好 | 仮説 → 事実支持の典型 | - |
| RLN-000009 | HYP-002 → contradicts → IZM-094 | ○ 良好 | 仮説 → 矛盾事実の典型 | - |
| RLN-000010 | DEI-009 → primary_deity_of → SHR-020 | ○ 妥当 | - | - |
| RLN-000011 | RIT-001 → reenacts → MYTH-001 | ○ 妥当 | RIT-001 はマスター未投入だが概念明確 | RIT 未マスター化の対応(将来 ritual_master.tsv 立項) |
| RLN-000012-014 | MYTH-001 → mentioned_in → TXT-001/002/003 | ○ 妥当 | 異伝3件の独立記録は理想形 | - |
| RLN-000015 | CLN-008 → renamed_to → CLN-008(自己参照) | △ 表現工夫 | 同 RLN-000005 と同様の問題 | 同上 |
| RLN-000016-017 | HYP-006 → supports → IZM-013 / IZM-072 | ○ 妥当 | 仮説の証拠ネットワーク | - |
| RLN-000018 | DEI-001 ↔ syncretized_with ↔ DEI-014(L2) | ○ 良好 | 同体論争の正しい記録形式 | - |

### 3.1 改称関係の表現方法の改善提案

`renamed_to` で同一 ID を source/target に置くのは **グラフ表現として奇妙**。代替案:

**案 A**: マスター TSV の `old_names` カラムで表現し、relations では張らない(現行+運用ガイドで処理)
**案 B**: 改称前後を別 master_id で残す(SHR-001A 杵築大社 → SHR-001B 出雲大社)
**案 C**: 改称イベントを EVT で立項し、関係を `EVT-NN renamed CLN-008(中臣→藤原)`

→ **推奨**: **案 A**。改称は master 側で履歴管理。relations で表すのは「複数法人化された場合」のみ。

---

## 4. 暴走リスク高 5 type の運用ガイダンス

### 4.1 syncretized_with(神仏習合・同体視)

**暴走例**: 全ての神を「○○の本地は△△」と関係化し始めると、中世神道書の記述を全てフラット化してしまう

**運用ルール**:
1. **必須**: hypothesis_layer 付与(L0-L1: 中世社伝記述、L2+: 学術論争)
2. **必須**: source_reference に該当文献(両部神道書、伊勢神道書、各神社縁起 等)
3. **推奨**: valid_from / valid_until で時代を限定
4. **禁止**: 出典なしで「○○=△△」と関係化

### 4.2 same_as(同一神確定)

**暴走例**: 別名に過ぎないものを `same_as` で結び、後世の判明で誤統合になる

**運用ルール**:
1. 古事記書紀の **同一文中で同一神扱い** されている場合のみ
2. それ以外は `has_alias` または `syncretized_with`(L2)
3. `same_as` の relation には source_reference に **直接的な明記** を必須

### 4.3 descended_from / ancestor_deity_of(系譜)

**暴走例**: 新撰姓氏録の祖神記述を全て史実扱いし、後世の系譜創作に振り回される

**運用ルール**:
1. **必須**: hypothesis_layer L1(中央氏族の系譜) or L2(後世補強の系譜)
2. **推奨**: source_reference に文献名(新撰姓氏録、先代旧事本紀、各家伝)を明記
3. **禁止**: confidence A をつけない。系譜は B 以下で運用

### 4.4 archaeologically_linked(考古-神話対応)

**暴走例**: 銅鐸祭祀終焉=国譲り神話、ヤマタノオロチ=製鉄民征服、と全部つなげる

**運用ルール**:
1. **必須**: hypothesis_layer L2-L4(L0-L1 はあり得ない)
2. **必須**: hypothesis_master 立項+ relations で hypothesis ノード経由で結ぶ(直接 site → myth ではなく、hypothesis を媒介に)
3. **推奨**: contradicts 関係も同時に記録(反証の存在を明示)

---

## 5. 監査総括

### 5.1 良好な点

- 関係性の必須 13 カラム(confidence_level、hypothesis_layer、source_reference の必須化)は **暴走防止に有効**
- syncretized_with と same_as の使い分けが文書化されている(02_relation_types.md §6.2)
- supports / contradicts による仮説 ↔ 事実の構造化は理想的

### 5.2 改善が必要な点

| 件数 | 内容 | 重要度 |
|---|---|---|
| 1 | 改称関係の表現方法(renamed_to の自己参照) | 中 |
| 5 | 要注意 type の運用ガイダンスを 02_relation_types.md に追記 | 高 |
| 各サンプル | RIT-001 等の未マスター ID を実体化(将来) | 中 |

### 5.3 推奨対応

1. `02_relation_types.md` §3.x に **要注意 5 type の運用ガイダンス** を追加
2. 改称関係の表現方法を **案 A(master 側で old_names 管理)** に統一
3. RIT(ritual)、SITE(archaeological_site)、TXT(text)、EVT(event)等の **未収録 master の段階整備**
