# 議論プロトコル v0.2 (DISC-004 確定版)

本リポジトリにおける Claude × Codex × 人間 の議論プロトコル。DISC-004 (#180) で確定。

## プロトコル全体図

```
Claude Round 1 (初期提案、issue コメント投稿)
    ↓
[最大 2 週間 Codex 応答待ち]
    ↓
├── Codex 応答あり → Codex Round 2 反証 → Round 3 応答 → Round 4 収束
└── Codex 応答なし → Claude Round 2 自己反証
                       ↓
                     人間 Round 3 (最終判断 + docs 反映指示)
                       ↓
                     Claude Round 4 (docs 反映 PR)
```

**最大 3 週間で必ず収束する保証**。

## 各 Round の役割

### Round 1: Claude 初期提案

- 議論 issue を作成 (テンプレート: `## 議論目的 / ## 想定参加者 / ## 鍵となる問い / ## 完了条件 / ## 議論ログ`)
- Claude が初期提案コメントを投下
- 各 persona / リスク / 設計案を網羅列挙

### Round 2: 反証 (Codex または Claude 自己反証)

**Codex 応答あり (理想)**: Codex が反証・補強・スキーマ落とし込みを投稿

**Codex 応答なし (2 週間経過)**: Claude が**自分の Round 1 提案を反証**
- 実装上の問題点
- 想定が崩れる事案
- 改訂版 v0.2 を提示

### Round 3: 人間最終判断

- 反証を踏まえた最終結論
- docs 反映方針の指示
- 後続 PR の優先度設定

### Round 4: docs 反映

- `docs/discussions/DISC-NNN_resolution.md` 作成
- 関連する `docs/civilization/*.md` / `docs/audit/*.md` / `docs/master/*.tsv` 更新 PR
- 元 issue を「解決済」コメントで close

## 収束条件 v0.2

旧 (Round 1): 「両者 3 ターン同立場 + 人間合意」 → Codex 沈黙時に永遠不達

新 (v0.2):
1. Claude が自己反証 (Round 2 自分で反証) を行った
2. 2 週間以内に Codex 応答なし、または応答があれば収束まで対話
3. 人間が最終判断

## docs 反映フロー (5 ステップ)

| ステップ | 反映先 | 主体 |
|---|---|---|
| 1. 議論ログ | issue コメント | Claude / Codex / 人間 |
| 2. 合意要約 | `docs/discussions/DISC-NNN_resolution.md` (新規) | Claude |
| 3. schema 変更 | `docs/civilization/08_civilization_os_schema.md` 等 | Claude (Codex レビュー歓迎) |
| 4. master 変更 | `docs/master/*.tsv` | Claude PR |
| 5. 監査ルール | `docs/audit/*.md` | Claude PR |

## 監査方針

- `scripts/audit_kpi.py` の自動チェック (CI 統合済) を必須
- 人間レビュー (PR 単位)
- master 変更時の duplicate / dangling 検出 (audit_kpi で自動)
- Gemini 反射監査は導入されていないため、現状は対象外

## 未収束項目の強制収束

「次セッションへ持ち越し」は実態として「永久放置」になるため、**3 週間ルール**を厳守:
- 2 週間: Codex 応答待ち
- 3 週間到達: Claude / 人間で強制収束
- DISC-001〜004 が初の実例 (2026-05-07 起票 → 2026-05-24 強制収束)

## Codex 役割の再定義

| 期待した役割 (Round 1) | 実態 | 再定義 (v0.2) |
|---|---|---|
| 議論担当: 反証・補強 | DISC issue 内では完全沈黙 | 沈黙時は Claude が自己反証 |
| スキーマ落とし込み | 実施なし | Claude が schema 提案、Codex はレビュー歓迎 |
| 監査・運用要件 | 実施なし | Claude / 人間主導、Codex はレビューのみ |
| 実装 PR | dangling ドキュメント PR のみ | Codex は「報告者」、Claude が「実装者」 |

## 適用実績

| DISC | 起票 | Round 1 | Codex Round 2 | Claude Round 2 自己反証 | 収束 |
|---|---|---|---|---|---|
| DISC-001 (#177) | 2026-05-06 | Claude | 応答なし | 2026-05-24 | 2026-05-24 |
| DISC-002 (#178) | 2026-05-07 | Claude | 応答なし | 2026-05-24 | 2026-05-24 |
| DISC-003 (#179) | 2026-05-07 | Claude | 応答なし | 2026-05-24 | 2026-05-24 |
| DISC-004 (#180) | 2026-05-07 | Claude | 応答なし | 2026-05-24 | 2026-05-24 |

## 関連

- DISC-004 解決報告: `docs/discussions/DISC-004_resolution.md`
- 起票: #180
- 既存ワークフロー: `docs/project/15_workflow.md`
