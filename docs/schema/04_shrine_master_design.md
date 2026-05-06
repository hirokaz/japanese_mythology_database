# 神社マスター設計

`docs/master/shrine_master.tsv` の構造定義と運用ルール。

## 1. 解決すべき問題

| 問題 | 解決手段 |
|---|---|
| 改称(杵築大社→出雲大社) | `old_names` 列、`renamed_to` 関係 |
| 別称(熊野大社=出雲国一宮) | `alternative_names` + `has_title` |
| 神仏習合期の名称(○○権現) | `old_names` に含める |
| 古代社格と近代社格の差 | `shrine_rank_ancient` / `shrine_rank_modern` |
| 摂社・末社・本社 | `parent_shrine_id`(将来追加検討、現行は `notes` で代替) |
| 同名異社 | `address`/`coordinates`/`prefecture` で識別 |

## 2. カラム定義(全 16 列・固定順)

| # | カラム | 必須 | 内容 |
|---|---|---|---|
| 1 | `master_id` | ○ | `SHR-NNN` |
| 2 | `canonical_name` | ○ | 現代の正式名(改称後の名) |
| 3 | `canonical_reading` | ○ | ひらがな |
| 4 | `old_names` | △ | 旧称(時系列順、`\|` 区切り) |
| 5 | `alternative_names` | △ | 別称・通称 |
| 6 | `prefecture` | ○ | 都道府県 |
| 7 | `address` | △ | 現代住所 |
| 8 | `coordinates` | △ | `lat,lon`(小数 4 桁推奨) |
| 9 | `main_deity_ids` | ○ | 主祭神の DEI-ID(`\|` 区切り)。未マスター化は `-` |
| 10 | `secondary_deity_ids` | △ | 配祀神 |
| 11 | `related_clan_ids` | △ | 関連氏族 CLN-ID |
| 12 | `shrine_rank_ancient` | △ | 式内大社/式内小社/国史見在社/出雲国造神賀詞登載社 等 |
| 13 | `shrine_rank_modern` | △ | 官幣大社/別格官幣大社/別表神社 等(明治期社格) |
| 14 | `founding_year_estimated` | △ | 創建推定年 |
| 15 | `founding_legend` | △ | 創建伝承の要約 |
| 16 | `notes` | △ | 論争点・備考 |

## 3. 運用ルール

### 3.1 canonical_name の選定

- **現存最新の正式名** を採用(出雲大社=明治以降、上賀茂神社=明治以降)
- 旧称は `old_names` に時系列で記録(古→新)

### 3.2 神社の同一性判定

「神社が同一」と認める基準:
- 物理的に同じ場所(または明確な遷座記録)
- 祭祀の連続性
- 別法人化していない

→ 改称しても基本同一エンティティ(`old_names` で履歴保存)
→ 完全な分立(千家系 vs 北島系の出雲大社など)は別エンティティ化を検討

### 3.3 摂社・末社の扱い

- **諏訪大社** のように四宮制の場合、各宮を **別レコード**(SHR-NNN)とし、`notes` に親社名を記載。
- 将来的に `parent_shrine_id` を追加してリレーション化予定(運用負荷バランスを見て判断)。

### 3.4 主祭神(main_deity_ids)が未マスター化の場合

- `-` を入れる
- `notes` に祭神名(自然言語)を記載
- 後日 `deity_master.tsv` に追加し、ID 化する(段階移行)

### 3.5 社格の併記

`shrine_rank_ancient` と `shrine_rank_modern` を分離。

例: 出雲大社
- ancient: 名神大社、出雲国造神賀詞奏上社
- modern: 官幣大社、神社本庁の別表神社

## 4. サンプル成果物

`docs/master/shrine_master.tsv` に **28 神社** を投入(目標 20 件超過)。
出雲編で言及される神社を中心に、伊勢・諏訪・宗像・鹿島香取など主要神社を含む。
