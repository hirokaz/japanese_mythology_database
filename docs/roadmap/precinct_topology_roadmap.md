# Precinct Topology Roadmap

## Vision

Transform shrine representation from:

```txt
shrine = point
```

into:

```txt
shrine = ritual topology / movement space / boundary system
```

This roadmap defines the staged evolution of precinct topology support.

---

# Phase 1 — Prototype Precinct Maps

Status: in progress

## Goal

Enable shrine detail pages to render schematic precinct maps.

## Deliverables

- GeoJSON precinct samples
- Leaflet integration
- marker / line / polygon rendering
- popup rendering
- shrine-level map loading

## Initial Targets

- 伊勢神宮 内宮
- 伊勢神宮 外宮
- 鹿島神宮
- 香取神宮
- 明治神宮

---

# Phase 2 — Structured Precinct Ontology

## Goal

Separate rendering data from ontology / database layers.

## Deliverables

- precinct_feature_master.tsv
- feature_type ontology
- movement_type
- boundary_role
- confidence model
- accessibility model

## Concepts

- threshold
- purification
- center
- pilgrimage flow
- ritual transition

---

# Phase 3 — Ritual Movement Analysis

## Goal

Represent ritual movement and procession topology.

## Candidate Features

- pilgrimage routes
- procession flow
- purification progression
- seasonal routes
- temporary ritual sites

## Neo4j Possibilities

```cypher
(:Feature)-[:connects_to]->(:Feature)
(:Route)-[:passes_through]->(:Boundary)
(:Pilgrimage)-[:approaches]->(:Sanctuary)
```

---

# Phase 4 — Temporal Precinct Evolution

## Goal

Represent precinct change over time.

## Concepts

- reconstruction
- shrine relocation
- ritual reconfiguration
- Meiji restructuring
- syncretic transformations

## Candidate Schema

```txt
precinct_epoch.tsv
feature_temporal_state.tsv
boundary_transition_history.tsv
```

---

# Phase 5 — Sacred Landscape Integration

## Goal

Extend precinct topology into surrounding sacred landscape.

## Candidate Features

- mountains
- rivers
- sacred forests
- pilgrimage roads
- maritime access
- boundary hills
- ritual approach corridors

---

# Phase 6 — Civilization Topology Layer

## Goal

Connect precinct topology to civilization-scale graph analysis.

## Long-term Possibilities

- sacred density analysis
- pilgrimage clustering
- regional ritual topology
- movement synchronization
- mythologem-spatial overlays
- civilization transition analysis

---

# Architectural Principles

## 1. Schematic over survey-grade

The system is intended for:

- topology understanding
- ritual-space comprehension
- cultural structure analysis

NOT architectural precision mapping.

---

## 2. Public information only

Avoid:

- sensitive layouts
- non-public ritual details
- restricted internal structures

---

## 3. Evidence separation

Always distinguish:

- direct/public evidence
- inferred topology
- symbolic interpretation
- speculative overlays

---

# Related

- DISC-008 Sacred Topology
- DISC-012 temporal persistence
- DISC-013 spatial ontology
- web/data/precinct_maps/
- docs/schema/precinct_topology_schema.md
