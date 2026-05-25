<!-- DISC-009 anti-hallucination architecture / DISC-006 verified_status governance -->

## Summary

<!-- 1-3 行で変更内容と目的を記述。何を、なぜ -->

## 変更種別

- [ ] [Data] master / relations 追加・修正
- [ ] [Docs] discussion / glossary / CLAUDE.md / README
- [ ] [Web] フロントエンド (web/)
- [ ] [Schema] master / relation 列定義変更
- [ ] [Scripts] audit / ETL スクリプト
- [ ] [CI] workflows / templates

---

## master 追加 / 修正 PR の場合 (DISC-009 checklist)

該当しない場合はスキップ可。

### 追加件数

- [ ] 1 PR あたり **20 件以下** (超える場合は分割理由を明記)
- 件数: ___ 件 / 分割理由: ___

### 各エントリの distinctive feature (1 つ以上必須、CLAUDE.md §4.2)

- [ ] 古代社格 (式内社・名神大社・一宮 等)
- [ ] 近代社格 (官幣・国幣・別表・府社・県社・郷社)
- [ ] 具体的別名・古名 (4 字以上)
- [ ] 詳細な founding_legend (20 字以上)
- [ ] 詳細な notes (20 字以上)
- [ ] 町字を含む詳細住所

### AI hallucination 防止 (DISC-009 原則)

- [ ] **plausibility ≠ evidence**: 「ありそう」だけで追加していない
- [ ] 「(地名)+(神格)+(神社/宮)」型合成名は実在検証エビデンスを添付
- [ ] **旧国名網羅シリーズ**ではない (または各旧国の根拠を個別に明示)
- [ ] **fingerprint 重複**なし (主祭神+rank+founded+notes が大量複製していない)
- [ ] `scripts/check_new_entries.py` を実行し warning レビュー済

### verified_status / verification provenance (DISC-006)

- [ ] 全エントリに `verified_status` 入力済 (verified / under_review / unverified / known_fabrication)
- [ ] `verification_dimension` 入力済 (existence / textual / interpretive / genealogical / ritual)
- [ ] `verified_by` 入力済 (agent / reviewer / claude / codex / human)
- [ ] `verification_source` 入力済 (URL or 出典文字列)

### inference_type 明示 (DISC-005)

- [ ] `inference_type` 入力済 (source_backed / inferential / speculative / symbolic)
- [ ] `source_backed` の場合、一次史料への遡及あり (記紀・延喜式・風土記・社伝 等)

### AI contributor disclosure (DISC-011)

- [ ] **AI 関与レベル**: ☐ human-written ☐ AI-assisted ☐ AI-generated-reviewed ☐ AI-generated
- [ ] AI 生成内容には provenance 明示 (一次史料への遡及または「unverified」明示)

---

## relation 追加 PR の場合 (DISC-009 Phase 2 予告)

- [ ] 全 relation に `inference_type` 入力済
- [ ] `symbolic` relation は人間レビュー必須 (DISC-011 governance)
- [ ] `source_reference` 必須 (`docs/civilization/CLAUDE.md §4.1` の引用形式)

---

## Test plan

<!-- Bulleted markdown checklist of TODOs for testing -->

- [ ] `python3 scripts/audit_kpi.py` PASS
- [ ] `python3 scripts/check_new_entries.py` 実行 (warning レビュー)
- [ ] (Web 変更時) ローカルで動作確認

## 関連

<!-- closes #issue / 関連 PR / 関連 DISC -->
