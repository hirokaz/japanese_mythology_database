# Web Atlas 設計(7+ 可視化パターン)

本書は **将来公開する Web Atlas** の設計仕様を確定する。Neo4j(`#125`)を背後 DB として、7+ パターンのインタラクティブ可視化を提供する。

## 0. 全体ゴール

- 一般読者・研究者・教育機関向けに、本データベースを **公開・可視化**
- Cypher クエリの結果を Web UI で対話操作可能に
- インタラクティブ年表 / 神社地図 / 系譜 / 神話ルート / 海路 / 修験道 / 神話モチーフ分布 を網羅

## 1. 全体 UX フロー(S01)

### 1.1 エントリーポイント

```
Top → 検索バー(全文検索) → 個別 entity ページ
   ↓
   ├── 神 → 系譜・祭祀社 → 関連神話
   ├── 神社 → 主祭神・由緒 → 周辺地図 → 巡礼路
   ├── 氏族 → 系譜・祭祀権 → 政治史
   ├── 神話 → 異伝対比 → 関連 motif
   ├── 地域 → 祭祀圏 → ネットワーク
   └── 仮説 → 支持/反証事実 → 競合仮説
```

### 1.2 全 Atlas のナビゲーション

```
Top
 ├── 1. インタラクティブ年表(縄文〜鎌倉、5 軸切替)
 ├── 2. 神社ネットワーク地図(地理 / 祭神 / 系統)
 ├── 3. 豪族ネットワーク図(系譜+婚姻+軍事+祭祀)
 ├── 4. 神話ルート可視化(神武東征 / 国譲り / オロチ)
 ├── 5. 海上交易ルート(沖ノ島 / 補陀落 / 対朝鮮)
 ├── 6. 修験道ルート(出羽 / 大峰 / 熊野 / 白山 / 富士)
 ├── 7. 神話モチーフ分布マップ(蛇神 / 海神 / 太陽神 等)
 ├── 8. 文明圏俯瞰(10 圏統合ビュー)
 └── 9. 仮説層別ビュー(L0-L5 + F0、確度別フィルタ)
```

## 2. インタラクティブ年表(S02)

### 2.1 機能要件

- 縦軸: 西暦(BCE 14000 縄文草創期 → CE 1333 鎌倉終焉)
- 横軸: 5 軸タブ切替(mythic / ritual / political / archaeological / literary)
- 期間ズーム(1000年単位 → 100年単位 → 10年単位)
- 事象クリックで個別ページへ遷移
- フィルタ: 仮説層 L0-L5 + F0、地域別、神社別

### 2.2 必要 Cypher

```cypher
// 政治時間軸の事象
MATCH (e:Event)-[:DURING_ERA]->(re:RegnalEra)
RETURN e.canonicalName, e.estimatedHistoricalTime, re.canonicalName
ORDER BY e.estimatedHistoricalTime;

// 考古時間軸の遺跡
MATCH (s:Site)
WHERE s.era IS NOT NULL
RETURN s.canonicalName, s.era, s.coordinates;
```

### 2.3 技術スタック

- D3.js timeline + zoom
- データソース: Neo4j REST/Bolt → JSON

## 3. 神社ネットワーク地図(S03)

### 3.1 機能要件

- Mapbox GL JS で全国地図
- 各神社をピンで表示(coordinates プロパティ)
- フィルタ: 都道府県 / 主祭神 / 社格 / 神社系統
- 線で接続: shrine_lineage(分霊・勧請) / has_subordinate_shrine
- クラスタリング(zoom out 時)

### 3.2 Cypher

```cypher
MATCH (s:Shrine)
WHERE s.coordinates IS NOT NULL AND s.prefecture = $prefecture
OPTIONAL MATCH (s)-[:KANJO_FROM]->(head:Shrine)
RETURN s, head;
```

## 4. 豪族ネットワーク図(S04)

### 4.1 機能要件

- D3.js force-layout で氏族ネットワーク
- ノード色: 中央/地方/祭祀/技術/渡来 で分類
- エッジ: descended_from(系譜) / married_to(婚姻) / allied_with(軍事) / holds_role(祭祀)
- 時代スライダー: ある時代の氏族関係を抽出

### 4.2 Cypher

```cypher
MATCH (c:Clan)-[r:DESCENDED_FROM|MARRIAGE_ALLIANCE|ALLIED_WITH|HOLDS_ROLE]-(other)
WHERE c.peakPeriod = $period
RETURN c, r, other;
```

## 5. 神話ルート可視化(S05)

### 5.1 機能要件

- 主要神話ルート 5+:
  - 神武東征(日向 → 紀伊 → 熊野 → 大和)
  - 国譲り経路(出雲 → 中津国)
  - 八岐大蛇退治(出雲 斐伊川流域)
  - 神功皇后航海(筑紫 → 朝鮮半島)
  - ヤマトタケル東征(大和 → 東国)
- 地図上に経路線 + 各停留点の神話エピソード

### 5.2 Cypher

```cypher
MATCH (m:MythEpisode {canonicalName:'神武東征'})
   -[:OCCURRED_IN]->(r:Region)
RETURN r.canonicalName, r.coordinates;
```

## 6. 海上交易ルート(S06)

### 6.1 機能要件

- seafaring_route / sea_lane / port を地図化
- 古墳期 / 飛鳥奈良期 / 平安期 で時代切替
- 沖ノ島祭祀の段階変遷を時系列アニメーション

### 6.2 Cypher

```cypher
MATCH (sf:SeafaringRoute)-[:CONNECTS_REGIONS]->(r:Region)
MATCH (sf)-[:WORKSHOP_PERIOD]->(dp:DynasticPeriod)
RETURN sf, r, dp;
```

## 7. 修験道ルート(S07)

### 7.1 機能要件

- 6 修験霊場(出羽三山 / 大峰 / 熊野 / 白山 / 富士 / 戸隠)
- 各派(本山派 / 当山派 / 羽黒派 / 英彦山派)別表示
- 巡礼路 + 役小角伝(7C)から 1872 廃止令までのタイムライン

### 7.2 Cypher

```cypher
MATCH (s:ShugenjaSchool)<-[:SHUGENJA_SCHOOL_OF]-(pl:PriestLineage)
   -[:LINEAGE_OF_ROLE]->(pr:PriestRole)
   -[:ROLE_AT]->(sh:Shrine)
RETURN s, pl, pr, sh, sh.coordinates;
```

## 8. 神話モチーフ分布マップ(S08)

### 8.1 機能要件

- 主要 motif(蛇神 / 海神 / 太陽神 / 鍛冶神 / 国譲り型 等)
- 各 motif の地域分布をヒートマップ化
- 中央⇄地方の二項構造を可視化(国譲り中央版 vs 国引き地方版)

### 8.2 Cypher

```cypher
MATCH (m:MotifAbstract {canonicalName:$motif})
   -[:LOCALIZED_IN]->(r:Region)
RETURN r.canonicalName, r.coordinates, count(m) AS density;
```

## 9. データソース・技術スタック(S09)

### 9.1 推奨スタック

| 層 | 技術 |
|---|---|
| DB | Neo4j Community 5.x |
| API | Neo4j HTTP API / GraphQL Library / FastAPI |
| Frontend | React + TypeScript |
| 可視化 | D3.js / neovis.js / Mapbox GL JS / vis-timeline |
| 地図 | OpenStreetMap タイル / 国土地理院 タイル |
| Hosting | GitHub Pages(静的)/ Vercel(動的)/ AWS S3+CloudFront |

### 9.2 データ更新フロー

```
Repository TSV
   ↓ pipeline/tsv2csv.py
Staging CSV
   ↓ LOAD CSV
Neo4j
   ↓ API
Web Atlas
```

## 10. 公開ライセンス・出典クレジット(S10)

### 10.1 ライセンス

- コード: MIT
- データ(TSV/Cypher): **CC-BY 4.0**(出典明記で自由利用可)
- 神社写真等は別途権利者に確認

### 10.2 出典クレジット

- 各 entity ページの末尾に `sourceReference` を表示
- ページ頭で「本データは古事記・日本書紀・延喜式 等を整理したものです。L4-L5 仮説は『興味深いが論証不可能』として扱っています」と明示
- 偽書(F0)由来の言及は明示

### 10.3 民俗学的配慮

- 神社・氏族・地方伝承への敬意
- 中央史観で地方を矮小化しない記述
- 偽書を信頼層から分離

---

## 11. 結論

| 項目 | 結果 |
|---|---|
| 全体 UX フロー設計 | ✅ S01 |
| インタラクティブ年表(5 軸) | ✅ S02 |
| 神社ネットワーク地図 | ✅ S03 |
| 豪族ネットワーク図 | ✅ S04 |
| 神話ルート可視化(5+) | ✅ S05 |
| 海上交易ルート | ✅ S06 |
| 修験道ルート | ✅ S07 |
| 神話モチーフ分布マップ | ✅ S08 |
| 技術スタック選定 | ✅ S09 |
| ライセンス・出典クレジット規程 | ✅ S10 |

→ **issue #126 全 10 サブタスク完了**。Phase 5 実装フェーズへの引き継ぎ準備完了。
