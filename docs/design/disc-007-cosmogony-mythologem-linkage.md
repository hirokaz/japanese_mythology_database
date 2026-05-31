# DISC-007 Cosmogony Mythologem Linkage Design

## Purpose

This document designs how C layer cosmogony deities can be linked to mythologem / motif records without violating epistemic discipline.

The goal is to enrich tooltips and explanatory UI, not to infer genealogy, causation, or source-backed historical descent.

## Scope

Target area:

```text
web/js/genealogy.js C layer tooltip / popup / detail link UI
```

Target data concepts:

- C layer cosmogony deities
- mythologem / motif records
- DISC-007 symbolic association rules
- DISC-009 anti-hallucination rules

## Epistemic rule

A mythologem link means:

```text
This deity is useful for reading this motif or narrative pattern.
```

It does NOT mean:

```text
This deity caused the motif.
This deity historically derives from the motif.
This motif proves genealogical descent.
This motif is source-backed for every related tradition.
```

UI language must consistently use:

```text
関連するモチーフ
読解補助
象徴的関連
```

Avoid:

```text
起源
証明
由来確定
因果関係
```

## Candidate mythologem links

### MTGM-014 `pillar_axis_mundi`

Suggested label:

```text
柱 / 世界軸
```

Possible C layer relevance:

- 天之御中主神
- 天之常立神
- 国之常立神

Interpretive rationale:

These names and positions may help users read verticality, centrality, and cosmological ordering in the chart.

Required caveat:

```text
象徴的読解補助であり、神格の起源・系譜関係を示すものではありません。
```

### MTGM-019 `tabuized_visibility`

Suggested label:

```text
見るなの禁忌 / 可視性の制限
```

Possible C layer relevance:

- 伊邪那岐神
- 伊邪那美神

Interpretive rationale:

The Izanagi / Izanami cycle is useful for linking cosmogony to boundary-crossing, death-world narrative, and visibility taboo motifs.

Required caveat:

```text
物語モチーフの接続であり、C層の出現順や親子関係を補強するものではありません。
```

### MTGM-020 candidate `generative_pairing`

If this motif exists or is later added, it may connect to paired Kamiyo Nanayo deities.

Suggested label:

```text
対偶生成
```

Possible C layer relevance:

- 宇比地邇神 / 須比智邇神
- 角杙神 / 活杙神
- 意富斗能地神 / 大斗乃弁神
- 於母陀流神 / 阿夜訶志古泥神
- 伊邪那岐神 / 伊邪那美神

Required caveat:

```text
対偶配置は神話構造の表示であり、現代的な婚姻・生物学的親子関係の投影ではありません。
```

## Tooltip design

### Minimal tooltip

For C layer nodes, add an optional section:

```text
関連モチーフ:
- 柱 / 世界軸 (読解補助)
- 対偶生成 (読解補助)
```

Footer caveat:

```text
注: モチーフ関連は象徴的読解補助であり、親子・因果関係を示しません。
```

### Expanded popup

If a richer popup exists later:

```text
関連モチーフ
MTGM-014 柱 / 世界軸
  中心性・垂直軸・宇宙秩序を読む補助。
  出典上の系譜・因果を示すものではない。
```

## Suggested data shape

Avoid hard-coding full interpretation text inside rendering logic if possible.

Suggested lightweight mapping:

```js
const COSMOGONY_MOTIF_LINKS = {
  'DEI-304': ['MTGM-014'],
  'DEI-605': ['MTGM-014'],
  'DEI-606': ['MTGM-014'],
  'DEI-005': ['MTGM-019'],
  'DEI-006': ['MTGM-019']
};
```

Suggested metadata:

```js
const MOTIF_LABELS = {
  'MTGM-014': '柱 / 世界軸',
  'MTGM-019': '見るなの禁忌 / 可視性の制限'
};
```

If motif master data exists, prefer loading it from data rather than duplicating labels.

## Display priority

C layer tooltip sections should appear in this order:

1. deity name / reading
2. C layer subtype
3. relation caveat if connected by `succeeded_by`
4. related motif links
5. epistemic caution

## UI copy

### For `succeeded_by`

```text
灰破線は神代記の出現順を示します。親子関係ではありません。
```

### For motif links

```text
関連モチーフは神話読解の補助です。系譜・因果・史実を証明するものではありません。
```

### For paired deities

```text
対偶神として並べています。表示上の対配置であり、親子関係ではありません。
```

## Accessibility

Motif links should not be represented only by icons or colors.

Each motif link should include:

- text label
- motif id
- short caveat

Example:

```text
MTGM-014 柱 / 世界軸 — 読解補助
```

## Over-precision guardrails

Do not assign a motif link when:

- the relation is based only on vague name similarity
- the motif requires a source not yet encoded in the project
- the UI would imply source-backed causation
- the motif would overdetermine an ambiguous deity

Use one of these states if uncertainty must be represented:

```text
candidate
weak_association
source_required
not_shown
```

## Recommended implementation phase

### Phase M1: documentation only

This document.

### Phase M2: tooltip copy only

Add generic caveat for C layer and `succeeded_by` without motif-specific links.

### Phase M3: limited motif mapping

Add only high-confidence reading aids:

- MTGM-014 for central/standing cosmological deities
- MTGM-019 for Izanagi / Izanami

### Phase M4: data-driven motif loading

If motif master records are available, render labels from data instead of hard-coded constants.

## Audit checklist

Before implementation:

```bash
python3 scripts/cross_reference_audit.py
```

Manual checks:

- no parent-child wording appears in motif tooltip
- `succeeded_by` remains clearly distinct
- motif id is visible
- caveat is visible on mobile
- no new source-backed claim is introduced without source reference

## Recommended PR boundary

Keep mythologem linkage separate from Phase 2 pair-layout implementation.

Do not combine:

- pair layout changes
- multi-stage toggle
- motif tooltip expansion

in the same PR.
