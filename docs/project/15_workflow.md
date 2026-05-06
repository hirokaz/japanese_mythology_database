# 進め方(実行ワークフロー)

本書は **Claude が Issue を 1 つずつ自動実行する際の標準手順** を規定する。タイムアウトせず、レビュー可能な単位で進めることを目的とする。

## 0. 鉄則(まず読む)

1. **PR は必ず `main` に向けて作成する**
2. **Issue は 1 つずつ順番に処理する**(並行着手禁止)
3. **Issue にサブタスク(チェックボックス)があれば、サブタスク 1 つ = PR 1 本 = マージ 1 回**
4. **1 PR の作業時間は 8 時間以内**(超えそうなら更に分割)
5. **PR 作成後はセルフレビュー → 問題なければ Approve & Merge → Issue のサブタスクを ✓ → 次へ**
6. **基盤初期化以外、`main` への直接コミット禁止**(CLAUDE.md §1-6 準拠)
7. **マージ後、対応 Issue は全サブタスク完了時に `completed` で close**

---

## 1. Issue 1 件の標準フロー

```
┌──────────────────────────────────────────────┐
│ Step 1. Issue 選択(open のうち優先度最上位) │
└────────────────┬─────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ Step 2. Issue 本文を Read で全文確認         │
│         サブタスク有無を確認                  │
└────────────────┬─────────────────────────────┘
                 ▼
       ┌─────────┴─────────┐
       │                   │
   サブタスクあり       サブタスクなし
       │                   │
       ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ Step 3a.     │   │ Step 3b.         │
│ サブタスク   │   │ Issue 全体を 1   │
│ 単位で 1 PR  │   │ PR で処理       │
│ ×N 回         │   │ (8h 以内なら)  │
└──────┬───────┘   └────────┬─────────┘
       │                    │
       └─────────┬──────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ Step 4. 全完了したら Issue を close           │
└──────────────────────────────────────────────┘
```

---

## 2. サブタスクごとの 1 PR ループ

```
[loop start]
   │
   ▼
(1) 対象サブタスク選択(チェックボックス未完で先頭のもの)
   │
   ▼
(2) ブランチ作成
    main から派生:  git checkout main && git pull origin main
                   git checkout -b issue/<Issue 番号>-S<連番>-<slug>
    例:  issue/79-S01-evolved-into
   │
   ▼
(3) スキーマ・既存ファイルを Read で再確認
    - docs/schema/01_node_types.md, 02_relation_types.md
    - CLAUDE.md §3.2(29 列)
    - 関連既存 TSV
   │
   ▼
(4) 作業実施(該当サブタスク分のみ)
    - TSV/md 編集
    - 出典付与・hypothesis_layer 付与
    - 表記揺れチェック
   │
   ▼
(5) セルフ Subtask チェックリスト評価(`13_claude_rules.md` §3.4)
   │
   ▼
(6) commit
    git add docs/...
    git commit -m "[<Issue タグ> Sxx] <一行サマリ>"
    例: "[文明解析 #3 S01] evolved_into 系 80件追加"
   │
   ▼
(7) push
    git push -u origin issue/<Issue 番号>-S<連番>-<slug>
   │
   ▼
(8) PR 作成 (base=main)
    タイトル: "[<Issue タグ> Sxx] <一行サマリ>"
    body 末尾に:
      - "Closes #<Issue 番号> サブタスク Sxx"  (または "Refs")
      - セルフレビューチェックリスト
   │
   ▼
(9) セルフレビュー(問題あれば修正コミット → 同じ PR を更新)
   │
   ▼
(10) Approve & Merge(Squash 推奨)
   │
   ▼
(11) ローカルを main に戻す
     git checkout main && git pull origin main
     (使い終えたブランチは削除可)
   │
   ▼
(12) Issue 本文の対応サブタスクのチェックボックスを ✓
     mcp__github__issue_write で `update` 操作
   │
   ▼
[次のサブタスクへ → loop へ]

全サブタスク完了 → Issue を close (state=CLOSED, state_reason=completed)
```

---

## 3. ブランチ命名規約

| 種別 | 命名 | 例 |
|---|---|---|
| 単一 Issue | `issue/<番号>-<slug>` | `issue/82-jomon-memory` |
| サブタスク付 | `issue/<番号>-S<2桁>-<slug>` | `issue/79-S01-evolved-into` |
| schema 改訂 | `schema/<topic>` | `schema/master-design-extra` |
| 監査 | `audit/<番号 or topic>` | `audit/gemini-deity-master` |
| 並行作業 | `claude/parallel-work-<rand>` | (本ブランチ等) |

---

## 4. PR タイトル・本文規約

### 4.1 タイトル

```
[<Issue タグ> S<NN>] <短い見出し>
```

例:
- `[文明解析 #3 S01] evolved_into 系 motif relation 80件追加`
- `[ISE S04] 別宮 14 社 由緒整理`
- `[RLN-EN S02] 伊勢系 enshrined_at 抽出`

### 4.2 本文(テンプレート)

```markdown
## 概要
<1〜3 文で何をしたか>

## 関連 Issue
Refs #<Issue 番号> サブタスク S<NN>
(全 Issue を閉じる PR の場合のみ「Closes #<Issue 番号>」)

## 変更ファイル
- docs/civilization/02_motif_relations.tsv (+80 行)

## セルフレビュー
- [x] CLAUDE.md §3.2 の必須カラムを満たす
- [x] 全行に「出典」記載
- [x] L4-L5 仮説を断定していない
- [x] master_id / motif_id 重複なし
- [x] hypothesis_layer / confidence_level 付与
- [x] 表記揺れチェック済
- [x] スコープ内に留まっている

## 検証
- 行数: 80
- 重複検査: なし
- ヘッダ整合: OK
```

### 4.3 base ブランチ

**必ず `main`** に向ける。

```
gh pr create --base main --head issue/79-S01-evolved-into ...
```

(本リポジトリでは `mcp__github__create_pull_request` ツールで `base=main` を明示)

---

## 5. コミットメッセージ規約

```
[<Issue タグ> S<NN>] <一行サマリ>

<必要なら詳細>
```

例:
```
[文明解析 #3 S01] evolved_into 系 motif relation 80件追加

- 太陽神→火山神 等の派生系統
- 蛇神→龍神 等の習合系統
- 出典: 古事記/書紀/各風土記
- hypothesis_layer: L0〜L2 の範囲
```

---

## 6. タイムアウト対策

### 6.1 1 サブタスクの上限

**1 サブタスク = 1 PR = 4 時間以内** を目安。Claude セッションが長引きそうなときは:

| 時間 | 対応 |
|---|---|
| 〜4h | そのまま継続 |
| 4-6h | 進捗を Issue にコメント。中間 commit を push |
| 6h+ | サブタスクを更に分割。後半を別サブタスクとして起票 |
| 8h+(危険) | **強制中断 → 中間 commit を push → 残作業を新サブタスクに** |

### 6.2 大量データの目安

| 行数 | サブタスク数 |
|---|---|
| 〜80 行 | 1 サブタスク |
| 80〜200 行 | 2-3 サブタスク |
| 200〜500 行 | 5-8 サブタスク |
| 500 行+ | 10+ サブタスク(分類軸で分割) |

### 6.3 中断時の安全策

中断必要なら:

1. その時点で必ず **commit + push**(空の場合は `--allow-empty` でも push)
2. Issue にコメント: 「<サブタスク名> 進行中、<行数> 完了、残 <行数>」
3. 次セッションで再開時は、PR を更新 or 新サブタスクで継続

---

## 7. レビュー観点(セルフレビュー必須)

PR 作成時、以下を **すべて自分で確認**:

### 7.1 構造
- [ ] スキーマ準拠(`docs/schema/`)
- [ ] CLAUDE.md §3.2 (連表は 29 列)
- [ ] master の必須カラム(`docs/schema/01_node_types.md`)
- [ ] relation の必須カラム(`docs/schema/02_relation_types.md`)

### 7.2 内容
- [ ] 全行 出典記載
- [ ] hypothesis_layer 付与
- [ ] confidence_level 付与
- [ ] 神話成立年代と神話描写時代の混同なし
- [ ] L4-L5 を断定していない
- [ ] 中央偏重なし、地方軽視なし

### 7.3 整合
- [ ] 重複なし(master_id / motif_id / relation_id)
- [ ] dangling 参照なし(source/target が master に存在)
- [ ] 表記揺れ検査(自分の追加分内)

### 7.4 範囲
- [ ] スコープ内のファイルのみ変更
- [ ] 「ついでに」変更なし
- [ ] PR diff サイズが妥当(`14_scaling.md` §7.1)

---

## 8. Issue サブタスクの記法

Issue 本文に GitHub Markdown のチェックボックスで列挙:

```markdown
## サブタスク

- [ ] **S01** evolved_into 系 motif relation 80件 (`docs/civilization/02_motif_relations.tsv`)
- [ ] **S02** symbolically_related 系 80件
- [ ] **S03** ritual_related 系 70件
- [ ] **S04** politically_related 系 60件
- [ ] **S05** regionally_related 系 80件
- [ ] **S06** syncretized_with 系 70件
- [ ] **S07** associated_with / transformed_into 系 80件
- [ ] **S08** 統合・index 整理・監査
```

各 ✓ が **1 PR の完了** に対応。

---

## 9. Issue クローズ条件

全サブタスクの ✓ が完了し:

- [ ] 全 PR がマージ済み
- [ ] 受入条件(Acceptance Criteria)満たす
- [ ] 監査軸への影響を `docs/audit/` に記録(該当があれば)
- [ ] 関連 Issue へのリンクを更新(後続 Issue がある場合)

→ `mcp__github__issue_write` の `update` で `state=CLOSED, state_reason=completed`

---

## 10. 並行作業時の注意

複数 Claude セッションが同時稼働する場合:

| 状況 | 対応 |
|---|---|
| 異なる Issue を担当 | OK(衝突なし) |
| 同 Issue の異なるサブタスク | OK(別ブランチ) |
| 同 Issue の同サブタスク | NG(片方は別サブタスクへ) |
| master TSV 統合 | NG(必ず順次) |

`status:in-progress` ラベルでロック表現。サブタスク単位で `S<NN>` を本文末に書き残し、衝突を防ぐ。

---

## 11. クイックスタート(Claude 自律実行用)

```
1. open Issue を listing → 優先度最上位を選択
2. Issue 本文を Read
3. サブタスクがあれば S01 から順に実行
   - 各 S<NN> ごと:
       a. branch 作成 (issue/<番号>-S<NN>-<slug>, from main)
       b. 作業 (TSV/md)
       c. セルフレビュー
       d. commit & push
       e. PR 作成 (base=main, body にチェックリスト)
       f. セルフレビューで問題なければ自分で merge
       g. Issue のチェックボックスを ✓ に更新
4. 全 S<NN> 完了したら Issue close
5. 次の open Issue へ
```

---

## 12. 例外的な単独 PR 化

以下は Issue サブタスク化せず単独 PR で良い:

- ドキュメント微修正(誤字・リンク切れ)
- schema 軽微改訂(必須カラム追加なし)
- README 整備
- ラベル設計

---

## 13. 関連文書

- `04_issue_template.md`: Issue テンプレート
- `06_subtasks.md`: Subtask 分解パターン
- `13_claude_rules.md`: Claude 暴走防止ルール
- `14_scaling.md`: 大規模運用戦略
- `CLAUDE.md` §1: プロジェクト全体ルール
