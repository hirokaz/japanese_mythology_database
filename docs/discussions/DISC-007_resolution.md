# DISC-007 解決報告: mythologem_master.tsv 設計

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#243)
**収束**: 2026-05-25

---

## 結論

mythologem layer は motif (Level 1) と political structure (Level 3) の中間層 (Level 2) として有効。ただし Codex Round 2 の **「全神話を抽象構造へ還元できる幻想」「multi-layered structural overlays として扱う」** という規律を最重要原則とする。

## 確定設計 v0.2

### Schema (`docs/master/mythologem_master.tsv`)

```
mythologem_id
canonical_name
abstract_pattern        # 構造定式 (例: living↔dead | mortal↔divine)
theoretical_framework   # multi-tag: structuralist|archetypal|ritual-functional|political-legitimacy
proposing_scholars      # 例: レヴィ=ストロース|松前健|大林太良
inference_type          # 必須 symbolic
hypothesis_layer        # L2 標準
confidence_level        # C 標準
world_parallels         # Phase 1 は自由記述、Phase 3 で構造化
source_references
```

### Phase 1: 10 mythologem (Codex 推奨 8 + 2)

1. **boundary_traversal** 境界横断
2. **legitimacy_transfer** 正統性継承
3. **concealment_revelation** 隠蔽回復
4. **marriage_integration** 婚姻統合
5. **exchange_gift** 贈与交換
6. **death_rebirth** 死と再生
7. **center_periphery_integration** 中央/周辺統合
8. **periodic_renewal** 周期更新
9. **divine_descent** 神聖降臨
10. **succession_dispute** 継承争い

### 接続: 多対多 (Codex 採用)

新 relation type: `motif_belongs_to_mythologem`

例: MOTIF-001 国譲り → MYTH-002 (legitimacy_transfer) + MYTH-005 (exchange_gift) + MYTH-007 (center_periphery_integration) + MYTH-001 (boundary_traversal)

### Phase 戦略

| Phase | 内容 | mythologem 件数 | motif-mythologem rel |
|---|---|---|---|
| Phase 1 | schema + 代表 motif 接続 | 10 | 50 |
| Phase 2 | 拡張 | 15-30 | 500-1000 |
| Phase 3 | graph query + clustering + world comparison + viz | (UI 実装) | - |

## Codex Round 2 主要採用点

1. ✅ **Multi-framework coexistence** (単一理論固定回避)
2. ✅ 15-30 件粒度
3. ✅ 多対多接続
4. ✅ 世界神話比較は慎重 (false equivalence / Indo-European bias / archetype overgeneralization)
5. ✅ 出典 4 必須 (proposing_scholars / theoretical_framework / inference_type / confidence)
6. ✅ Phase 1-3 段階実装
7. ✅ **multi-layered structural overlays 原則**

## 改訂された原則 (CLAUDE.md 追加検討)

```
- mythologem は研究者の抽象 = inference_type=symbolic 必須
- 単一理論固定は避け、multi-framework tag を許容
- 世界神話比較は慎重 (false equivalence / Indo-European bias / archetype overgeneralization)
- 「全神話を抽象構造へ還元できる」幻想を排し、multi-layered structural overlays として扱う
- 日本神話の地方差・時代差・編集層・習合を尊重
```

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 | Claude (起票) | 2026-05-25 11:46 |
| Round 2 | **Codex 応答** | 2026-05-25 11:54 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 12:01 |
| 収束 | 本 PR | 2026-05-25 |

→ **同日内 15 分で 3 ターン完結**。

## 後続 PR (Lane D: 知識グラフ拡張)

- [ ] `docs/master/mythologem_master.tsv` 新規 (Phase 1: 10 件)
- [ ] `relations.tsv` に `motif_belongs_to_mythologem` 関係追加 (50 件)
- [ ] Web 詳細ページに mythologem 表示
- [ ] Phase 2 拡張 (15-30 件、motif 全体接続)

## 関連

- 起票: #243
- 親議論: DISC-005 (#238) Mythologem layer 賛成
- 用語集: `docs/civilization/12_terminology_glossary.md`
