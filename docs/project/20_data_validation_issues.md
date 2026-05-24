# Data Validation Issues (2026-05-24)

## ISSUE-DATA-001: `relations.tsv` の dangling reference 修正依頼

- 検証日: 2026-05-24
- 検証コマンド: `python3 scripts/audit_kpi.py`
- 結果: `relations.tsv` に `festival_master.tsv` へ解決できない参照が 2 件存在

### 事象

以下の relation は `festival=FES-022` を参照しているが、`docs/master/festival_master.tsv` に `FES-022` が存在しない。

- `RLN-020257`
- `RLN-020258`

### 追加検証で判明した補強情報

- 欠落は `FES-022` のみで、warning の件数(2件)と一致する。
- 2件とも `source_reference=諏訪神社社伝|長崎奉行記`、`notes=長崎くんち関連神格` で整合しており、同一祭礼を想定した relation と判断できる。
- 参照神格は `DEI-010` / `DEI-029` で、諏訪系祭祀として妥当な組み合わせになっている。
- 直前後の ID 連番を確認すると `FES-021` と `FES-023` は存在し、`FES-022` だけが欠番になっている。

### 推定原因

- `festival_master.tsv` 編集時に `FES-022` 行のみ脱落した可能性が高い(連番欠番パターン)。

### 修正依頼

1. 第一候補(推奨): `docs/master/festival_master.tsv` に `FES-022` を追加する。
   - 候補 canonical_name: `長崎くんち`
   - 候補 host_shrine_id: `SHR-039`(諏訪神社)
   - 候補 related_deity_ids: `DEI-010|DEI-029`
   - 候補 source_reference: `諏訪神社社伝|長崎奉行記`
   - ※上記は relation からの復元案。正式値は史料照合で確定すること。
2. 第二候補: `docs/relations/relations.tsv` 側の `FES-022` を既存 festival ID へ置換する。
   - ただし祭礼の独立性を損なう可能性があるため、置換理由の記録を必須とする。

### 受け入れ条件

- `python3 scripts/audit_kpi.py` 実行時に `dangling references: 0` となること。
- `RLN-020257` / `RLN-020258` の参照先 festival が `festival_master.tsv` に実在すること。
- `FES-022` を追加した場合、`performed_at` relation も必要なら併せて追加され、祭礼ノードとして最小構成(主催社・関連神格・出典)が満たされること。

---

## ブランチ確認メモ

- この作業環境では `origin/main` リモートが未設定のため、リモート main の最新状態は直接確認できない。
- 実施できた確認:
  - ローカルの現行ブランチ(head)確認
  - リポジトリ内データの最新整合性監査
- リモート main を確認するには、`git remote add origin <repo-url>` 後に `git fetch origin main` が必要。
