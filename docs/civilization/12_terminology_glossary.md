# 用語集 (Terminology Glossary)

本データベースで使用する**抽象概念**の定義集。DISC-005 で Codex から指摘された「OS 比喩の過剰一般化」を防ぐため、概念を細分化して用語を厳格化する。

最終更新: 2026-05-25 (DISC-005〜013 確定)

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

## DISC-006 由来 (verified_status epistemology)

### Institutionally Verifiable
**「制度・史料・現存組織により存在確認可能」**な状態。`historically_true` (歴史的真実そのもの) とは区別する。

例:
- 式内社・名神大社 → institutionally_verifiable (古代制度に記載)
- 一宮 → institutionally_verifiable (中世以降の制度的確立)
- 神社庁公式に登録 → institutionally_verifiable (現代組織で実在確認)

→ `verified_status = verified` は institutional verifiability を意味し、歴史的真実性は別問題。

### Verification Dimension (Codex 提案、entity 別意味)
entity ごとに「検証対象」の意味が異なる:

| Entity | Dimension | 検証対象 |
|---|---|---|
| shrine | `existence` | 実在性 (神社庁・公式サイト・現地確認) |
| deity | `textual` | 文献・伝統 attestation (記紀・延喜式) |
| motif | `interpretive` | 解釈の安定性 (研究者間で確立) |
| clan | `genealogical` | 系譜証拠の質 (公卿補任・尊卑分脈) |
| ritual / festival | `ritual` | 祭祀継承の実証 (文化財指定・代々継承) |

### Knowledge Provenance
**verification の出所 + 時刻 + 検証者を記録**することで、将来の再検証や情報更新を可能にする原則。

- `verified_at`: ISO8601
- `verified_by`: agent | reviewer | claude | codex | human
- `verification_source`: URL or 出典

---

## DISC-007 由来 (mythologem layer)

### Mythologem (神話素)
個別神話を超えた**抽象パターン**。motif (Level 1) の上位、政治構造 (Level 3) の下位の Level 2。

例: boundary_traversal / legitimacy_transfer / concealment_revelation / marriage_integration / exchange_gift / death_rebirth / center_periphery_integration / periodic_renewal / divine_descent / succession_dispute

### Multi-Framework Coexistence (Codex 提案)
複数の神話理論を**並存タグ付与**する。単一理論固定回避。

theoretical_framework 候補:
- `structuralist` (レヴィ=ストロース型)
- `archetypal` (ユング・キャンベル型)
- `ritual-functional` (フレイザー・マリノフスキー型)
- `political-legitimacy` (実用主義型、本 DB の中核)

### Multi-Layered Structural Overlays (Codex 規律)
**「全神話を抽象構造へ還元できる」幻想を排する**原則。日本神話は地方差・時代差・編集層・習合が大きく、single canonical interpretation ではなく multi-layered overlays として扱う。

→ 1 つの motif が複数 mythologem に属する**多対多接続**を採用 (Codex 推奨)。

---

## DISC-008 由来 (sacred topology)

### Sacred Topology (Codex 概念)
神社・祭祀地が形成する**地理的構造**。単なる地点配置ではなく、network として意味を持つ topology:

- maritime_corridors: 海上守護神社網 (住吉系・宗像・志賀海・気比・若狭彦)
- mountain_worship_chains: 山岳信仰連環 (出羽三山・吉野・高野・伯耆大山)
- river_basin_ritual: 河川流域祭祀
- fault_line_alignments: 断層と神社 (中央構造線・諏訪・大神・剣山)
- pilgrimage_paths: 巡礼路 (熊野古道・西国 33・四国 88)

### Evolving Ritual Topology (Codex 概念)
**時間軸を持つ神社ネットワーク変化**。static atlas ではなく temporal graph:

- 勧請 event (宇佐 → 石清水 859 → 鶴岡 1063)
- 分祀 event (八幡 4 万社の段階的展開)
- 遷宮 event (伊勢式年遷宮 62 回)
- 神階授与 event (三代実録数千件)
- 一宮化 event (8 世紀後半)

### Visualization Confidence (Codex 提案)
GIS layer ごとの**根拠強度**を明示:
- archaeological (考古学根拠)
- textual (文献根拠)
- inferred (妥当な推論)
- speculative (検証困難仮説)

### Narrative Intoxication 警告 (Codex 規律)
GIS が引き起こす**因果誤認のリスク**。「線が引ける・近くにある・分布が似ている」だけで歴史的因果を断定しない。

UI 表示:
- 実線 = source-backed relation
- 点線 = inferred relation
- グレー = speculative correlation

---

## DISC-009 由来 (anti-hallucination architecture)

### Pattern Completion Hallucination
AI が旧国名・神格・地名・社格等の **pattern から plausible but nonexistent entity を生成する現象**。本 DB の最大データ品質リスク (PR #229/#231 で 284 件削除済)。

### Plausibility ≠ Evidence (Codex 強調)
「**ありそう**」を **evidence とみなさない** 原則。AI generic synthesis を抑制するために generic plausibility を意図的に reject する。

### Fingerprint Detection (escalation review)
主祭神 + rank + founded + notes の hash 衝突で大量類似を検出。ただし**八幡・稲荷・天神は実際に高類似 network が存在**するため、hard reject ではなく escalation review を採用 (Codex 推奨)。

### Too Systematic = Suspicious
AI は網羅・対称性・均一性を過剰生成するが、実世界の神社分布は **非対称・欠損・偏在・歴史的断絶** を含む。systematic completeness 自体が suspicious signal。

### Relation Hallucination
entity 同士を「**意味ありげに繋いでしまう**」現象。graph visualization と結合で persuasive power が極めて強い。Codex 指摘の通り **entity hallucination より将来的に危険**。

### Epistemic Anomaly Detection
sudden dense clusters / symmetric expansion / identical note structures / unusual relation fan-out / ontology drift 等の **graph-level 異常**を検出する手法 (Codex 提案、Phase 3+)。

### Provenance Entropy
entity / relation が **多様な independent source に依存**しているか、単一 AI inference か、repeated copy chain かを定量化する **trust analysis** (Codex 提案)。

### Anti-Hallucination Architecture
単一 CI チェックではなく、**PR 時点予防 + relation provenance + graph anomaly + provenance entropy** を統合した**多層防御**。詳細は `docs/discussions/DISC-009_resolution.md`。

---

## DISC-010 由来 (graph epistemics)

### Label-Based Node (Codex 強推奨)
Neo4j の **`(:Shrine)`, `(:Deity)` 等の label-based 設計**。「Entity + type property」方式は ontology 崩壊リスク (Cypher query readability / typo risk / ontology clarity の観点)。multi-label `(:Entity:Shrine)` も有効。

### Relation Ontology (6 Category)
relation_type の増加に伴い、relation 自体を ontology 化:
- `ritual_relation` (祭祀関係)
- `lineage_relation` (系譜関係)
- `authority_relation` (権威関係)
- `geographic_relation` (地理関係)
- `symbolic_relation` (象徴関係、default query 除外候補)
- `synchronization_relation` (同期関係、temporal graph 用)

### Hypothesis-Aware Query
`r.hypothesis_layer IN ['L0','L1']` や `r.inference_type <> 'symbolic'` 等、4 軸 (hypothesis_layer / confidence_level / verified_status / inference_type) でフィルタする **本 DB 独自の graph query 様式**。Codex 評価「普通の graph DB ではあまりない、かなり強い」。

### Evolving Civilization Graph
勧請・分祀・遷宮・神階授与・一宮化等を **graph mutation event** として時間軸で記録する temporal graph。static atlas からの脱却 (Codex 強調)。

### False Coherence (Codex 警告)
graph visualization により「**繋がって見える**」だけで**因果・歴史的継承・実在関係を錯覚**する現象。特に symbolic relation / mythologem relation / inferred topology で危険。visualization 必須対策: relation confidence / source visibility / symbolic warning / layer filtering。

### Pedagogically Safe Graph
Persona C 教育者向けに **`verified_status='verified' AND hypothesis_layer='L0' AND inference_type<>'symbolic'`** でフィルタした graph view。no speculative clustering。

### Contradiction-Rich Query
Persona A 研究者向けに **反対説・併記説・competing interpretations** を含む query。Codex 提案。

---

## DISC-011 由来 (public epistemology)

### Authority Illusion (Codex 最重要警告)
公開された graph / map / ontology / badge が「**公式見解**」「**学術 consensus**」「**神社認定**」のように見えてしまう錯覚。本 DB の公開設計で最大リスク。

### Interpretation Disclaimer
「本記述は編纂者解釈を含み、公式見解ではない」旨を **UI 各エントリ画面に明示**する標準警告。authority illusion 対策の中核。

### Curated Relational Interpretation
本 DB が含む**知的編集性** (relation selection / ontology design / mythologem abstraction / verification layer)。単純 raw data ではない。**CC0 ではなく CC BY-SA を選ぶ根拠**。

### Epistemic Neutrality
**どの政治立場・宗教立場・学術派閥にも回収されない知識的中立性**。本 DB の公開規律。国家神道復活運動・排外主義・神話 literalism・pseudo-history 等への悪用に対する積極的防御。

### Provenance-Preserving Publication
attribution / source / inference_type を**維持したまま公開**する原則。CC0 ではなく CC BY-SA 4.0 を選ぶ根拠 (Codex 採用)。

### AI Contributor Governance
「**誰が書いたか**」より「**どう生成されたか**」を重視する寄稿者規律:
- AI-generated PR disclosure 必須
- provenance required (一次史料への遡及)
- no unsourced mass addition
- symbolic relation review mandatory

---

## DISC-012 由来 (temporal persistence)

### Ritual Persistence
**反復による文明継続**。年中祭祀・周期祭祀 (式年遷宮 / 御柱祭 / 大嘗祭) を通じた continuity。西洋的 archive persistence (文書・法・institution による継続) との対比 (Codex 強調)。

### Archive Persistence
**文書・法・institution による継続**。西洋近代の典型的 civilization persistence model。日本文明への過剰投影は要警戒。

### Process Ontology
**entity = process not substance** という哲学的基盤。Ship of Theseus 問題 (式年遷宮で 20 年毎に建て替えられる伊勢神宮は同一か?) に対応。Codex Round 2 で提起。

### 5 軸 Continuity
**物理 / 儀礼 / 制度 / 物語 / 位置** の独立 continuity 評価。各軸の値域: `maintained` / `partial_rebuild` / `rebuilt` / `inferred` / `broken` / `unknown`。**単一スコア化禁忌** (Codex narrative illusion 警告対応)。

### 三重 Metric (Codex 提案)
`continuity_score` 単独ではなく:
- `rupture_score` (断絶の強度)
- `reinterpretation_intensity` (再解釈の度合い)
- `revival_status` (復活状態)

を **同時可視化**することで continuity と mutation の両面を表現。

### Persistence Medium (Codex 新概念)
**文明継続の媒体 8 種**:
- `text` (記紀・延喜式・社伝)
- `ritual` (祭祀継承)
- `architecture` (社殿・古墳)
- `lineage` (氏族継承)
- `pilgrimage` (巡礼路)
- `oral` (口承)
- `geography` (神奈備・磐座)
- `seasonal` (季節同期)

各 entity がどの medium で継続しているかを `persistence_medium.tsv` で記録。Civilization comparison にも利用可能。

### Temporal Topology (Codex 新概念)
**時間構造を network として扱う**。timeline ではなく:
- overlapping cycles (重なり周期)
- asynchronous regions (地域間非同期)
- delayed adoption (制度導入遅延)
- ritual lag (祭祀の地方残存)
- reactivation waves (再活性化の波)

を含む。**time-as-network** が本質。

### Continuity Illusion (Codex 用語、最重要警告)
**「古代から変わらない」「連綿と続く」「本質は不変」**の錯覚。temporal authority illusion (DISC-011 authority illusion の時間版) と同義。

UI 必須対策:
- continuity を単一数値で表示しない (5 軸別表示)
- discontinuity / reconstructed / invented を視覚区別
- mythic_time と historical_time を別軸表示

### Invented Continuity
**後世創造の「伝統」**。Hobsbawm "The Invention of Tradition" (1983) 参照。具体例:
- 吉田神道による古代復古物語
- 明治国家神道による神武創業神話再編
- 観光化された「伝統」(2000s 以降)

→ `reactivation_type = invented` で独立カテゴリ可視化。

### Civilization Rewrite Event
**civilization-scale 編集 event**。日本史で特に重要:
- 神仏習合 (8C-19C)
- 廃仏毀釈 (1868-1872)
- 国家神道再編 (1871-1945)
- 戦後祭祀変化 (1945-、GHQ 神道指令)

→ `continuity_break.tsv` で `is_civilization_rewrite=true` field により赤色強調表示。

### Civilizational Synchronization Clock
**国家規模 ritual sync の総体**。新嘗祭 (annual) / 大嘗祭 (reign) / 式年遷宮 (20-year) / 御柱祭 (7-year) 等。Neo4j では `CIVILIZATIONAL_SYNC` relation category (DISC-010 6 → 7 category 拡張)。

### Temporal Confidence (5 値)
| 値 | 意味 |
|---|---|
| `exact` | 年代ほぼ確定 |
| `approximate` | 世紀レベル |
| `relative_only` | 前後関係のみ |
| `mythic_time` | 歴史年代不適用 |
| `chronology_mode` (別 field) | `absolute` / `relative` / `mythic` / `unknown` |

`mythic_time` を `historical_time` と混同しない discipline が必須。

---

## DISC-013 由来 (spatial ontology)

### Sacred Boundary
**俗→聖境界を構成する物理・概念構造** (鳥居・橋・川・坂・禁足境等)。`boundary_type` 10 種で分類:
- `torii` (鳥居) / `bridge` (橋) / `gate` (門) / `slope` (坂) / `coastline` (海岸)
- `path` (山道・巡礼路) / `axial_pillar` (御柱・心御柱) / `perimeter` (禁足境)
- `threshold` (禊場・橋詰) / `stone_marker` (要石等)

### Landscape Type
**神社の地理的形態類型** (山岳/海岸/水源/峠等)。DISC-008 sacred_topology の 5 GeoJSON layer と整合。

### Landscape Role (Codex 新概念)
**同一形態でも epoch・文脈により変化する機能的役割**。`landscape_type` (形態) と独立 2 軸で評価することで、epoch 別 role 変化を表現可能。DISC-012 temporal persistence と直接接続。

### Ritual Space Geometry
**祭祀空間の幾何学的範囲**。`geometry_type` 6 値:
- `point` / `polygon` / `network_path` / `axis` / `radius` / `boundary_line`

将来 atlas.html での **point + polygon overlay** 描画に利用。

### Spatial Layer Overlay
**同一空間の時代別意味重畳**。DISC-012 `narrative_layer.tsv` の空間版。`is_overlay_or_overwrite` で積層 (overlay) と上書き (overwrite) を区別。

例:
- SHR-002 伊勢神宮: 中世神仏習合 (overlay) → 近代純化空間 (overwrite、BRK-017 神宮寺廃絶)
- SHR-016 宇佐神宮: 中世弥勒寺一体 (overlay) → 近代純粋神道空間 (overwrite、BRK-023 弥勒寺廃絶)

### Axial Pillar
**axis mundi の物理具現** — 御柱 (諏訪)・心御柱 (伊勢)・出雲心御柱等。DISC-007 MTGM-014 pillar_axis_mundi mythologem の物理化。

### Evidence Type (Codex 提案、最重要)
**direct / inferred / interpretive の 3 値分離**で空間解釈の **overread** (pattern 読み込みすぎ) を防止:
- `direct` — 一次史料に空間記述あり (神宮儀式帳の境内図等)
- `inferred` — 妥当な推論 (考古学的範囲推定等)
- `interpretive` — 解釈層 (要石を axis mundi とする等)

DISC-005 `inference_type` (source_backed/inferential/speculative/symbolic) と**両軸独立評価**。

---

## 関連

- DISC-005 (#238) 解決報告: `docs/discussions/DISC-005_resolution.md`
- DISC-006 (#242) 解決報告: `docs/discussions/DISC-006_resolution.md`
- DISC-007 (#243) 解決報告: `docs/discussions/DISC-007_resolution.md`
- DISC-008 (#244) 解決報告: `docs/discussions/DISC-008_resolution.md`
- DISC-009 (#246) 解決報告: `docs/discussions/DISC-009_resolution.md`
- DISC-010 (#247) 解決報告: `docs/discussions/DISC-010_resolution.md`
- DISC-011 (#248) 解決報告: `docs/discussions/DISC-011_resolution.md`
- DISC-012 (#265) 解決報告: `docs/discussions/DISC-012_resolution.md`
- DISC-002 (#178) RISK-31 (AI 生成プレースホルダー混入)
- DISC-003 (#179) verified_status 公開レイヤ
- CLAUDE.md §4 編集ルール
