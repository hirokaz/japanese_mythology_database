# DISC-008 Cosmogony Uncertainty Display Rules

## Purpose

Define how uncertainty, interpretive status, and evidence levels are displayed within the C-layer cosmology view.

This document exists to prevent over-precision and accidental presentation of speculative interpretations as established facts.

## Core Principle

Users should be able to distinguish:

- source-backed relation
- narrative sequence
- symbolic interpretation
- research hypothesis

at a glance.

## Evidence Levels

### L1 Source-backed

Definition:

- directly represented in source material already encoded in project data

Display:

- no warning chip
- standard node rendering

### L2 Editorial normalization

Definition:

- spelling normalization
- naming harmonization
- display-only adjustments

Display:

```text
表示調整
```

### L3 Interpretive grouping

Definition:

- creation triad grouping
- Kamiyo paired-deity grouping
- visual subtype categorization

Display chip:

```text
解釈整理
```

Tooltip:

```text
閲覧性向上のための整理です。
```

### L4 Research hypothesis

Definition:

- motif linkage candidates
- symbolic association candidates
- unresolved scholarly interpretations

Display chip:

```text
研究仮説
```

Tooltip:

```text
複数説があります。
```

### L5 Speculative

Definition:

- weakly supported symbolic mapping
- future research placeholder

Display chip:

```text
参考仮説
```

Tooltip:

```text
十分な裏付けはありません。
```

## C Layer Mapping

Default recommendation:

| Element | Level |
|----------|--------|
| parent-child relation | L1 |
| succeeded_by relation | L1 |
| creation triad grouping | L3 |
| Kamiyo pair layout | L3 |
| MTGM linkage | L4 |
| candidate motif mapping | L4-L5 |

## Tooltip Structure

Recommended order:

1. deity name
2. subtype
3. evidence status
4. relation notes
5. motif links
6. uncertainty note

## Succeeded_by Disclaimer

Always show:

```text
神代記の出現順を示します。
親子関係ではありません。
```

## Motif Disclaimer

Always show:

```text
神話読解補助です。
因果関係や起源を証明するものではありません。
```

## Visual Language

| Level | Style |
|---------|---------|
| L1 | normal |
| L2 | gray chip |
| L3 | blue chip |
| L4 | amber chip |
| L5 | red-outline chip |

Color alone must never be the only signal.

Each level requires text labels.

## Mobile

On mobile:

- collapse detailed evidence text
- keep evidence chip visible
- allow expansion for explanation

## Anti-hallucination Checklist

Before merge:

- symbolic ≠ genealogical
- appearance order ≠ descent
- motif link ≠ origin proof
- grouping ≠ historical certainty
- competing interpretations shown when applicable

## Recommended Implementation Order

1. Evidence chips only
2. Tooltip warnings
3. Motif uncertainty badges
4. Data-driven evidence metadata
