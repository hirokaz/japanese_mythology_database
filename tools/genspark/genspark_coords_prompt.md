# 依頼: 日本の神社の正確な緯度・経度を調べて TSV で返す

あなた (Genspark) に、日本の神社データベースの **座標 (緯度・経度) 収集** を依頼します。
添付の作業リスト `shrine_coords_worklist.tsv` にある各神社について、正確な座標を調べ、
**指定フォーマットの TSV** で出力してください。

---

## 1. ゴール

各神社の **本殿（または拝殿・社殿中心）の WGS84 緯度経度** を、信頼できる出典に基づいて特定する。

- `status=NEEDED` の 597 社 … **座標が未登録。最優先で調べる。**
- `status=VERIFY(approximate)` の 180 社 … 既存座標は編纂者の概算で **最大 1km 程度ずれている可能性**。出典に基づき検証・補正する（正しければそのままでよい）。

---

## 2. 出典の優先順位 (必ず明示すること)

1. **神社本庁「新全国神社検索」** https://jinja-net.jp/jinja-all/ （鎮座地の確認に使用）
2. **各神社の公式サイト**（アクセス／境内案内ページの座標・地図）
3. **日本語 Wikipedia の座標テンプレート**（記事右上の「北緯○度…東経○度」/ geo マイクロフォーマット）
4. **国土地理院地図 (GSI Maps)** https://maps.gsi.go.jp/
5. **OpenStreetMap** （`amenity=place_of_worship` / `religion=shinto` のノード/ウェイ）
6. **Google Maps**（最終手段。社名で検索しピンの座標）

> 神社本庁サイトは住所中心で座標を持たない場合があります。その場合は **住所を 2〜6 の地図サービスでジオコーディング**し、衛星写真で社殿位置を確認して座標を確定してください。

---

## 3. 品質ルール (厳守)

- **本殿/社殿の位置**を返す。市役所・町中心・最寄り駅の座標で代用しない。
- 座標は **WGS84・十進度・小数第6位まで**（例: `34.668789,135.641497`）。
- 必ず **作業リストの `prefecture`（都道府県）と `address` に整合**することを確認する。県をまたぐ値は誤り。
- **推測で埋めない**。確信が持てない社は座標を空欄にし `status=not_found` とする（捏造厳禁）。
- 同名・別表記の社（例「氣比神宮」と「気比神宮」、伊勢別宮など）は **作業リストの住所で同定**する。住所が同一なら同一座標でよい。
- 出典 URL を 1 件以上必ず記録する。
- 精度区分:
  - `exact` … 公式サイト/GSI/OSM/Wikipedia で社殿位置をピンポイント特定
  - `approximate` … 住所ジオコーディング+衛星確認の概算（境内レベル）
  - `not_found` … 特定できず（座標は空欄）

---

## 4. 出力フォーマット (これだけを返す)

タブ区切り (TSV)、ヘッダ込み。**1 行 1 社**、作業リストの全行に対応させる。

```
master_id	latitude	longitude	accuracy	source	source_url	note
SHR-032	34.668789	135.641497	exact	wikipedia	https://ja.wikipedia.org/wiki/枚岡神社	河内国一宮
SHR-068	36.290600	133.320800	approximate	gsi	https://maps.gsi.go.jp/...	隠岐一宮、住所ジオコーディング
SHR-XXX				not_found		公式・地図で社殿特定できず
```

列の定義:
| 列 | 内容 |
|---|---|
| `master_id` | 作業リストの ID をそのまま |
| `latitude` | 緯度 (十進度, 小数第6位)。not_found は空欄 |
| `longitude` | 経度 (十進度, 小数第6位)。not_found は空欄 |
| `accuracy` | `exact` / `approximate` / `not_found` |
| `source` | `jinja-honcho` / `official` / `wikipedia` / `gsi` / `osm` / `googlemaps` |
| `source_url` | 出典 URL (1件) |
| `note` | 補足 (一宮/別宮/同一住所の重複 等)。任意 |

---

## 5. 進め方の指示

- 都道府県ごとにまとめて処理すると効率的。
- 一度に全 778 行が難しければ **都道府県単位 or 200 行ずつ分割**して返してよい（ただし master_id は必ず付ける）。
- **CSV ではなく TSV** で返す（社名に「,」が含まれるため）。
- 余計な解説は不要。**TSV 本体のみ**を返す（必要なら冒頭に1行コメント可）。

---

## 6. 背景 (品質方針の理由)

このデータベースは「ロマン化ではなく構造化」を原則とし、座標は地図可視化 (Sacred Topology Atlas) に使う。
**「ありそう」で埋めた不正確な座標は、未登録より有害**（地図上で誤った歴史的相関を示唆するため）。
確実な出典のある座標のみを、出典付きで返してほしい。

返ってきた TSV は、こちらで `shrine_master.tsv` の
`coordinates` (= `latitude,longitude`) / `coordinates_accuracy` / `coordinates_source` /
`coordinates_verified_at` / `visualization_confidence` 列に取り込みます。
