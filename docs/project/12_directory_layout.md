# 推奨ディレクトリ構成

長期運用で破綻しないリポジトリ構成。**Layer A(連表)/ Layer B(master)/ Layer C(relation)** の三層を物理的にも分離する。

## 0. ルート構成

```
japanese_mythology_database/
├── README.md
├── CLAUDE.md                    # 編纂規程
├── LICENSE                      # コード:MIT、データ:CC-BY 4.0(検討)
├── docs/
│   ├── 出雲編/                  # Layer A: 編単位連表
│   ├── 伊勢編/
│   ├── 諏訪編/
│   ├── 鹿島香取編/
│   ├── 宗像編/
│   ├── 熊野編/
│   ├── 石上編/
│   ├── 三輪編/
│   ├── 宇佐編/
│   ├── 春日編/
│   ├── 海人編/
│   ├── 修験編/
│   ├── 東北編/
│   ├── 九州編/
│   ├── 琉球編/
│   ├── regional/                # 既存:横断地方層
│   ├── master/                  # Layer B: 13 種 master TSV
│   │   ├── deity_master.tsv
│   │   ├── shrine_master.tsv
│   │   ├── clan_master.tsv
│   │   ├── emperor_master.tsv
│   │   ├── myth_episode_master.tsv
│   │   ├── event_master.tsv
│   │   ├── site_master.tsv
│   │   ├── artifact_master.tsv
│   │   ├── ritual_master.tsv
│   │   ├── region_master.tsv
│   │   ├── text_master.tsv
│   │   ├── title_master.tsv
│   │   ├── hypothesis_master.tsv
│   │   └── wikidata_mapping.tsv (Phase 5)
│   ├── relations/               # Layer C: relation TSV
│   │   ├── relations.tsv        # 統合(自動生成)
│   │   ├── relations_enshrined_at_*.tsv
│   │   ├── relations_mentioned_in_*.tsv
│   │   ├── relations_genealogy_*.tsv
│   │   ├── relations_syncretized_*.tsv
│   │   ├── relations_archaeologically_linked_*.tsv
│   │   ├── relations_supports_contradicts_*.tsv
│   │   ├── ... (relation_type 別)
│   │   └── relation_inventory.md  # type 別件数台帳
│   ├── schema/                  # スキーマ規程
│   │   ├── 00_id_scheme.md
│   │   ├── 01_node_types.md
│   │   ├── 02_relation_types.md
│   │   ├── 03_deity_master_design.md
│   │   ├── 04_shrine_master_design.md
│   │   ├── 05_clan_master_design.md
│   │   ├── 06_time_axes.md
│   │   ├── 07_source_reliability.md
│   │   ├── 08_hypothesis_layer.md
│   │   ├── 09_relation_db.md
│   │   ├── 10_future_architectures.md
│   │   └── 11_master_design_misc.md  # emperor/myth/event 等の追補
│   ├── audit/                   # 監査レポート
│   │   ├── 00_audit_framework.md
│   │   ├── 01〜09_*.md
│   │   ├── 10〜15_*.md (Phase 4 追加)
│   │   └── gemini/              # Gemini 反射監査ログ
│   │       ├── AUD-GM-01_*.md
│   │       └── ...
│   ├── civilization/            # 文明解析(motif / network / 縄文記憶)
│   │   ├── 00_methodology.md
│   │   ├── 01_motif_db.tsv
│   │   ├── 02_motif_relations.tsv
│   │   ├── 03_saiken_analysis.md
│   │   ├── 03_saiken_summary.tsv
│   │   ├── 04_networks.md
│   │   ├── 04_networks.tsv
│   │   ├── 05_jomon_memory.md
│   │   ├── 06_central_vs_regional.md
│   │   └── 07_knowledge_graph_final.md
│   ├── project/                 # 本書群(プロジェクト運用設計)
│   │   ├── README.md
│   │   ├── 01_roadmap.md
│   │   ├── 02_epics.md
│   │   ├── 03_milestones.md
│   │   ├── 04_issue_template.md
│   │   ├── 05_issues_catalog.md
│   │   ├── 06_subtasks.md
│   │   ├── 07_relation_issues.md
│   │   ├── 08_master_db_issues.md
│   │   ├── 09_audit_issues.md
│   │   ├── 10_graphdb_neo4j.md
│   │   ├── 11_labels.md
│   │   ├── 12_directory_layout.md (本書)
│   │   ├── 13_claude_rules.md
│   │   └── 14_scaling.md
│   ├── queries/                 # Phase 5: Cypher
│   │   ├── 00_index.md
│   │   ├── 01_deity_shrine.cypher
│   │   ├── 02_genealogy.cypher
│   │   └── ...
│   ├── graph_visualization/     # Phase 5: 可視化サンプル
│   │   ├── genealogy.html
│   │   ├── shrine_network.html
│   │   └── myth_variants.html
│   └── templates/
│       ├── columns.md
│       ├── empty.tsv
│       ├── issue_template.md
│       └── pr_template.md
├── pipeline/                    # Phase 5: TSV→Neo4j パイプライン
│   ├── tsv2csv.py
│   ├── load_neo4j.cypher
│   ├── export_jsonld.py
│   └── verify.cypher
├── scripts/                     # 監査・正規化スクリプト
│   ├── audit/
│   │   ├── check_id_collision.sh
│   │   ├── check_required_cols.sh
│   │   ├── check_duplicate_rln.sh
│   │   ├── check_orphan_master.sh
│   │   ├── check_dangling_rln.sh
│   │   └── check_normalize.sh
│   ├── master/
│   │   ├── extract_from_layer_a.py
│   │   └── merge_master.py
│   └── relation/
│       └── merge_relations.py
├── staging/                     # gitignore: Neo4j 用一時 CSV
│   └── .gitkeep
└── .github/
    ├── workflows/
    │   ├── audit.yml             # 監査スクリプト CI
    │   └── tsv-validate.yml      # TSV 形式検証
    ├── ISSUE_TEMPLATE/
    │   ├── area_issue.md         # 04_issue_template.md と同期
    │   ├── relation_issue.md
    │   ├── master_issue.md
    │   ├── audit_issue.md
    │   └── graph_issue.md
    ├── PULL_REQUEST_TEMPLATE.md
    └── labels.yml                # ラベル定義(11_labels.md と同期)
```

---

## 1. 既存構造との対応

現状(2026-05 時点):

```
docs/
├── audit/        ✅ 既存
├── civilization/ ✅ 既存(部分)
├── master/       ✅ 既存(部分)
├── regional/     ✅ 既存
├── relations/    ✅ 既存(サンプルのみ)
├── schema/       ✅ 既存
├── templates/    ✅ 既存
└── 出雲編/       ✅ 既存
```

→ 新規追加:
- `docs/project/`(本書群)
- `docs/伊勢編/` 〜 `docs/琉球編/` 各地域編
- `docs/queries/`(Phase 5)
- `docs/graph_visualization/`(Phase 5)
- `pipeline/`(Phase 5)
- `scripts/`(漸次)
- `.github/`(漸次)

---

## 2. 各ディレクトリの設計原則

### 2.1 `docs/<編>/`(Layer A 連表)

- 編単位で TSV を分割
- ファイル名: `<連番>_<トピック>.tsv`(例: `04_betsugu.tsv`)
- 同じ編に補足 md があれば `<連番>_<トピック>_notes.md`
- README.md(任意): 編の方針を 200 行以内で記述

### 2.2 `docs/master/`(Layer B)

- 1 ファイル = 1 node_type
- ヘッダ行は `docs/schema/01_node_types.md` の必須カラムを順守
- master_id は **同じディレクトリ内で一意**(プレフィックスで自動衝突回避)
- aliases は **半角カンマ区切り**(全角カンマ禁止)

### 2.3 `docs/relations/`(Layer C)

- relation_type 別にファイル分割(レビューしやすさ重視)
- 最終的に `relations.tsv` に統合(自動生成 / または手動マージ)
- 各分割ファイルは `relations_<type>_<area or domain>.tsv`
- `relation_inventory.md` で件数台帳

### 2.4 `docs/schema/`(規程)

- スキーマ変更は **新ファイル追加** または **既存ファイルへの追記**
- 過去版を残したい場合は `_v1.md` のように suffix
- 重大変更は `docs/schema/CHANGELOG.md`(任意)に記録

### 2.5 `docs/audit/`

- 監査軸ごとに `<連番>_<軸>.md`
- Gemini 監査は `gemini/` サブディレクトリ
- 監査と修正 PR は **同じブランチ** で行わない(分離)

### 2.6 `docs/civilization/`

- 既存の 7 文書 + 任意の補追
- TSV は motif / network / region の 3 視点

### 2.7 `docs/project/`(本書群)

- 14 文書 + README
- スキーマや CLAUDE.md と矛盾を起こさないよう、**変更時は両方更新**

### 2.8 `docs/queries/`(Phase 5)

- 1 ファイル = 1 クエリパターン
- ヘッダコメントに **目的・想定結果** を記述

### 2.9 `pipeline/`

- Neo4j 投入のための CSV 変換 + Cypher
- 言語は Python(任意)
- pipenv / requirements.txt を整備

### 2.10 `scripts/audit/`

- Bash スクリプト(POSIX 互換)
- 戻り値 0 = OK、非 0 = 違反検出

---

## 3. ファイル命名規約

### 3.1 TSV(連表・master・relation)

```
<編>/<連番2桁>_<英語または日本語スラッグ>.tsv
master/<node_type>_master.tsv
relations/relations_<type>[_<area>].tsv
```

### 3.2 Markdown

```
schema/<連番2桁>_<トピック>.md
project/<連番2桁>_<トピック>.md
audit/<連番2桁>_<軸>.md
civilization/<連番2桁>_<トピック>.md
```

### 3.3 ブランチ命名

```
issue/<Issue ID>     例: issue/ISE-04
chore/<topic>        例: chore/setup-labels
audit/<Issue ID>     例: audit/AUD-GM-03
master/<topic>       例: master/deity-merge-v1
release/v1.0
```

### 3.4 タグ命名

```
M<X.Y>-<topic>        例: M2.3-Ise-v1.0
v<X>.<Y>.<Z>          例: v1.0.0
```

---

## 4. ファイルサイズ・分割閾値

| ファイル種別 | 推奨上限 | 超えたら |
|---|---|---|
| Layer A 連表 TSV | 250 行 | 編内で `<連番>_<細分>.tsv` に分割 |
| master TSV | 1500 行 | 慎重に。分割せずに済ますのが原則(SQL 的に 1 テーブル) |
| relations 個別 TSV | 5000 行 | area で更に分割 |
| relations.tsv 統合 | 100,000 行 | gzip 圧縮 + LFS 検討 |
| md | 1000 行 | トピックで分割 |

### 4.1 LFS の検討

- `relations.tsv` が 50MB を超えそうなら Git LFS 化
- master TSV は通常通り(LFS 不要想定)

---

## 5. .gitignore 推奨

```
# Neo4j 用一時ファイル
staging/
*.csv

# エディタ
.idea/
.vscode/
*.swp

# OS
.DS_Store

# Python
__pycache__/
*.pyc
.venv/

# 監査スクリプト一時出力
scripts/**/out/
```

---

## 6. ファイル間整合性の保ち方

| 仕組み | 説明 |
|---|---|
| schema/01_node_types.md ⇄ docs/master/*_master.tsv | 必須カラムが乖離してはならない。schema 変更時は CI でチェック |
| schema/02_relation_types.md ⇄ docs/relations/*.tsv | 未定義 type の使用禁止 |
| docs/master/* ⇄ docs/relations/* | source/target master_id が必ず存在 |
| CLAUDE.md §3.2 ⇄ docs/templates/columns.md ⇄ docs/templates/empty.tsv | 連表 29 列が完全一致 |
| 11_labels.md ⇄ .github/labels.yml | ラベル定義が一致(CI で同期) |

---

## 7. 大規模化時の構成変更(Phase 5+)

| 規模 | 対応 |
|---|---|
| relation 50,000 件超 | `relations/` 配下を `<type>/<area>.tsv` のサブディレクトリ化 |
| master 5,000 件超 | LFS 化検討(現時点では不要) |
| Issue 500 件超 | GitHub Project Board を Phase 別 + Area 別の 2 軸に |
| 編 30 編超 | `docs/area/<編>/` のように `area/` 共通ディレクトリ下に集約 |
