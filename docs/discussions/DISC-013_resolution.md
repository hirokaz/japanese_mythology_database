# DISC-013 解決報告: spatial ontology / ritual space モデル

**ステータス**: 収束 (Round 1 起票 → Claude Round 1 応答 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#272)
**収束**: 2026-05-25

---

## 結論

DISC-008 sacred topology が「神社ネットワーク = 空間構造の関係」を扱ったのに対し、DISC-013 は「**祭祀空間そのものの内部構造**」を扱う補完層。DISC-012 temporal persistence と並行する **第 9 軸 (空間内部構造)** として位置付け。

Codex Round 2 の核心指摘:
> 同じ location でも epoch によって role が変化する可能性 → DISC-012 強連動
> 空間 relation は pattern を読み込みすぎやすい → direct/inferred/interpretive を分離

## 確定 6 原則

1. **boundary structure を entity 化** (torii / bridge / gate / axial_pillar / perimeter / threshold / path / stone_marker / slope / coastline 10 種)
2. **landscape は type (形態) + role (機能) の 2 軸評価** — Codex 提案 `landscape_role` を採用
3. **ritual_space は geometry (point/polygon/network_path) + visualization_confidence で記述**
4. **spatial_interpretation は DISC-012 narrative_layer と並行構造** (overlay/overwrite 二分採用)
5. **evidence_type 3 値** (direct / inferred / interpretive) で空間解釈の overread を防止 (Codex 強調)
6. **mythologem との横断接続** (MTGM-001 boundary_traversal / MTGM-014 pillar_axis_mundi / MTGM-019 tabuized_visibility が物理具現)

## 確定 schema (4 種、Phase 段階実装)

### Phase 1: `boundary_structure.tsv` (30 件、本 PR で実装)

```tsv
boundary_id  entity_id  canonical_name  boundary_type  position_within
symbolic_function  evidence_type  source_reference  inference_type  notes
```

`boundary_type` 値域 (10 種):
- `torii` (鳥居) / `bridge` (橋) / `gate` (門) / `slope` (坂) / `coastline` (海岸)
- `path` (山道・巡礼路) / `axial_pillar` (御柱・心御柱) / `perimeter` (禁足境)
- `threshold` (禊場・橋詰) / `stone_marker` (要石等)

`position_within` 値域: `outer` / `inner` / `axial` / `perimeter` / `threshold` / `path`

`evidence_type` 値域 (Codex 採用):
- `direct` — 一次史料に記述あり (神宮儀式帳・社伝等)
- `inferred` — 妥当な推論
- `interpretive` — 解釈層

### Phase 2: `sacred_landscape.tsv` (20 件、後続)

```tsv
landscape_id  entity_id  landscape_type  landscape_role  geographic_feature
ritual_focus  founding_legend  evidence_type  source_reference  inference_type  notes
```

`landscape_type` (形態): `mountain_worship` / `maritime_corridor` / `river_basin_ritual` / `spring_water_ritual` / `coastal_ritual` / `fault_line` / `pilgrimage_path` / `megalith` / `pass_crossing`

`landscape_role` (機能、Codex 提案): `boundary_marker` / `axis_mundi` / `purification` / `sacred_threshold` / `cosmic_pillar` / `tabu_zone` / `network_node` 等

→ **type + role の 2 軸独立**で同一形態の epoch 別 role 変化を表現。

### Phase 3: `ritual_space.tsv` (15 件、後続)

```tsv
space_id  entity_id  space_type  geometry_type  area_estimate
visualization_confidence  source_reference  inference_type  notes
```

`geometry_type`: `point` / `polygon` / `network_path` / `axis` / `radius` / `boundary_line`
`visualization_confidence` (DISC-008 採用): `archaeological` / `textual` / `inferred` / `speculative`

### Phase 4: `spatial_interpretation.tsv` (30 件、後続、DISC-012 連動)

```tsv
interp_id  entity_id  epoch  spatial_meaning  is_overlay_or_overwrite
source_reference  inference_type  notes
```

→ DISC-012 `narrative_layer.tsv` と並行構造。同一空間の epoch 別意味重畳 (overlay) と上書き (overwrite) を表現。

## Neo4j 拡張 (DISC-010 6 + DISC-012 7 → 8 category 検討)

Phase 5+ で新規 **SPATIAL_STRUCTURE** category 検討:

```cypher
[:SPATIAL_STRUCTURE {boundary_type, position_within, symbolic_function}]
  // 例: (:Shrine)-[:HAS_BOUNDARY]->(:Boundary)
  //     (:Shrine)-[:LANDSCAPE_TYPE]->(:Landscape)
  //     (:Shrine)-[:OCCUPIES]->(:RitualSpace)
  //     (:RitualSpace)-[:REINTERPRETED_IN {epoch}]->(:SpatialInterpretation)
```

DISC-007 mythologem との横断接続:
- MTGM-001 boundary_traversal → boundary_type=torii/bridge
- MTGM-014 pillar_axis_mundi → boundary_type=axial_pillar
- MTGM-019 tabuized_visibility → boundary_type=perimeter

## UI 統合 (将来)

- `web/pages/temporal.html` または `atlas.html` に boundary overlay layer 追加
- popup で symbolic_function の mythologem connection 表示
- evidence_type 別の色分け表示 (direct=実線、inferred=点線、interpretive=破線)

## Codex Round 2 主要採用点

1. ✅ boundary_type entity 化
2. ✅ **landscape_role** (Codex 新概念) 採用、type と独立 2 軸
3. ✅ ritual_space + epoch 別 role 変化の DISC-012 強連動
4. ✅ **evidence_type 3 値** で空間解釈リスク分離 (overread 防止)
5. ✅ direct / inferred / interpretive の 3 値で「pattern 読み込みすぎ」を防止

## 用語集追加 (DISC-013 由来、7 用語)

| 用語 | 定義 |
|---|---|
| `sacred boundary` | 俗→聖境界を構成する物理・概念構造 (鳥居・橋・川・坂等) |
| `landscape type` | 神社の地理的形態類型 (山岳/海岸/水源/峠等) |
| `landscape role` | 同一形態でも epoch・文脈により変化する機能的役割 (Codex 提案) |
| `ritual space geometry` | 祭祀空間の幾何学的範囲 (point/polygon/network_path) |
| `spatial layer overlay` | 同一空間の時代別意味重畳 (DISC-012 narrative_layer の空間版) |
| `axial pillar` | axis mundi の物理具現 (御柱・心御柱) |
| `evidence_type` | direct (一次史料) / inferred (推論) / interpretive (解釈層) の分離。Codex 提案、空間 overread 防止 |

## 実装ロードマップ

| Phase | 内容 | 状況 |
|---|---|---|
| Round 3 | 合意マトリクス + 解決 PR | 本 PR |
| Phase 1 | boundary_structure 30 件 | **本 PR で実装** |
| Phase 2 | sacred_landscape 20 件 (type + role 2 field) | 後続 |
| Phase 3 | ritual_space 15 件 (GIS overlay) | 後続 |
| Phase 4 | spatial_interpretation 30 件 (DISC-012 連動) | 後続 |
| Phase 5 | Neo4j SPATIAL_STRUCTURE category 検討 | 後続 |
| Phase 6 | UI 統合 (temporal.html / atlas.html overlay) | 後続 |

## DISC-004 v0.2 運用実績 (DISC-013)

| Round | 主体 | 時刻 |
|---|---|---|
| Round 1 起票 | hirokaz/Codex | 2026-05-25 22:54 |
| Round 1 応答 | Claude | 2026-05-25 22:57 |
| Round 2 | **Codex 応答** | 2026-05-25 23:20 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 |
| 収束 | 本 PR | 2026-05-25 |

→ 同日内 3 ターン完結。**DISC-005~013 で 9 件連続**達成。

## 関連

- 起票: #272
- DISC-008 sacred topology (space relations 補完先)
- DISC-012 temporal persistence (epoch 別 role 変化 = narrative_layer の空間版)
- DISC-007 mythologem (boundary_traversal / pillar_axis_mundi / tabuized_visibility の物理具現)
- CLAUDE.md §4.11 spatial ontology 原則
