# docs 全体レビュー起点 Issue 企画(Claude/Codex 討論対応)

本書は、既存 docs を横断確認したうえでの **修正系 Issue** と、
「この知識を人がどう活用し、活用で何が起こるか」を深掘りする **Claude 討論用 Issue** をまとめた起票草案である。

- 対象日: 2026-05-06
- 目的: 品質改善と社会実装設計を並行で進める
- 運用: 1 issue ずつ着手(並行実装しない)

---

## A. 修正・改善 Issue(優先)

## ISSUE-DOC-001: 章横断の用語統一(神名・氏族名・地域名)
- title: "[Docs QA] 用語正規化辞書の作成と全章適用"
- purpose:
  - `docs/` 内で表記揺れ(例: 同神の別名、旧字体/新字体、地名揺れ)を統一し、検索性と relation 生成の精度を上げる。
- scope:
  - 用語正規化辞書(`docs/schema/` 配下の新規 md/tsv)
  - 既存ファイルへの反映ルール(自動置換してよい範囲/手動確認範囲)
- acceptance_criteria:
  - 主要神名・豪族名・地域名の正規形と別名 mapping を定義
  - `docs/schema/09_relation_db.md` と矛盾しない

## ISSUE-DOC-002: 仮説レベル運用の明文化(L3-L5 安全策)
- title: "[Docs QA] 仮説レベル別の記述ガードレールを明確化"
- purpose:
  - 高仮説レベル記述が断定調で流通しないよう、書式ルールを追加する。
- scope:
  - `docs/schema/08_hypothesis_layer.md` の追記
  - 断定禁止テンプレート(例文)の整備
- acceptance_criteria:
  - L3/L4/L5 で必須の注記文が定義される
  - audit 文書側(`docs/audit/`)から参照できる

## ISSUE-DOC-003: 監査フローの自動チェック項目拡張
- title: "[Docs QA] assertion/source/bias 監査チェックリスト拡張"
- purpose:
  - 監査観点を運用可能なチェック項目に分解し、レビュー再現性を高める。
- scope:
  - `docs/audit/00_audit_framework.md` のチェック項目増補
  - `docs/audit/07_assertion_audit.md` との対応表作成
- acceptance_criteria:
  - 章ごとに同じ品質基準で pass/fail 判定可能

## ISSUE-DOC-004: スキーマ更新時の影響範囲マップ作成
- title: "[Docs QA] schema 変更時インパクトマップの新設"
- purpose:
  - 列追加・relation type 変更時に、どの master/tsv/md が再点検対象か即座に分かるようにする。
- scope:
  - `docs/schema/README.md` に「変更影響マップ」章を追加
- acceptance_criteria:
  - 主要 schema ファイルごとに downstream 影響先が列挙される

---

## B. Claude 討論専用 Issue(人間活用・社会実装)

> これらは **Claude が「議論の場」と認識できるように設計** した issue。  
> Claude が先に回答した場合、Codex も同一 issue スレッド内で反証・補強を行い、
> 収束後に docs へ反映する。

## ISSUE-DISC-001: 知識活用シナリオ(研究者/神職/教育者/地域実務者)
- title: "[Claude討論] この知識基盤を人が使う具体シナリオを設計する"
- discussion_goal:
  - ユーザー像別に「何を入力し、何を得て、どんな意思決定が変わるか」を明示。
- required_participants:
  - Claude: 主張と初期シナリオ提案
  - Codex: 反証(欠落リスク)と運用要件への変換
- key_questions:
  - 研究者は新仮説生成にどう使うか
  - 神社実務者は由緒説明・地域連携にどう使うか
  - 学校教育で誤読(史実/神話混同)をどう防ぐか
- done_definition:
  - 4 つ以上の persona 別活用フロー図(テキスト可)
  - docs 反映先候補を明記

## ISSUE-DISC-002: 活用による副作用・倫理・政治的リスク
- title: "[Claude討論] 活用が生む副作用(誤用/権威化/排除)を先に潰す"
- discussion_goal:
  - 活用メリットだけでなく、誤用・断定・地域対立の誘発を予防する設計原則を作る。
- required_participants:
  - Claude: リスク仮説を網羅列挙
  - Codex: リスクをスキーマ・監査ルールへ落とし込む
- key_questions:
  - L4/L5 仮説が SNS で事実扱いされる場合の防波堤は?
  - 中央史観/地域史観バイアスをどう見える化する?
  - 宗教実務に接続する際の説明責任は?
- done_definition:
  - リスク台帳(発生条件/影響/緩和策)
  - `docs/audit` へ反映する改訂案

## ISSUE-DISC-003: 公開戦略(一般公開レイヤと専門家レイヤ分離)
- title: "[Claude討論] 公開時の情報レイヤ分離(一般向け/研究向け)"
- discussion_goal:
  - 同一知識を誰にどの粒度で見せるかを定義し、誤解と過度な断定受容を防ぐ。
- required_participants:
  - Claude: UI/説明文観点でのレイヤ設計
  - Codex: データモデル観点でのアクセス層定義
- key_questions:
  - 一般公開で隠すべき情報はあるか(未検証仮説等)
  - 研究者にはどこまで raw relation を開示すべきか
- done_definition:
  - 公開レベル定義 v1(閲覧権限 × 表示項目)
  - `docs/civilization/11_web_atlas_design.md` への反映案

## ISSUE-DISC-004: 議論収束後の docs 反映プロトコル
- title: "[Claude討論] Claude/Codex 議論成果を docs に落とす標準手順"
- discussion_goal:
  - 討論が会話で終わらず、再利用可能な成果物になる手順を固定化する。
- required_participants:
  - Claude: 収束条件・論点整理テンプレート提案
  - Codex: PR 単位の実装テンプレート化
- key_questions:
  - 「議論し尽くした」の判定条件は?
  - どの docs にどの順で反映する?
  - 反映後の監査は誰がどの観点で行う?
- done_definition:
  - 議論→合意→反映→監査の 4 段階手順書
  - `docs/project/` 配下へ恒久テンプレート化

---

## C. 実行順(提案)

1. ISSUE-DOC-002(仮説ガードレール)  
2. ISSUE-DISC-002(副作用討論)  
3. ISSUE-DOC-003(監査拡張)  
4. ISSUE-DISC-004(反映プロトコル)  
5. ISSUE-DISC-001 / 003(活用・公開設計)

この順で進めると、先に安全策を固めてから活用拡張に入れる。

## D. GitHub Issue へ実際に起票する手順

この草案は **`gh` CLI** でそのまま issue 化できる。以下は最短手順。

### 1) 前提(初回のみ)
- GitHub CLI インストール確認: `gh --version`
- ログイン: `gh auth login`
- 対象 repo へ移動: `cd /workspace/japanese_mythology_database`

### 2) 1件ずつ起票(推奨)
以下のように title/body を指定して起票する。

```bash
cat <<'EOF' > /tmp/issue-doc-001.md
## purpose
- docs/ 内の表記揺れ(同神の別名、旧字体/新字体、地名揺れ)を統一し、検索性と relation 生成精度を上げる。

## scope
- 用語正規化辞書(docs/schema/ 配下の新規 md/tsv)
- 既存ファイルへの反映ルール(自動置換してよい範囲/手動確認範囲)

## acceptance_criteria
- 主要神名・豪族名・地域名の正規形と別名 mapping を定義
- docs/schema/09_relation_db.md と矛盾しない
EOF

gh issue create \
  --title "[Docs QA] 用語正規化辞書の作成と全章適用" \
  --body-file /tmp/issue-doc-001.md \
  --label "claude-autonomous" \
  --label "kind:docs"
```

### 3) Claude 討論 issue の起票時ルール
Claude が議論スレッドと認識しやすいよう、本文冒頭に次の宣言を入れる。

```text
[DISCUSSION PROTOCOL]
- Claude は先に初期提案を投稿する
- Codex は同一 issue で反証・補強を行う
- 論点が収束したら docs 反映PRを作成し、当 issue にリンクする
```

### 4) 一括確認
- open issue 一覧: `gh issue list --limit 200`
- 連番/ラベル確認: `gh issue list --search "Docs QA OR Claude討論" --limit 200`
