# Precinct Maps

This directory stores shrine-level precinct map GeoJSON files.

Each file is named by shrine master ID:

```txt
web/data/precinct_maps/SHR-002.geojson
web/data/precinct_maps/SHR-003.geojson
```

## Purpose

These files are schematic precinct topology data for shrine detail pages.
They are not survey-grade maps.

The goal is to represent publicly understandable ritual-space structure:

- main sanctuary area
- approach routes
- torii / bridges / entrances
- subsidiary or auxiliary shrines
- public facilities
- restricted or view-only zones where appropriate

## Geometry policy

- `Point`: discrete facility or landmark
- `LineString`: approach, path, bridge, procession route
- `Polygon`: precinct area, sacred area, garden, pond, restricted zone

## Required properties

```json
{
  "feature_id": "PREC-SHR-002-001",
  "shrine_id": "SHR-002",
  "feature_type": "main_sanctuary",
  "canonical_name": "正宮",
  "reading": "しょうぐう",
  "description": "Public-level description only.",
  "source_type": "manual",
  "source_reference": "Publicly available map / OSM / official guide link",
  "confidence_level": "C",
  "accessibility": "public|restricted|view_only|unknown",
  "notes": "Schematic data; not survey-grade."
}
```

## Confidence guideline

- `A`: official map or reliable open geospatial source
- `B`: confirmed by multiple public sources
- `C`: approximate public-level placement
- `D`: inferred schematic placement
- `E`: uncertain; avoid public rendering unless needed

## Copyright / safety guideline

Do not copy official precinct map images.
Use links for official maps and store only original structured point/line/polygon data.
Avoid non-public ritual areas and overly detailed internal layouts.
