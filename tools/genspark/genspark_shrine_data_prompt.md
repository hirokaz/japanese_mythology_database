# 依頼: 日本の神社の「座標」と「詳細情報」を調べて返す (Genspark 用)

添付の `shrine_needs_worklist.csv` にある神社について、不足している情報を信頼できる出典から調べ、
**指定フォーマットの TSV** で返してください。

## 入力 CSV の列
`master_id, canonical_name, reading, prefecture, address, main_deity, rank_ancient, rank_modern, current_coordinates, needs_coordinates, needs_detail`

- `needs_coordinates=Y` … 座標が未登録。本殿(社殿中心)の緯度経度を調べる。
- `needs_detail=Y` … 詳細解説が未作成。由緒・歴史・祭礼等を調べる。
- 両方 `Y` の社は両方、片方だけ `Y` の社はその情報のみでよい。

---

## 出典の優先順位 (必ず明示)
1. 各神社の**公式サイト**
2. **神社本庁「新全国神社検索」** https://jinja-net.jp/jinja-all/
3. **日本語 Wikipedia**(座標テンプレート / 由緒記述)
4. **国土地理院地図** https://maps.gsi.go.jp/ ・**OpenStreetMap**
5. 都道府県神社庁・自治体観光サイト・現地案内
- 一次史料(延喜式神名帳・記紀・風土記・社伝・縁起)は本文典拠として活用。

---

## 出力フォーマット (2 ブロックに分けて TSV で返す)

### ブロック A: 座標 (needs_coordinates=Y の社のみ)
タブ区切り・ヘッダ込み:
```
master_id	latitude	longitude	accuracy	source	source_url
SHR-239	34.9421	135.6789	exact	wikipedia	https://ja.wikipedia.org/wiki/大原野神社
```
- `latitude/longitude`: WGS84・十進度・小数第6位。本殿/社殿中心(市役所・駅で代用しない)
- `accuracy`: `exact`(公式/GSI/OSM/Wikipediaでピンポイント) / `approximate`(住所ジオコーディング+衛星確認) / `not_found`(空欄)
- `source`: `official` / `jinja-honcho` / `wikipedia` / `gsi` / `osm`
- 必ず `prefecture` と整合(県をまたぐ値は誤り)

### ブロック B: 詳細情報 (needs_detail=Y の社のみ)
タブ区切り・ヘッダ込み:
```
shrine_id	extended_summary	history	rituals_culture	primary_sources	external_links
SHR-022	【概要】…【祭神】…【創建・由緒】…【社格・歴史的位置づけ】…	【古代】…【中世】…【近世・近代】…	例祭・特殊神事・建築・文化財・摂末社…	延喜式神名帳|日本書紀|社伝	〇〇神社公式 https://…
```
- `extended_summary`: 【概要】【祭神】【創建・由緒】【社格・歴史的位置づけ】を【】見出しで構造化 (250〜450字)
- `history`: 【古代】【中世】【近世・近代】の沿革 (150〜350字)
- `rituals_culture`: 例祭・特殊神事・建築様式・文化財・摂末社 (150〜350字)
- `primary_sources`: 実在する一次史料・古典をパイプ区切り(延喜式神名帳・記紀・風土記・六国史・社伝・縁起 等)
- `external_links`: 確実な公式 URL のみ(`社名公式 https://…`)。不確実なら `-`
- **フィールド内にタブ・改行を入れない**(句読点で区切る)

---

## 厳守ルール (捏造禁止)
- 確証のない年代・人名・数値・祭神を書かない。不確かは「社伝では」「一説に」「と伝わる」で明示。
- 入力 CSV の `main_deity`(既存登録祭神)と公式社伝が食い違う場合は、**両論併記**し「既存記録は〜だが社伝・公式では〜」と書く(勝手に上書きしない)。
- 出典 URL を必ず添える。Wikipedia/SNS の又聞きでなく一次情報に遡れるものを優先。
- 座標は本殿位置。市中心・駅で代用しない。
- 特定できない/確証がない社は無理に埋めず `not_found` または `-`。

---

## 進め方
- 都道府県単位 or 100 行ずつ分割して返してよい(必ず master_id を付ける)。
- 余計な解説は不要。**ブロック A / ブロック B の TSV 本体**のみ返す。
- 返ってきた TSV は、こちらで `shrine_master.tsv`(coordinates 列)と `shrine_extended.tsv` に取り込みます。

## 背景
本データベースは「ロマン化ではなく構造化」を原則とし、**不正確な情報は未登録より有害**(地図・解説で誤りを広めるため)。確実な出典のある情報のみを出典付きで返してください。
