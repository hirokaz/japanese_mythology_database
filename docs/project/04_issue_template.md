# Issue 粒度ルール & テンプレート

GitHub Issue は本プロジェクトの **作業最小単位** であり、Claude が自律的に処理するための **契約書** でもある。粒度・必須項目・受入条件を厳格に定義する。

## 1. Issue 粒度ルール

### 1.1 サイズ基準

| 区分 | 推定時間 | 想定行数(成果物) | 用途 |
|---|---|---|---|
| **S(small)** | 2〜3h | TSV 30〜80 行 / md 200 行 | 1 神社の社伝整理、1 氏族の系譜整理 |
| **M(medium)** | 4〜5h | TSV 80〜150 行 / md 400 行 | 1 編の中分類、1 relation_type 抽出(1 領域分) |
| **L(large)** | 6〜8h | TSV 150〜250 行 / md 600 行 | 1 編全体の overview、1 relation_type 全領域抽出 |

**8 時間を超える Issue は禁止** → 必ず分割すること。

### 1.2 単一責任原則

1 Issue = **1 種類の成果物 / 1 目的**。複数のことを混ぜない。
NG 例: 「諏訪編 全部」 → OK 例: 「諏訪編 #3 ミシャグジ祭祀整理」

### 1.3 依存関係明確化

各 Issue は以下を **必ず** 明記:
- **前提 Issue**(Closed 必須)
- **後続 Issue**(これを完了させると次の何が動くか)
- **並行可 Issue**(衝突しない別 Issue)

### 1.4 完了条件の機械検証性

完了条件は **チェックリスト** で書き、可能な限り **自動検証可能** な形式にする:
- [x] `docs/伊勢編/04_betsugu.tsv` が存在する
- [x] 同ファイルが 14 行以上ある
- [x] 全行に `出典` カラムが入っている
- [x] master_id 衝突がない(検証コマンドで確認)

---

## 2. Issue 必須項目テンプレート

GitHub Issue Body にコピーして使う。

```markdown
## 🎯 Issue ID
ISE-04 (編コード-連番) または `M3.1-04` (Milestone 紐づけ用)

## 🧭 Title
[<Epic コード>] <短く具体的な見出し>
例: [ISE] 別宮 14 社の由緒整理

## 🎯 Purpose
<なぜこの Issue が必要か。1〜3 文>

## 📦 Scope (含むもの)
- 含む 1
- 含む 2
- 含む 3

## 🚫 Out of Scope (含まないもの)
- 含まない 1
- 含まない 2

## 📥 Input
- 参照ファイル: `docs/...`
- 参照スキーマ: `docs/schema/...`
- 参照外部資料: <文献名・URL>

## 📤 Output (成果物)
- `docs/伊勢編/04_betsugu.tsv` (29 列、14 行以上)
- `docs/伊勢編/04_betsugu_notes.md` (任意)

## 🔗 Dependencies
- 前提 (Closed 必須): #ISE-01, #ISE-02
- 並行可: #ISE-03 (内宮)
- 後続: #ISE-12 (master 投入)

## 🔥 Priority
P0 / P1 / P2 / P3

## ⏱ Estimated Effort
S (2-3h) / M (4-5h) / L (6-8h)

## ✅ Acceptance Criteria
- [ ] CLAUDE.md §3.2 の 29 列を満たす
- [ ] 全行に `出典` (古事記/書紀/延喜式/社伝 等) を記載
- [ ] `史実性レベル` (A〜E) を全行に付与
- [ ] `仮説レベル` (L0〜L5) を全行に付与
- [ ] 文字エンコーディング UTF-8、改行 LF
- [ ] PR セルフレビュー通過

## 🔁 Suggested relation_types
出力 TSV から派生する relation 候補:
- `enshrined_at` (祭神 → 別宮)
- `has_subordinate_shrine` (内宮 → 別宮)
- `located_in` (別宮 → 三重県下地域)

## 🧱 Suggested node_types
本 Issue で生成・参照される master 候補:
- deity (DEI)
- shrine (SHR)
- region (REG)
- text (TXT)

## 🏷 Labels
`area:ise`, `type:shrine`, `phase:2`, `priority:P1`, `effort:M`, `evidence:engishiki`
```

---

## 3. テンプレート使用例(具体)

### 例 1. ISE-04 別宮 14 社

```markdown
## 🎯 Issue ID: ISE-04

## 🧭 Title
[ISE] 別宮 14 社の由緒整理

## 🎯 Purpose
伊勢神宮の別宮 14 社を Layer A 連表 1 ファイルに整理し、
deity_master / shrine_master への投入準備を整える。

## 📦 Scope
- 内宮別宮 10 社 (荒祭宮、月讀宮、月讀荒御魂宮、伊佐奈岐宮、
  伊佐奈弥宮、瀧原宮、瀧原並宮、伊雑宮、風日祈宮、倭姫宮)
- 外宮別宮 4 社 (多賀宮、土宮、月夜見宮、風宮)
- 各社の主祭神・社伝・延喜式・遷宮履歴

## 🚫 Out of Scope
- 摂社・末社 (ISE-05 で扱う)
- 度会・荒木田氏譜 (ISE-06, ISE-07)

## 📥 Input
- `docs/schema/04_shrine_master_design.md`
- 延喜式神名帳 (引用箇所のみ)
- 神宮儀式帳

## 📤 Output
- `docs/伊勢編/04_betsugu.tsv`

## 🔗 Dependencies
- 前提: ISE-01 (基盤), ISE-02 (内宮), ISE-03 (外宮)
- 並行可: ISE-05〜ISE-08
- 後続: ISE-12 (master 投入)

## 🔥 Priority: P1

## ⏱ Estimated Effort: M (4-5h)

## ✅ Acceptance Criteria
- [ ] 14 行以上の TSV
- [ ] 29 列フォーマット遵守
- [ ] 出典 100% 記載
- [ ] PR セルフレビュー通過

## 🔁 Suggested relation_types
- enshrined_at, primary_deity_of, has_subordinate_shrine,
  mentioned_in, located_in

## 🧱 Suggested node_types
- deity, shrine, region, text

## 🏷 Labels
area:ise, type:shrine, phase:2, priority:P1, effort:M
```

---

### 例 2. RLN-EN-04 海人系 enshrined_at 抽出

```markdown
## 🎯 Issue ID: RLN-EN-04

## 🧭 Title
[RLN] 海人系 deity → shrine の enshrined_at 抽出

## 🎯 Purpose
海人族系神格 (綿津見三神、住吉三神、宗像三女神、阿曇磯良 等)
を全国海洋神社に対し `enshrined_at` で接続する。

## 📦 Scope
- deity_master のうち category=海神/海人系 (推定 30+ 神格)
- 上記神格を祀る神社 (推定 200+ 社)
- 主祭神 / 配祀の区別

## 🚫 Out of Scope
- 山岳系 (RLN-EN-05 で別途)
- 神仏習合 (RLN-SY 系で別途)

## 📥 Input
- `docs/master/deity_master.tsv`
- `docs/master/shrine_master.tsv`
- 全国神社誌、各社縁起

## 📤 Output
- `docs/relations/relations_enshrined_at_marine.tsv` (200+ 行想定)

## 🔗 Dependencies
- 前提: M2.17 (deity_master 600+), M2.18 (shrine_master 800+)
- 並行可: RLN-EN-01〜03, 05〜08
- 後続: M3.1 統合

## 🔥 Priority: P1
## ⏱ Estimated Effort: L (6-8h)

## ✅ Acceptance Criteria
- [ ] 全行に source_id, target_id, relation_type, confidence_level,
      hypothesis_layer, source_reference
- [ ] 主祭神は primary_deity_of, 配祀は secondary_deity_of
- [ ] 200 行以上
- [ ] 重複 (同一 source/type/target) なし

## 🔁 Suggested relation_types
- enshrined_at, primary_deity_of, secondary_deity_of, located_in

## 🧱 Suggested node_types
- deity, shrine, region

## 🏷 Labels
area:marine, type:relation, phase:3, priority:P1, effort:L,
evidence:shrine_legend
```

---

## 4. Issue ライフサイクル

```
Open
  ↓
Triaged   (label 付与・priority 確定)
  ↓
In Progress (Claude 着手 / branch 作成 claude/<issue-id>)
  ↓
PR Open   (セルフレビュー)
  ↓
PR Merged (main へ)
  ↓
Closed (completed) ─→ 次 Issue へ
```

各遷移で **コメントを残す** (Claude が自律実行する場合は工程ログ)。

## 5. Issue がブロックされた場合

- ラベル `status:blocked` を付け、本文に **理由** と **解除条件** を明記
- 解除に新 Issue が必要なら起票し、依存関係を更新

## 6. Issue 命名 ID の体系

```
<Epic コード>-<種別2文字>-<連番>     最も推奨
例:  ISE-SH-04        伊勢編 神社 4 番
     IZM-RL-12        出雲編 relation 12 番
     RLN-EN-04        relation 専用 enshrined_at 4 番
     AUD-NM-01        監査 表記ゆれ 1 番
     MST-DE-03        master deity 3 番
     CIV-KG-07        文明解析 知識グラフ 7 番
```

| 種別 | コード | 用途 |
|---|---|---|
| 神 | DE | deity |
| 神社 | SH | shrine |
| 豪族 | CL | clan |
| 皇族 | EM | emperor |
| 神話 | MY | myth_episode |
| 事象 | EV | event |
| 遺跡 | ST | site |
| 遺物 | AR | artifact |
| 祭祀 | RT | ritual |
| 地域 | RG | region |
| 文献 | TX | text |
| 仮説 | HY | hypothesis |
| 称号 | TT | title |
| 関係 | RL | relation |
| 監査 | NM (表記)/ SR (出典)/ AS (断定)/ CB (中央偏重)/ LC (地方軽視) | audit |
| 文明解析 | MO (motif) / NW (network) / SK (祭祀圏) / JM (縄文) / KG (graph) | civilization |
| グラフ | NE (Neo4j) / VS (visualization) / EX (export) | graph |

連番は Epic 内で 01 から振る(衝突なし)。
