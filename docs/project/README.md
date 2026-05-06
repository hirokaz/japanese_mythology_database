# 日本神話・神道史統合DB プロジェクト運用設計

本書群は、本リポジトリを **GitHub Issue 駆動型 長期研究プロジェクト** として運用するための設計文書である。Epic / Milestone / Issue / Subtask の体系、Claude による自律実行ルール、知識グラフ化までの全工程を規程する。

## 1. 設計の前提

| 項目 | 内容 |
|---|---|
| プロジェクト規模 | 数万 relation・数千 node・数百 issue |
| 期間想定 | 12〜36 ヶ月 |
| 主要実行者 | Claude Code(編纂)+ Gemini(監査)+ 人間(承認・方向性) |
| 出力形式 | TSV(Layer A 連表 / Layer B マスター / Layer C relations)+ Markdown(設計・解析) |
| 最終形態 | Neo4j 知識グラフ + 検索 UI |
| 並行性 | 可(Issue 単位で独立。`area:*` で衝突回避) |

## 2. 文書構成

| ファイル | 内容 |
|---|---|
| `README.md`(本書) | 索引・全体俯瞰 |
| `01_roadmap.md` | Phase 1〜5 全体ロードマップ |
| `02_epics.md` | 32 Epic 定義 |
| `03_milestones.md` | Milestone 群と完了条件 |
| `04_issue_template.md` | Issue 粒度ルールとテンプレート |
| `05_issues_catalog.md` | 主要 Issue カタログ(着手しやすい順) |
| `06_subtasks.md` | 典型 Issue の Subtask 分解パターン |
| `07_relation_issues.md` | relation 生成専用 Epic と Issue |
| `08_master_db_issues.md` | Master DB 構築専用 Epic と Issue |
| `09_audit_issues.md` | Gemini 監査 Issue 設計 |
| `10_graphdb_neo4j.md` | Neo4j 化最終工程 |
| `11_labels.md` | GitHub Label 設計 |
| `12_directory_layout.md` | リポジトリ構成 |
| `13_claude_rules.md` | Claude 運用ルール(暴走防止) |
| `14_scaling.md` | 数万 relation 規模での運用戦略 |

## 3. 全体の流れ(超高速サマリ)

```
Phase 1: スキーマ確定 (済) ─┐
                              ├─ Phase 2: 地域編 + Master 投入
Phase 2: 地域編充実 (進行中) ┘                       │
                                                      ▼
                              Phase 3: relation 大量生成 (RLN-* 数万件)
                                                      │
                                                      ▼
                              Phase 4: 監査 + 正規化 + 横断仮説
                                                      │
                                                      ▼
                              Phase 5: Neo4j 化 + クエリ + 公開
```

## 4. 既存の到達点(2026-05 時点)

- スキーマ層: `docs/schema/` 全 11 文書で確定済(node 13 種・relation 約 35 種)
- 出雲編: 161 行(`docs/出雲編/`)
- 地方研究: 神話 105 / 神社 102 / 海人製鉄 / 修験習合 / テーマ 62 / relation 310(`docs/regional/`)
- 監査: 9 軸完了(`docs/audit/`)
- 文明解析: #1 基盤確定、#2〜#7 未着手
- Master: deity / shrine / clan / hypothesis(部分)

→ Phase 1 ほぼ完了、Phase 2 中盤、Phase 3 端緒。

## 5. 用語

| 用語 | 定義 |
|---|---|
| Epic | 大テーマ(例: 出雲祭祀ネットワーク)。複数 Milestone を含む |
| Milestone | 集約点(例: 出雲編 v1.0)。複数 Issue を含む |
| Issue | 2〜8 時間で完了する単位作業 |
| Subtask | Issue 内チェックリスト(各 30 分〜2 時間) |
| Layer A | 連表 TSV(時系列・29 列) |
| Layer B | Master TSV(node 単位・正規化済み) |
| Layer C | Relations TSV(エッジ単位) |
| L0〜L5 | 仮説強度(`docs/schema/08_hypothesis_layer.md`) |
| A〜E | 史実性レベル(`CLAUDE.md` §3.4) |
