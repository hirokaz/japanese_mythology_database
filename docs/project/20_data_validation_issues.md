# Data Validation Issues (2026-05-24)

## ISSUE-DATA-001: `relations.tsv` の dangling reference 修正依頼

- 検証日: 2026-05-24
- 検証コマンド: `python3 scripts/audit_kpi.py`
- 結果: `relations.tsv` に `festival_master.tsv` へ解決できない参照が 2 件存在

### 事象

以下の relation は `festival=FES-022` を参照しているが、`docs/master/festival_master.tsv` に `FES-022` が存在しない。

- `RLN-020257`
- `RLN-020258`

### 影響

- relation の参照整合性が崩れ、データ利用時の join / 検索で欠損が発生する。
- 監査結果に warning が継続して残る。

### 修正依頼

1. `docs/master/festival_master.tsv` に `FES-022` を追加する、または
2. `docs/relations/relations.tsv` 側の `FES-022` を既存の正しい festival ID に置換する。

### 受け入れ条件

- `python3 scripts/audit_kpi.py` 実行時に `dangling references: 0` となること。
- `RLN-020257` / `RLN-020258` の参照先 festival が `festival_master.tsv` に実在すること。
