# Precinct Topology Schema

## Purpose

This schema defines a structured representation for shrine precinct topology.

The goal is NOT survey-grade architectural mapping.
The goal is to represent:

- ritual movement
- sacred boundaries
- transition structures
- public pilgrimage flow
- precinct-level spatial ontology

for integration with:

- Sacred Topology Atlas
- GIS layers
- Neo4j graph
- ritual space analysis

---

# Core Concepts

## 1. Precinct Topology

A shrine is treated not merely as a point location, but as:

- movement space
- layered boundary system
- ritual transition structure
- symbolic spatial organization

---

## 2. Geometry Types

### Point

Discrete feature.

Examples:

- sanctuary
- torii
- sacred tree
- purification basin
- auxiliary shrine

---

### LineString

Movement / route feature.

Examples:

- approach
- bridge crossing
- procession route
- pilgrimage flow

---

### Polygon

Area / zone feature.

Examples:

- precinct
- restricted area
- sacred grove
- pond
- ritual zone

---

# Feature Types

## Core Types

| feature_type | meaning |
|---|---|
| main_sanctuary | central sacred area |
| worship_hall | worship facility |
| torii | ritual transition marker |
| approach | public ritual route |
| bridge | crossing / transition structure |
| subsidiary_shrine | smaller shrine within precinct |
| auxiliary_shrine | supporting shrine |
| sacred_tree | sacred natural feature |
| purification_basin | purification location |
| office | administrative facility |
| garden | sacred garden area |
| pond | sacred water area |
| restricted_area | access-limited area |
| ritual_site | ritual-specific location |
| entrance | public entrance |
| parking | visitor parking |
| precinct_area | overall schematic precinct polygon |

---

# Boundary Semantics

Some features represent transition semantics.

Examples:

- torii
- bridge
- slope
- gate
- mountain entrance

These may later connect to:

- liminal_space
- boundary ontology
- ritual transition graph

---

# Movement Semantics

Approach routes are not merely roads.

They may represent:

- purification progression
- pilgrimage flow
- ritual sequencing
- symbolic transition

Future expansion may include:

```json
{
  "movement_type": "pilgrimage | purification | procession | access"
}
```

---

# Confidence Model

| level | meaning |
|---|---|
| A | official/public geospatially reliable |
| B | multiple public confirmations |
| C | public-level approximate placement |
| D | schematic inferred placement |
| E | uncertain |

---

# Accessibility Model

| value | meaning |
|---|---|
| public | public access |
| restricted | restricted access |
| view_only | visible but not enterable |
| mixed | mixed conditions |
| unknown | unknown |

---

# Important Constraints

## 1. No overprecision

These maps are schematic topology maps.
Not architectural survey maps.

---

## 2. No sensitive internal information

Avoid:

- non-public ritual layouts
- internal restricted details
- security-sensitive structures

---

## 3. Separate evidence layers

Future systems should distinguish:

- direct/public evidence
- inferred placement
- interpretive overlay
- symbolic relation

---

# Future Expansion

Potential future integration:

- ritual procession graphs
- temporal precinct changes
- sacred boundary ontology
- pilgrimage network continuity
- GIS clustering
- Neo4j traversal
- ritual movement analysis

---

# Related

- DISC-008 Sacred Topology
- DISC-012 temporal persistence
- DISC-013 spatial ontology
- web/data/precinct_maps/
