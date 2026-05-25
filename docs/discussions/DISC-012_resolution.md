# DISC-012 解決報告: 文明時間層 — temporal persistence モデル

**ステータス**: 収束 (Codex Round 1 → Claude Round 1 応答 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#265)
**収束**: 2026-05-25

---

## 結論

Codex Round 2 の核心指摘:

> 「文明は何を保持し、何を変えながら継続するのか？」

> 「日本文明は archive persistence より ritual persistence が強い可能性」

> 「continuity と mutation を同時に可視化する必要がある」

本 DB が DISC-005~011 で確立した epistemology / mythologem / sacred topology / graph epistemics の上に、**temporal persistence** を第 8 軸として導入する。

## 確定 8 原則

1. **ritual persistence > archive persistence** — 西洋的 archive 投影回避 (Codex 強調)
2. **process ontology** — Ship of Theseus、entity = process not substance
3. **5 軸 continuity** (物理 / 儀礼 / 制度 / 物語 / 位置) — 単一スコア化禁忌
4. **三重 metric** (continuity / rupture_score / reinterpretation_intensity / revival_status) — Codex Round 2 採用
5. **persistence medium 8 種** で文明継続の媒体を分類 (text / ritual / architecture / lineage / pilgrimage / oral / geography / seasonal) — Codex 新概念
6. **temporal topology = time-as-network** (cycles / lag / asynchrony) — Codex 新概念
7. **continuity illusion 警告** (UI 必須) — Codex 用語、DISC-011 authority illusion の時間版
8. **invented continuity** を独立カテゴリで可視化 (Hobsbawm "Invention of Tradition")

## 確定 schema (5 種、Phase 段階実装)

### Phase 1: `ritual_epoch.tsv` (主要 hub festival 30 件)

```tsv
epoch_id | ritual_id | start_year | end_year | cycle_length |
repetition_count | status | persistence_medium | sync_scope |
source_reference | inference_type | time_confidence | notes
```

### Phase 2: `entity_version.tsv` (主要 30 神社 × 6 epoch = 180 件)

```tsv
entity_id | version_id | epoch_id |
physical_continuity | ritual_continuity | institutional_continuity |
narrative_continuity | location_continuity |
rupture_score | reinterpretation_intensity | revival_status |
source_reference | inference_type | notes
```

各 continuity 軸の値域: `maintained` / `partial_rebuild` / `rebuilt` / `inferred` / `broken` / `unknown`

### Phase 3: `narrative_layer.tsv`

```tsv
entity_id | layer_id | epoch | interpretation_text |
source_reference | inference_type | is_overlay_or_overwrite | notes
```

### Phase 4: `continuity_break.tsv`

```tsv
break_id | entity_id | start_year | end_year | cause |
reactivation_year | reactivation_type | is_civilization_rewrite |
source_reference | inference_type | notes
```

`reactivation_type` 値域: `restored` / `partial_revival` / `reconstructed` / `invented` (差別化必須)
`is_civilization_rewrite=true` の例: 神仏習合 / 廃仏毀釈 / 国家神道 / 戦後再編

### Phase 5: `persistence_medium.tsv`

```tsv
entity_id | medium_type | strength | continuity_window |
source_reference | inference_type | notes
```

`medium_type` 値域: `text` / `ritual` / `architecture` / `lineage` / `pilgrimage` / `oral` / `geography` / `seasonal`

## Neo4j 拡張 (DISC-010 採択 6 category → 7 category)

```cypher
[:CIVILIZATIONAL_SYNC {sync_type, scope, period_unit}]
  // sync_type: agricultural | seasonal | political | cosmic
  // scope: local | regional | network | civilizational
  // period_unit: annual | 7-year | 20-year | reign | mythic

(:Entity)-[:reinterpreted_in]->(:Epoch)
(:Ritual)-[:reactivated_after]->(:Discontinuity)
(:Mythologem)-[:mutated_into]->(:Mythologem)
(:Entity)-[:persists_via]->(:PersistenceMedium)
```

具体例:
- 新嘗祭 → CIVILIZATIONAL_SYNC (agricultural, civilizational, annual)
- 大嘗祭 → CIVILIZATIONAL_SYNC (political, civilizational, reign)
- 式年遷宮 → CIVILIZATIONAL_SYNC (cosmic, network, 20-year)
- 御柱祭 → CIVILIZATIONAL_SYNC (cosmic, regional, 7-year)

## time_confidence 5 値 (Codex Round 2 採用 + Claude 拡張)

| 値 | 意味 | 例 |
|---|---|---|
| `exact` | 年代ほぼ確定 | 753 天平勝宝 5 年 行基没 |
| `approximate` | 世紀レベル | 5C 雄略期、4C 末-5C 初 応神 |
| `relative_only` | 前後関係のみ | 「景行の後、成務の前」 |
| `mythic_time` | 歴史年代不適用 | 神武紀元、神代 |
| `chronology_mode` 別 field: `absolute` / `relative` / `mythic` / `unknown` | | |

`chronology_basis` (元号 / 干支 / 推定 / 神武紀元 / 月暦) も別 field。

## UI 必須要件 (continuity illusion 回避)

- `continuity_score` を **単一数値で表示しない** (5 軸別表示)
- `discontinuity` / `reconstructed` / `invented` を **視覚的に区別** (色・破線)
- `mythic_time` は **historical_time と別軸で表示** (混同回避)
- 「epoch slider」では各 layer を **独立 toggle 可能** に
- `is_civilization_rewrite=true` の event は **赤色強調** で warning 表示

## Codex Round 2 主要採用点

1. ✅ ritual persistence > archive persistence (process ontology 接続)
2. ✅ Ship of Theseus 哲学的接続
3. ✅ 5 軸 continuity + material continuity 表現追加
4. ✅ **三重 metric** (rupture_score / reinterpretation_intensity / revival_status) 新規採用
5. ✅ **persistence medium** 8 種分類採用 (Codex 新概念)
6. ✅ **temporal topology** time-as-network 採用 (Codex 新概念)
7. ✅ **civilization rewrite events** 概念採用 (神仏習合等)
8. ✅ **continuity illusion** 用語採用 (主見出し、temporal authority illusion を別名併記)
9. ✅ time_confidence + chronology_mode 5 値採用

## 用語集追加 (DISC-012 由来、8 用語)

| 用語 | 定義 |
|---|---|
| `ritual persistence` | 反復による文明継続。archive persistence (西洋的文書保存) との対比 |
| `archive persistence` | 文書・法・institution による継続。西洋近代の典型 |
| `process ontology` | entity = process not substance。Ship of Theseus 問題に対応する哲学的基盤 |
| `5 軸 continuity` | 物理 / 儀礼 / 制度 / 物語 / 位置 の独立 continuity 評価。単一スコア化禁忌 |
| `persistence medium` | 文明継続の媒体 8 種 (text / ritual / architecture / lineage / pilgrimage / oral / geography / seasonal)。Codex 提案 |
| `temporal topology` | 時間構造を network として扱う概念。overlapping cycles / asynchronous regions / delayed adoption / ritual lag / reactivation waves を含む |
| `continuity illusion` | 「古代から変わらない」「連綿と続く」「本質は不変」等の錯覚 (Codex 用語)。temporal authority illusion (DISC-011 authority illusion の時間版) と同義 |
| `invented continuity` | 後世に作られた「伝統」(吉田神道復古、明治国家神道による神武創業神話再編等)。Hobsbawm "Invention of Tradition" 参照 |
| `civilization rewrite event` | 神仏習合 / 廃仏毀釈 / 国家神道 / 戦後再編 等の civilization-scale 編集 event |
| `civilizational synchronization clock` | 国家規模 ritual sync の総体 (新嘗祭 / 大嘗祭 / 式年遷宮 / 御柱祭 等) |

## 実装ロードマップ

| Phase | 内容 | 時期 |
|---|---|---|
| Round 3 | 合意マトリクス + 解決 PR | 本 PR |
| Phase 1 | `ritual_epoch.tsv` 30 件 (主要 hub festival) | 本 PR で実装 |
| Phase 2 | `entity_version.tsv` 180 件 (30 神社 × 6 epoch) | 後続 |
| Phase 3 | `narrative_layer.tsv` (主要 motif × 6 epoch) | 後続 |
| Phase 4 | `continuity_break.tsv` 50 件 + `is_civilization_rewrite` | 後続 |
| Phase 5 | `persistence_medium.tsv` + Neo4j CIVILIZATIONAL_SYNC | 後続 |
| Phase 6 | UI 時間軸スライダー (atlas.html / relations.html) | 後続 |

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 起票 | Codex/hirokaz | 2026-05-25 19:05 |
| Round 1 応答 | Claude | 2026-05-25 19:13 |
| Round 2 | **Codex 応答** | 2026-05-25 22:04 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 |
| 収束 | 本 PR | 2026-05-25 |

→ 同日内 3 ターン完結 (DISC-005~011 と同パターン、**8 件連続**達成)。

## 関連

- 起票: #265
- 直前: DISC-005~011 全件収束済
- 用語集: `docs/civilization/12_terminology_glossary.md`
- CLAUDE.md §4.10 temporal persistence
- 連動 layer: DISC-007 mythologem (multi-layered overlays) / DISC-008 sacred topology (evolving ritual topology) / DISC-010 graph epistemics (relation ontology) / DISC-011 epistemic neutrality (authority illusion)
