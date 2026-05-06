# Milestone 設計

Milestone は「成果集約点」であり、複数 Issue を束ねる **完成可能な状態** を定義する。

## 0. Milestone 命名規則

```
M<Phase>.<Sprint>-<Topic>     例: M2.3-Ise-v1.0
```

- Phase: 1〜5
- Sprint: 当該 Phase 内の通し番号
- Topic: 完成物の識別子(編コード or master 名)

## 1. Milestone 全体表

| ID | 名称 | Phase | 状態 | 期待週数 |
|---|---|---|---|---|
| M1.1 | スキーマ確定 v1.0 | 1 | ✅ 完了 | - |
| M1.2 | スキーマ補追(残 7 master 設計) | 1 | 進行中 | 4 |
| M2.1 | 出雲編 v1.0 | 2 | ✅ 完了 | - |
| M2.2 | 地方研究 v1.0(横断地方層) | 2 | ✅ 完了 | - |
| M2.3 | 伊勢編 v1.0 | 2 | 未着手 | 6 |
| M2.4 | 諏訪編 v1.0 | 2 | 未着手 | 5 |
| M2.5 | 鹿島香取編 v1.0 | 2 | 未着手 | 4 |
| M2.6 | 宗像編 v1.0 | 2 | 未着手 | 5 |
| M2.7 | 熊野編 v1.0 | 2 | 未着手 | 6 |
| M2.8 | 石上編 v1.0 | 2 | 未着手 | 4 |
| M2.9 | 三輪編 v1.0 | 2 | 未着手 | 5 |
| M2.10 | 宇佐編 v1.0 | 2 | 未着手 | 4 |
| M2.11 | 春日編 v1.0 | 2 | 未着手 | 4 |
| M2.12 | 海人編 v1.0 | 2 | 部分 | 3 |
| M2.13 | 修験編 v1.0 | 2 | 部分 | 3 |
| M2.14 | 東北編 v1.0 | 2 | 未着手 | 5 |
| M2.15 | 九州編 v1.0 | 2 | 未着手 | 5 |
| M2.16 | 琉球編 v1.0 | 2 | 未着手 | 3 |
| M2.17 | deity_master 600+ | 2 | 部分 | 6 |
| M2.18 | shrine_master 800+ | 2 | 部分 | 8 |
| M2.19 | clan_master 250+ | 2 | 部分 | 5 |
| M2.20 | emperor_master 全代 | 2 | 未着手 | 4 |
| M2.21 | myth_episode_master 200+ | 2 | 未着手 | 5 |
| M2.22 | event/site/artifact/ritual/region/text/title master 完成 | 2 | 未着手 | 8 |
| M2.23 | hypothesis_master 100+ | 2-4 | 部分 | 6 |
| M2.24 | 文明解析 #2〜#7 完成 | 2 | 進行中 | 4 |
| M3.1 | enshrined_at relation 一括生成 | 3 | 未着手 | 3 |
| M3.2 | mentioned_in relation 一括生成 | 3 | 未着手 | 4 |
| M3.3 | 系譜 relation 一括生成(parent_of / married_to / sibling_of / descended_from) | 3 | 未着手 | 4 |
| M3.4 | 神格・同体 relation 一括生成(syncretized_with / same_as / has_alias / has_title / regional_variant_of) | 3 | 未着手 | 4 |
| M3.5 | 政治・支配 relation 一括生成 | 3 | 未着手 | 3 |
| M3.6 | 神話・出来事 relation 一括生成 | 3 | 未着手 | 3 |
| M3.7 | 考古 relation 一括生成 | 3 | 未着手 | 3 |
| M3.8 | 祭祀 relation 一括生成 | 3 | 未着手 | 3 |
| M3.9 | 仮説 relation 一括生成(supports / contradicts) | 3 | 未着手 | 4 |
| M3.10 | relation 1 万件突破 | 3 | 未着手 | - |
| M3.11 | relation 3 万件突破 | 3 | 未着手 | - |
| M4.1 | 表記ゆれ統合(全 master) | 4 | 部分 | 4 |
| M4.2 | 出典監査 v2.0(全 relation) | 4 | 未着手 | 6 |
| M4.3 | 断定監査 v2.0 | 4 | 部分 | 4 |
| M4.4 | 中央史観バランス監査 | 4 | 部分 | 3 |
| M4.5 | 地方伝承被覆監査 | 4 | 部分 | 3 |
| M4.6 | Gemini 反射監査ループ運用開始 | 4 | 未着手 | 3 |
| M4.7 | 横断仮説層完成(縄文記憶 / 海人連合 / 銅鐸祭祀文化圏) | 4 | 未着手 | 6 |
| M5.1 | Neo4j スキーマ凍結 | 5 | 未着手 | 3 |
| M5.2 | Neo4j 投入パイプライン完成 | 5 | 未着手 | 3 |
| M5.3 | Cypher クエリ集 50 件 | 5 | 未着手 | 4 |
| M5.4 | 可視化デモ 3 種 | 5 | 未着手 | 4 |
| M5.5 | 公開エクスポート(JSON-LD / Wikidata QID) | 5 | 未着手 | 3 |
| M5.6 | プロジェクト v1.0 リリース | 5 | 未着手 | - |

→ **計 50 Milestone**

---

## 2. 各 Milestone の標準フォーマット

### M2.3 — 伊勢編 v1.0(代表例)

#### 目的
内宮・外宮・斎宮制度・伊勢神道・両宮論争・度会神道までを Layer A 連表 1 ファイルにまとめ、Layer B Master へ正規化する。

#### 完了条件
- [ ] `docs/伊勢編/01_overview.tsv` が CLAUDE.md §3.2 の 29 列で 100 行以上
- [ ] 内宮(皇大神宮)・外宮(豊受大神宮)・別宮 14 社の社伝・由緒を網羅
- [ ] 度会・荒木田の祭祀職譜を載せる
- [ ] 斎宮制度の歴代斎王(伝説含)を網羅
- [ ] 両宮論争(中世)を `hypothesis` で別立て
- [ ] 全行が `出典` カラムを持つ
- [ ] `docs/master/deity_master.tsv` に伊勢系神格(50+)を追加(`merged_into` で重複統合済)
- [ ] `docs/master/shrine_master.tsv` に伊勢系神社(80+)を追加
- [ ] 必須 relation(`enshrined_at` / `mentioned_in` / `descended_from`)を `docs/relations/relations.tsv` に投入
- [ ] PR セルフレビュー通過

#### 必須 Issue(目安 12 本)
1. 伊勢編 #1: 基盤(命名規程・対象スコープ確定)
2. 伊勢編 #2: 内宮 由緒・主祭神 整理
3. 伊勢編 #3: 外宮 由緒・主祭神 整理
4. 伊勢編 #4: 別宮 14 社 整理
5. 伊勢編 #5: 摂社・末社 整理
6. 伊勢編 #6: 度会氏 系譜・祭祀
7. 伊勢編 #7: 荒木田氏 系譜・祭祀
8. 伊勢編 #8: 斎宮制度・歴代斎王
9. 伊勢編 #9: 式年遷宮の歴史
10. 伊勢編 #10: 中世伊勢神道(度会神道)
11. 伊勢編 #11: 両宮論争の整理(hypothesis 化)
12. 伊勢編 #12: master 投入 + relation 一括化

#### 推定成果物
- `docs/伊勢編/01_overview.tsv`
- `docs/伊勢編/02_inner_shrine.tsv`
- `docs/伊勢編/03_outer_shrine.tsv`
- `docs/伊勢編/04_betsugu.tsv`
- `docs/伊勢編/05_priesthood.tsv`
- `docs/伊勢編/06_saiku.tsv`
- `docs/伊勢編/07_shikinen.tsv`
- `docs/伊勢編/08_medieval_shinto.tsv`
- `docs/伊勢編/09_ryogu_dispute.md`(hypothesis ノート)

---

### M3.1 — enshrined_at relation 一括生成(代表例)

#### 目的
全 deity master に対し、`primary_deity_of` または `secondary_deity_of` または `enshrined_at` を **少なくとも 1 本** 付与する。

#### 完了条件
- [ ] 全 deity_master のうち祀られている神(95% 想定)が `enshrined_at` の source として最低 1 行存在
- [ ] 主祭神は `primary_deity_of` で記録
- [ ] `valid_from` / `valid_until` がある場合(祭神交代史)は記録
- [ ] 出典欄に `text_master` への参照
- [ ] 監査スクリプト(将来作成)を通過

#### 必須 Issue(目安 8 本)
1. 出雲系 神→神社 enshrined_at 抽出
2. 伊勢系 enshrined_at 抽出
3. 諏訪系 enshrined_at 抽出
4. 海人系 enshrined_at 抽出
5. 山岳・修験系 enshrined_at 抽出
6. 八幡・春日・熊野系 enshrined_at 抽出
7. 渡来系 enshrined_at 抽出
8. 残余整理 + 監査

#### 推定成果物
- `docs/relations/relations_enshrined_at.tsv`(8000+ 行想定)
- 統合後 `docs/relations/relations.tsv` に取り込み

---

### M5.1 — Neo4j スキーマ凍結(代表例)

#### 目的
Layer B Master と Layer C Relations を Neo4j ノード/エッジに **写像する規則** を確定する。

#### 完了条件
- [ ] 全 13 node_type を Neo4j ラベル(`:Deity`, `:Shrine`, ...)で表現
- [ ] 全 35+ relation_type を Neo4j relationship type で表現(大文字スネーク化: `ENSHRINED_AT`)
- [ ] 必須プロパティ・インデックス・制約を Cypher で記述
- [ ] サンプルデータ(出雲編ベース)で投入テスト成功
- [ ] `docs/civilization/07_knowledge_graph_final.md` 完成

#### 必須 Issue(目安 6 本)
1. ラベル設計 + Cypher 制約
2. relationship type マッピング表
3. プロパティ正規化(snake_case → camelCase 等の規約)
4. インデックス戦略
5. 投入テスト(出雲編サブセット)
6. 文書化

---

## 3. Milestone 進行ルール

1. **Milestone は同一 Phase 内で並行可** — ただし master 系(M2.17-M2.23)は地域編(M2.3-M2.16)より遅い完了が許容される
2. **Phase 跨ぎは原則禁止** — Phase 3 は Phase 2 の master 完了後に着手(部分先行は可)
3. **Milestone 完了 = タグ作成** — `git tag M2.3-Ise-v1.0` で版を打つ
4. **Milestone は GitHub Milestone 機能で実装** — Issue を全紐付け、進捗バーで可視化
