# エッジ(関係性)定義

ノード間の relation_type を定義する。全関係性は `docs/relations/relations.tsv` に格納される。

## 1. 基本ルール

1. 各関係には `relation_type`、`source_id`、`target_id` の三要素が必須。
2. `directed`(有向)/`undirected`(無向)を type ごとに固定。
3. 関係には `confidence_level`(確実性)、`hypothesis_layer`(仮説強度)、`source_reference`(出典)を必須付与。
4. **逆向きの関係**は記録しない(クエリ側で逆引き)。例: `enshrined_at` は deity → shrine のみ。

## 2. relation_type 一覧(分類別)

### 2.1 神社・祭祀関係

| relation_type | source → target | 意味 |
|---|---|---|
| enshrined_at | deity → shrine | 祭神として祀られる |
| primary_deity_of | deity → shrine | 主祭神(secondary との区別) |
| secondary_deity_of | deity → shrine | 配祀神 |
| has_subordinate_shrine | shrine → shrine | 摂社・末社の関係 |
| located_in | shrine/site → region | 地理的所在 |

### 2.2 系譜関係(神・人)

| relation_type | source → target | 意味 |
|---|---|---|
| parent_of | deity/emperor → deity/emperor | 親子(directed) |
| child_of | deity/emperor → deity/emperor | 子(parent_of の逆だが、入力簡便のため許容) |
| sibling_of | deity/emperor ↔ deity/emperor | 兄弟姉妹(undirected) |
| married_to | deity/emperor ↔ deity/emperor | 婚姻(undirected) |
| descended_from | clan → deity/clan | 系譜上の祖 |
| ancestor_deity_of | deity → clan | 祖神 |

### 2.3 神格・同体関係

| relation_type | source → target | 意味 |
|---|---|---|
| syncretized_with | deity ↔ deity | 神仏習合・同体視(undirected) |
| same_as | deity ↔ deity | 別名・同一神確定(undirected) |
| has_alias | deity → deity | 別名関係(merged_into 候補) |
| has_title | deity/shrine → title | 神格カテゴリ・社格 |
| regional_variant_of | deity → deity | 地方変異名 |

### 2.4 政治・支配関係

| relation_type | source → target | 意味 |
|---|---|---|
| controlled_by | region/clan → clan/emperor | 政治支配される |
| ruled | clan/emperor → region | 支配した |
| allied_with | clan ↔ clan | 同盟(undirected) |
| opposed_to | clan/deity ↔ clan/deity | 敵対(undirected) |
| served | clan/emperor → emperor | 仕えた |
| renamed_to | clan/shrine → clan/shrine | 改称(directed、時系列) |

### 2.5 神話・出来事関係

| relation_type | source → target | 意味 |
|---|---|---|
| participated_in | deity/clan/emperor → myth_episode/event | 登場・参加 |
| occurred_in | myth_episode/event → region | 発生地 |
| triggered | myth_episode/event → myth_episode/event | 因果関係 |
| variant_of | myth_episode → myth_episode | 異伝関係 |

### 2.6 文献・出典関係

| relation_type | source → target | 意味 |
|---|---|---|
| mentioned_in | 任意 node → text | 文献に言及される |
| primary_source_for | text → 任意 node | 一次出典 |
| authored_by | text → emperor/clan | 編纂・撰進 |

### 2.7 考古関係

| relation_type | source → target | 意味 |
|---|---|---|
| found_at | artifact → archaeological_site | 出土地 |
| dated_to | artifact/site → period(文字列) | 時代帰属 |
| archaeologically_linked | site/artifact → myth_episode/deity | 考古学的対応(仮説的) |

### 2.8 祭祀関係

| relation_type | source → target | 意味 |
|---|---|---|
| performed_at | ritual → shrine | 行われる場所 |
| reenacts | ritual → myth_episode | 神話の再演 |
| performed_by | ritual → clan/emperor | 主催者 |

### 2.9 仮説関係

| relation_type | source → target | 意味 |
|---|---|---|
| supports | hypothesis → 任意 node | 支持証拠 |
| contradicts | hypothesis → 任意 node | 反証 |
| proposed_by | hypothesis → text/clan/emperor | 提唱者 |

### 2.10 メタ関係

| relation_type | source → target | 意味 |
|---|---|---|
| merged_into | 任意 node → 任意 node | 同一視確定で統合 |
| supersedes | 任意 node → 任意 node | 改訂で旧版を置換 |

---

## 3. 詳細(主要 relation_type のみ)

### 3.1 enshrined_at(deity → shrine)

- **意味**: 神 X が神社 Y に祀られている。
- **directed**: yes
- **使用例**: `DEI-001(大国主) → enshrined_at → SHR-001(出雲大社)`
- **注意**:
  - 主祭神/配祀神を区別したい場合は `primary_deity_of` / `secondary_deity_of` を使用。
  - 中世に祭神が交代した期間は `valid_from`/`valid_until` を別カラムで記録(関係性 TSV のオプション項目)。

### 3.2 syncretized_with(deity ↔ deity)

- **意味**: 神仏習合・同体視。
- **undirected**: yes
- **使用例**: `DEI-002(スサノオ) ↔ syncretized_with ↔ DEI-NN(牛頭天王)`
- **注意**:
  - 同体視が **史料的事実** と **同体説の主張** を分離するため、`hypothesis_layer` を必ず付与(L0:確定/L1:広く認められる/L2 以上:仮説)。

### 3.3 same_as(deity ↔ deity)

- **意味**: 同一神確定(別名統合)。
- **undirected**: yes
- **使用例**: `DEI-001(大国主) ↔ same_as ↔ DEI-XX(オオナムチ)`
- **注意**:
  - 確定したら片方を `merged_into` で吸収するのが推奨。
  - 学界で異説がある場合は `same_as` を使わず、`syncretized_with` か `regional_variant_of` を使う。

### 3.4 mentioned_in(任意 → text)

- **意味**: 文献に言及される。
- **directed**: yes
- **使用例**: `MYTH-001(国譲り) → mentioned_in → TXT-001(古事記)`、`→ TXT-002(日本書紀)`、`→ TXT-003(出雲国造神賀詞)`
- **注意**:
  - 同じエピソードが複数文献で記述差を持つ場合、**異伝の差異は relation 側の `notes` または独立した `myth_episode_variant` レコードに記録**。
  - 単なる「触れている」と「主出典」は `primary_source_for` で区別。

### 3.5 supports / contradicts(hypothesis → 任意)

- **意味**: 仮説が事実 node を支持/反証。
- **directed**: yes
- **使用例**:
  - `HYP-001(国譲り政治史仮説) → supports → SITE-001(銅鐸祭祀終焉)`
  - `HYP-002(ヤマタノオロチ製鉄民説) → contradicts → ART-XX(古代製鉄炉不在)`
- **注意**:
  - 仮説 layer が L4-L5 の場合、関係を **「肯定的に支持される」と書かない**。「仮説 X はこの事実を引用しがち」程度の関係。

### 3.6 renamed_to(directed、時系列)

- **意味**: 改称関係。
- **使用例**: `SHR-NN(杵築大社) → renamed_to → SHR-001(出雲大社)`(明治 4 年)
- **注意**:
  - 改称前後で同一エンティティとして扱う場合 `merged_into` で統合し、`canonical_name` を最新に。
  - 別エンティティとして残したい場合(歴史的論議のため)は別レコードで `renamed_to` を結ぶ。

---

## 4. 関係性 TSV の必須カラム(`relations.tsv` 側)

| カラム | 必須 | 内容 |
|---|---|---|
| `relation_id` | ○ | `RLN-000001` |
| `source_id` | ○ | source node の master_id |
| `source_type` | ○ | source の node_type |
| `relation_type` | ○ | 本書定義の type |
| `target_id` | ○ | target node の master_id |
| `target_type` | ○ | target の node_type |
| `confidence_level` | ○ | A〜E(史実性) |
| `hypothesis_layer` | ○ | L0〜L5 |
| `temporal_scope` | △ | mythic / estimated / document |
| `valid_from` | △ | 関係成立年 |
| `valid_until` | △ | 関係終了年 |
| `source_reference` | ○ | 出典(text_master_id or 自由記述) |
| `notes` | △ | |

## 5. 検証(出雲編との対応)

| 出雲編で出現する関係 | 該当 relation_type |
|---|---|
| 大国主 が 出雲大社 に祀られる | enshrined_at |
| アメノホヒ が 出雲国造 の祖 | ancestor_deity_of |
| 千家氏 と 北島氏 の分立 | renamed_to or descended_from |
| スサノオ が 牛頭天王 と習合 | syncretized_with |
| 国譲り が 古事記・書紀・神賀詞 に記載 | mentioned_in(複数) |
| タケミナカタ が タケミカヅチ に敗北 | opposed_to + participated_in |
| 銅鐸祭祀終焉 と 国譲り神話 の対応(仮説) | supports(HYP → 両 node) |
| 杵築大社 → 出雲大社 改称 | renamed_to |
| 大国主 = オオナムチ | same_as / has_alias |
| 大物主 と 大国主 の同体論争 | syncretized_with(L2 仮説) |

→ 出雲編で扱った全関係性が表現可能。

## 6. 設計上の判断

### 6.1 双方向関係の扱い
`married_to`、`sibling_of` は意味的に対称だが、**TSV では片方向 1 行のみ記録**。クエリ時に逆引き。`undirected` フラグで区別。

### 6.2 仮説関係を分離
`syncretized_with` を `same_as` と同列にすると、史料確定(L0)と仮説(L2)が混在する。`syncretized_with` には必ず `hypothesis_layer` を付け、L1 以上は仮説扱い。

### 6.3 改称と統合
- 改称が **完全に同一エンティティ**: `merged_into` で統合
- 改称が **別法人/別社** として併存: `renamed_to`(履歴扱い)
- 区別は `notes` で明記
