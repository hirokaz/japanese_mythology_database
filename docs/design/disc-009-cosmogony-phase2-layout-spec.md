# DISC-009 Cosmogony Refinement Phase 2 Layout Detail

## Purpose

This document concretizes Phase 2 layout details requested for the C layer genealogy refinement.

Phase 1 defines subtype labels and legend language. Phase 2 defines how pair positioning, connector weight, connector color, and node width adjustments should behave.

This is a design handoff for implementation on `staging`. It does not change source-backed deity or relation data.

## Scope

Target view:

```text
web/js/genealogy.js
```

Target layer:

```text
C layer: cosmogony / 神代(宇宙生成)
```

Primary targets:

- Kamiyo Nanayo paired deities
- spouse/pair connector visualization
- node width and row grouping
- `succeeded_by` distinction from parent-child relation

## Pair groups

The following pair groups should be handled as visual pairs:

| Pair group | Left / first | Right / paired | Current meaning |
|---|---|---|---|
| Kamiyo 3 | `DEI-608` 宇比地邇神 | `DEI-609` 須比智邇神 | 対偶神 |
| Kamiyo 4 | `DEI-610` 角杙神 | `DEI-611` 活杙神 | 対偶神 |
| Kamiyo 5 | `DEI-612` 意富斗能地神 | `DEI-613` 大斗乃弁神 | 対偶神 |
| Kamiyo 6 | `DEI-614` 於母陀流神 | `DEI-615` 阿夜訶志古泥神 | 対偶神 |
| Kamiyo 7 | `DEI-005` 伊邪那岐神 | `DEI-006` 伊邪那美神 | 対偶神 |

## Layout rule

### Horizontal pairing

Each pair should be rendered on the same generation row.

Recommended spacing:

```text
pairGap = 14px to 20px
```

Recommended structure:

```text
[ first deity node ]──[ paired deity node ]
```

The pair connector must be visually weaker than parent-child edges.

### Node width

Current node width is `NODE_W = 150`.

For Phase 2, avoid introducing variable node width unless necessary.

Recommended initial rule:

```text
NODE_W remains 150
pair layout uses x-position adjustment only
```

Reason:

- minimizes regression risk
- preserves existing line routing logic
- keeps 1PR small

### Pair container option

A future Phase 3.5 may introduce a visual pair container.

Do not add container background in Phase 2 unless layout remains stable.

Rationale:

- container rectangles can imply a stronger structural relationship than source data supports
- additional bounding boxes increase overlap risk on mobile

## Connector specification

### Parent-child connector

Already present:

```text
stroke: #8b3a3a
stroke-width: 1.5
solid
```

Meaning:

```text
source-backed or accepted parent-child relation
```

### Succeeded-by connector

Already present:

```text
stroke: #a89878
stroke-width: 1.3
stroke-dasharray: 3 4
```

Refined legend meaning:

```text
神代記の出現順。親子関係ではありません。
```

### Pair connector

Recommended:

```text
stroke: #9aa3a6
stroke-width: 1.4
stroke-dasharray: none
```

Label:

```text
対偶
```

Optional tiny center label:

```text
font-size: 9
fill: #6c7477
```

Do not use arrowheads.

Do not use red.

Do not use the same dashed style as `succeeded_by`.

## Connector priority

When multiple relation types touch the same node pair:

1. `parent_of` remains parent-child edge.
2. `succeeded_by` remains narrative-order edge.
3. `married_to` or pair mapping renders horizontal pair connector only if both nodes are in the same generation row.

If a pair connector and succeeded-by line would overlap, keep pair connector horizontal and route `succeeded_by` vertically/L-shaped.

## Node subtype labels

Recommended chip labels:

| Subtype | Label | Placement |
|---|---|---|
| creation triad | `造化三神` | top chip |
| other kotoamatsukami | `別天津神` | top chip |
| kamiyo single | `神世七代・独神` | top chip |
| kamiyo pair | `神世七代・対偶` | top chip |

For narrow nodes, allow shortened display:

| Full | Compact |
|---|---|
| `神世七代・独神` | `七代・独神` |
| `神世七代・対偶` | `七代・対偶` |

## Shape and border rules

### Creation triad

```text
fill: #eef3fa
stroke: #536d98
stroke-width: 1.7
dash: 2 2 or double-border later
```

### Other Kotoamatsukami

```text
fill: #eef6f8
stroke: #547f8f
stroke-dasharray: 4 3
```

### Kamiyo Nanayo single

```text
fill: #eef8f4
stroke: #5b8a74
stroke-dasharray: 5 3
```

### Kamiyo Nanayo pair

```text
fill: #f0f6f2
stroke: #66886e
stroke-dasharray: 4 2
```

## Accessibility requirements

Each relationship type must be distinguishable without color:

| Relation | Color | Pattern |
|---|---|---|
| parent-child | red-brown | solid |
| succession / appearance order | gray-brown | dashed |
| spouse / pair | blue-gray | solid horizontal |
| sibling bracket | blue-gray | bracket form |

Node subtypes must also include text chips, not color only.

## Mobile behavior

Phase 2 should not introduce a full mobile rewrite.

Minimum behavior:

- preserve readability at 375px viewport
- avoid pair connector crossing text
- keep pair spacing tighter than normal generation spacing
- do not force horizontal overflow more than current C layer already does

Recommended future mobile treatment:

```text
C layer summary cards:
造化三神 3柱
別天津神 2柱
神世七代 12柱
```

## Implementation notes

### Suggested constants

```js
const COSMOGONY_PAIR_GAP = 16;
const PAIR_EDGE_COLOR = '#9aa3a6';
const PAIR_EDGE_WIDTH = 1.4;
```

### Suggested metadata

```js
const COSMOGONY_SUBTYPES = {
  'DEI-304': { label: '造化三神', className: 'creation-triad' },
  'DEI-007': { label: '造化三神', className: 'creation-triad' },
  'DEI-008': { label: '造化三神', className: 'creation-triad' },
  'DEI-604': { label: '別天津神', className: 'kotoamatsukami' },
  'DEI-605': { label: '別天津神', className: 'kotoamatsukami' },
  'DEI-606': { label: '七代・独神', className: 'kamiyo-single' },
  'DEI-607': { label: '七代・独神', className: 'kamiyo-single' },
  'DEI-608': { label: '七代・対偶', className: 'kamiyo-pair' },
  'DEI-609': { label: '七代・対偶', className: 'kamiyo-pair' }
};
```

Full mapping should include `DEI-610` through `DEI-615`, `DEI-005`, and `DEI-006`.

### Suggested pair mapping

```js
const COSMOGONY_PAIRS = [
  ['DEI-608', 'DEI-609'],
  ['DEI-610', 'DEI-611'],
  ['DEI-612', 'DEI-613'],
  ['DEI-614', 'DEI-615'],
  ['DEI-005', 'DEI-006']
];
```

## Anti-hallucination discipline

This design intentionally avoids claiming that:

- C layer nodes are biological ancestors in the same sense as later genealogical parent-child relations
- `succeeded_by` is descent
- visual pair layout proves gender or marriage beyond source-backed labels and relations

The UI language must remain:

```text
神代記の出現順
対偶神
親子関係ではありません
```

## Recommended PR boundary

One PR should include only:

1. subtype metadata constants
2. subtype chip labels
3. updated node colors/strokes
4. legend/popup wording for `succeeded_by`
5. pair connector constants and pair mapping only if no layout regression

Do not combine Phase 2 with multi-stage toggle implementation.

## Audit checklist

Run before staging PR review:

```bash
python3 scripts/cross_reference_audit.py
```

Manual UI checks:

- B layer default still loads
- C layer expansion still works
- Amaterasu toggle still works
- parent-child red solid lines remain unchanged
- succeeded-by gray dashed lines remain visible
- pair connector is not confused with parent-child or succession
- no source data modified
