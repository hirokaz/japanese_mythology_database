# 検証 Issue 設計(EPIC-29〜EPIC-30 詳細)

監査(Audit)は **Claude が書いた成果を別系統が独立検証する** 工程。本プロジェクトでは:

- **Layer A 監査**(自セルフ): Claude による既存 9 軸完了(`docs/audit/`)
- **Layer B 監査**(独立): Gemini による反射監査(本書で設計)
- **Layer C 監査**(機械): 将来のスクリプト監査

## 0. 監査の三層

```
┌─────────────────────┐
│ A. Claude セルフ監査 │  既に完了 9 軸
│  (docs/audit/01〜09)│
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ B. Gemini 反射監査   │  本 Epic で設計
│  (issue 駆動)       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ C. 機械監査(スクリプト) │  将来
└─────────────────────┘
```

## 1. 既存 Claude セルフ監査(EPIC-29)

| # | 軸 | ファイル | 状態 |
|---|---|---|---|
| A1 | 監査フレームワーク | `00_audit_framework.md` | ✅ |
| A2 | 神格 | `01_deity_audit.md` | ✅ |
| A3 | 神社 | `02_shrine_audit.md` | ✅ |
| A4 | 氏族 | `03_clan_audit.md` | ✅ |
| A5 | 関係性 | `04_relation_audit.md` | ✅ |
| A6 | 欠落検出 | `05_missing_audit.md` | ✅ |
| A7 | 推奨追加出典 | `06_recommended_sources.md` | ✅ |
| A8 | 出典監査 | `06_source_audit.md` | ✅ |
| A9 | 断定監査 | `07_assertion_audit.md` | ✅ |
| A10 | 地方軽視監査 | `08_regional_audit.md` | ✅ |

→ 9 軸 + 地方の計 10 を実施済。Phase 4 で追加軸を起こす際は連番続行(`10_*.md` から)。

### 追加検討軸(Phase 4)

| # | 軸 | 想定ファイル |
|---|---|---|
| A11 | 神仏習合監査 | `10_syncretism_audit.md` |
| A12 | 海人 vs 山岳ネットワーク偏重 | `11_network_balance_audit.md` |
| A13 | hypothesis_layer 一貫性 | `12_hypothesis_consistency_audit.md` |
| A14 | 文献網羅性(漏れている文献) | `13_text_coverage_audit.md` |
| A15 | relation_type 分布偏り | `14_relation_distribution_audit.md` |

---

## 2. Gemini 反射監査(EPIC-30)

### 2.1 基本ループ

```
Claude が PR 作成
   ↓
人間が PR を Gemini に貼る or
GitHub Action で Gemini API へ自動送信
   ↓
Gemini が独立検証 (本書のチェックリスト準拠)
   ↓
監査結果コメント (issue or PR)
   ↓
Claude が修正 PR
   ↓
Gemini 再監査 → OK ならマージ
```

### 2.2 Gemini 監査 Issue テンプレート

```markdown
## 🎯 Issue ID: AUD-GM-XX

## 🧭 Title
[AUD] Gemini 反射監査 — <対象> v<バージョン>

## 🎯 Purpose
Claude が生成した <対象> を Gemini に独立検証させ、
偏り・断定・出典脆弱・表記ゆれ・relation 不整合を検出する。

## 🔍 監査対象
- 対象ファイル: <path>
- 対象 PR: #NN
- 対象 Milestone: M<X.Y>

## 🤖 Gemini への指示プロンプト
```
以下のリポジトリ:
https://github.com/hirokaz/japanese_mythology_database

の特定 PR (#<NN>) について、独立した第三者として
以下の観点で監査せよ:

1. 表記ゆれ: 同一エンティティに複数表記がないか
2. 出典: 一次史料への参照が適切か (古事記/書紀/風土記/延喜式)
3. 断定: 仮説を断定形で書いていないか
4. 中央偏重: 地方伝承の独立性を尊重しているか
5. relation 妥当性: source/target の node_type が定義通りか
6. hypothesis_layer: 仮説強度 L0-L5 が適切か
7. 史実性レベル: A-E の判定が妥当か
8. 神話成立年代と神話が描く時代の混同がないか
9. 神仏習合・本地垂迹の関係が relation で表現されているか
10. 文献の編纂年・編纂背景を踏まえているか

各観点について:
- 問題ありなら具体的な行番号と理由
- なしなら「OK」と書く
- 全体総評を最後に付ける

回答は markdown で、本リポジトリ docs/audit/gemini/<監査ID>.md として
保存可能な形式とする。
```

## 📤 Output
- `docs/audit/gemini/<監査ID>_<対象>.md`

## ✅ Acceptance Criteria
- [ ] Gemini からの 10 観点全件への返答取得
- [ ] 問題ありの行を Claude が修正
- [ ] 修正後 Gemini 再監査 → 全項目 OK
- [ ] 監査ログを docs/audit/gemini/ にコミット

## 🏷 Labels
type:audit, audit:gemini, phase:4, priority:P1
```

### 2.3 Gemini 監査 Issue カタログ

| ID | Title | 対象 | 起票タイミング |
|---|---|---|---|
| AUD-GM-01 | Gemini × 出雲編 v1.0 | 出雲編 | 既完了済(過去対応) |
| AUD-GM-02 | Gemini × 地方研究 v1.0 | 地方研究 | 既完了済 |
| AUD-GM-03 | Gemini × deity_master 600+ | deity_master | M2.17 完了時 |
| AUD-GM-04 | Gemini × shrine_master 800+ | shrine_master | M2.18 完了時 |
| AUD-GM-05 | Gemini × clan_master 250+ | clan_master | M2.19 完了時 |
| AUD-GM-06 | Gemini × emperor_master 全代 | emperor_master | M2.20 完了時 |
| AUD-GM-07 | Gemini × myth_episode_master 200+ | myth_episode | M2.21 完了時 |
| AUD-GM-08 | Gemini × hypothesis_master | hypothesis | M2.23 完了時 |
| AUD-GM-09 | Gemini × relations enshrined_at | relations.tsv 抜粋 | M3.1 完了時 |
| AUD-GM-10 | Gemini × relations mentioned_in | relations.tsv 抜粋 | M3.2 完了時 |
| AUD-GM-11 | Gemini × relations 系譜 | relations.tsv 抜粋 | M3.3 完了時 |
| AUD-GM-12 | Gemini × relations syncretized_with | relations.tsv 抜粋 | M3.4 完了時 |
| AUD-GM-13 | Gemini × relations supports/contradicts | relations.tsv 抜粋 | M3.9 完了時 |
| AUD-GM-14 | Gemini × 各地域編 v1.0 (15 編) | 各編 | 各 M2.X 完了時 |
| AUD-GM-15 | Gemini × 文明解析 #2〜#7 | 各文明解析 md | 各完了時 |
| AUD-GM-16 | Gemini × Neo4j スキーマ | Cypher schema | M5.1 完了時 |

---

## 3. 観点別 監査チェックリスト(再利用可能)

### 3.1 表記ゆれ監査(AUD-NM)

```markdown
- [ ] 同一エンティティが複数 master_id を持っていないか
- [ ] aliases に集約漏れがないか
- [ ] 漢字ゆれ(度会/度合/渡会)を集約済か
- [ ] 仮名表記ゆれ(タケミカヅチ/建御雷)を集約済か
- [ ] Unicode 正規化(NFC)後に重複が生じないか
```

### 3.2 出典監査(AUD-SR)

```markdown
- [ ] 全行に「出典」記載
- [ ] 出典名が text_master に存在
- [ ] 引用箇所(巻・段)が明示
- [ ] 一次/二次 区別
- [ ] 出典なしで断定している行が無いか
- [ ] 「○○とされる」「と推定される」 ↔ 一次史料原文の整合
```

### 3.3 断定監査(AUD-AS)

```markdown
- [ ] 「である」と書く根拠が L0 (史料記載) か
- [ ] L1-L2 仮説を「とされる」「と考えられる」で表記しているか
- [ ] L3-L5 仮説を「説がある」「議論がある」で表記しているか
- [ ] 神話を史実と混同していないか(例:「大国主は実在し」)
- [ ] 神話の成立年代と神話の描く時代を分けているか
```

### 3.4 中央偏重監査(AUD-CB)

```markdown
- [ ] 地方伝承を「○○の地方異伝」と書いて中央版を正規化していないか
- [ ] 中央史観で書かれた一次史料(書紀)を地方伝承より優位に置いていないか
- [ ] 朝廷主導の神話編集の限界を明記しているか
```

### 3.5 地方軽視監査(AUD-LC)

```markdown
- [ ] 風土記独自エピソードに myth_episode_master が割り当てられているか
- [ ] 地方氏族(国造)の独立祖神が clan_master に存在するか
- [ ] 中央正統化前の地方祭祀(出雲・諏訪・宗像)が独立記述されているか
```

### 3.6 relation 整合性(AUD-RL)

```markdown
- [ ] source_id が node_type の master に存在
- [ ] target_id が node_type の master に存在
- [ ] relation_type の source_type/target_type 定義に違反していない
- [ ] directed type の逆向き行が存在しない
- [ ] 同 source/type/target の重複が存在しない
- [ ] hypothesis_layer ≥ 4 の relation の confidence_level が E
```

### 3.7 hypothesis_layer 一貫性(AUD-HY)

```markdown
- [ ] L0 と書かれた行が史料原文記述に厳密に対応するか
- [ ] L4-L5 仮説を独立 hypothesis ノードに分離済か
- [ ] supports/contradicts 関係が双方向に存在するか
- [ ] proposer が text_master または clan/emperor に存在するか
```

### 3.8 神仏習合監査(AUD-SY)

```markdown
- [ ] 本地垂迹を syncretized_with で表現
- [ ] 本地仏と権現を別 node とし、関係でつなぐ
- [ ] 牛頭天王・蔵王権現・熊野権現・春日権現・八幡大菩薩が独立 node
- [ ] 中世仏教書(『中臣祓訓解』『鼻帰書』等)が text_master に存在
```

### 3.9 ネットワーク偏重監査(AUD-NW)

```markdown
- [ ] 海人ネットワークだけでなく山岳・修験・製鉄もカバーしているか
- [ ] 渡来系を過小評価していないか
- [ ] 東北・九州・琉球を「中央外」として軽視していないか
```

### 3.10 神話成立年代の混同監査(AUD-MT)

```markdown
- [ ] 「古事記が描く神代」と「古事記成立(712 年)」を分離して扱っているか
- [ ] 中世神道書の神話を上代神話と峻別しているか
- [ ] 各風土記の編纂年を踏まえているか
```

---

## 4. 監査の自動化(Phase 4-5)

### 4.1 機械監査スクリプト候補

```bash
scripts/audit/check_id_collision.sh    # master_id 衝突
scripts/audit/check_required_cols.sh   # 必須カラム欠損
scripts/audit/check_duplicate_rln.sh   # relation 重複
scripts/audit/check_orphan_master.sh   # どこからも参照されない master
scripts/audit/check_dangling_rln.sh    # source/target が master に無い
scripts/audit/check_normalize.sh       # Unicode NFC 検査
scripts/audit/check_layer_confidence.sh# L4-L5 ↔ E 整合
```

### 4.2 GitHub Action 監査

```yaml
# .github/workflows/audit.yml(将来)
on: [pull_request]
jobs:
  master-audit:
    steps:
      - run: bash scripts/audit/check_id_collision.sh
      - run: bash scripts/audit/check_required_cols.sh
      - run: bash scripts/audit/check_duplicate_rln.sh
```

→ 失敗時に PR をブロック。Phase 5 までに整備推奨。

---

## 5. 監査の重要原則

1. **監査者は対象に関与しない** — Claude が書いた箇所を Claude が「自分で大丈夫」と言うのは監査ではない
2. **監査は記録する** — 監査結果は必ずファイル化し commit する
3. **監査は責める道具ではない** — 改善ループのため
4. **監査は spec 改訂のトリガになる** — 監査で見つかった構造問題は schema/ にフィードバック
