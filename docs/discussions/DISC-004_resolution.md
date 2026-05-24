# DISC-004 解決報告: 議論成果を docs に落とす標準手順 v0.2

**ステータス**: 収束 (実証反証完了、プロトコル v0.2 確定)
**起票**: 2026-05-07 (#180)
**収束**: 2026-05-24

---

## 結論

Round 1 で提案した「Claude → Codex → 人間」3 者議論プロトコルは、**Codex の 2.5 週間沈黙という実証反証**を踏まえ、**Claude / 人間主導 + Codex 非同期参加**の v0.2 に改訂。

## 確定プロトコル v0.2

```
Claude Round 1 (初期提案、issue コメント投稿)
    ↓
[最大 2 週間 Codex 応答待ち]
    ↓
├── Codex 応答あり → 旧プロトコル (Round 2 反証 → Round 3 応答 → Round 4 収束) で継続
└── Codex 応答なし → Claude Round 2 自己反証 (issue コメント投稿)
                       ↓
                     人間 Round 3 (最終判断 + docs 反映指示)
                       ↓
                     Claude Round 4 (docs 反映 PR)
```

**最大 3 週間で必ず収束する保証**。

## 「議論し尽くした」判定条件 v0.2

旧 Round 1: 「両者 3 ターン同立場 + 人間合意」 → **Codex 応答ない場合に永遠不達**

新 v0.2:
1. Claude が**自己反証** (Round 2 自分で反証) を行った
2. **2 週間以内に Codex 応答がない**、または応答があれば収束まで対話
3. **人間が最終判断**を下す

## docs 反映先と順序

| ステップ | 反映先 | 主体 | 状態 |
|---|---|---|---|
| 1. 議論ログ | issue コメント (#171, #177-180 等) | Claude / Codex / 人間 | DISC-001〜004 完了 |
| 2. 合意要約 | `docs/discussions/DISC-NNN_resolution.md` (新規) | Claude | 本 PR で 4 件作成 |
| 3. schema 変更 | `docs/civilization/08_civilization_os_schema.md` 等 | Claude (Codex レビュー歓迎) | 後続 PR |
| 4. master 変更 | `docs/master/*.tsv` | Claude PR | 後続 PR (verified_status 追加) |
| 5. 監査ルール | `docs/audit/*.md` | Claude PR | 後続 PR |

## 監査の方針 (Round 1 反証)

Round 1 提案: 「Gemini 反射監査の発動条件」

**反証**: 実運用で Gemini 監査は導入されていない。

→ **改訂**: 現実的には以下で十分:
- `scripts/audit_kpi.py` の自動チェック (CI 統合済)
- 人間レビュー (PR 単位)
- master 変更時の duplicate / dangling 検出 (audit_kpi で自動)

## 未収束項目の扱い (Round 1 反証)

Round 1 提案: 「次セッションへ持ち越し」可視化

**反証**: 「持ち越し」は実態として「**永久放置**」になる (DISC-001〜004 がまさに 2.5 週間放置された実例)。

→ **改訂**: 未収束項目は **3 週間ルール** (Codex 応答なし) を発動して**強制収束**。Claude / 人間で結論を出す。本 DISC-001〜004 が初の実例。

## Codex 役割の再定義 (実証ベース)

| 期待した役割 (Round 1) | 実態 | 再定義 (v0.2) |
|---|---|---|
| 議論担当: 反証・補強 | DISC issue 内では完全沈黙 | **沈黙時は Claude が自己反証で代替** |
| スキーマ落とし込み | 実施なし | **Claude が schema 提案、Codex はレビュー歓迎** |
| 監査・運用要件 | 実施なし | **Claude / 人間主導、Codex はレビューのみ** |
| 実装 PR | dangling ドキュメント PR のみ (実装せず) | **Codex は「報告者」、Claude が「実装者」** |

## 完了条件達成状況

- [x] **議論 → 自己反証 → 人間判断 → 反映の 4 段階手順書** (本文書)
- [x] 各段階のテンプレート文書 (本文書 + `docs/discussions/DISC-NNN_resolution.md` 形式)
- [ ] `docs/project/20_discussion_protocol.md` への恒久テンプレート化 (本 PR で実施)
- [x] 既存 #171 連携スレッドとの整合性 (本コメントで反映済)

## 反映先

- 本文書 `docs/discussions/DISC-004_resolution.md` (確定版)
- 本 PR: `docs/project/20_discussion_protocol.md` 新規作成

## 関連
- 起票 issue: #180
- 連動 DISC: #177 / #178 / #179 (全て本プロトコル v0.2 を初実証)
