# Cypher Query 集 (DISC-010 採択)

本 DB を Neo4j に load した後の query reference。DISC-001 v0.2 で定義した 4 persona ごとに **hypothesis-aware query** + **symbolic ↔ source-backed の query-layer 分離** を活用したサンプル集。

最終更新: 2026-05-25 (DISC-010 採択時に整備)

---

## 前提: schema

DISC-010 採択原則 (CLAUDE.md §4.8):

```cypher
// Node (multi-label)
(:Entity:Shrine    {master_id, canonical_name, ..., verified_status, ...})
(:Entity:Deity     {master_id, ...})
(:Entity:Clan      {master_id, ...})
(:Entity:Motif     {master_id, ...})
(:Entity:Mythologem {mythologem_id, ...})  // Phase 3 で投入
(:Entity:Text      {text_id, ...})
(:Entity:Period    {period_id, ...})
(:Entity:Rank      {rank_id, ...})
(:Entity:Event     {event_id, ...})
(:Entity:Region    {region_id, ...})
(:Entity:Festival  {festival_id, ...})

// Relation (6 category)
[:RITUAL          {relation_type, hypothesis_layer, confidence_level, inference_type, source_reference, ...}]
[:LINEAGE         {...}]
[:AUTHORITY       {...}]
[:GEOGRAPHIC      {...}]
[:SYMBOLIC        {...}]    // query default 除外候補
[:SYNCHRONIZATION {...}]
[:ASSOC           {...}]    // 未分類 fallback
```

すべての relation は `relation_type` (具体名、例 `descended_from`) と category label の両方を保持。

## 標準フィルタ (本 DB 独自性、Codex 評価)

**hypothesis-aware query** を全 persona で標準化:

```cypher
// 強い epistemic filter (source-backed のみ)
WHERE r.hypothesis_layer IN ['L0', 'L1']
  AND r.inference_type <> 'symbolic'
  AND r.confidence_level IN ['A', 'B']

// 弱い filter (under_review も含める、L3 民間伝承も可)
WHERE r.hypothesis_layer IN ['L0', 'L1', 'L2', 'L3']

// false coherence 警告対応 (DISC-010): symbolic を visual で別色表示するため category 分離
MATCH (s)-[r:RITUAL|LINEAGE|AUTHORITY|GEOGRAPHIC|SYNCHRONIZATION]->(t)  // symbolic 除外
```

---

## Persona A: 研究者 (contradiction-rich query)

DISC-010 採択: **反対説・併記説・competing interpretations を含む** query を許容。

### A-1: 国譲り神話の全 motif と関連神社・神格 (横断仮説生成)

```cypher
MATCH (m:Motif {motif_id: 'MOTIF-001'})-[r1:SYMBOLIC]-(n)
WHERE n.verified_status IN ['verified', 'under_review']
OPTIONAL MATCH (n)-[r2:LINEAGE|AUTHORITY]-(o)
WHERE o.verified_status = 'verified'
RETURN m, n, o, r1.hypothesis_layer AS layer, r1.inference_type AS itype
ORDER BY layer, itype;
```

### A-2: 八幡分祀 5 層ネットワーク (descended_from 多段)

```cypher
MATCH path = (s:Shrine {master_id: 'SHR-016'})<-[:LINEAGE*1..5 {relation_type: 'descended_from'}]-(d:Shrine)
RETURN path, length(path) AS depth, d.canonical_name AS shrine
ORDER BY depth;
```

### A-3: 矛盾する relation の検出 (両論並記)

```cypher
MATCH (a)-[r1:LINEAGE]->(b), (a)-[r2:LINEAGE]->(c)
WHERE r1.relation_type = 'descended_from'
  AND r2.relation_type = 'descended_from'
  AND b <> c
  AND r1.hypothesis_layer <> r2.hypothesis_layer
RETURN a.canonical_name, b.canonical_name, c.canonical_name,
       r1.hypothesis_layer AS layer1, r2.hypothesis_layer AS layer2;
```

### A-4: 古代社格保持社と祭神の双方 verified

```cypher
MATCH (s:Shrine)-[r:RITUAL {relation_type: 'primary_deity_of'}]-(d:Deity)
WHERE s.shrine_rank_ancient CONTAINS '名神大社'
  AND s.verified_status = 'verified'
  AND d.verified_status = 'verified'
  AND r.confidence_level IN ['A', 'B']
RETURN s.canonical_name AS 神社, d.canonical_name AS 主祭神, s.shrine_rank_ancient AS 社格;
```

### A-5: L4-L5 仮説の出典付き列挙 (両論並記対象)

```cypher
MATCH (a)-[r]->(b)
WHERE r.hypothesis_layer IN ['L4', 'L5']
RETURN a.canonical_name, type(r) AS category, r.relation_type, b.canonical_name,
       r.hypothesis_layer, r.source_reference;
```

### A-6: 出雲・伊勢・諏訪 3 拠点の祭神共有検出

```cypher
WITH ['SHR-001', 'SHR-002', 'SHR-006'] AS hubs
MATCH (s:Shrine)-[r:RITUAL]-(d:Deity)
WHERE s.master_id IN hubs
WITH d, collect(DISTINCT s.canonical_name) AS shrines, count(DISTINCT s) AS n
WHERE n > 1
RETURN d.canonical_name AS 神格, shrines AS 共有神社, n AS 共有数;
```

### A-7: 氏族の祖神-現存神社チェーン (祭祀権分析)

```cypher
MATCH (c:Clan)-[:LINEAGE {relation_type: 'descended_from'}]->(d:Deity)<-[:RITUAL]-(s:Shrine)
OPTIONAL MATCH (c)-[ctl:AUTHORITY]->(s)
RETURN c.canonical_name AS 氏族, d.canonical_name AS 祖神, s.canonical_name AS 神社,
       ctl.relation_type AS 統制関係;
```

---

## Persona B: 神職 (verified focus、lineage and sync)

### B-1: 自社+分祀系統 (祖から子孫まで、verified preferred)

```cypher
MATCH path = (root:Shrine)-[:LINEAGE*1..5 {relation_type: 'descended_from'}]-(child:Shrine)
WHERE root.master_id = $shrine_id
  AND child.verified_status IN ['verified', 'under_review']
RETURN path, child.verified_status AS status
ORDER BY length(path);
```

### B-2: 自社の祭祀権 (control / 祭祀記録)

```cypher
MATCH (s:Shrine {master_id: $shrine_id})
OPTIONAL MATCH (c:Clan)-[r:AUTHORITY]->(s)
OPTIONAL MATCH (s)-[rf:RITUAL]->(f:Festival)
RETURN s.canonical_name AS 神社, collect(DISTINCT c.canonical_name) AS 統制氏族,
       collect(DISTINCT f.canonical_name) AS 祭祀;
```

### B-3: 主祭神 + 配祀神 (verified)

```cypher
MATCH (s:Shrine {master_id: $shrine_id})-[r:RITUAL]-(d:Deity)
WHERE d.verified_status = 'verified'
RETURN d.canonical_name AS 神格, r.relation_type AS 関係,
       d.canonical_reading AS 読み;
```

### B-4: 神階授与履歴 (3 代実録参照)

```cypher
MATCH (s:Shrine {master_id: $shrine_id})-[r:AUTHORITY {relation_type: 'has_rank'}]-(rk:Rank)
RETURN s.canonical_name, rk.canonical_name AS 神階,
       r.valid_from, r.source_reference
ORDER BY r.valid_from;
```

### B-5: 同名神社 (同系統候補) の確認

```cypher
MATCH (s:Shrine)
WHERE s.canonical_name CONTAINS $name_substring
  AND s.verified_status IN ['verified', 'under_review']
RETURN s.master_id, s.canonical_name, s.prefecture, s.shrine_rank_ancient;
```

### B-6: 自社祭祀の継承 (世代)

```cypher
MATCH (c:Clan {master_id: $clan_id})-[:LINEAGE*1..]->(ancestor:Clan)
WHERE ancestor.verified_status = 'verified'
RETURN c.canonical_name AS 氏族, collect(ancestor.canonical_name) AS 系譜;
```

---

## Persona C: 教育者 (pedagogically safe graph)

DISC-010 採択: **`verified_status='verified' AND hypothesis_layer='L0' AND inference_type<>'symbolic'`** がデフォルトフィルタ。

### C-1: 教科書水準の祭神-神社対応

```cypher
MATCH (s:Shrine)-[r:RITUAL {relation_type: 'primary_deity_of'}]-(d:Deity)
WHERE s.verified_status = 'verified'
  AND d.verified_status = 'verified'
  AND r.hypothesis_layer = 'L0'
  AND r.confidence_level IN ['A', 'B']
RETURN s.canonical_name AS 神社, d.canonical_name AS 主祭神
ORDER BY s.canonical_name
LIMIT 50;
```

### C-2: 名神大社一覧 (教育向け基本データ)

```cypher
MATCH (s:Shrine)
WHERE s.shrine_rank_ancient CONTAINS '名神大社'
  AND s.verified_status = 'verified'
RETURN s.master_id, s.canonical_name, s.prefecture
ORDER BY s.prefecture, s.canonical_name;
```

### C-3: 古事記 / 日本書紀記載神格

```cypher
MATCH (d:Deity)-[r:SYMBOLIC|RITUAL {relation_type: 'mentioned_in'}]-(t:Text)
WHERE t.canonical_title IN ['古事記', '日本書紀']
  AND d.verified_status = 'verified'
  AND r.hypothesis_layer IN ['L0', 'L1']
RETURN DISTINCT d.canonical_name AS 神格, collect(t.canonical_title) AS 出典文献
ORDER BY 神格;
```

### C-4: 三輪山・出雲・伊勢の関係 (基本)

```cypher
MATCH (s:Shrine)
WHERE s.master_id IN ['SHR-001', 'SHR-002', 'SHR-005']
MATCH (s)-[r:RITUAL|LINEAGE]-(d)
WHERE r.hypothesis_layer IN ['L0', 'L1']
  AND r.inference_type <> 'symbolic'
RETURN s.canonical_name AS 神社, type(r) AS 関係種別, d.canonical_name AS 関連;
```

### C-5: 安全な系譜 (神代天皇は除外)

```cypher
MATCH (a:Deity)-[r:LINEAGE {relation_type: 'parent_of'}]->(b:Deity)
WHERE a.verified_status = 'verified'
  AND b.verified_status = 'verified'
  AND r.confidence_level IN ['A', 'B']
RETURN a.canonical_name AS 親, b.canonical_name AS 子, r.source_reference AS 出典;
```

---

## Persona D: 観光 (region + rank focus)

### D-1: 都道府県の式内社一覧

```cypher
MATCH (s:Shrine {prefecture: $pref})
WHERE s.shrine_rank_ancient CONTAINS '式内'
  AND s.verified_status = 'verified'
RETURN s.canonical_name AS 神社, s.address AS 住所, s.shrine_rank_ancient AS 社格
ORDER BY s.canonical_name;
```

### D-2: 一宮巡り (旧国別)

```cypher
MATCH (s:Shrine)
WHERE s.shrine_rank_ancient CONTAINS '一宮'
  AND s.verified_status = 'verified'
RETURN s.canonical_name AS 神社, s.address AS 住所, s.shrine_rank_ancient AS 社格
ORDER BY s.shrine_rank_ancient;
```

### D-3: 八幡 5 層分祀の主要拠点

```cypher
MATCH (root:Shrine {master_id: 'SHR-016'})<-[:LINEAGE*1..2 {relation_type: 'descended_from'}]-(s:Shrine)
WHERE s.verified_status = 'verified'
RETURN s.canonical_name AS 神社, s.prefecture AS 都道府県
ORDER BY s.prefecture;
```

### D-4: 熊野古道 99 王子社 (現地巡礼)

```cypher
MATCH (root:Shrine {master_id: 'SHR-004'})<-[:LINEAGE {relation_type: 'descended_from'}]-(s:Shrine)
WHERE s.canonical_name CONTAINS '王子'
RETURN s.canonical_name AS 神社, s.address AS 住所
ORDER BY s.canonical_name;
```

### D-5: 近代社格上位社 (官幣社・国幣社・別格官幣社)

```cypher
MATCH (s:Shrine {prefecture: $pref})
WHERE (s.shrine_rank_modern CONTAINS '官幣'
       OR s.shrine_rank_modern CONTAINS '国幣'
       OR s.shrine_rank_modern CONTAINS '別格官幣社')
  AND s.verified_status = 'verified'
RETURN s.canonical_name, s.address, s.main_deity_ids
ORDER BY s.canonical_name;
```

---

## Mythologem-Aware Query (DISC-007 連動、Level 2 抽象層)

mythologem (Level 2) は研究者の象徴的抽象 = `inference_type=symbolic` 必須。query default で除外しているが、研究用途には積極的に使う。

### M-1: 特定 mythologem に属する全 motif と接続 entity

```cypher
MATCH (m:Mythologem {mythologem_id: 'MTGM-002'})  // legitimacy_transfer
MATCH (motif:Motif)-[r:SYMBOLIC {relation_type: 'motif_belongs_to_mythologem'}]->(m)
OPTIONAL MATCH (motif)-[r2:SYMBOLIC|RITUAL]-(target)
RETURN m.japanese_name AS mythologem,
       motif.motif_name AS motif,
       collect(DISTINCT target.canonical_name)[..5] AS 関連 entities;
```

### M-2: theoretical_framework 別 mythologem 一覧

```cypher
MATCH (m:Mythologem)
WHERE m.theoretical_framework CONTAINS 'political-legitimacy'
RETURN m.mythologem_id, m.japanese_name, m.theoretical_framework,
       m.proposer_or_school AS 提唱者
ORDER BY m.mythologem_id;
```

### M-3: 1 motif が複数 mythologem に属する多対多接続検出

```cypher
MATCH (motif:Motif)-[r:SYMBOLIC {relation_type: 'motif_belongs_to_mythologem'}]->(m:Mythologem)
WITH motif, collect(m.japanese_name) AS mythologems, count(m) AS n
WHERE n > 1
RETURN motif.motif_name AS motif, mythologems, n AS 帰属数
ORDER BY n DESC;
```

→ DISC-007 採用「**1 つの motif が複数 mythologem に属する多対多接続**」(Codex 推奨) の確認。

### M-4: counterargument を持つ mythologem (両論並記対象)

```cypher
MATCH (m:Mythologem)
WHERE m.counterargument IS NOT NULL AND m.counterargument <> '-'
RETURN m.japanese_name AS mythologem,
       m.proposer_or_school AS 提唱,
       m.counterargument AS 反対説;
```

### M-5: comparative_caveats (Indo-European bias 警告) チェック

```cypher
MATCH (m:Mythologem)
WHERE m.comparative_caveats IS NOT NULL
  AND (m.comparative_caveats CONTAINS 'bias'
       OR m.comparative_caveats CONTAINS '警戒'
       OR m.comparative_caveats CONTAINS '禁忌')
RETURN m.japanese_name AS mythologem,
       m.world_parallels AS 世界比較,
       m.comparative_caveats AS 警告;
```

→ DISC-007 採択「**世界神話比較は慎重 (false equivalence / Indo-European bias)**」の運用 query。

---

## Anti-Hallucination Aware Query (DISC-009 連動)

### AH-1: source_backed のみの厳密 graph

```cypher
MATCH (a)-[r]->(b)
WHERE r.inference_type = 'source_backed'
  AND r.hypothesis_layer = 'L0'
  AND a.verified_status = 'verified'
  AND b.verified_status = 'verified'
RETURN a.canonical_name, type(r) AS category, r.relation_type, b.canonical_name
LIMIT 100;
```

### AH-2: speculative / symbolic relation の visibility 確認

```cypher
MATCH (a)-[r:SYMBOLIC]->(b)
WHERE r.inference_type IN ['speculative', 'symbolic']
RETURN type(r), count(*) AS cnt, collect(DISTINCT r.relation_type)[..5] AS sample_types
ORDER BY cnt DESC;
```

### AH-3: under_review / unverified の所在

```cypher
MATCH (n:Entity)
WHERE n.verified_status IN ['under_review', 'unverified']
WITH labels(n) AS labels, n.verified_status AS status, count(*) AS cnt
RETURN labels, status, cnt
ORDER BY cnt DESC;
```

### AH-4: relation hallucination 候補 (大量 fan-out)

```cypher
MATCH (a)-[r:SYMBOLIC]->(b)
WITH a, type(r) AS rel_category, count(b) AS fanout
WHERE fanout > 50
RETURN a.canonical_name AS source, rel_category, fanout
ORDER BY fanout DESC
LIMIT 20;
```

→ Codex 警告「**relation hallucination の方が将来的に危険**」(DISC-009 原則 5) の検出用。

---

## Temporal Graph (DISC-008 / DISC-010 evolving civilization graph)

### T-1: 勧請 chain (年代順)

```cypher
MATCH path = (root:Shrine)<-[r:LINEAGE {relation_type: 'descended_from'}]-(branch:Shrine)
WHERE r.valid_from IS NOT NULL
RETURN root.canonical_name AS 本社, branch.canonical_name AS 勧請先, r.valid_from AS 年代
ORDER BY r.valid_from;
```

### T-2: 同時代の event clusters

```cypher
MATCH (e:Event)
WHERE e.year_start >= 700 AND e.year_start <= 900
OPTIONAL MATCH (e)-[r:SYMBOLIC|RITUAL]-(n)
RETURN e.canonical_name AS 事件, e.year_start AS 年代,
       collect(DISTINCT n.canonical_name)[..5] AS 関連 entities
ORDER BY e.year_start;
```

### T-3: 神階授与の時系列

```cypher
MATCH (s:Shrine)-[r:AUTHORITY {relation_type: 'has_rank'}]-(rk:Rank)
WHERE r.valid_from IS NOT NULL
RETURN s.canonical_name AS 神社, rk.canonical_name AS 神階,
       r.valid_from AS 授与年, r.source_reference AS 出典
ORDER BY r.valid_from;
```

---

## False Coherence Warning Pattern (DISC-010 採用)

graph visualization 時、以下を**明示的に区別**して表示:

| relation category | 視覚化 | 意味 |
|---|---|---|
| RITUAL / LINEAGE / AUTHORITY / GEOGRAPHIC / SYNCHRONIZATION | **実線** | source-backed / inferential |
| SYMBOLIC | **点線** | 象徴・mythologem (DISC-009 警戒) |
| ASSOC (未分類) | **グレー破線** | hand-curation 待ち |

`inference_type` 別:
- `source_backed`: 実線・濃色
- `inferential`: 実線・中間色
- `speculative`: 破線・薄色
- `symbolic`: 点線・薄色 + warning badge

→ Codex 規律「**繋がって見える** だけで因果・歴史的継承・実在関係を錯覚させない」(DISC-010 採択)。

---

## 関連

- `scripts/tsv_to_cypher.py` — TSV → Cypher ETL
- `scripts/load_neo4j.sh` — Neo4j Aura Free への load 手順
- `docs/discussions/DISC-010_resolution.md` — graph epistemics 解決報告
- `docs/discussions/DISC-009_resolution.md` — anti-hallucination (relation hallucination 警告)
- `docs/discussions/DISC-008_resolution.md` — sacred topology (temporal graph)
- `docs/civilization/12_terminology_glossary.md` — 用語集
- CLAUDE.md §4.8 graph epistemics 原則
