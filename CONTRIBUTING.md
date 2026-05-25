# CONTRIBUTING

本プロジェクトは **日本神話・神道史 文明 OS データベース** (`hirokaz/japanese_mythology_database`) です。寄稿に際してのガバナンス規律を以下に定めます。

最終更新: 2026-05-25 (DISC-011 採択)

---

## 1. 基本方針

本 DB は単純な raw data ではなく **curated relational interpretation** を含む知識構造です (DISC-011 採択)。したがって寄稿は以下の原則に従ってください。

### 1.1 規律 4 軸

すべての寄稿は次の 4 軸で多面的に評価されます (CLAUDE.md §4.3 / §4.4):

| 軸 | 値域 | 意味 |
|---|---|---|
| `hypothesis_layer` | L0-L5 | 仮説強度 (L0 = 史料記載、L5 = 検証困難) |
| `confidence_level` | A-E | 史実性 (A = 文献+考古双方裏付け、E = 推測) |
| `verified_status` | verified / under_review / unverified / known_fabrication | 実在性 (DISC-006) |
| `inference_type` | source_backed / inferential / speculative / symbolic | 推論性質 (DISC-005) |

### 1.2 ロマン化ではなく構造化 (Codex 規律)

「**ありそう**」を evidence とみなさない (DISC-009 plausibility ≠ evidence 原則)。一次史料への遡及がない仮説は `inference_type=speculative` または `symbolic` で明示してください。

---

## 2. AI Contributor 規律 (DISC-011 採択、最重要)

「**誰が書いたか**」より「**どう生成されたか**」が重要です。

### 2.1 AI 関与レベル開示 (必須)

すべての PR description で AI 関与レベルを明示してください:

| レベル | 説明 | 必須レビュー |
|---|---|---|
| `human-written` | 人手のみ、AI 支援なし | 通常レビュー |
| `AI-assisted` | 人手が draft、AI が補助 (補完・校正) | 通常レビュー |
| `AI-generated-reviewed` | AI が draft、人間が確認・編集 | **詳細レビュー必須** |
| `AI-generated` | AI が draft、人間レビュー最小 (最高リスク) | **詳細レビュー + 段階リリース推奨** |

### 2.2 AI 寄稿に対する追加要求

- **provenance 必須**: 一次史料への遡及 (記紀・延喜式・風土記・社伝 等)
- **no unsourced mass addition**: 1 PR ≤20 件 + 全件 `source_reference` 必須 (CLAUDE.md §4.2)
- **symbolic relation review mandatory**: `inference_type=symbolic` を含む PR は人間レビュー必須 (relation hallucination 警戒、DISC-009 原則 5)
- **過去削除パターン参照**: `docs/audit/deleted_fabrications.md` で類似名 PR を確認

### 2.3 AI 関与が禁止される領域

- `source_reference` の捏造 (一次史料を実際に参照していないのに記載)
- `verified_status=verified` の自動付与 (人間または制度的に確認可能な根拠なし)
- 旧国名網羅生成 (CLAUDE.md §4.2)
- 「(地名)+(神格)+(神社/宮)」型合成名の実在検証なし生成

---

## 3. master 追加 / 修正 (DISC-009 checklist)

`.github/PULL_REQUEST_TEMPLATE.md` の checklist を完了してください:

1. **追加件数 ≤20 件**
2. **distinctive feature 1 つ以上**: 古代社格 / 近代社格 / 別名 / founding_legend 20字+ / notes 20字+ / 詳細住所
3. **「(地名)+(神格)+(神社/宮)」型合成名は実在検証エビデンス必須**
4. **旧国名網羅シリーズ禁止**
5. **fingerprint 重複なし**
6. `verified_status` / `verification_dimension` / `verified_by` / `verification_source` 入力済
7. `inference_type` 明示

PR 作成後、CI で `scripts/check_new_entries.py` が自動実行されます (Phase 1 = warning only、DISC-009)。

---

## 4. relation 追加 (DISC-009 Phase 2 規律)

- 全 relation に `inference_type` 入力必須
- `symbolic` relation は人間レビュー必須
- `source_reference` 必須 (CLAUDE.md §4.1 引用形式)
- 構造化フィールド推奨: `text_id` / `chapter` / `section` / `quote_summary` / `note`

---

## 5. ドキュメント・議論

### 5.1 既存ファイル修正

`docs/discussions/`, `docs/civilization/`, `docs/audit/` 配下は CC BY-SA 4.0 (`LICENSE-INTERPRETATION`)。修正時は editorial discipline を遵守:

- multi-framework coexistence を尊重 (単一理論固定回避)
- competing interpretations の表記を維持
- DISC 記録 (DISC-NNN_resolution.md) の Round 1/2/3 構造を踏襲

### 5.2 大規模変更 (schema / 公開方針)

CLAUDE.md / DISC ドキュメント / LICENSE 変更等は **DISC 起票必須** (`docs/project/20_discussion_protocol.md` v0.2 に従う):

1. issue 起票 (`.github/ISSUE_TEMPLATE/discussion.md`)
2. Claude Round 1 投下
3. Codex Round 2 応答 (or self-rebuttal)
4. Round 3 合意マトリクス
5. `docs/discussions/DISC-NNN_resolution.md` で恒久化

---

## 6. Web (web/) 改善

`web/` は MIT (`LICENSE`)。寄稿時:

- vanilla JS 方針維持 (build step なし)
- `data_loader.js` の cache 設計を尊重
- DISC-011 採択 UI 必須要件:
  - `web/components/disclaimer.html` 由来の interpretation disclaimer
  - L4-L5 表示時の warning badge
  - symbolic relation の視覚マーキング (DISC-010)

---

## 7. 禁止事項 (絶対)

- AI 生成テキストの**直接引用** (例: 「Claude が ◯◯ と述べた」を史料として扱う)
- SNS / Wikipedia のみを根拠とした追加 (一次史料へ遡及せよ)
- L4-L5 仮説を L0 として記載する誤分類
- `verified_status=verified` の根拠なし付与
- 政治的悪用目的 (国家神道復活運動 / 排外主義 / 神話 literalism / pseudo-history) を意図した寄稿

---

## 8. 寄稿フロー

```
1. Issue 起票 (新規追加・修正提案・議論)
   ↓
2. 専用 branch 作成 (claude/<purpose> または feature/<purpose>)
   ↓
3. 変更を実装、ローカルテスト
   - python3 scripts/audit_kpi.py
   - python3 scripts/check_new_entries.py
   ↓
4. PR 作成 (テンプレート完全記入、AI 関与レベル明示)
   ↓
5. CI 通過 (warning レビュー、Phase 1 では merge 可能)
   ↓
6. レビュー (AI 関与レベルにより重み付け)
   ↓
7. Merge (squash 推奨)
   ↓
8. Issue クローズ (state=completed)
```

---

## 9. Code of Conduct

詳細は `CODE_OF_CONDUCT.md`。要旨:

- **epistemic neutrality** 維持 (どの政治立場にも回収されない)
- 史実と仮説の峻別
- 複数説の併記
- AI と人間の協働を歓迎するが、AI 関与の透明性は必須

---

## 10. 関連

- `LICENSE` (MIT、code)
- `LICENSE-DATA` (CC BY-SA 4.0、structured data)
- `LICENSE-INTERPRETATION` (CC BY-SA 4.0、editorial interpretation)
- `CODE_OF_CONDUCT.md`
- `CLAUDE.md` §1-9 (編纂規程)
- `.github/PULL_REQUEST_TEMPLATE.md` (PR checklist)
- `docs/project/20_discussion_protocol.md` (DISC v0.2 議論プロトコル)
- `docs/discussions/DISC-009_resolution.md` (anti-hallucination architecture)
- `docs/discussions/DISC-011_resolution.md` (public epistemology)
