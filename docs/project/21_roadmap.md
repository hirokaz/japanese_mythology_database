# 編纂ロードマップ (Codex #237 提案 5)

5 レーンに分けた中長期的な作業優先順位。各 lane の Issue はテンプレート (`.github/ISSUE_TEMPLATE/`) を使って起票する。

最終更新: 2026-05-25

---

## Lane A: データ品質 (最優先)

DISC-002 の RISK-31「AI 生成プレースホルダー混入」が依然として最大リスク。今後の master 追加は厳格化。

### 完了済 (2026-05-24)
- [x] AI 生成エントリ 211 件削除 (PR #229)
- [x] AI 生成 73 件追加削除 + 国造シリーズ 47 件 (PR #231)
- [x] 主祭神誤登録 212 件修正 (PR #221)
- [x] ふりがな本格修正 150+51 件 (PR #225, #228)
- [x] dangling reference 解消 FES-022 追加 (PR #235)
- [x] 重複統合 25 件 (PR #219)

### TODO
- [ ] `verified_status` field を master schema に追加 (DISC-003 確定)
- [ ] 既存エントリ初期値設定 (古代社格保有 → verified、その他 → under_review)
- [ ] 神社庁データ等の外部参照と突合 (人手レビュー)

## Lane B: Web UX (Codex #237 改善提案 2)

### TODO
- [ ] **relations 画面のページネーション + 索引検索** (#237 提案 2)
- [ ] `web/data/index/*.json` 軽量インデックス生成
- [ ] 神社一覧の都道府県フィルタ拡張 (現在は北→南、PR #227 で実施済)
- [ ] 検証状態バッジ (verified_status) を detail page に追加 (DISC-003)
- [ ] 警告色 (`unverified` エントリ非表示 or 警告) (DISC-003)
- [ ] モバイル UX 改善継続

## Lane C: 出典・学術性 (Codex #237 改善提案 4)

### 完了済 (2026-05-25)
- [x] 出典表記ルールを CLAUDE.md §4.1 に追記

### TODO
- [ ] 既存 relation の `source_reference` 構造化検討 (text_id / chapter / section / quote_summary / note)
- [ ] L4-L5 仮説の反対説併記強化
- [ ] extended_summary 充実継続 (deity 70/595, shrine 27/777, clan 25/254, motif 41/500)
- [ ] 外部リンク (国会図書館・神社公式) の検証

## Lane D: 知識グラフ拡張

### TODO
- [ ] Neo4j 投入スクリプト整備
- [ ] Cypher クエリ集 (persona 別、DISC-001 v0.2)
- [ ] motif graph 化 (motif → ritual → political structure 変換、#238 議論)
- [ ] GIS 統合 (神社配置 × 地政学、#238 議論)

## Lane E: 公開・説明資料 + 運用基盤

### 完了済 (2026-05-25)
- [x] README / web/README 件数同期 (#237 提案 1)
- [x] `scripts/generate_stats.py` 自動集計スクリプト
- [x] Issue テンプレート 4 種 (#237 提案 5)
- [x] 本ロードマップ作成 (#237 提案 5)
- [x] 議論プロトコル v0.2 文書化 (DISC-004)

### TODO
- [ ] `docs/civilization/11_web_atlas_design.md` を DISC-001 v0.2 persona で更新
- [ ] `docs/audit/` への DISC-002 リスク 35 項目反映
- [ ] CI に `audit_kpi.py` 統合
- [ ] README に「DB の限界」「未検証エントリ警告」セクション追加

---

## 優先順位 (Codex #237 推奨ベース)

1. **README/web 統計同期** (#237-1) — 完了 ✓
2. **relations 画面ページネーション** (#237-2)
3. **entity detail 動作確認** (#237-3) — 完了 ✓ (entity.html / entity.js + 各 _extended.tsv 整備済)
4. **出典粒度・仮説表示強化** (#237-4) — Part 1 完了 (CLAUDE.md §4.1)
5. **Issue テンプレート + ロードマップ** (#237-5) — 完了 ✓

## 議論レーン (#238 文明 OS 中長期テーマ)

長期議論用、DISC プロトコル v0.2 で進行。
- 文明 OS とは具体的に何か
- 神話を構造として読む方法
- 縄文記憶仮説の境界
- 神社を地理インターフェースとして扱う
- 皇統・豪族・祭祀権力モデル化
- AI 時代の知識編纂
- このDBの最終形

---

## 関連

- `docs/project/15_workflow.md` 既存ワークフロー
- `docs/project/20_discussion_protocol.md` 議論プロトコル v0.2
- `docs/discussions/DISC-NNN_resolution.md` 過去議論の結論
- `.github/ISSUE_TEMPLATE/` Issue 起票テンプレート
- `scripts/generate_stats.py` 統計自動集計
- `scripts/audit_kpi.py` KPI / 整合性監査
