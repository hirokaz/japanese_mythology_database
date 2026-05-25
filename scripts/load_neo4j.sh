#!/usr/bin/env bash
# DISC-010 採択 — Neo4j Aura Free / self-hosted への load 手順。
#
# Phase 1 = internal only (Aura Free instance、外部公開せず)。
#
# 前提:
# 1. scripts/tsv_to_cypher.py を実行済 (web/data/neo4j_import.cypher 生成済)
# 2. neo4j-cli (cypher-shell) インストール済
# 3. 環境変数:
#    NEO4J_URI    例: neo4j+s://xxxxx.databases.neo4j.io
#    NEO4J_USER   例: neo4j
#    NEO4J_PASS   (Aura instance パスワード)
#
# 使い方:
#   export NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
#   export NEO4J_USER=neo4j
#   export NEO4J_PASS=<your-aura-password>
#   bash scripts/load_neo4j.sh
#
# 注意 (DISC-010 / DISC-011):
# - Phase 1 は internal only、Aura free 上で動作確認のみ
# - Phase 2 で read-only API として API key 経由公開
# - Phase 3 で self-hosted (容量・パフォーマンス問題発生時)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CYPHER_FILE="${REPO_ROOT}/web/data/neo4j_import.cypher"

if [ ! -f "$CYPHER_FILE" ]; then
  echo "[ERROR] $CYPHER_FILE が見つかりません。先に scripts/tsv_to_cypher.py を実行してください。" >&2
  exit 1
fi

: "${NEO4J_URI:?Set NEO4J_URI (例: neo4j+s://xxxxx.databases.neo4j.io)}"
: "${NEO4J_USER:?Set NEO4J_USER (default: neo4j)}"
: "${NEO4J_PASS:?Set NEO4J_PASS (Aura instance パスワード)}"

if ! command -v cypher-shell >/dev/null 2>&1; then
  echo "[ERROR] cypher-shell が見つかりません。https://neo4j.com/download/ からインストールしてください。" >&2
  exit 1
fi

echo "=== Neo4j ETL load 開始 ==="
echo "URI : $NEO4J_URI"
echo "User: $NEO4J_USER"
echo "File: $CYPHER_FILE ($(wc -l < "$CYPHER_FILE") lines)"
echo

cypher-shell \
  -a "$NEO4J_URI" \
  -u "$NEO4J_USER" \
  -p "$NEO4J_PASS" \
  --format plain \
  < "$CYPHER_FILE"

echo
echo "=== load 完了 ==="
echo
echo "確認 query 例:"
echo "  MATCH (n) RETURN labels(n)[1] AS type, count(*) AS cnt ORDER BY cnt DESC;"
echo "  MATCH ()-[r]->() RETURN type(r) AS category, count(*) AS cnt ORDER BY cnt DESC;"
echo
echo "Persona 別 query 集: docs/civilization/13_cypher_queries.md"
