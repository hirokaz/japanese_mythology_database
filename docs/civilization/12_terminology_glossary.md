# 用語集 (Terminology Glossary)

本データベースで使用する**抽象概念**の定義集。DISC-005 で Codex から指摘された「OS 比喩の過剰一般化」を防ぐため、概念を細分化して用語を厳格化する。

最終更新: 2026-05-25 (DISC-005 確定)

---

## 中核概念

### OS (Operating System)
**複数階層を貫通する制度的記憶インターフェースの全体**。最上位カテゴリ。

例:
- 「日本文明 OS」 = 神話・祭祀・氏族・物流・暦・外交を貫通する全体システム
- 「縄文的 OS」 = 磐座・神奈備・在地神を中心とする原始システム
- 「律令的 OS」 = 神祇官・延喜式を中心とする中央集権システム

**注意**: 「OS」は最上位のみで使用。それ以下の構成要素は protocol / interface / synchronization 等に分解する。

### Protocol
**特定機能を実現する手続き規約**。OS の構成要素。

例:
- 神賀詞奏上プロトコル (霊亀 2 年〜寛弘 2 年で 26 例)
- 式年遷宮プロトコル (持統 4 年〜現在、20 年周期)
- 火継神事プロトコル (出雲国造代替わり時、熊野大社にて執行)
- 神階授与プロトコル (朝廷 → 地方神社、『三代実録』他に数千例)

### Interface
**OS / Protocol の閲覧・操作面**。

例:
- 神社 = 場 (place) の interface (特定座標と神聖性の対応)
- 延喜式神名帳 = 2861 社の一覧 interface
- 古事記・日本書紀 = 神話 OS の文書 interface

### Synchronization
**周期的状態更新の機構**。

例:
- 式年遷宮 (20 年周期、伊勢・住吉等)
- 御柱祭 (7 年周期、諏訪)
- 大嘗祭 (天皇即位毎)
- 月次祭 (月次、伊勢神宮)

### Authority
**祭祀権・統治権の所在**。

例:
- 出雲国造祭祀権 (天穂日命後裔家、神賀詞奏上で確認)
- 諏訪上社大祝 (現人神制度、明治祭政分離まで)
- 春日大社祭祀権 (藤原氏氏神)
- 神階授与権 (朝廷)

### Persistence
**長期維持の機構**。

例:
- 出雲国造家 84 代継承 (千家・北島)
- 諏訪上社守矢神長官 78 代継承
- 籠神社海部氏 83 代継承 (海部氏系図、国宝)
- 阿蘇神社阿蘇氏 80 代以上継承

### Event
**一回的事象 (時刻が特定可能)**。

例:
- 道鏡事件 (神護景雲 3 年 = 769)
- 八幡大菩薩号授与 (天平勝宝元年 = 749)
- 丁未の乱 (用明天皇 2 年 = 587)
- 第 1 回式年遷宮 (持統 4 年 = 690)

→ Persistence (長期継続) と Event (一回的) を区別。

---

## 神話・構造関連

### Mythologem (Codex 提案、DISC-005 採用)
**神話素 = 個別神話を超えた抽象パターン**。

例:
- **境界横断** (living↔dead、mortal↔divine、center↔periphery)
- **贈与交換** (gift → counter-gift → political alliance)
- **正統性継承** (predecessor → object/symbol → successor)
- **死と再生** (death → ritual → renewal)
- **周期更新** (cycle → renewal → preservation)

→ motif_db.tsv (Level 1) の上位抽象層 (Level 2) として `mythologem_master.tsv` を後続 PR で実装。

### Motif
**個別神話に繰り返し現れる説話パターン**。motif_db.tsv 500 件で実装。

例: MOTIF-001 国譲り / MOTIF-002 天孫降臨 / MOTIF-026 八岐大蛇

### Executable Protocol (Codex 提案、DISC-005 採用)
**祭祀 = 実行可能な手続き**として構造化可能なもの。

定義要素:
- `actor` 執行者 (祭主・大祝・天皇等)
- `role` 役割 (奉斎・司会・遥拝等)
- `authority_source` 権威の出所 (国造神賀詞・延喜式等)
- `sequence` 手続きの順序
- `timing` 暦的タイミング (旧暦/新暦/周期)
- `place` 執行場所
- `offering` 供物 (神饌・幣帛・鹿頭等)
- `state_change` 何が更新されるか

→ `festival_master.tsv` (40 件) を Codex 提案で拡張予定。

### Sync Event (神社 Network Synchronization)
**神社ネットワーク間の動的イベント**。

種類:
- **divergence event** (分祀): 例 宇佐 → 石清水 → 鶴岡
- **propagation event** (勧請): 新規 relation type `kanjo_from` で実装予定
- **authority broadcast** (神階授与): 新規 relation type `shinkai_to` で実装予定
- **sync event** (式年遷宮): 周期更新

---

## 仮説・推論関連

### Verified Status (DISC-003 確定、4 値)
**実在性検証状態**。

- `verified` 人手 or 外部参照で実在確認済
- `under_review` 検証中 (デフォルト)
- `unverified` 未検証 (AI 生成プレースホルダーの疑いあり)
- `known_fabrication` 架空判明 (L3 内部のみ可視)

### Hypothesis Layer (既存、L0-L5)
**仮説強度**。

- L0 史料記載 / L1 一般解釈 / L2 学術仮説 / L3 民間伝承 / L4 大胆仮説 / L5 検証困難

### Confidence Level (既存、A-E)
**史実性**。

- A 文献+考古双方裏付け / B 文献記録あり / C 神話・伝承 / D 後世創作可能性 / E 推測

### Inference Type (Codex 提案、DISC-005 採用、4 軸目)
**推論性質**。Speculation 自己増殖を抑制するため `verified_status` / `hypothesis_layer` / `confidence_level` と独立した 4 軸目として導入。

- `source_backed` 一次史料に直接記載
- `inferential` 史料からの妥当な推論
- `speculative` 検証困難な仮説 (L4-L5)
- `symbolic` 象徴的・神話的解釈 (motif / mythologem)

→ 4 軸独立により、各エントリの**性質を多面的に把握**可能。

---

## OS Type 列挙 (Codex 提案、DISC-005 採用)

二項対立 (縄文 vs 律令) は綺麗すぎるため、**列挙型 + `mixed` 許容**:

- `jomon` 縄文的 OS (磐座・神奈備・在地神)
- `ritsuryo` 律令的 OS (神祇官・延喜式)
- `shinbutsu` 神仏習合 OS (本地垂迹)
- `chusei_shinto` 中世神道 OS (吉田・度会)
- `kokugaku` 国学 OS (本居宣長・平田篤胤)
- `meiji_kokka` 国家神道 OS
- `mixed` 混交 (**実態の大半はこれ**)
- `unknown` 不明 (デフォルト)

具体例:
- 三輪山 (大神神社) = `mixed` (磐座 jomon + 大物主神話 ritsuryo)
- 諏訪大社上社 = `mixed` (守矢神長官 jomon + 大祝制度 chusei)
- 伊勢神宮 = `ritsuryo` 中心 (内宮起源に jomon 要素)

---

## 規律 (Codex 最終提言、DISC-005 採用)

「**ロマン化ではなく構造化**」を維持するために以下の分離を堅持:

```
source     (一次史料に裏付けあり)
 ↑↓
abstraction (motif / mythologem 等の抽象化)
 ↑↓
inference  (妥当な推論)
 ↑↓
speculation (検証困難な仮説、L4-L5)
```

各エントリは**どの段階に属するか**を `inference_type` field で明示。AI が speculative を増殖しても、構造的に区別される。

---

## 関連

- DISC-005 (#238) 解決報告: `docs/discussions/DISC-005_resolution.md`
- DISC-002 (#178) RISK-31 (AI 生成プレースホルダー混入)
- DISC-003 (#179) verified_status 公開レイヤ
- CLAUDE.md §4 編集ルール
