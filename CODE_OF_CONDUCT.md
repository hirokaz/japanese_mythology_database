# Code of Conduct

本プロジェクト `hirokaz/japanese_mythology_database` は、日本神話・神道史・古代史を扱う**学術的編纂プロジェクト**です。寄稿者・利用者全員に以下の規律を求めます。

最終更新: 2026-05-25 (DISC-011 採択)

---

## 1. 行動原則

### 1.1 Epistemic Neutrality (認識論的中立性、DISC-011 採択)

**どの政治立場・宗教立場・学術派閥にも回収されない**知識的中立性を維持します。

具体的に警戒する立場:

- 国家神道復活運動への奉仕
- 排外主義による氏族系譜の操作
- 神話 literalism (神話を文字通り歴史として読む)
- pseudo-history (擬似科学的 ancient civilization 言説)
- 単一学術派閥への過剰追従

これらの目的での寄稿は **拒否**されます。

### 1.2 史実と仮説の峻別 (CLAUDE.md §4)

すべての記載は以下の 4 軸で明示:

- `hypothesis_layer` (L0-L5)
- `confidence_level` (A-E)
- `verified_status` (verified / under_review / unverified / known_fabrication)
- `inference_type` (source_backed / inferential / speculative / symbolic)

「断定」「事実認定」を装った推論記載は許容されません。

### 1.3 Multi-Framework Coexistence (DISC-007 採択)

神話・歴史解釈に**単一理論固定を採用しません**。寄稿時は次の theoretical_framework のいずれを採用するかを明示するか、複数併記してください:

- `structuralist` (レヴィ=ストロース型)
- `archetypal` (ユング・キャンベル型)
- `ritual-functional` (フレイザー・マリノフスキー型)
- `political-legitimacy` (実用主義型、本 DB の中核)

### 1.4 AI Governance (DISC-011 採択)

AI 生成内容は許容しますが、**透明性が必須**:

- AI 関与レベル開示 (CONTRIBUTING.md §2.1)
- AI 生成の symbolic relation は人間レビュー必須
- `source_backed` の捏造禁止 (一次史料への遡及が必須)

---

## 2. コミュニケーション規律

### 2.1 期待される姿勢

- **誠実な誤り報告**: 過去削除事例 (PR #228/#229/#231 で 284 件削除) を踏まえ、誤りを認める文化を共有
- **complementary な議論**: Claude×Codex の DISC プロトコルが示すように、批判は補強の手段
- **多言語対応**: 日本語・英語ともに歓迎、用語の対応は `docs/civilization/12_terminology_glossary.md` に従う

### 2.2 許容されない言動

- 個人攻撃、ハラスメント
- 政治的・宗教的・思想的な押し付け
- 一次史料を引用しない断定
- 「ありそう」を evidence と扱う寄稿の擁護
- 編纂者解釈を「公式見解」「神社認定」「学術 consensus」と偽る発言

---

## 3. 違反への対応

### 3.1 軽微な違反

- PR review でのフィードバック + 修正要求
- 該当寄稿の修正 / 取り消し

### 3.2 重大な違反 (epistemic neutrality 侵害、政治的悪用、捏造)

- PR / issue の即時クローズ
- 寄稿者のアカウントブロック
- 過去寄稿の再レビュー (削除・修正)
- `docs/audit/deleted_fabrications.md` への記録

---

## 4. 検証と透明性

すべての判断は以下に従って公開されます:

- 削除パターン: `docs/audit/deleted_fabrications.md`
- 議論履歴: `docs/discussions/DISC-NNN_resolution.md`
- KPI: `scripts/audit_kpi.py` 実行結果

---

## 5. 関連

- `CONTRIBUTING.md` — 寄稿規律
- `LICENSE-INTERPRETATION` — 編纂解釈のライセンス
- `CLAUDE.md` §4.9 epistemic neutrality / public epistemology
- `docs/discussions/DISC-011_resolution.md` — public epistemology

---

## 6. 連絡先

issue 起票による報告を推奨します:

- セキュリティ・著作権関連: `.github/ISSUE_TEMPLATE/data_correction.md`
- 規律違反の通報: `.github/ISSUE_TEMPLATE/discussion.md` (private な場合は repository owner へ直接連絡)
