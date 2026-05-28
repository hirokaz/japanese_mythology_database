# Neo4j Precinct Graph Model

## Goal

Represent shrine precinct topology as graph structures.

The system is intended for:

- movement analysis
- ritual transition analysis
- route continuity
- sacred topology understanding

rather than architectural precision.

---

# Core Node Types

## Shrine

```cypher
(:Shrine)
```

Examples:

- 伊勢神宮
- 鹿島神宮
- 香取神宮

---

## PrecinctFeature

```cypher
(:PrecinctFeature)
```

Examples:

- torii
- bridge
- purification basin
- sanctuary
- ritual site

---

## Zone

```cypher
(:Zone)
```

Examples:

- outer_world
- purification
- inner_precinct
- sanctuary_center

---

## Route

```cypher
(:Route)
```

Examples:

- pilgrimage route
- approach
- procession route

---

# Core Edge Types

## contains

```cypher
(:Shrine)-[:contains]->(:PrecinctFeature)
```

---

## connects_to

```cypher
(:PrecinctFeature)-[:connects_to]->(:PrecinctFeature)
```

---

## transitions_to

```cypher
(:Zone)-[:transitions_to]->(:Zone)
```

---

## part_of_route

```cypher
(:PrecinctFeature)-[:part_of_route]->(:Route)
```

---

## approaches

```cypher
(:Route)-[:approaches]->(:PrecinctFeature)
```

---

# Example Graph

```txt
outer_world
 -> torii
 -> purification basin
 -> approach
 -> sanctuary
```

May become:

```cypher
(:Zone {id:'outer_world'})
  -[:transitions_to]->
(:Zone {id:'purification'})
```

---

# Future Possibilities

Potential future analysis:

- route centrality
- sacred transition density
- pilgrimage continuity
- regional topology clustering
- temporal route evolution
- ritual movement comparison

---

# Important Constraints

## topology over precision

The graph models:

- structure
- transition
- movement
- relation

NOT architectural survey precision.

---

## evidence separation

Always distinguish:

- source-backed relations
- inferred topology
- interpretive overlays

---

# Related

- precinct_feature_master.tsv
- precinct_route_master.tsv
- ritual_transition_patterns.tsv
- precinct_zone_model.md
