# DISC-009 genealogy.js Implementation Draft

## Purpose

This document gives Claude an implementation-ready draft for refining the C layer in `web/js/genealogy.js`.

It intentionally avoids directly editing `genealogy.js` from ChatGPT, because partial file fetches can be truncated and unsafe for full-file replacement.

## Target

```text
web/js/genealogy.js
```

Current confirmed implementation:

- `showCosmogony` boolean controls C layer display.
- `ANCESTORS_C` contains 17 C layer deities.
- C layer nodes currently share one label: `神代(宇宙生成)`.
- `succeeded_by` is rendered as gray dashed L-shaped line.

## Implementation Goal

Phase 1 should be small and safe:

1. add C layer subtype metadata
2. display subtype chip labels
3. vary C layer node fill/stroke by subtype
4. clarify `succeeded_by` legend / intro language
5. avoid layout algorithm rewrites

Do not implement pair layout or multi-stage toggle in the same PR.

## Add constants near `ANCESTORS_C`

```js
const COSMOGONY_SUBTYPES = {
  'DEI-304': { label: '造化三神', compact: '造化三神', className: 'creation-triad', level: 'L3' },
  'DEI-007': { label: '造化三神', compact: '造化三神', className: 'creation-triad', level: 'L3' },
  'DEI-008': { label: '造化三神', compact: '造化三神', className: 'creation-triad', level: 'L3' },

  'DEI-604': { label: '別天津神', compact: '別天津神', className: 'kotoamatsukami', level: 'L3' },
  'DEI-605': { label: '別天津神', compact: '別天津神', className: 'kotoamatsukami', level: 'L3' },

  'DEI-606': { label: '神世七代・独神', compact: '七代・独神', className: 'kamiyo-single', level: 'L3' },
  'DEI-607': { label: '神世七代・独神', compact: '七代・独神', className: 'kamiyo-single', level: 'L3' },

  'DEI-608': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-609': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-610': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-611': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-612': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-613': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-614': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-615': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-005': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
  'DEI-006': { label: '神世七代・対偶', compact: '七代・対偶', className: 'kamiyo-pair', level: 'L3' },
};
```

## Add style helper

Add this helper near `escapeXml` or before `renderGenealogy`:

```js
function getCosmogonyStyle(id) {
  const meta = COSMOGONY_SUBTYPES[id];
  if (!meta) {
    return {
      label: '神代(宇宙生成)',
      fillBg: '#eef0ee',
      strokeColor: '#6a7a6a',
      dashAttr: ' stroke-dasharray="4 3"',
      chipFill: '#eef0ee',
      chipText: '#5f6f5f',
    };
  }

  if (meta.className === 'creation-triad') {
    return {
      label: meta.compact,
      fillBg: '#eef3fa',
      strokeColor: '#536d98',
      dashAttr: ' stroke-dasharray="2 2"',
      chipFill: '#dfeafa',
      chipText: '#435d86',
    };
  }

  if (meta.className === 'kotoamatsukami') {
    return {
      label: meta.compact,
      fillBg: '#eef6f8',
      strokeColor: '#547f8f',
      dashAttr: ' stroke-dasharray="4 3"',
      chipFill: '#dff0f3',
      chipText: '#416f7c',
    };
  }

  if (meta.className === 'kamiyo-single') {
    return {
      label: meta.compact,
      fillBg: '#eef8f4',
      strokeColor: '#5b8a74',
      dashAttr: ' stroke-dasharray="5 3"',
      chipFill: '#dff2ea',
      chipText: '#46745d',
    };
  }

  return {
    label: meta.compact,
    fillBg: '#f0f6f2',
    strokeColor: '#66886e',
    dashAttr: ' stroke-dasharray="4 2"',
    chipFill: '#e3f0e6',
    chipText: '#55745c',
  };
}
```

## Replace C layer style block

Current logic resembles:

```js
else if (isAncestorC) { fillBg = '#eef0ee'; strokeColor = '#6a7a6a'; }
```

Replace with:

```js
let cosmogonyStyle = null;
if (isAncestorC) cosmogonyStyle = getCosmogonyStyle(id);

let fillBg, strokeColor;
if (isSibling)           { fillBg = '#eef1f4'; strokeColor = '#7a8a9a'; }
else if (isAncestorC)    { fillBg = cosmogonyStyle.fillBg; strokeColor = cosmogonyStyle.strokeColor; }
else if (isAncestorB)    { fillBg = '#f4efe8'; strokeColor = '#5a8a5a'; }
else if (isKesshi)       { fillBg = '#ffffff'; strokeColor = '#c9a878'; }
else if (isEmpress)      { fillBg = '#fcf6e8'; strokeColor = '#8b3a3a'; }
else                     { fillBg = '#ffffff'; strokeColor = '#4a3520'; }

const dashAttr = isAncestorC && cosmogonyStyle
  ? cosmogonyStyle.dashAttr
  : ((isKesshi || isSibling) ? ' stroke-dasharray="4 3"' : '');
```

## Replace layer label text

Current logic resembles:

```js
const layerText = isSibling ? '神代/傍系'
  : isAncestorC ? '神代(宇宙生成)'
  : (isAncestorB && !daiText ? '神代' : '');
```

Replace with:

```js
const layerText = isSibling ? '神代/傍系'
  : isAncestorC && cosmogonyStyle ? cosmogonyStyle.label
  : (isAncestorB && !daiText ? '神代' : '');

const layerFill = isAncestorC && cosmogonyStyle
  ? cosmogonyStyle.chipText
  : '#6a7a6a';
```

Then replace the layer label fill:

```js
fill="#6a7a6a"
```

with:

```js
fill="${layerFill}"
```

## Optional chip background

For Phase 1, plain text chip is acceptable.

If adding a small chip rectangle, use:

```js
${layerText ? `<rect x="${p.x + 28}" y="${p.y + 4}" width="${NODE_W - 56}" height="14" rx="7" ry="7"
      fill="${isAncestorC && cosmogonyStyle ? cosmogonyStyle.chipFill : 'transparent'}" opacity="0.95"></rect>` : ''}
```

Only add this if it does not overlap `daiText`.

## Update intro copy

Current expanded copy:

```text
造化三神起点 C 層展開
```

Recommended expanded copy:

```text
造化三神・別天津神・神世七代を含む C 層を表示中。灰破線は神代記の出現順であり、親子関係ではありません。
```

Implementation:

```js
intro.textContent = showCosmogony
  ? `${imperialIdSet.size} 神格・${generations.length} 世代を表示中 (造化三神・別天津神・神世七代 C 層展開)。灰破線は神代記の出現順であり、親子関係ではありません。各ノードをタップで詳細へ。`
  : `${imperialIdSet.size} 神格・${generations.length} 世代を表示中 (天照大神起点 B 層)。天照ノード上のボタンで宇宙起源 (造化三神) を展開可。`;
```

## Update toggle label

Current expanded button label:

```text
▼ 宇宙起源(造化三神)を折りたたむ
```

Recommended:

```text
▼ C層(神代宇宙生成)を折りたたむ
```

Current collapsed button label:

```text
▲ 宇宙起源(造化三神)を展開
```

Recommended:

```text
▲ C層(造化三神〜神世七代)を展開
```

## Do not change in Phase 1

- generation calculation
- `parents` construction
- `succeeded_by` relation handling
- pair layout
- mobile collapse
- master TSV data

## Validation

Run:

```bash
python3 scripts/cross_reference_audit.py
```

Manual checks:

- B layer default view still works
- C layer toggle still works
- C layer shows subtype labels instead of one generic label
- `succeeded_by` remains gray dashed
- parent-child remains red solid
- no JS syntax error in browser console

## Recommended PR title

```text
feat: add C-layer subtype labels for cosmogony genealogy
```

## Recommended PR size

This should be a small PR touching only:

- `web/js/genealogy.js`
- optionally this design doc reference in docs index if such index exists
