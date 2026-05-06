# 大規模運用戦略 — 数万 relation・数千 node・数百 Issue 対応

プロジェクトが Phase 3-5 へ進むにつれ、「**規模に伴って崩れる問題**」が発生する。本書ではそれらを **設計時から防ぐ戦略** をまとめる。

---

## 0. 想定規模

| 項目 | Phase 2 終 | Phase 3 終 | Phase 5 終 |
|---|---|---|---|
| node 総数 | 2,000 | 4,500 | 5,000+ |
| relation 総数 | 2,000 | 30,000 | 35,000+ |
| Issue 累積 | 80 | 250 | 500+ |
| ファイル数(TSV) | 50 | 120 | 150+ |
| TSV 総容量 | 5 MB | 30 MB | 40 MB |
| 編数 | 4 | 15 | 15 |

---

## 1. 重複防止戦略

### 1.1 master_id を **唯一の真実** に

- master_id 衝突は CI で検出(`scripts/audit/check_id_collision.sh`)
- TSV 投入前に `awk -F"\t" '{print $1}' | sort | uniq -d` で重複検出
- canonical_name の重複も `--ignore-aliases` モードで検出

### 1.2 entity merge プロトコル

重複検出時の標準手順:

```
1. 重複候補の同定
   - 表記ゆれ (アメノホヒ/天穂日命/天菩比命)
   - 同一神格の異名 (オオナムチ/大己貴命)
2. canonical_name の確定
   - 古事記表記を優先(なければ書紀、なければ史料登場順)
3. 残す master_id の確定(古いものを残し、新しいものを merge)
4. merged_into 関係の発行(削除しない)
5. relation の source_id / target_id を一括更新
6. CI 検証
```

### 1.3 重複 PR ガード

CI で:

- 新規 PR がすでにある master_id を重複定義 → ブロック
- canonical_name の完全一致 → 警告(merge 候補として提示)

---

## 2. 正規化戦略

### 2.1 名前正規化レベル

| レベル | 内容 | 適用 |
|---|---|---|
| L1 | Unicode NFC | 全カラム必須 |
| L2 | 全角 → 半角(数字・英字・記号) | ID, 年代等 |
| L3 | 揺らぎ統一(度合 → 度会) | canonical_name |
| L4 | 読み仮名(現代仮名遣い) | canonical_reading |

### 2.2 正規化スクリプト

```bash
# scripts/master/normalize.sh
python3 -c "
import unicodedata, sys
for line in sys.stdin:
    print(unicodedata.normalize('NFC', line), end='')
"
```

PR 前に `make normalize` で実行する運用を推奨(将来 Makefile 整備)。

### 2.3 表記ゆれ辞書

- `docs/master/aliases_dictionary.tsv` を整備(将来)
- `<canonical> <tab> <variant1>,<variant2>,...`
- 自動マージのリファレンス

---

## 3. マスター統合戦略

### 3.1 段階的統合

```
[編単位 master 抽出]                         (並行可)
   │
   ├── 出雲編 → deity_master_izumo.tsv (一時)
   ├── 伊勢編 → deity_master_ise.tsv (一時)
   └── ...
        │
        ▼
[統合 Issue(MST-DE-17)]                    (順次)
   ├── 全一時 master を結合
   ├── 重複検出
   ├── canonical_name 確定
   ├── merged_into 発行
   └── deity_master.tsv を更新
        │
        ▼
[CI 検証 + Gemini 監査]
        │
        ▼
[merged]
```

### 3.2 統合の頻度

- 編 1 つ完了するごと → 統合 Issue(L サイズ)
- 統合は **1 PR で 1 master まで**(同時複数禁止 — レビュー困難)

### 3.3 履歴保持

- 統合で消した master_id は merged_into で残す
- 本物の削除は禁止(参照切れリスク)

---

## 4. relation 統合戦略

### 4.1 分割ファイル運用

```
docs/relations/
├── relations.tsv                                ← 統合(自動生成)
├── relations_enshrined_at_izumo.tsv
├── relations_enshrined_at_ise.tsv
├── ... (relation_type × area の二次元)
```

### 4.2 統合パイプライン

```bash
# scripts/relation/merge_relations.py
# 1. relations_*.tsv を全件読み込み
# 2. ヘッダ行のみ統一
# 3. relation_id を RLN-NNNNNN で再採番
# 4. 重複検出(同 source/type/target)
# 5. relations.tsv 出力
# 6. relation_inventory.md 自動生成(type 別件数)
```

### 4.3 重複検知ルール

- 同 `source_id`,`relation_type`,`target_id` → 重複
- ただし `valid_from`/`valid_until` が異なれば別レコード(時系列差)
- ただし `temporal_scope` が異なれば別レコード(神話/歴史/文献)

---

## 5. インデックス戦略

### 5.1 TSV 段階(Phase 2-3)

- 機械検索は `grep` / `awk` で十分
- `sort -t$'\t' -k1,1` で master_id ソートしておく(diff 安定化)

### 5.2 Neo4j 段階(Phase 5)

`10_graphdb_neo4j.md` §3 の通り:

```cypher
CREATE INDEX deity_name FOR (n:Deity) ON (n.canonicalName);
CREATE INDEX shrine_pref FOR (n:Shrine) ON (n.prefecture);
CREATE INDEX rln_layer FOR ()-[r]-() ON (r.hypothesisLayer);
```

### 5.3 textsearch 用 fulltext index

```cypher
CREATE FULLTEXT INDEX entity_search FOR (n:Deity|Shrine|Clan|MythEpisode) ON EACH [n.canonicalName, n.aliases];
```

→ 「あいうえお」検索で全 master 横断ヒット。

---

## 6. Issue 大量化への対応

### 6.1 Project Board 設計

- **Phase × Area** の 2 軸で Board を分割
- Board 1 つあたり 30〜60 Issue が視認限界
- Phase 跨ぎは別 Board

### 6.2 Issue 検索パターン

```
is:open label:phase:2 label:area:ise  → 伊勢編 進行中
is:open label:type:relation           → 全 relation 系
is:open label:status:blocked          → ブロック中
is:open label:claude-autonomous       → 自律実行可
```

### 6.3 Issue メタ整理

- `epic` ラベル付き親 Issue を Epic ごとに 1 つ用意
- 親の本文に子 Issue を一覧
- GitHub の `Tasklist` 機能でツリー表示

### 6.4 Stale Issue 整理

- 6 ヶ月更新なし → `status:stale` 付与
- 9 ヶ月更新なし → クローズ判断(自動化候補)

---

## 7. レビュー戦略(数百 PR への耐性)

### 7.1 PR サイズ制約

| 種別 | diff 上限目安 |
|---|---|
| Layer A 連表 | 300 行 |
| master 統合 | 200 行(merged_into 除く) |
| relation 抽出 | 500 行 |
| schema 改訂 | 100 行 |
| 監査レポート | 制限なし |

→ 超えるなら必ず分割。

### 7.2 セルフレビュー Checklist

`13_claude_rules.md` §3.4 のチェックリストを **PR 本文末尾に必ず貼る**。

### 7.3 自動 CI

- TSV 形式検証
- master_id 衝突検出
- relation dangling 検出
- 必須カラム欠損検出
- → 全件 OK でないと merge 不可

---

## 8. データ品質維持

### 8.1 confidence_level / hypothesis_layer の分布監視

```
relation 全件のうち:
  - L0 比率 (理想 > 50%)
  - L4-L5 比率 (理想 < 10%)
  - confidence A 比率 (理想 > 30%)
  - confidence E 比率 (理想 < 15%)
```

→ 月次で `relation_inventory.md` に記録。L4-L5 が増えすぎたら警告。

### 8.2 出典の偏り監視

```
mentioned_in を text 別に集計:
  - 古事記 / 書紀 / 風土記 / 延喜式 / 社伝 のバランス
```

→ 古事記偏重(中央偏重の徴候)は監査軸として警戒。

### 8.3 地域分布監視

```
shrine / deity / event の prefecture 別件数:
  - 関西偏重・関東軽視 が起きていないか
  - 東北・九州・琉球が存在するか
```

---

## 9. 危機対応(壊れたらどうするか)

### 9.1 master 全壊

- バックアップ: git history で十分(LFS なし前提)
- 復旧: 該当コミット直前を `git revert`
- 統合 PR は段階的 revert で部分復旧可

### 9.2 relation 全壊

- 個別 `relations_*.tsv` から再統合
- 統合は冪等なので再実行で復旧

### 9.3 Neo4j 投入失敗

- 投入は `MERGE` ベース → 部分投入なら冪等
- 全壊時は DB を drop して LOAD CSV を再実行
- 投入時間は 5,000 node + 35,000 edge で 5-10 分想定

---

## 10. 長期維持

### 10.1 schema 改訂のコスト

schema 変更は **波及範囲が広い** → 慎重に。

| 変更 | 影響範囲 | 対応 |
|---|---|---|
| node_type 追加 | master 1 つ追加 | OK |
| relation_type 追加 | relation 投入 1 つ追加 | OK |
| 必須カラム追加 | 全該当 master を更新 | 一斉 PR |
| 必須カラム削除 | 全該当 master を更新 | 慎重に |
| ID 体系変更 | ほぼ全データ移行 | やらない(極力避ける) |

### 10.2 後方互換性

- master_id は **絶対変えない**
- canonical_name は変えてよい(出典付きで)
- relation_type は **deprecated 機能で段階的廃止**

### 10.3 ドキュメンテーション

- すべての schema 変更を `docs/schema/CHANGELOG.md`(将来)に記録
- master の運用変更は `docs/master/CHANGELOG.md`(将来)に記録
- 半年に 1 度、`docs/project/01_roadmap.md` を見直し

---

## 11. 数値目標(KPI)

| 指標 | Phase 3 終 | Phase 5 終 |
|---|---|---|
| node カバレッジ(主要 1500 神/神社/氏族) | 80% | 95% |
| 全 relation の出典付与率 | 95% | 100% |
| 重複(同 source/type/target) | 0.5% 未満 | 0% |
| L0 relation 比率 | > 40% | > 50% |
| L4-L5 relation 比率 | < 15% | < 10% |
| Gemini 監査済 milestone 数 | 10 | 20 |
| Cypher クエリ動作率 | - | 100%(50/50) |

---

## 12. ツール整備チェックリスト(Phase 3-4 で順次)

- [ ] `scripts/audit/check_id_collision.sh`
- [ ] `scripts/audit/check_required_cols.sh`
- [ ] `scripts/audit/check_duplicate_rln.sh`
- [ ] `scripts/audit/check_orphan_master.sh`
- [ ] `scripts/audit/check_dangling_rln.sh`
- [ ] `scripts/audit/check_normalize.sh`
- [ ] `scripts/master/extract_from_layer_a.py`
- [ ] `scripts/master/merge_master.py`
- [ ] `scripts/relation/merge_relations.py`
- [ ] `scripts/relation/inventory.py`
- [ ] `pipeline/tsv2csv.py`
- [ ] `pipeline/load_neo4j.cypher`
- [ ] `pipeline/verify.cypher`
- [ ] `pipeline/export_jsonld.py`
- [ ] `.github/workflows/audit.yml`
- [ ] `.github/workflows/tsv-validate.yml`

---

## 13. 撤退ライン(やらないことを決める)

巨大化を防ぐため、以下は本プロジェクトのスコープ外:

- 江戸期以降の新興神社の網羅(`docs/master/shrine_master.tsv` には主要のみ)
- 地方寺院(神仏習合の主要拠点を除く)
- 個別の神職人物名(主要社家のみ)
- 全ての風土記逸文(主要逸話のみ)
- 個別の祭祀年中行事(代表的なもののみ)

→ これらを Issue 化したい人は **別プロジェクト** として fork を推奨。
