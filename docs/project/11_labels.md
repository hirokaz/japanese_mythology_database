# GitHub Label 設計

Issue / PR にラベルを **多次元** に付与することで、フィルタ・並行作業・優先度管理を可能にする。

## 0. ラベル群の構成

| グループ | プレフィックス | 役割 |
|---|---|---|
| Phase | `phase:1〜5` | フェーズ |
| Area(地域) | `area:izumo`, `area:ise`, ... | 地域編 |
| Area(ネットワーク) | `area:marine`, `area:metal`, ... | ネットワーク Epic |
| Type | `type:shrine`, `type:relation`, ... | 作業種別 |
| Priority | `priority:P0〜P3` | 優先度 |
| Effort | `effort:S/M/L` | 作業量 |
| Evidence | `evidence:kojiki`, `evidence:archeology`, ... | 出典種別 |
| Hypothesis | `layer:L0〜L5` | 仮説強度 |
| Risk | `risk:assertion`, `risk:bias-central`, ... | 監査リスク |
| Status | `status:blocked`, `status:in-review`, ... | 進行状態 |
| Audit | `audit:claude`, `audit:gemini`, `audit:script` | 監査担当 |

---

## 1. Phase ラベル

| ラベル | 色 | 用途 |
|---|---|---|
| `phase:1` | gray | スキーマ |
| `phase:2` | blue | 地域編 + master |
| `phase:3` | purple | relation 大量生成 |
| `phase:4` | orange | 監査・正規化 |
| `phase:5` | green | Neo4j・公開 |

## 2. Area ラベル(地域・ネットワーク)

### 2.1 地域(15)

| ラベル | 編 |
|---|---|
| `area:izumo` | 出雲 |
| `area:ise` | 伊勢 |
| `area:suwa` | 諏訪 |
| `area:kashima-katori` | 鹿島・香取 |
| `area:munakata` | 宗像 |
| `area:kumano` | 熊野 |
| `area:isonokami` | 石上(物部) |
| `area:miwa` | 三輪 |
| `area:usa` | 宇佐 |
| `area:kasuga` | 春日 |
| `area:tohoku` | 東北 |
| `area:kyushu` | 九州 |
| `area:okinawa` | 琉球 |

### 2.2 ネットワーク(4)

| ラベル | 内容 |
|---|---|
| `area:marine` | 海人系 |
| `area:mountain` | 山岳・修験 |
| `area:metal` | 製鉄・金属 |
| `area:toraijin` | 渡来系 |

### 2.3 横断(複数 Area またがり)

| ラベル | 内容 |
|---|---|
| `area:multi` | 複数地域横断(集約・統合 Issue) |

色: 各 area で固有色(紫系統)。

## 3. Type ラベル

| ラベル | 用途 |
|---|---|
| `type:deity` | 神格関連 |
| `type:shrine` | 神社関連 |
| `type:clan` | 氏族関連 |
| `type:emperor` | 皇族関連 |
| `type:myth` | 神話エピソード |
| `type:event` | 歴史事象 |
| `type:site` | 遺跡 |
| `type:artifact` | 遺物 |
| `type:ritual` | 祭祀 |
| `type:region` | 地域 |
| `type:text` | 文献 |
| `type:title` | 称号 |
| `type:hypothesis` | 仮説 |
| `type:relation` | relation 生成 |
| `type:master` | master 構築 |
| `type:audit` | 監査 |
| `type:graph` | グラフ DB / 可視化 |
| `type:civilization` | 文明解析(motif / network 等) |
| `type:schema` | schema 改訂 |
| `type:infra` | リポジトリ運用・CI 等 |
| `type:docs` | 文書整備 |

色: 青系統(濃淡で区別)。

## 4. Priority ラベル

| ラベル | 意味 |
|---|---|
| `priority:P0` | 必須最優先(クリティカルパス) |
| `priority:P1` | 高 |
| `priority:P2` | 中 |
| `priority:P3` | 低(将来) |

色: 赤系統(P0=濃赤、P3=薄赤)。

## 5. Effort ラベル

| ラベル | 意味 |
|---|---|
| `effort:S` | 2-3h |
| `effort:M` | 4-5h |
| `effort:L` | 6-8h |
| `effort:XL` | (禁止 / 必ず分割) |

色: 黄系統。

## 6. Evidence ラベル(出典)

| ラベル | 意味 |
|---|---|
| `evidence:kojiki` | 古事記 |
| `evidence:nihonshoki` | 日本書紀 |
| `evidence:fudoki` | 風土記 |
| `evidence:engishiki` | 延喜式 |
| `evidence:shoji` | 続日本紀・三代実録 |
| `evidence:shrine_legend` | 社伝 |
| `evidence:medieval_shinto` | 中世神道書 |
| `evidence:archaeology` | 考古資料 |
| `evidence:folklore` | 民俗・地方伝承 |
| `evidence:modern_research` | 近代・現代研究 |
| `evidence:hypothesis_only` | 仮説のみ(L4-L5) |

色: 緑系統。

## 7. Hypothesis Layer ラベル

| ラベル | 意味 |
|---|---|
| `layer:L0` | 史料記載の整理 |
| `layer:L1` | 一般的研究解釈 |
| `layer:L2` | 複数研究者言及 |
| `layer:L3` | 民間・地域伝承 |
| `layer:L4` | 大胆仮説 |
| `layer:L5` | 思想的・構造的仮説 |

色: 紫系統(L0=薄、L5=濃)。

## 8. Risk ラベル

| ラベル | 意味 |
|---|---|
| `risk:assertion` | 仮説断定の懸念 |
| `risk:bias-central` | 中央史観偏重の懸念 |
| `risk:bias-male` | 父系優位の懸念 |
| `risk:bias-modern` | 近代国学・近現代観の混入懸念 |
| `risk:source-weak` | 出典脆弱 |
| `risk:duplicate` | 重複の懸念 |
| `risk:naming-variation` | 表記ゆれ懸念 |
| `risk:scope-creep` | 範囲拡大の懸念 |

色: オレンジ系統。

## 9. Status ラベル

| ラベル | 意味 |
|---|---|
| `status:blocked` | 前提未完で停止 |
| `status:needs-info` | 追加情報待ち |
| `status:in-review` | レビュー中 |
| `status:approved` | 承認済 |
| `status:duplicate` | 重複 issue |
| `status:wontfix` | 対応見送り |
| `status:waiting-gemini` | Gemini 監査待ち |

色: 灰系統。

## 10. Audit ラベル

| ラベル | 意味 |
|---|---|
| `audit:claude` | Claude セルフ監査対象 |
| `audit:gemini` | Gemini 反射監査対象 |
| `audit:script` | 機械監査対象 |
| `audit:reviewed-claude` | Claude 監査済 |
| `audit:reviewed-gemini` | Gemini 監査済 |

## 11. Special

| ラベル | 意味 |
|---|---|
| `epic` | Epic 親 issue(meta) |
| `milestone-meta` | Milestone 集約 issue |
| `good-first-task` | 着手しやすい(Onboarding 推奨) |
| `claude-autonomous` | Claude 自律実行可 |
| `human-required` | 人間判断要 |
| `wip` | Work In Progress |

---

## 12. ラベル組み合わせ運用例

| 例 | ラベル群 |
|---|---|
| 伊勢編 内宮 整理 issue | `phase:2`, `area:ise`, `type:shrine`, `priority:P0`, `effort:M`, `evidence:engishiki`, `claude-autonomous` |
| 海人系 enshrined_at relation 抽出 | `phase:3`, `area:marine`, `type:relation`, `priority:P1`, `effort:L`, `evidence:shrine_legend`, `claude-autonomous` |
| Gemini 監査 issue | `phase:4`, `type:audit`, `audit:gemini`, `priority:P1`, `effort:M`, `human-required` |
| 大胆仮説 hypothesis 整理 | `phase:4`, `type:hypothesis`, `layer:L4`, `risk:assertion`, `priority:P2`, `effort:M` |
| Neo4j 投入 | `phase:5`, `type:graph`, `priority:P0`, `effort:L`, `claude-autonomous` |

---

## 13. ラベル運用ルール

1. **必須ラベル**: phase / type / priority は **すべての Issue に必須**
2. **area** は地域・ネットワーク Issue に必須(例外: スキーマ・インフラ)
3. **effort** は Closed 直前に確定可(着手前は仮置き S/M/L)
4. **risk** は監査時に Claude が必ずチェックし、該当があれば付与
5. **claude-autonomous** が付いた Issue は人間承認なしで自動実行 OK(`13_claude_rules.md` の制約下)
6. **human-required** が付いた Issue は人間判断・コミュニケーション必須

---

## 14. ラベル一括作成スクリプト(将来)

```bash
# scripts/setup/create_labels.sh
gh label create "phase:1" --color "808080"  # ※本リポジトリでは gh 不可
# 代替: GitHub MCP の create/update 経由で起こす
```

→ 本リポジトリでは `mcp__github__*` ツールでラベル設定する。CI で同期予定。

## 15. Project Board での使い方

GitHub Projects(Beta)で:

- **Phase ごとに Board 分割**
- **Area / Priority で Group**
- **Status で列分割** (Backlog → Triaged → In Progress → In Review → Done)
- **Effort と Priority で sort**

→ 数百 Issue でも視認性確保。
