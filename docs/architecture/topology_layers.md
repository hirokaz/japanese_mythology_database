# Topology Layers

## Goal

Organize the repository as layered topology structures.

---

# Layer 1 — Entity Layer

Examples:

- shrine
- deity
- clan
- province

Current files:

```txt
shrine_master.tsv
deity_master.tsv
clan_master.tsv
```

---

# Layer 2 — Relation Layer

Examples:

- enshrines
- associated_with
- pilgrimage_connection

Potential graph:

```cypher
(:Shrine)-[:enshrines]->(:Deity)
```

---

# Layer 3 — Spatial Layer

Examples:

- shrine coordinates
- regional clusters
- mountain routes
- maritime access

Systems:

- Sacred Topology Atlas
- GIS overlays

---

# Layer 4 — Precinct Topology Layer

Shrines represented as:

- movement topology
- boundary structure
- approach sequence

Current additions:

- precinct GeoJSON
- movement ontology
- boundary ontology

---

# Layer 5 — Temporal Layer

Examples:

- reconstruction
- route changes
- shrine relocation
- restructuring

Potential schema:

```txt
precinct_epoch.tsv
feature_temporal_state.tsv
```

---

# Layer 6 — Interpretation Layer

Examples:

- boundary semantics
- purification sequence
- route interpretation

Important:

Separate:

- direct evidence
- inferred topology
- interpretive overlay

---

# Principles

## topology over precision

Prioritize:

- structural understanding
- route understanding
- spatial organization

rather than survey-grade mapping.

---

## failure isolation

Visualization systems should isolate:

- rendering failures
- malformed data
- schema mismatch

so pages remain usable.
