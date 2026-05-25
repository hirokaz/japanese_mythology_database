# DISC-011 解決報告: 公開時のライセンス・著作権・コミュニティ運用設計

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、同日内 3 ターン完結)
**起票**: 2026-05-25 (#248)
**収束**: 2026-05-25

---

## 結論

Codex Round 2 の核心指摘:

> 「知識を公開する」のではなく、「不確実性を含んだ知識をどう公共化するか」

> 「公開 = 真実認定」ではない

本 DB は単純 raw data ではなく **curated relational interpretation** を含む知識構造であることを公開設計の前提とする。CC0 不採用、**CC BY-SA 4.0** で attribution を維持。

## 確定 6 原則

1. **編纂的解釈に attribution 必須** → CC BY-SA 4.0 (CC0 不採用)
2. **「公開 = 真実認定」ではない** → authority illusion 回避が公開設計の中核
3. **interpretation disclaimer を UI レベルで強く可視化**
4. **competing interpretations / source visibility / uncertainty indicators / contradiction overlays** を積極表示
5. **AI contributor governance = 「誰が」ではなく「どう生成されたか」**
6. **どの政治立場にも回収されない epistemic discipline** 維持

## 確定 LICENSE 構成

| Layer | License | 対象 |
|---|---|---|
| **code** | MIT | `web/`, `scripts/`, `.github/` |
| **structured data** | CC BY-SA 4.0 | `docs/master/`, `docs/relations/` |
| **interpretation** | CC BY-SA 4.0 | `docs/discussions/`, `docs/civilization/`, `docs/audit/` |

```
LICENSE                  # MIT (code、トップレベル)
LICENSE-DATA            # CC BY-SA 4.0 (structured data)
LICENSE-INTERPRETATION  # CC BY-SA 4.0 (interpretation)
```

**CC0 不採用理由** (Codex 強調):
- relation selection / ontology design / mythologem abstraction / verification layer に**知的編集性**
- CC0 にすると attribution 消失、speculative layer だけの切り離し再利用、provenance 消失リスク
- 特に symbolic relation だけの再利用は危険

**ODbL 不採用理由**:
- OpenStreetMap 規模なら適切だが本 DB には過剰
- code / interpretation との非対称が複雑化

## 著作権リスク評価 (Codex Round 2 採用)

| リスク種別 | 評価 | 対策 |
|---|---|---|
| 一次史料 (記紀・延喜式) | なし (1923 年以前 public domain) | 出典明示のみ |
| 戦後研究 (上田正昭・松前健等) | 低 (要約のみ fair use 範囲) | 直接全文引用なし |
| 神社公式縁起・由緒 | 低 (リンク参照のみ、本文転載なし) | 出典明示 |
| Wikipedia 由来 | 中 (CC BY-SA 4.0 継承必要) | 出典・ライセンス明示 |
| 画像・地図 tile | (将来) 低-中 | 利用規約遵守、OSM 等オープン優先 |
| **authority implication** (Codex 最重要) | **高** | interpretation disclaimer UI 必須 |

→ 最大リスクは **text copy ではなく authority implication risk**:
- 「公式見解に見える」「神社が認めているように見える」「学術 consensus に見える」錯覚

## Phase 1 公開 UI 必須要件 (Codex 採用)

| 要件 | 実装 |
|---|---|
| warning UI | `web/components/disclaimer.html` 全ページヘッダ |
| verified filtering | default filter = verified、toggle で under_review/L4-L5 表示 |
| interpretation disclaimer | 各エントリ画面に「本記述は編纂者解釈を含みます」明示 |
| symbolic badge | `inference_type=symbolic` エントリに視覚バッジ |
| narrative intoxication 警告 | DISC-008 連動、graph/map に correlation ≠ causation 明示 |

## AI Contributor Governance (Codex 採用)

```markdown
## AI 寄稿者ルール (CONTRIBUTING.md 反映予定)

1. **AI-generated PR disclosure 必須**: PR description に AI 関与レベル明示
   - human-written / AI-assisted / AI-generated-reviewed / AI-generated
2. **provenance required**: 一次史料への遡及必須、generic plausibility 不可
3. **no unsourced mass addition**: 1 PR ≤20 件 + 全件 source_reference 必須
4. **symbolic relation review mandatory**: `inference_type=symbolic` を含む PR は人間レビュー必須
5. **過去削除パターン参照**: `docs/audit/deleted_fabrications.md` 類似名 PR は警告
```

→ 「**誰が書いたか**」より「**どう生成されたか**」を重視。

## 政治的悪用への防御 (Codex 強調)

想定される悪用:
- 国家神道復活運動への利用
- 排外主義による氏族系譜操作
- 神話 literalism (神話を文字通り歴史として読む)
- pseudo-history (擬似科学的 ancient civilization 議論)

防御:
- **competing interpretations** を積極表示
- **source visibility** で「誰の解釈か」明示
- **uncertainty indicators** (hypothesis_layer / verified_status badge)
- **contradiction overlays** で異論併記
- 「どの立場にも回収されない epistemic discipline」維持

## Codex Round 2 主要採用点

1. ✅ code/data/interpretation 3 層 ライセンス分離
2. ✅ **CC0 不採用** (curated relational interpretation のため)
3. ✅ CC BY-SA 4.0 採用
4. ✅ ODbL 不採用 (過剰)
5. ✅ **authority implication risk** が最大リスク
6. ✅ AI contributor disclosure 必須
7. ✅ symbolic relation の review mandatory
8. ✅ 政治的悪用 (国家神道・排外主義) 警戒
9. ✅ Zenodo DOI 取得 (Phase 3)
10. ✅ Phase 1 Web 公開時の warning UI / verified filtering / interpretation disclaimer 必須

## 用語集追加 (DISC-011 由来)

| 用語 | 定義 |
|---|---|
| `authority illusion` | 公開された graph / map / ontology / badge が「公式見解」「学術 consensus」「神社認定」のように見えてしまう錯覚。本 DB の公開設計で最大リスク |
| `interpretation disclaimer` | 「本記述は編纂者解釈を含み、公式見解ではない」旨を UI 各エントリ画面に明示する標準警告 |
| `curated relational interpretation` | 本 DB が含む知的編集性 (relation selection / ontology design / mythologem abstraction / verification layer)。単純 raw data ではない |
| `epistemic neutrality` | どの政治立場・宗教立場・学術派閥にも回収されない知識的中立性。本 DB の公開規律 |
| `provenance-preserving publication` | attribution / source / inference_type を維持したまま公開する原則。CC0 ではなく CC BY-SA を選ぶ理由 |

## DISC-004 v0.2 プロトコル運用実績

| Round | 主体 | 時刻 |
|-------|------|------|
| Round 1 | Claude (起票) | 2026-05-25 12:16 |
| Round 2 | **Codex 応答** | 2026-05-25 13:01 |
| Round 3 | Claude (合意マトリクス) | 2026-05-25 |
| 収束 | 本 PR | 2026-05-25 |

→ 同日内 3 ターン完結。DISC-005~010 と並ぶ 7 件連続収束パターン。

## 後続 PR (Lane E: 公開準備)

- [ ] `LICENSE` (MIT) / `LICENSE-DATA` / `LICENSE-INTERPRETATION` 作成
- [ ] `CONTRIBUTING.md` (AI contributor governance)
- [ ] `CODE_OF_CONDUCT.md`
- [ ] `web/components/disclaimer.html` 標準警告 UI
- [ ] interpretation disclaimer を全エントリ画面に統合
- [ ] symbolic badge 実装 (web/css/main.css)
- [ ] Zenodo DOI 取得 (Phase 3)

## 関連

- 起票: #248
- DISC-002 (#178) リスク台帳 35 項目
- DISC-003 (#179) 公開レイヤ 4 階層
- DISC-006 (#242) verified_status
- DISC-008 (#244) narrative intoxication 警告
- DISC-009 (#246) AI hallucination governance
- DISC-010 (#247) graph 公開時の false coherence
- CLAUDE.md §4.9 epistemic neutrality / public epistemology
- 用語集: `docs/civilization/12_terminology_glossary.md`
