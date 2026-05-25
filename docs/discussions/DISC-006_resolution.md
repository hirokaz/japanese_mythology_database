# DISC-006 解決報告: verified_status field 実装詳細設計

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#242)
**収束**: 2026-05-25

---

## 結論

`verified_status` field は **「epistemology layer」**そのものであり、単なる UI flag ではなく、本 DB の trust 設計の根幹。Codex Round 2 の規定を全面採用:

- `historically_true` ではなく **`institutionally_verifiable`**
- 削除済 284 件を即 `known_fabrication` 分類は強い判断、**当面 `under_review`**
- UI は段階的緩和 (Phase 1: warning badge のみ、完全非表示は後段階)
- **`verification_dimension`** で entity 別意味を変える

## 確定 schema v0.2

```yaml
# master 共通追加 field (5 種)
verified_status:        [verified, under_review, unverified, known_fabrication]
verification_dimension: [existence, textual, interpretive, genealogical, ritual]  # Codex 提案
verified_at:            ISO8601
verified_by:            "agent|reviewer|claude|codex|human"
verification_source:    "<URL or 出典>"
```

## Verification Dimension (entity 別意味)

| Entity | Dimension | 検証対象 |
|---|---|---|
| shrine | `existence` | 実在性 (神社庁・公式サイト・現地確認) |
| deity | `textual` | 文献・伝統 attestation (記紀・延喜式) |
| motif | `interpretive` | 解釈の安定性 |
| clan | `genealogical` | 系譜証拠の質 |
| ritual/festival | `ritual` | 祭祀継承の実証 |

## 初期値ルール (DISC-003 + Codex Round 2 慎重論)

- 古代社格 (式内/名神大社/一宮/二宮) → `verified`
- 近代社格 (官幣/国幣/別表/府社/県社/郷社) → `verified`
- 著名社保護リスト 130 件 → `verified`
- 削除済 284 件 → **`under_review`** (即 `known_fabrication` は強すぎ、Codex 指摘)
- それ以外 → `under_review` (default)

## UI 段階的緩和

- Phase 1 (初期): verified=normal, under_review=warning badge, **全表示**
- Phase 2 (中期): under_review に warning color (黄/橙)
- Phase 3 (完成): L0 一般は verified のみ、warning は L1+

→ いきなり 80% 非表示しない (Codex 指摘採用)。

## Codex Round 2 主要採用点

1. ✅ **「institutionally_verifiable」**命名 (historically_true との混同回避)
2. ✅ 削除済は当面 under_review (将来 finer granularity: fabricated/modern_creation/disputed/tourism_mythology)
3. ✅ UI 段階的緩和
4. ✅ verified_at/by/source (knowledge provenance)
5. ✅ verification_dimension (entity 別意味)
6. ✅ **epistemology layer** として disciplined 設計

## CLAUDE.md §4.4 追加 (本 PR で実装)

```
verified_status = institutional verifiability  ≠ historical truth
verification_dimension = entity-specific epistemology
verified_at/by/source = knowledge provenance (将来の更新追跡)
```

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 | Claude (起票) | 2026-05-25 11:45 |
| Round 2 | **Codex 応答** (10 分以内) | 2026-05-25 11:54 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 12:00 |
| 収束 | 本 PR | 2026-05-25 |

→ **同日内 15 分で 3 ターン完結**。DISC-005 に続き 2 例目の理想的運用。

## 後続 PR (Lane A: データ品質)

- [ ] master 8 種に新 5 field 追加 (`verified_status` / `verification_dimension` / `verified_at` / `verified_by` / `verification_source`)
- [ ] 初期値設定スクリプト (`scripts/init_verified_status.py`)
- [ ] audit_kpi.py に verified 比率 KPI 追加
- [ ] Web UI に検証状態バッジ (Phase 1 = warning のみ)

## 関連

- 起票: #242
- 親議論: DISC-003 (#179) 公開レイヤ
- 連動: DISC-005 (#238) inference_type 4 軸目
- 用語集: `docs/civilization/12_terminology_glossary.md`
- 削除実績: PR #229 / #231 (284 件、当面 under_review)
