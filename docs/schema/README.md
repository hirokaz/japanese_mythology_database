# スキーマ設計 README

本ディレクトリは、日本神話・神道史・古代史データベースを **知識グラフ化可能な構造** として設計するための文書群を格納する。

## 設計の最重要目的

以下の問題を **データ構造レベルで解決** する。

1. 同一神の別名問題(大国主=オオナムチ=八千矛=大物主)
2. 神社名変更問題(杵築大社→出雲大社)
3. 豪族の別表記問題(中臣氏→藤原氏、中臣連)
4. 神仏習合による名称変化(スサノオ=牛頭天王)
5. 神話時間と史実時間の混在(神代 vs CE 712)
6. 社伝と学術説の混在
7. 地方伝承と中央史観の混在
8. 仮説と史料の混在

## 設計の二層構造

### Layer A: ドキュメント層(年表・編)
- `docs/<編名>/` — 「出来事レベル」のレコード(現在の出雲編 161 行)
- 1 行 = 1 イベント、29 カラム
- 既存 ID: `IZM-001` 等の編コード

### Layer B: マスター・関係性層(知識グラフ)
- `docs/master/` — エンティティのマスターデータ(神・神社・豪族・…)
- `docs/relations/` — エンティティ間の関係性
- `docs/schema/` — スキーマ定義文書

両層は ID で相互参照する。Layer A の各行は、Layer B のマスター ID を参照する形に正規化していく(段階的移行)。

## ファイル一覧

| # | ファイル | 内容 |
|---|---|---|
| 00 | `00_id_scheme.md` | ID 命名規則 |
| 01 | `01_node_types.md` + `.tsv` | ノード種別定義 |
| 02 | `02_relation_types.md` + `.tsv` | エッジ(関係性)定義 |
| 03 | `03_deity_master_design.md` | 神名マスター設計 |
| 04 | `04_shrine_master_design.md` | 神社マスター設計 |
| 05 | `05_clan_master_design.md` | 豪族マスター設計 |
| 06 | `06_time_axes.md` | 三層時間軸設計 |
| 07 | `07_source_reliability.md` | 出典強度設計 |
| 08 | `08_hypothesis_layer.md` | 仮説レイヤー設計 |
| 09 | `09_relation_db.md` | 関係性 DB 設計 |
| 10 | `10_future_architectures.md` | 将来的アーキテクチャ |

## マスターファイル一覧(`docs/master/`)

| ファイル | エンティティ | ID プレフィックス |
|---|---|---|
| `deity_master.tsv` | 神 | `DEI-` |
| `shrine_master.tsv` | 神社 | `SHR-` |
| `clan_master.tsv` | 豪族・氏族 | `CLN-` |
| `emperor_master.tsv` | 皇族 | `EMP-` |
| `myth_episode_master.tsv` | 神話エピソード | `MYTH-` |
| `event_master.tsv` | 歴史事象 | `EVT-` |
| `site_master.tsv` | 考古遺跡 | `SITE-` |
| `artifact_master.tsv` | 考古資料 | `ART-` |
| `ritual_master.tsv` | 祭祀 | `RIT-` |
| `region_master.tsv` | 地域 | `REG-` |
| `text_master.tsv` | 文献 | `TXT-` |
| `hypothesis_master.tsv` | 仮説 | `HYP-` |
| `title_master.tsv` | 称号・神格カテゴリ | `TTL-` |

## 関係性ファイル(`docs/relations/`)

| ファイル | 内容 |
|---|---|
| `relations.tsv` | 全関係性レコード(`RLN-NNNNNN`) |
| `relations_sample.tsv` | サンプル(設計検証用) |

## 設計原則

1. **不可逆性の保護**: 一度確定した ID は再利用しない。エンティティが統合されても、旧 ID から新 ID への参照を残す。
2. **複数説併記の徹底**: 同体・別体論争、改称論争などは「複数説」「relation の confidence_level」で表現。
3. **時間軸の明示的分離**: 神話時間 / 推定時間 / 文献成立時間 を独立カラムで持つ。
4. **出典の必須化**: 全ての主張に source_reference を紐付ける。
5. **AI/LLM 統合前提**: 全ファイルは UTF-8(BOM なし)、LF 改行、TSV(タブ区切り)で機械可読。

## 使い方(編纂者向け)

1. 新しい情報を追加する際は、まず該当エンティティが master に存在するか確認。
2. 存在しなければ、master に新規 ID で追加。
3. 既存編の TSV(年表)の関連カラムには master ID を記載(段階的移行)。
4. 関係性は `relations.tsv` に追加。
5. 仮説的な主張は `hypothesis_master.tsv` に立項し、関係性で結ぶ。
