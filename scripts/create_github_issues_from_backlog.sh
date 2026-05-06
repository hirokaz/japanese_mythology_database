#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required (owner/repo)}"

API="https://api.github.com/repos/${GITHUB_REPOSITORY}/issues"

create_issue() {
  local title="$1"
  local body="$2"
  local labels_json="$3"

  curl -sS -X POST "$API" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -d "$(jq -n \
      --arg title "$title" \
      --arg body "$body" \
      --argjson labels "$labels_json" \
      '{title:$title, body:$body, labels:$labels}')" \
  | jq -r 'if .html_url then "CREATED: " + .html_url else "ERROR: " + (.message // "unknown") end'
}

create_issue "[Docs QA] 用語正規化辞書の作成と全章適用" "## purpose
- docs/ 内の表記揺れを統一し、検索性と relation 生成精度を上げる。

## scope
- 用語正規化辞書(docs/schema/ 配下の新規 md/tsv)
- 既存ファイルへの反映ルール

## acceptance_criteria
- 主要神名・豪族名・地域名の正規形と別名 mapping を定義
- docs/schema/09_relation_db.md と矛盾しない" '["claude-autonomous","kind:docs"]'

create_issue "[Docs QA] 仮説レベル別の記述ガードレールを明確化" "## purpose
- 高仮説レベル記述が断定調で流通しないよう、書式ルールを追加する。

## scope
- docs/schema/08_hypothesis_layer.md の追記
- 断定禁止テンプレート整備

## acceptance_criteria
- L3/L4/L5 で必須の注記文が定義される
- docs/audit から参照できる" '["claude-autonomous","kind:docs"]'

create_issue "[Claude討論] この知識基盤を人が使う具体シナリオを設計する" "[DISCUSSION PROTOCOL]
- Claude は先に初期提案を投稿する
- Codex は同一 issue で反証・補強を行う
- 論点が収束したら docs 反映PRを作成し、当 issue にリンクする

## discussion_goal
- ユーザー像別に何を入力し何を得るかを明示する。

## key_questions
- 研究者は新仮説生成にどう使うか
- 神社実務者は由緒説明・地域連携にどう使うか
- 学校教育で誤読をどう防ぐか" '["claude-autonomous","kind:discussion"]'

create_issue "[Claude討論] 活用が生む副作用(誤用/権威化/排除)を先に潰す" "[DISCUSSION PROTOCOL]
- Claude は先に初期提案を投稿する
- Codex は同一 issue で反証・補強を行う
- 論点が収束したら docs 反映PRを作成し、当 issue にリンクする

## discussion_goal
- 誤用・断定・地域対立の誘発を予防する設計原則を作る。

## key_questions
- L4/L5 仮説が SNS で事実扱いされる場合の防波堤は?
- 中央史観/地域史観バイアスをどう見える化する?
- 宗教実務に接続する際の説明責任は?" '["claude-autonomous","kind:discussion"]'
