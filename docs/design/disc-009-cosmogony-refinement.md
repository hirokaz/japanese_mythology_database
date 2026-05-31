# DISC-009 Cosmogony Refinement Design

## Scope

This document refines the C layer genealogy view introduced by PR #287.

The target repository is `hirokaz/japanese_mythology_database`.

This document does not modify source-backed master data. It proposes UI and rendering refinements only.

## Starting point

PR #287 already implemented:

- default B layer display beginning from Amaterasu
- optional C layer expansion above Amaterasu
- 17 C layer deities from the Kotoamatsukami through Kamiyo Nanayo
- `succeeded_by` relation as appearance order, not parentage
- dashed gray rendering for `succeeded_by`
- spouse pair fixup for paired deities
- cold-color dashed style for C layer nodes

## Refinement goals

The current C layer is useful but visually flat. All C layer nodes share the same label and visual treatment.

This refinement should make the C layer easier to interpret without pretending that symbolic or narrative order is biological genealogy.

## Epistemic constraints

### DISC-007

Motif or symbolic similarity is not treated as causal descent.

### DISC-008

The view must avoid over-precise reconstruction of mythic chronology.

### DISC-009

Plausibility is not evidence. `succeeded_by` means narrative appearance order only.

Therefore:

- C layer sequencing must not be drawn as parent-child descent.
- symbolic layers must be visually distinct from genealogical lines.
- L4/L5 claims require uncertainty display and, where applicable, competing interpretations.

## Proposed C layer subtypes

### 1. Creation triad

Target deities:

- 天之御中主神
- 高皇産霊神
- 神産巣日神

UI label:

```text
造化三神
```

Suggested node style:

- cold indigo outline
- double border
- small label chip: `造化三神`
- no implied spouse/pair marker

### 2. Remaining Kotoamatsukami

Target deities:

- 宇摩志阿斯訶備比古遅神
- 天之常立神

UI label:

```text
別天津神
```

Suggested node style:

- blue outline
- dashed border
- label chip: `別天津神`

### 3. Kamiyo Nanayo single deities

Target deities:

- 国之常立神
- 豊雲野神

UI label:

```text
神世七代・独神
```

Suggested node style:

- blue-green outline
- single-column node
- small marker: `独神`

### 4. Kamiyo Nanayo paired deities

Target pairs:

- 宇比地邇神 / 須比智邇神
- 角杙神 / 活杙神
- 意富斗能地神 / 大斗乃弁神
- 於母陀流神 / 阿夜訶志古泥神
- 伊邪那岐神 / 伊邪那美神

UI label:

```text
神世七代・対偶神
```

Suggested node style:

- pair container
- horizontal arrangement
- neutral pair connector line
- male/female distinction only if source-backed by existing data labels, not inferred from styling alone

## Pair layout rule

For paired C layer deities, render the pair as a shared row-level group:

```text
[ male or first deity ] — [ female or paired deity ]
```

The connector should not reuse parent-child styling.

Recommended connector:

- neutral gray
- solid thin line
- optional label: `対偶`

Do not use:

- red parent-child lines
- `succeeded_by` dashed order lines
- arrowheads implying causation

## Multi-stage toggle proposal

Current UI has one toggle on Amaterasu.

Recommended staged toggle states:

```text
0: B layer only
1: + 造化三神
2: + 別天津神
3: + 神世七代
```

Labels:

- `神代を隠す`
- `造化三神まで表示`
- `別天津神まで表示`
- `神世七代まで表示`

This is clearer than a binary C layer toggle on mobile.

## Legend refinement

The legend must explicitly state:

```text
灰破線 = 神代記の出現順。親子関係ではありません。
```

Popup text should repeat:

```text
この接続は物語上の出現順を示し、系譜上の親子関係を意味しません。
```

## Accessibility

Do not rely on color alone.

Use combined encodings:

- parent-child: solid red line
- `succeeded_by`: dashed gray line
- spouse/pair: solid neutral line without arrow
- C layer node: dashed or double border plus label chip
- single deity: `独神` chip
- paired deity: `対偶` chip

## Mobile behavior

For narrow screens:

1. collapse C layer to summary cards by default
2. show counts by subtype
3. expand one subtype at a time
4. keep B layer readable without horizontal overflow

Suggested mobile summaries:

```text
造化三神 3柱
別天津神 2柱
神世七代 12柱
```

## Implementation phases

### Phase 1: label and legend only

- add subtype metadata in renderer code
- display subtype label chips
- update legend text for `succeeded_by`

Risk: low.

### Phase 2: pair container layout

- render paired Kamiyo Nanayo deities as row groups
- add neutral pair connector
- keep `succeeded_by` separate

Risk: medium.

### Phase 3: staged C layer toggle

- replace boolean `showCosmogony` with stage integer
- support four display levels
- update Amaterasu toggle UI

Risk: medium.

### Phase 4: mobile summary mode

- add breakpoint-specific collapsed C layer cards
- allow subtype expansion

Risk: medium-high.

## Alternatives considered

### Alternative A: keep one C layer style

Rejected because it hides meaningful narrative distinctions between Kotoamatsukami and Kamiyo Nanayo.

### Alternative B: render all C layer links as genealogy

Rejected. This violates DISC-009 because appearance order and symbolic sequence are not parentage.

### Alternative C: fully separate cosmogony chart

Possible later, but not necessary for the first refinement.

## Recommended next action

Start with Phase 1.

It provides immediate interpretability improvement without changing master data or introducing risky layout changes.
