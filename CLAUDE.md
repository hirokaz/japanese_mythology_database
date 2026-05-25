# 日本神話・神道史データベース 編纂規程 (CLAUDE.md)

本リポジトリは、氷河期・旧石器・縄文時代から鎌倉時代までの日本列島に関する **神話・神社・豪族・皇統・祭祀・地方伝承・考古学** を統合する巨大知識体系を、Excel 互換の構造化データ(TSV)として整理することを目的とする。

このファイルは Claude Code(編纂担当エージェント)が常に従う恒久ルールである。

---

## 1. 開発ワークフロー(必須ルール)

1. **粒度分解**: 一度に整理しきれない作業は、適切な粒度に分解して GitHub Issue として登録する。
2. **issue 単位処理**: 立てた issue は 1 つずつ順に処理する。並行着手しない。
3. **PR フロー**: 各 issue ごとに専用ブランチを切り、`main` ブランチへ向けて Pull Request を作成する。
4. **セルフレビュー**: PR 作成後、自分でレビューを行い、問題がなければ Approve しマージする。
5. **次の issue へ**: マージ完了後、次の issue に着手する。
6. **直接コミット禁止**: 基盤初期化以外の内容変更を `main` に直接コミットしない。
7. **issue クローズ**: マージ後、対応 issue は `completed` で閉じる。

---

## 2. プロジェクトの基本方針

これは単なる年表ではない。以下を統合する巨大知識体系である。

- 日本神話 / 神道 / 神社由緒
- 豪族史 / 皇統史 / 祭祀権力史
- 地方伝承 / 考古学 / 古代権力構造
- 神話に含まれる可能性のある縄文・弥生・古墳時代の記憶

---

## 3. 出力データ仕様

### 3.1 ファイル形式

- 形式: **TSV (タブ区切り)** — Excel への直接貼り付けを想定
- 文字コード: UTF-8 (BOM なし)
- 改行: LF
- 配置: `docs/<編名>/<連番>_<トピック>.tsv`

### 3.2 カラム定義(全29列・固定順)

| # | カラム名 | 内容 |
|---|---|---|
| 1 | ID | `IZM-001` 形式の一意 ID(編コード3文字 + 連番) |
| 2 | 時代 | 旧石器/縄文/弥生/古墳/飛鳥/奈良/平安/鎌倉/神代 等 |
| 3 | 推定年代 | 学術的推定年代(範囲可) |
| 4 | 西暦 | 西暦表記(BCE/CE)。神話時代は「不明」 |
| 5 | 和暦 | 和暦表記。該当なき場合は「-」 |
| 6 | 出来事 | 事象の簡潔な要約 |
| 7 | 分類 | 神社創建/神話エピソード/考古遺跡/政治事件/系譜/祭祀 等 |
| 8 | 関連神話 | 国譲り神話、ヤマタノオロチ神話 等 |
| 9 | 関連神社 | 出雲大社、諏訪大社 等 |
| 10 | 関連祭神 | 大国主、スサノオ 等 |
| 11 | 関連人物 | 神話的・歴史的人物 |
| 12 | 関連皇族 | 該当する天皇・皇族 |
| 13 | 関連豪族 | 出雲国造、物部氏 等 |
| 14 | 関連氏族 | 千家氏、北島氏、意宇氏 等 |
| 15 | 関連地域 | 出雲、伊勢、諏訪 等 |
| 16 | 関連遺跡 | 荒神谷遺跡、加茂岩倉遺跡 等 |
| 17 | 関連考古資料 | 銅鐸、銅剣、四隅突出型墳丘墓 等 |
| 18 | 出典 | 古事記、日本書紀、出雲国風土記、延喜式 等 |
| 19 | 史料種別 | §3.3 参照 |
| 20 | 史実性レベル | §3.4 参照 |
| 21 | 仮説レベル | §3.5 参照 |
| 22 | 複数説 | 併記すべき別説。なければ「-」 |
| 23 | 神話的象徴 | 太陽信仰、蛇神信仰、農耕神 等 |
| 24 | 祭祀的意味 | 国家祭祀/地域祭祀/王権神話化 等 |
| 25 | 政治的意味 | 王権正統化、国譲りの政治的読解 等 |
| 26 | 系譜的意味 | 皇統との接続、地方氏族の祖神化 等 |
| 27 | 考古学的根拠 | 対応遺跡・出土品。なければ「-」 |
| 28 | 後世への影響 | 中世神道、近世国学、現代神社 等への影響 |
| 29 | 備考 | 脚注的情報、論争の所在 等 |

### 3.3 史料種別

`正史 / 神話 / 風土記 / 社伝 / 神社縁起 / 地方伝承 / 系譜資料 / 考古学 / 民俗学 / 中世神道 / 近世資料 / 近代研究 / 現代研究 / 仮説`

### 3.4 史実性レベル

- **A**: 文献・考古学双方で比較的裏付けがある
- **B**: 文献上の記録があり、一定の蓋然性がある
- **C**: 神話・伝承として重要だが史実性は未確定
- **D**: 後世の創作・政治的編集の可能性が高い
- **E**: 仮説・推測として扱うべきもの

### 3.5 仮説レベル

- **0**: 仮説ではなく史料記載の整理
- **1**: 一般的な研究上の解釈
- **2**: 複数研究者が言及する推定
- **3**: 民間伝承・地域伝承としての解釈
- **4**: 大胆な仮説
- **5**: 検証困難だが思想的・構造的に興味深い仮説

---

## 4. 編集上の注意事項(厳守)

- 不明点は **「不明」** と書く。無理に断定しない。
- **複数説は必ず併記** する。
- **学術説と社伝・伝承を峻別** する。
- **神話成立年代と、神話が描いている時代を分けて** 考える。
  - 例: 古事記成立は 712 年だが、描く時代は神代〜推古朝。
- 出雲、伊勢、諏訪、鹿島・香取、宗像、熊野、石上、三輪、宇佐、春日 を特に重視する。
- **豪族**: 祭祀・土地支配・婚姻・皇室との関係を重視。
- **神社**: 祭神・由緒・創建伝承・政治的意味・祭祀的意味を重視。
- **考古学**: 遺跡・出土品・時代区分・神話との対応可能性を記録。
- 神話を単なる創作として切り捨てない。ただし史実と混同しない。

### 4.1 出典表記ルール (Codex #237 提案 4 採用)

`source_reference` カラムおよび extended summary 内の出典記載は以下の表記規約に従う:

#### 基本形式

`<書名>(<章/段>)|<書名>(<章/段>)` のように **パイプ区切り** で複数併記。

#### 引用粒度の必須レベル

| エントリ種別 | 必須粒度 |
|---|---|
| L0 (史料記載) | 書名 + 章/段名 (例: `古事記(神代下 国譲り段)`、`日本書紀(神代上 第八段一書)`) |
| L1 (一般的解釈) | 書名 + 研究者名 (例: `古事記伝(本居宣長)`、『出雲国造神賀詞奏上記』) |
| L2 (学術仮説) | 書名 + 研究者名 + 年代 (例: `L2、上田正昭・松前健ら` のように `extended_summary` で論者明示) |
| L3 (民間伝承) | 「社伝」「諸伝承」 + 地域名 |
| L4-L5 (大胆仮説・検証困難) | **「反対説」「保留理由」「検証不能性」を必ず併記**。`extended_summary` 内に「L4、〇〇研究 / 反対: △△」のような両論記載必須 |

#### 構造化フィールド (将来導入候補、Codex #237 推奨)

各 relation の出典を以下のように構造化することを推奨 (現状は `source_reference` カラム一本):

- `text_id` — text_master の ID (例: TXT-Kojiki)
- `chapter` — 章/巻 (例: 神代下)
- `section` — 段/段一書 (例: 第九段一書)
- `quote_summary` — 該当箇所の要約
- `note` — 異伝・反対説の補足

#### 引用形式の標準化 (8 形式)

1. 古事記: `古事記(神代上 国生み段)` / `古事記(中巻 崇神段)`
2. 日本書紀: `日本書紀(神代上 第六段本文)` / `日本書紀(垂仁紀)`
3. 風土記: `出雲国風土記` / `播磨国風土記` / `備後国風土記逸文`
4. 延喜式: `延喜式神名帳` / `延喜式祝詞(龍田風神祭)`
5. 続日本紀以下: `続日本紀(天平勝宝元年)` / `日本三代実録`
6. 古典 (中世): `太平記` / `平家物語` / `諏訪大明神画詞`
7. 神社縁起・社伝: `<神社名>縁起` / `<神社名>社伝`
8. 研究書: `<書名>(<著者>、<年代>)`、研究者名併記

#### 禁止事項

- AI 生成テキストの直接引用
- SNS / Wikipedia の引用 (一次史料へ遡及せよ)
- 「諸書」「複数史料」のような漠然とした記載 (具体的に列挙する)
- L4-L5 を L0 として記載する誤分類

### 4.2 master 追加時のルール (DISC-001 ~ DISC-004 採択)

- 1 PR あたり 20 件以下を推奨 (大量投入による品質低下を防ぐ)
- 全エントリに distinctive feature 必須:
  - 古代社格 (式内社・名神大社等)
  - 近代社格 (官幣・国幣・別表等)
  - 具体的別名・古名
  - 詳細な founding_legend (20 字以上)
  - 詳細な notes (20 字以上)
  - 町字を含む詳細住所
  - 上記いずれか 1 つは必須
- 「(地名)+(神格)+(神社/宮)」型の合成名は要・実在検証
- 旧国名の網羅シリーズ (各旧国に同種神社を 1 件ずつ) は AI 生成プレースホルダーの典型署名なので**禁止**

### 4.3 source / abstraction / inference / speculation 分離 discipline (DISC-005 採択)

「ロマン化ではなく構造化」を維持するため、各エントリは以下 4 層のどこに属するかを明示する:

```
source       (一次史料に裏付けあり) ← 最上位、信頼度最高
abstraction  (motif / mythologem 等の抽象化) ← 構造的解釈
inference    (妥当な推論) ← 学術的推測
speculation  (検証困難な仮説、L4-L5) ← 最下位、要警告
```

#### 表記方法
- `hypothesis_layer` (L0-L5): 仮説強度
- `confidence_level` (A-E): 史実性
- `verified_status` (verified/under_review/unverified/known_fabrication): 実在性 (DISC-003 採択)
- `inference_type` (source_backed/inferential/speculative/symbolic): 推論性質 (DISC-005 採択、Codex 提案)

→ **4 軸独立**で各エントリを多面的に評価。AI が speculative を増殖しても、構造的に区別される。

#### AI 編纂時の原則 (DISC-006 採択)
- **「AI は仮説生成器、人間は検証者」**
- AI が abstraction / inference / speculation を増やすこと自体は許容するが、`inference_type` で明示する
- `source_backed` を捏造することは厳禁 (一次史料への遡及を必ず行う)
- 詳細は `docs/civilization/12_terminology_glossary.md` 用語集を参照

### 4.4 epistemology layer 原則 (DISC-006 採択)

`verified_status` は単なる UI flag ではなく、本 DB の **epistemology layer (認識論の基盤)** そのもの。

- `verified_status = institutional verifiability` (制度・史料・現存組織により確認可能)
- `verified_status ≠ historical truth` (歴史的真実性そのものではない)
- `verification_dimension = entity-specific epistemology` (entity 別に検証対象の意味が異なる)
- `verified_at` / `verified_by` / `verification_source` = knowledge provenance (将来更新追跡)

詳細は `docs/discussions/DISC-006_resolution.md` および `docs/civilization/12_terminology_glossary.md` 参照。

### 4.5 mythologem layer 原則 (DISC-007 採択)

mythologem (Level 2: motif と政治構造の中間層) を扱う際の規律:

- mythologem は研究者の抽象 = `inference_type=symbolic` 必須
- 単一理論固定は避け、`theoretical_framework` multi-tag を許容 (structuralist / archetypal / ritual-functional / political-legitimacy)
- 世界神話比較は慎重 (false equivalence / Indo-European bias / archetype overgeneralization のリスク)
- 「全神話を抽象構造へ還元できる」幻想を排し、**multi-layered structural overlays** として扱う
- 日本神話の地方差・時代差・編集層・習合を尊重

Phase 1 (2026-05-25 実装済): `docs/civilization/02_mythologem_master.tsv` (10 件、boundary_traversal / legitimacy_transfer / concealment_revelation / marriage_integration / exchange_gift / death_rebirth / center_periphery_integration / periodic_renewal / divine_descent / succession_dispute) + `motif_belongs_to_mythologem` relation 14 件 (多対多接続)。

### 4.6 sacred topology 原則 (DISC-008 採択)

GIS 統合時の規律:

- **「地図でロマンを演出するではなく、構造を検証可能にする」** (Codex 規律)
- `coordinates_accuracy` (exact/approximate/inferred/unknown) で精度の幻想を排する
- `visualization_confidence` (archaeological/textual/inferred/speculative) で layer 根拠強度を明示
- Narrative intoxication 警告: 線が引ける・近くにある・分布が似ているだけで歴史的因果を断定しない
- 実線 (source-backed) / 点線 (inferred) / グレー (speculative) で関係性の質を視覚化

### 4.7 anti-hallucination architecture 原則 (DISC-009 採択)

AI hallucination は「ミス」ではなく**構造的に増殖する圧力**として扱う:

- **plausibility ≠ evidence** — 「ありそう」を reject する (Codex 強調)
- **fingerprint detection は escalation review** — hard reject は八幡・稲荷・天神等の高類似 network を誤検出
- **too systematic = suspicious** — 非対称性・欠損・偏在を期待値とする (実世界神社分布は対称的でない)
- **feature provenance > feature quantity** — distinctive feature の数より出所明示
- **relation hallucination > entity hallucination** — 意味ありげな繋ぎは graph visualization と結合で persuasive、将来的により危険
- **CI Phase 1 = warning only** — false positive 懸念のため suspiciousness scoring 蓄積から
- **epistemic anomaly detection** — graph-level hallucination 検出 (Phase 3+、Neo4j 連動)

→ 単一 CI チェックではなく **PR 時点予防 + relation provenance + graph anomaly + provenance entropy** の多層防御。詳細は `docs/discussions/DISC-009_resolution.md` 参照。

### 4.8 graph epistemics 原則 (DISC-010 採択)

Neo4j / Cypher 投入時の規律:

- **label-based node + multi-label** — `(:Entity:Shrine)` 等、ontology clarity 最優先 (Entity+type property 方式は ontology 崩壊リスク)
- **relation ontology 化** — 6 大 category (ritual / lineage / authority / geographic / symbolic / synchronization)
- **symbolic ↔ source-backed の query-layer 分離** — `inference_type=symbolic` は query default 除外
- **hypothesis-aware query** — `r.hypothesis_layer IN ['L0','L1']` 等は本 DB の独自性、全 persona query の標準フィルタに
- **temporal graph = evolving civilization graph** — 勧請・分祀・遷宮・神階授与・一宮化は graph mutation event
- **graph visualization の false coherence 警告** — relation confidence / source visibility / symbolic warning / layer filtering を必須要件

→ 「読む DB → 探索・推論する DB」への phase transition。詳細は `docs/discussions/DISC-010_resolution.md` 参照。

### 4.9 epistemic neutrality / public epistemology 原則 (DISC-011 採択)

公開設計の規律:

- **編纂的解釈に attribution 必須** → CC BY-SA 4.0 (CC0 不採用、curated relational interpretation の attribution 消失リスク)
- **「公開 = 真実認定」ではない** → authority illusion 回避が公開設計の中核
- **interpretation disclaimer を UI レベルで強く可視化** (公式見解/神社認定/学術 consensus に見える錯覚回避)
- **competing interpretations / source visibility / uncertainty indicators / contradiction overlays** を積極表示
- **AI contributor governance = 「誰が」ではなく「どう生成されたか」** — AI-generated PR disclosure 必須
- **どの政治立場にも回収されない epistemic discipline 維持** — 国家神道復活運動・排外主義・神話 literalism・pseudo-history への悪用警戒

LICENSE 構成:
- code (MIT) / structured data (CC BY-SA 4.0) / interpretation (CC BY-SA 4.0)

詳細は `docs/discussions/DISC-011_resolution.md` 参照。

---

## 5. ディレクトリ構成

```
docs/
├── 出雲編/             # 出雲関連 TSV 群
├── 伊勢編/             # (今後)
├── 諏訪編/             # (今後)
├── ...
└── templates/
    ├── columns.md      # カラム定義(本書 §3.2 と同期)
    └── empty.tsv       # ヘッダのみのテンプレート
```

---

## 6. 連結用 編コード

| 編 | コード |
|---|---|
| 出雲 | IZM |
| 伊勢 | ISE |
| 諏訪 | SUW |
| 鹿島・香取 | KSK |
| 宗像 | MNK |
| 熊野 | KMN |
| 石上 | ISO |
| 三輪 | MIW |
| 宇佐 | USA |
| 春日 | KSG |
| 海人 | AMA |
| 修験 | SHU |
| 東北 | TOH |
| 九州 | KYU |
| 琉球 | OKI |

ID は `<編コード>-<3桁連番>` (例: `IZM-001`)。
