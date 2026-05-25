# DISC-010 解決報告: Neo4j 投入戦略 + Cypher クエリ集

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#247)
**収束**: 2026-05-25

---

## 結論

Codex Round 2 の核心指摘:

> 「読む DB」から「探索・推論する DB」へ移行する境界

つまり repository **全体の phase transition** として扱う。**label-based node + relation ontology + hypothesis-aware query** を本 DB の独自性として確立する。

## 確定 6 原則

1. **label-based node + multi-label** — `(:Entity:Shrine)` 等、ontology clarity 最優先
2. **relation ontology 化** — 6 大 category (ritual / lineage / authority / geographic / symbolic / synchronization)
3. **symbolic ↔ source-backed の query-layer 分離** — `inference_type=symbolic` の relation は query default 除外
4. **hypothesis-aware query** — `r.hypothesis_layer IN ['L0','L1']` 等を本 DB の独自性として全 persona query の標準フィルタに
5. **temporal graph = evolving civilization graph** — 勧請・分祀・遷宮・神階授与・一宮化は graph mutation event
6. **graph visualization の false coherence 警告** — relation confidence / source visibility / symbolic warning / layer filtering を必須要件

## 確定 Schema

### Node (multi-label)

```cypher
(:Entity:Shrine    {master_id, canonical_name, ..., verified_status, ...})
(:Entity:Deity     {master_id, ...})
(:Entity:Clan      {master_id, ...})
(:Entity:Motif     {master_id, ...})
(:Entity:Mythologem {mythologem_id, ...})
(:Entity:Text      {master_id, ...})
(:Entity:Period    {master_id, ...})
(:Entity:Rank      {master_id, ...})
(:Entity:Event     {master_id, ...})
(:Entity:Region    {master_id, ...})
(:Entity:Festival  {master_id, ...})
```

### Relation (6 category × 既存 relation_type)

```cypher
[:RITUAL          {relation_type, hypothesis_layer, confidence_level, inference_type, source_reference}]
[:LINEAGE         {...}]
[:AUTHORITY       {...}]
[:GEOGRAPHIC      {...}]
[:SYMBOLIC        {...}]    // default query 除外候補
[:SYNCHRONIZATION {...}]    // temporal graph 用
```

## Persona 別 query 設計 (DISC-001 v0.2 連動)

| Persona | view | 標準フィルタ | 内容 |
|---|---|---|---|
| **A 研究者** | full + contradiction overlay | なし (反対説・併記説含む) | 横断仮説生成、symbolic も含む |
| **B 神職** | verified + lineage focus | `verified_status IN ['verified','under_review']` | 分祀系統、勧請履歴 |
| **C 教育者** | pedagogically safe | `verified_status='verified' AND hypothesis_layer='L0' AND inference_type<>'symbolic'` | speculative cluster なし |
| **D 観光** | shrine + region focus | `verified_status='verified' AND prefecture=$p` | 古代社格保有社、観光ルート |

各 Persona 5-10 query (合計 30+) を `docs/civilization/13_cypher_queries.md` に整備。

## ホスティング 3 段階 (Codex 推奨)

| Phase | ホスト | 公開範囲 |
|---|---|---|
| Phase 1 | **Aura Free** | internal only |
| Phase 2 | Aura Free / Pro | read-only API (Persona B/C) |
| Phase 3 | self-hosted | full (Persona A 学術アクセス) |

## ETL 方針

- 初回 bulk: **LOAD CSV** (シンプルさ優先、neo4j-admin import は DB 停止必要なため)
- 増分更新: `MERGE` ベース (idempotent)
- スクリプト: `scripts/tsv_to_cypher.py` で TSV → Cypher 変換

## Index 戦略

```cypher
CREATE INDEX FOR (n:Entity) ON (n.master_id);
CREATE INDEX FOR (n:Shrine) ON (n.prefecture);
CREATE INDEX FOR (n:Shrine) ON (n.shrine_rank_ancient);
CREATE INDEX FOR (n:Entity) ON (n.verified_status);
CREATE FULLTEXT INDEX entityNames FOR (n:Entity) ON EACH [n.canonical_name, n.kana];
```

## Codex Round 2 主要採用点

1. ✅ label-based node (案 1)、Entity+type property 方式 (案 2) 不採用
2. ✅ `(:Entity:Shrine)` multi-label allowed
3. ✅ **relation ontology 化** (6 category)
4. ✅ symbolic_relation と source_backed_relation の query-layer 分離
5. ✅ **hypothesis-aware query** を本 DB の独自性として確立
6. ✅ **evolving civilization graph** (temporal、static atlas 脱却)
7. ✅ Persona C pedagogically safe / Persona A contradiction-rich
8. ✅ Aura Free internal → API → self-hosted 3 段階
9. ✅ **false coherence** 警告を visualization の必須要件に

## 用語集追加 (DISC-010 由来)

| 用語 | 定義 |
|---|---|
| `hypothesis-aware query` | `hypothesis_layer` / `confidence_level` / `verified_status` / `inference_type` の 4 軸でフィルタする本 DB 独自の graph query 様式 |
| `evolving civilization graph` | 勧請・分祀・遷宮・神階授与・一宮化等を graph mutation event として時間軸で記録する temporal graph |
| `false coherence` | graph visualization により「繋がって見える」だけで因果・歴史的継承・実在関係を錯覚する現象 |
| `pedagogically safe graph` | Persona C 教育者向けに L0+verified+non-symbolic でフィルタした graph view |
| `contradiction-rich query` | Persona A 研究者向けに反対説・併記説・competing interpretations を含む query |

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 | Claude (起票) | 2026-05-25 12:08 |
| Round 2 | **Codex 応答** | 2026-05-25 12:51 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 |
| 収束 | 本 PR | 2026-05-25 |

→ 同日内 3 ターン完結。

## 後続 PR (Lane C: アーキテクチャ)

- [ ] `scripts/tsv_to_cypher.py` ETL 実装
- [ ] `docs/civilization/13_cypher_queries.md` 4 persona × 5-10 query
- [ ] `scripts/load_neo4j.sh` 投入スクリプト
- [ ] Aura Free instance internal setup
- [ ] mythologem 投入 (DISC-007 連動)
- [ ] temporal graph + sync event 時間軸 (DISC-008 連動)
- [ ] read-only API (Persona B/C)

## 関連

- 起票: #247
- DISC-001 (#177) Persona A 研究者
- DISC-005 (#238) テーマ 7 探索する DB
- DISC-007 (#243) mythologem layer Phase 3 = graph query
- DISC-008 (#244) sacred topology = temporal graph
- DISC-009 (#246) relation hallucination 警告
- CLAUDE.md §4.8 graph epistemics 原則
- 用語集: `docs/civilization/12_terminology_glossary.md`
