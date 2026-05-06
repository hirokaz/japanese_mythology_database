# 関係性 DB 設計

Excel 上で知識グラフを扱うための `docs/relations/relations.tsv` の構造を確定する。

## 1. ファイル構成

| ファイル | 用途 |
|---|---|
| `docs/relations/relations.tsv` | 全関係性の本体(将来肥大化) |
| `docs/relations/relations_sample.tsv` | サンプル・設計検証用(本 issue で投入) |

将来、件数増加に応じて relation_type 別に分割するか検討(`relations_kinship.tsv`、`relations_shrine.tsv` 等)。

## 2. カラム定義(全 13 列・固定順)

| # | カラム | 必須 | 内容 |
|---|---|---|---|
| 1 | `relation_id` | ○ | `RLN-NNNNNN`(6 桁) |
| 2 | `source_id` | ○ | source ノードの master_id |
| 3 | `source_type` | ○ | source の node_type(deity/shrine 等) |
| 4 | `relation_type` | ○ | `02_relation_types.md` で定義された type |
| 5 | `target_id` | ○ | target ノードの master_id |
| 6 | `target_type` | ○ | target の node_type |
| 7 | `confidence_level` | ○ | A〜E(史実性) |
| 8 | `hypothesis_layer` | ○ | L0〜L5 |
| 9 | `temporal_scope` | △ | mythic / estimated / document |
| 10 | `valid_from` | △ | 関係成立時点(西暦 or `神代` 等) |
| 11 | `valid_until` | △ | 関係終了時点 |
| 12 | `source_reference` | ○ | TXT-ID または自由記述 |
| 13 | `notes` | △ | 備考・論争点 |

## 3. 運用ルール

### 3.1 relation_id の採番

- 連番 6 桁(`RLN-000001` 〜 `RLN-999999`)
- 削除しない(不可逆)
- 将来桁あふれは 7 桁化

### 3.2 双方向関係の扱い

`02_relation_types.md` で `undirected` フラグが立つ type は、**片方向 1 行のみ記録**。クエリ時に逆引き。

例: `married_to`
- `DEI-001 大国主 → married_to → DEI-022 ヌナカワヒメ` (1 行のみ)
- 逆方向 `DEI-022 → married_to → DEI-001` は記録しない

### 3.3 confidence_level と hypothesis_layer の必須化

両軸を **必ず付与**。これにより、データを読む際に **史実性** と **解釈強度** の二軸で判断できる。

例:
- `enshrined_at` 関係: 多くは confidence=B、layer=L0(現代の社伝記載は事実)
- `archaeologically_linked` 関係(銅鐸→国譲り): confidence=B、layer=L2(仮説)

### 3.4 複数出典がある関係

同じ関係(source-target-relation_type が同一)で出典が複数ある場合:
- **同一 relation_id の `source_reference` に `|` 区切りで複数記載**
- または **複数 relation_id を立て、別 source ごとに記録**

通常は前者で十分。confidence/layer が出典で異なる場合は後者。

### 3.5 「不明」「不確定」の関係

- 関係の存在が不確定な場合: 記録しない(将来確定したら追加)
- 関係はあるが詳細不明: confidence=`E`、`notes` に「詳細不明」

## 4. サンプル成果物

`docs/relations/relations_sample.tsv` に **15 関係** を投入。出雲編・各マスターとの整合性を検証。

各サンプルは以下の代表的パターンを含む:
- 神社祭祀(enshrined_at)
- 系譜(parent_of, married_to)
- 神格同体(syncretized_with、same_as)
- 政治支配(renamed_to)
- 神話事象(participated_in)
- 文献出典(mentioned_in)
- 仮説関係(supports)
- 考古関係(found_at, archaeologically_linked)
- 祭祀関係(reenacts)

## 5. 連結検証

サンプル関係に登場する master_id が、対応するマスター TSV に確実に存在することを目視確認:

| relation の中の master_id | 確認先 |
|---|---|
| DEI-001 大国主 | deity_master.tsv ✓ |
| DEI-002 スサノオ | deity_master.tsv ✓ |
| DEI-010 タケミナカタ | deity_master.tsv ✓ |
| DEI-011 タケミカヅチ | deity_master.tsv ✓ |
| DEI-022 ヌナカワヒメ | deity_master.tsv ✓ |
| DEI-030 牛頭天王 | deity_master.tsv ✓ |
| SHR-001 出雲大社 | shrine_master.tsv ✓ |
| SHR-006 諏訪大社 | shrine_master.tsv ✓ |
| CLN-001 出雲国造 | clan_master.tsv ✓ |
| CLN-008 藤原氏 | clan_master.tsv ✓ |
| HYP-004 国譲り政治史仮説 | hypothesis_master.tsv ✓ |
| HYP-006 翡翠ロード仮説 | hypothesis_master.tsv ✓ |

## 6. クエリ例(将来の知識グラフ化を見据えて)

### 6.1 ある神を祀る神社一覧

`source_id = DEI-001 AND relation_type IN (enshrined_at, primary_deity_of)` で検索。
target_id 一覧を shrine_master と JOIN。

### 6.2 ある氏族の祖神

`source_id = CLN-NNN AND relation_type = descended_from` で target_id を取得。

### 6.3 仮説の証拠ネットワーク

`source_id = HYP-NNN AND relation_type IN (supports, contradicts)` で target_id を一覧化、各事実と仮説の関係を可視化。

### 6.4 異伝の比較(国譲り)

`target_id = MYTH-001 AND relation_type = mentioned_in` で文献を一覧化。
各文献と異伝差を比較。
