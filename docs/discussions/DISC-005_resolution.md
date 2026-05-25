# DISC-005 解決報告: 文明 OS としての発展方針

**ステータス**: 収束 (Claude Round 1 → Codex Round 2 → Claude Round 3、3 ターン完了)
**起票**: 2026-05-25 (#238)
**収束**: 2026-05-25 (同日内に 3 ターン議論完結)
**経緯**: DISC-005 は DISC-004 v0.2 プロトコル**初の Codex 応答ありパターン** ✅

---

## 結論

「日本神話 DB を文明 OS としてどう発展させるか」の 7 テーマで**全項目合意**。基本方向性は:

1. **多層 OS モデル** (記憶/物流/制度/思想) を骨格に
2. **概念分離** (OS / protocol / interface / synchronization / authority / persistence / event / mythologem / executable protocol)
3. **二項対立を避け `mixed` 許容** (縄文 vs 律令の固定対立は綺麗すぎる)
4. **Speculation 自己増殖の抑制** (4 軸 `inference_type` で分離)
5. **「ロマン化ではなく構造化」を維持**する規律 (Codex 最終提言)

## 確定した実装方針

### 即時実装 (本 PR)
- ✅ `docs/discussions/DISC-005_resolution.md` (本文書)
- ✅ `docs/civilization/12_terminology_glossary.md` (用語定義)
- ✅ CLAUDE.md §4.3 「source / abstraction / inference / speculation の分離 discipline」追加

### 後続 PR (Lane D、別 issue で起票)
- [ ] `os_type` field schema 追加 (列挙型: jomon/ritsuryo/shinbutsu/chusei_shinto/kokugaku/meiji_kokka/**mixed**/unknown)
- [ ] `inference_type` field 追加 (列挙型: source_backed/inferential/speculative/symbolic)
- [ ] `mythologem_master.tsv` 新規 (10-20 件、神話素レイヤ Level 2)
- [ ] `festival_master` ritual_protocol 拡張 (actor/role/authority_source/sequence/timing/place/offering/state_change)
- [ ] 神社 sync event 用 relation type 追加 (kanjo_from / shinkai_to / sengu_cycle)

## 各テーマの結論サマリ

### テーマ 1: 「文明 OS」の操作的定義
**4 層モデル** (Layer 1 記憶 / Layer 2 物流 / Layer 3 制度 / Layer 4 思想) で骨格定義。神社 = 「特定座標の神聖化と長期維持プロトコル」。

### テーマ 2: 神話を「構造」として読む
**Level 0 (説話) → Level 1 (motif) → Level 2 (mythologem) → Level 3 (政治構造)** の 4 層抽象化。Level 2 mythologem layer を新規実装提案 (Codex 賛成)。

### テーマ 3: 縄文記憶仮説の境界
**L3 まで保存、L4-L5 は反対説併記必須、F0 偽書は完全分離**。`verified_status` (DISC-003) と連動して公開時警告。

### テーマ 4: 神社 = 地理インターフェース
**実装可能だが現状 coordinates 大半空**。主要 200 社 (一宮・式内大社) に座標補完 + Leaflet 静的地図 (`web/pages/atlas.html`) を後続実装。

### テーマ 5: 皇統・豪族・祭祀権力モデル化
**60% 達成済** (lineage / married_to / controls_shrine)。残 40% は新関係タイプ (provides_consort_to / political_ally_of / delegated_ritual_authority_to) で実装。

### テーマ 6: AI 時代の知識編纂
**Claude (実装) + Codex (報告者) + 人間 (検証者)** の役割分担確定。CLAUDE.md §4.2 「AI は仮説生成器、人間は検証者」原則を恒久化。

### テーマ 7: このDBの最終形
**「探索可能な歴史仮説保管庫 + AI 文明研究基盤」** の二重機能。「読む + 探索する + 推論する」三層構造で「文明を再構築するエンジン」を目指す。

## Codex Round 2 の重要指摘 (採用済)

1. **OS 比喩の過剰一般化** → glossary 作成で対応 (本 PR で実装)
2. **縄文 vs 律令 の固定二項対立** → `os_type = mixed` 許容 (本 PR で文書化、schema は後続)
3. **Speculation 自己増殖** → 4 軸 `inference_type` 導入 (本 PR で文書化)

→ 「**ロマン化ではなく構造化**」の規律維持を最重要原則とする。

## DISC-004 v0.2 プロトコル適合性

- ✅ Claude Round 1 (2026-05-25 投下、7 テーマ)
- ✅ Codex Round 2 (同日応答、合意・反証・追加提案)
- ✅ Claude Round 3 (同日応答、合意マトリクス + 実装提案)
- ✅ 収束報告書 (本文書)
- 〇 人間最終判断 + docs PR (本 PR で実施)

→ **3 週間ルール大幅短縮、同日内に 3 ターン完結**。DISC-005 は v0.2 プロトコルの**理想的運用例**。

## 関連

- 起票 issue: #238
- 関連 DISC: #177 (DISC-001) / #178 (DISC-002) / #179 (DISC-003) / #180 (DISC-004)
- 関連 docs:
  - `docs/civilization/12_terminology_glossary.md` (本 PR で新規)
  - `docs/project/20_discussion_protocol.md` (DISC-004 v0.2)
  - `docs/project/21_roadmap.md` Lane D (知識グラフ拡張)
