# DISC-001 解決報告: 知識基盤の活用シナリオ (persona 別)

**ステータス**: 収束 (Round 2 自己反証完了、人間判断による close)
**起票**: 2026-05-06 (#177)
**収束**: 2026-05-24
**経緯**: Claude Round 1 投下 → Codex 応答なし 2.5 週間 → Claude Round 2 自己反証 → 人間判断で収束

---

## 結論

知識基盤の 4 persona 活用シナリオは、**AI 生成エントリ大量混入の発覚**を踏まえて Round 1 (初期案) から大幅改訂された v0.2 で確定。

## 確定 persona 定義 v0.2

| Persona | 推奨用途 | 必須前提 |
|---|---|---|
| **A: 古代史 / 神話研究者** | **既知仮説の文献マッピング** (Round 1 の「新仮説生成」から縮小) | `hypothesis_layer` + `verified_status` 両方表示。仮説生成時は手動エビデンス検証必須 |
| **B: 神職 / 由緒担当** | 自社・近隣社の由緒・分祀ネットワーク図 | `[要検証]` エントリは警告色表示。架空エントリ警告必須 |
| **C: 中学高校歴史教育者** | **L0 + verified_status=verified のみ表示** (色分けは「実在性」「典拠強度」両軸) | 色分けが Lレベルだけでは不十分 (Sprint5 で L0=A の架空エントリが大量混入していた事実から) |
| **D: 地方自治体 / 観光企画** | 古代社格社 (式内・一宮・名神大) のみの観光導線 | 保護リスト準拠 (古代社格を持つエントリは PR #229 削除対象から除外済) |

## 確定した処理パターン v0.2

### Persona A (研究者)

```cypher
// 既知仮説の文献マッピング (新仮説生成ではない)
MATCH (d:Deity)-[:syncretized_with]->(other)
WHERE other.hypothesis_layer = 'L3'
  AND other.verified_status IN ['verified', 'under_review']
RETURN d, other
```

### Persona B (神職)

```cypher
// 自社+分祀系統、ただし [要検証] は警告色
MATCH (s:Shrine {master_id: $shrine_id})-[:descended_from*1..3]-(parent)
RETURN s, parent, parent.verified_status as warning_status
```

### Persona C (教育者)

```cypher
// 教育用安全 view: L0 + verified のみ
MATCH (e)
WHERE e.hypothesis_layer = 'L0'
  AND e.verified_status = 'verified'
  AND e.confidence_level IN ['A', 'B']
RETURN e
```

### Persona D (観光)

```cypher
// 観光導線: 古代社格保有社のみ
MATCH (s:Shrine {prefecture: $pref})
WHERE s.shrine_rank_ancient =~ '.*(名神大社|式内|一宮|二宮).*'
RETURN s
```

## 完了条件達成状況

- [x] 4 persona 別活用フロー (v0.2 確定)
- [x] 各 persona の入力 → 処理 → 出力 → 意思決定 4 段階
- [x] 必要 UI / API リスト化 (実在検証バッジ表示、警告色)
- [ ] docs 反映 (本文書で完了、`docs/civilization/11_web_atlas_design.md` への接続は後続 PR)

## 反映先

- 本文書 `docs/discussions/DISC-001_resolution.md` (確定版)
- 後続 PR: `docs/civilization/11_web_atlas_design.md` の persona 章を v0.2 で更新 (TODO)
- 後続 PR: `verified_status` field 追加 (DISC-003 と連動)

## 関連
- 起票 issue: #177
- 関連 DISC: #178 (リスク台帳 RISK-31 で AI 生成リスクと連動) / #179 (公開レイヤで `verified_status` 採用)
- 削除実績: PR #229 (211 件), PR #231 (73 件) で AI 生成エントリ計 284 件除去
