# DISC-003 解決報告: 公開時の情報レイヤ分離 (一般 / 研究 / 検証状態)

**ステータス**: 収束
**起票**: 2026-05-07 (#179)
**収束**: 2026-05-24

---

## 結論

公開レイヤは **2 軸** で切る:
1. **仮説層 (hypothesis_layer)**: L0-L5
2. **実在検証状態 (verified_status)**: verified / under_review / unverified / known_fabrication (**新規**、本 DISC で確定)

Round 1 の「仮説層のみで公開レイヤ決定」は不十分と判明。AI 生成プレースホルダーは L0=A で混入していたため、`verified_status` 第二軸の導入が必須。

## 確定 4 階層公開レイヤ v0.2

| 公開レベル | 認証 | 仮説層フィルタ | 検証フィルタ | 用途 |
|---|---|---|---|---|
| **L0 一般** | なし | L0-L1 のみ | `verified=true` のみ | 教科書・観光・SNS 拡散安全圏 |
| **L1 学習者** | API キー | L0-L2 | `verified` または `under_review` | 学習・教育 |
| **L2 研究者** | 契約 | L0-L5 全件 | 全状態 (警告フラグ付き) | 学術研究 |
| **L3 内部** | 管理者 | 全件 + 削除履歴 | 全状態 + 削除痕跡 | 監査・運用 |

## `verified_status` field 定義 (新規)

```yaml
verified_status:
  type: enum
  values:
    - verified          # 人手 or 信頼できる外部参照で実在確認済
    - under_review      # 検証作業中
    - unverified        # 未検証 (templated AI 生成の疑いあり)
    - known_fabrication # 架空であると判明 (削除候補、L3 内部のみ可視)
  default: under_review  # 既存全エントリのデフォルト
  applies_to:
    - deity_master.tsv
    - shrine_master.tsv
    - clan_master.tsv
    - motif_master.tsv (motif_db.tsv)
    - festival_master.tsv
    - text_master.tsv
    - event_master.tsv
    - region_master.tsv
    - period_master.tsv
    - rank_master.tsv
```

### 既存エントリへの初期値設定方針

- `shrine_rank_ancient` が「名神大社・式内社・一宮・二宮」を含む: `verified`
- `shrine_rank_modern` が「官幣・国幣・別表・府社・県社・郷社」を含む: `verified`
- 著名社保護リスト (PR #229 で 130 件確定) に含まれる: `verified`
- 上記いずれも該当しない既存エントリ: `under_review` (デフォルト)
- 削除済 (PR #229/#231 の 284 件) は `known_fabrication` として履歴保持 (実装は別 PR)

## API フィルタリング設計

```python
def filter_for_audience(entries, audience):
    if audience == 'public':
        return [e for e in entries
                if e.hypothesis_layer <= 'L1'
                and e.verified_status == 'verified']
    elif audience == 'learner':
        return [e for e in entries
                if e.hypothesis_layer <= 'L2'
                and e.verified_status in ('verified', 'under_review')]
    elif audience == 'researcher':
        # 警告フラグ付きで全公開、known_fabrication は除外
        return [e for e in entries if e.verified_status != 'known_fabrication']
    elif audience == 'admin':
        return entries  # 削除済・架空判明も含む
```

## Round 1 からの主要な反証

### 反証 1: 「個人特定可能な系譜情報を隠す」は誤り

Round 1 提案: 「現代人につながる氏族系譜は隠す」

**反証**: 実態は逆。千家家・北島家・出雲国造家など現代人につながる系譜は**公式ソース存在 + verified=true**で最も安全。隠すべきは「現代人と無関係な架空合成エントリ」。

→ **改訂**: 公開ポリシーは「個人情報 vs 公知」ではなく「**verified vs unverified**」で切る。

### 反証 2: 仮説層単独では公開判定不能

Round 1 案 (L0-L2 一般 / L0-L3 学習者 / L0-L5 研究者) は、**L0 の中に AI 生成が混入**していた事実を捕捉できない。

→ `verified_status` 第二軸を必須に。

## Web Atlas UI への反映案

### バッジ表示

各 entity detail page で 2 バッジ表示:

```html
<span class="badge badge-l0">L0 (史実級)</span>
<span class="badge badge-verified">✓ 検証済</span>
<!-- or -->
<span class="badge badge-l3">L3 (民間伝承)</span>
<span class="badge badge-unverified">⚠ 未検証</span>
```

### 警告表示

`verified_status=unverified` のエントリは:
- 一般ユーザーには非表示 (検索結果から除外)
- 学習者には警告アイコン + ツールチップ「実在性が個別に確認されていません」
- 研究者には警告色背景

## 完了条件達成状況

- [x] **公開レベル定義 v0.2** (4 階層)
- [x] L0-L5 / verified_status 公開ポリシー一覧
- [ ] `docs/civilization/11_web_atlas_design.md` への反映 (後続 PR)
- [ ] API スキーマの権限フィルタリング実装 (後続 PR)
- [ ] **`verified_status` field の master 全件追加** (後続 PR、最大規模変更)

## 反映先

- 本文書 `docs/discussions/DISC-003_resolution.md` (確定版)
- 後続 PR (大規模): master schema に `verified_status` field 追加 + 既存エントリの初期値設定
- 後続 PR (中規模): `docs/civilization/11_web_atlas_design.md` v0.2 反映
- 後続 PR (中規模): Web UI に検証状態バッジ追加

## 関連
- 起票 issue: #179
- 関連 DISC: #177 (persona × 公開レイヤ整合) / #178 (RISK-32 で `verified_status` 必要性)
- 削除実績: PR #229/#231 (284 件)
