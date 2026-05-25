# DISC-008 解決報告: GIS 統合戦略

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#244)
**収束**: 2026-05-25

---

## 結論

GIS 統合は本 DB の独自価値だが、Codex Round 2 の **「地図でロマンを演出するではなく、構造を検証可能にする」「sacred topology」「evolving ritual topology」** の原則を最重要とする。

## 確定設計 v0.2

### Phase 戦略 (Codex 推奨 Phase 2 起点)

| Phase | スコープ | 件数 | 内容 |
|---|---|---|---|
| **Phase 1** | network hub (名神大社・宗像/住吉/鹿島香取/諏訪/熊野/出雲 等) | 30 | demonstration |
| **Phase 2** | + 一宮 + 式内大社 + 二十二社 + 別表神社 | 250 | network topology 可視化開始 |
| Phase 3 | + 全 verified shrine | 全件 | maintenance 段階 |

### Schema 拡張 (Codex 採用)

```yaml
# shrine_master.tsv 追加 field
coordinates_accuracy:    [exact, approximate, inferred, unknown]
coordinates_source:      "OSM | Wikipedia | 公式サイト | 神社庁 | 国土地理院 | manual"
coordinates_verified_at: ISO8601
```

### データソース (Codex 推奨)

OpenStreetMap / Nominatim + Wikipedia infobox + 人手検証のハイブリッド。
**Google Maps scraping は回避**。

### 地図ライブラリ

**Leaflet** (CDN 経由、vanilla JS 方針維持)。MapLibre は vector tile 最適化段階で。

### Sacred Topology Layers (Codex 概念採用)

`web/data/sacred_topology/` 配下に GeoJSON:

```
maritime_corridors.geojson    # 海上守護神社網 (住吉系・宗像・志賀海・気比・若狭彦)
mountain_worship_chains.geojson # 山岳信仰連環 (出羽三山・吉野・高野・伯耆大山)
river_basin_ritual.geojson    # 河川流域祭祀
fault_line_alignments.geojson  # 断層と神社 (中央構造線・諏訪・大神・剣山)
pilgrimage_paths.geojson      # 巡礼路 (熊野古道・西国 33・四国 88)
```

各 layer に `visualization_confidence`:
- archaeological: 考古学根拠
- textual: 文献根拠
- inferred: 妥当な推論
- speculative: 検証困難仮説

### Evolving Ritual Topology (Codex 強調)

時間軸スライダーで sync events:
- 勧請 event (宇佐 → 石清水 859 → 鶴岡 1063/1180)
- 分祀 event (八幡網 4 万社の段階的展開)
- 遷宮 event (伊勢式年遷宮 62 回)
- 神階授与 event (三代実録数千件)
- 一宮化 event (8 世紀後半)

→ **static atlas** ではなく **temporal graph** として実装。

### Narrative Intoxication 警告 (Codex 最重要)

Web UI 明示注意書き:

> 🗺️ 本地図は地理的相関を示しますが、因果関係を意味しません。
> 「線が引ける」「近くにある」「分布が似ている」だけで歴史的関係を断定しないでください。

線描画:
- 実線 = source-backed (例: 宇佐 → 石清水 = 続日本後紀記載)
- 点線 = inferred (例: 古代海運ルート推定)
- グレー = speculative correlation

## Codex Round 2 主要採用点

1. ✅ Phase 2 起点 (network hub 優先)
2. ✅ OSM/Nominatim + Wikipedia ハイブリッド
3. ✅ **`coordinates_accuracy` field 必須**
4. ✅ Leaflet (vanilla JS 維持)
5. ✅ 時代レイヤに **`visualization_confidence`**
6. ✅ **Sacred topology** (maritime/mountain/river/fault/pilgrimage)
7. ✅ **Evolving ritual topology** (時間軸 sync event)
8. ✅ **GIS narrative intoxication 警告** (correlation ≠ causation)

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 | Claude (起票) | 2026-05-25 11:47 |
| Round 2 | **Codex 応答** | 2026-05-25 11:54 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 12:02 |
| 収束 | 本 PR | 2026-05-25 |

→ **同日内 15 分で 3 ターン完結**。

## 後続 PR (Lane B: Web UX、段階的)

- [ ] Phase 1: 30 件 network hub 座標補完
- [ ] `web/pages/atlas.html` Leaflet 静的地図
- [ ] schema 拡張 (coordinates_accuracy 等)
- [ ] sacred topology GeoJSON 5 layer (Phase 2)
- [ ] Narrative intoxication 警告 UI

## 関連

- 起票: #244
- 親議論: DISC-005 (#238) テーマ 4 GIS 統合
- 用語集: `docs/civilization/12_terminology_glossary.md`
