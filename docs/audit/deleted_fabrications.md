# 削除された AI 生成プレースホルダー記録

**目的**: 過去の削除パターンを記録し、将来同様の hallucination が再混入することを防ぐ DISC-009 anti-hallucination architecture の知識ベース。

**最終更新**: 2026-05-25 (DISC-009 採択時に整備)

---

## サマリ

| ラウンド | PR | 削除対象 | 件数 |
|---|---|---|---|
| Round 1 | #228 | shrine 廣田八幡神社 (架空) → 七宮神社へ置換 | 1 |
| Round 2 | #229 | shrine_master AI 生成 211 件削除 (1003 → 792) | 211 |
| Round 3 | #231 | shrine 追加削除 73 件 + 実在社 [要検証] 除去 19 件 | 73 |
| **合計** | | **284 件** | |

---

## パターン別分類

### Pattern 1: 旧国名 × 神格 網羅シリーズ (29 件)

**典型署名**: AI が「各令制国に 1 つずつ同種神社を生成」しがちな pattern。実世界の神社分布は非対称・欠損・偏在が大きく、systematic completeness 自体が **too systematic = suspicious** signal (Codex 強調)。

| シリーズ | 件数 | 削除 PR |
|---|---|---|
| 春日神社 (各旧国版) | 21 | #229 |
| 国分八幡 (各旧国版) | 8 | #229 |

**例 (削除済)**:
- 「下野春日神社」「美濃春日神社」「飛騨春日神社」(春日系の旧国名生成)
- 「美濃国分八幡」「飛騨国分八幡」(国分八幡系)

→ 検出ロジック: `canonical_name` に旧国名 + 神格キーワードを含み、distinctive feature を満たさないものを escalation review。

### Pattern 2: 同一 fingerprint 大量複製 (145 件)

**典型署名**: 主祭神 ID + shrine_rank + founded_period + notes (短い) が同一指紋となる行が 5 件以上複製。AI が template から生成すると distinctive 差分が失われやすい。

**fingerprint 構成**:
```
main_deity_ids | shrine_rank_ancient | shrine_rank_modern | founding_year_estimated | notes[:30]
```

**Codex Round 2 警告**: hard reject だと八幡・稲荷・天神等の**実際に高類似 network**を持つ系統も誤検出する。**escalation review** が安全。

→ `scripts/check_new_entries.py` は 5+ 件衝突を warning として記録、人間レビュー前提。

### Pattern 3: 「(地名)+(神格)+(神社/宮)」型 + distinctive feature なし (63 件)

**典型署名**: 合成名 + 古代社格なし + 近代社格なし + founding_legend < 20 字 + notes < 20 字 + 詳細住所なし + 別名なし。

**例 (削除済)**:
- 「武蔵春日神社」「相模春日神社」(地名 + 神格、distinctive feature 完全欠落)
- 「越前八幡宮」(同上)

→ CLAUDE.md §4.2 にて distinctive feature 必須化済。`scripts/check_new_entries.py` で warning。

### Pattern 4: clan「国造(旧国名)」シリーズ (47 件)

**典型署名**: 全旧国に「○○国造」一律生成。実際の国造氏族は史料記載が散在し、全旧国に揃わない。

**削除対象例**:
- 「飛騨国造氏」「能登国造氏」「佐渡国造氏」(史料的根拠なき網羅生成)

→ clan_master でも旧国名カバー率を warning 対象に。

### Pattern 5: 誤った主祭神大量割当 (含む 211 件削除)

**典型署名**: 役小角 (en no Gyōja) を 130+ 社に主祭神として割り当て、戦国大名の取り違え等。

**原因**: AI が「修験道系 = 役小角」のような coarse な correlation で割当を量産。

→ relation hallucination の前駆 pattern (DISC-009 Phase 2 で本格対応)。

---

## 検出原則 (DISC-009 採択、CLAUDE.md §4.7)

1. **plausibility ≠ evidence** — 「ありそう」を reject (Codex 強調)
2. **fingerprint detection は escalation review** — hard reject は実在 network を誤検出
3. **too systematic = suspicious** — 非対称性・欠損・偏在を期待値とする
4. **feature provenance > feature quantity** — feature 数より出所明示
5. **relation hallucination > entity hallucination** — 将来的により危険
6. **CI Phase 1 = warning only** — false positive 懸念で suspiciousness scoring 蓄積から
7. **epistemic anomaly detection** — graph-level 検出 (Phase 3+、Neo4j 連動)

---

## 削除前後の master_id 範囲 (参考)

shrine_master の SHR-ID は連続番号、削除済 ID は再利用しない (リファレンス整合性のため空番)。

| 状態 | 件数 |
|---|---|
| 削除前 (PR #229 直前) | 1003 |
| Round 2 後 (PR #229) | 792 |
| Round 3 後 (PR #231) | 778 |
| 現在 (2026-05-25) | 777 |

---

## 関連

- `docs/discussions/DISC-009_resolution.md` — DISC-009 解決報告
- `docs/discussions/DISC-002_resolution.md` — RISK-31 (AI 生成プレースホルダー混入)
- `docs/discussions/DISC-006_resolution.md` — verified_status (検出後の状態管理)
- `scripts/check_new_entries.py` — Phase 1 warning checker
- `.github/PULL_REQUEST_TEMPLATE.md` — PR 時 checklist
- CLAUDE.md §4.2 master 追加ルール / §4.7 anti-hallucination architecture
