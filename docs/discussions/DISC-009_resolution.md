# DISC-009 解決報告: AI Hallucination 防止の構造的メカニズム

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#246)
**収束**: 2026-05-25

---

## 結論

AI hallucination は「ミス」ではなく**構造的に増殖する圧力**として扱う。Codex Round 2 の核心指摘:

> 「AI を禁止する」のではなく、「AI hallucination pressure を構造的に抑制する」

を中核原則として恒久化。

## 確定 7 原則

1. **plausibility ≠ evidence** — 「ありそう」を reject する (Codex 強調)
2. **fingerprint detection は escalation review** — hard reject は八幡・稲荷・天神等の高類似 network を誤検出するため
3. **too systematic = suspicious** — 非対称性・欠損・偏在を期待値とする (実世界神社分布は対称的でない)
4. **feature provenance > feature quantity** — distinctive feature の数より出所明示を重視
5. **relation hallucination は entity hallucination より将来的に危険** — 意味ありげな繋ぎ、graph visualization と結合で persuasive
6. **CI Phase 1 = warning only** — false positive 懸念のため suspiciousness scoring 蓄積から
7. **epistemic anomaly detection** — graph-level hallucination 検出 (Phase 3+)

## 過去パターン分類 (PR #229/#231 削除 284 件の整理)

| # | パターン | 件数 | 検出ロジック |
|---|---|---|---|
| 1 | 旧国名×神格網羅 (春日神社・国分八幡 等) | 29 | 旧国名と神格名の組合せで網羅率 >80% |
| 2 | 同一 fingerprint 大量複製 | 145 | 主祭神+rank+founded+notes thin → hash 衝突 5+ 件 |
| 3 | 「(地名)+(神格)+(神社/宮)」型 + distinctive feature なし | 63 | 合成名パターン + features=0 |
| 4 | 国造(旧国名) clan シリーズ | 47 | clan_master の旧国名網羅 |

## 実装ロードマップ

| Phase | 内容 | 時期 |
|---|---|---|
| **Phase 1 (即実装)** | `scripts/check_new_entries.py` (warning only) + PR テンプレ強化 + `docs/audit/deleted_fabrications.md` | 本 DISC 後続 PR |
| Phase 2 | **relation provenance チェック** (新規 relation の `inference_type` 必須) | mythologem layer 実装後 |
| Phase 3 | **epistemic anomaly detection** (graph-level、Neo4j 連動) | DISC-010 実装後 |
| Phase 4 | **provenance entropy** 計測 (trust analysis) | graph DB 成熟後 |

## Codex Round 2 主要採用点

1. ✅ generic plausibility ≠ evidence
2. ✅ fingerprint → escalation review (not hard reject)
3. ✅ too systematic = suspicious heuristic
4. ✅ feature provenance も同等重視
5. ✅ **relation hallucination の将来的危険性**
6. ✅ Phase 1 = warning only
7. ✅ **epistemic anomaly detection** / **provenance entropy** 用語採用

## 用語集追加 (DISC-009 由来)

| 用語 | 定義 |
|---|---|
| `epistemic anomaly detection` | sudden dense clusters / symmetric expansion / identical note structures / unusual relation fan-out / ontology drift 等の graph-level 異常を検出する手法 |
| `provenance entropy` | entity / relation が多様な independent source に依存しているか、単一 AI inference か、repeated copy chain かを定量化する trust analysis |
| `pattern completion hallucination` | AI が旧国名・神格・地名・社格等の pattern から plausible but nonexistent entity を生成する現象 |
| `anti-hallucination architecture` | 単一 CI チェックではなく、PR 時点予防 + relation provenance + graph anomaly + provenance entropy を統合した多層防御 |

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 | Claude (起票) | 2026-05-25 12:07 |
| Round 2 | **Codex 応答** | 2026-05-25 12:54 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 |
| 収束 | 本 PR | 2026-05-25 |

→ 同日内 3 ターン完結。

## 後続 PR (Lane A: データ品質)

- [ ] `scripts/check_new_entries.py` 実装 (warning only)
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` 強化 (DISC-009 checklist)
- [ ] `docs/audit/deleted_fabrications.md` 過去 284 件記録
- [ ] CI 統合 (Phase 1: warning)
- [ ] Phase 2 relation provenance check (mythologem 後)

## 関連

- 起票: #246
- DISC-002 (#178) RISK-31 「AI 生成プレースホルダー混入」
- DISC-006 (#242) verified_status (検出後の状態管理)
- DISC-005 (#238) inference_type 4 軸
- 用語集: `docs/civilization/12_terminology_glossary.md`
- CLAUDE.md §4.7 anti-hallucination architecture
