# relation 生成 Issue カタログ(#132、200+ Issue 骨格)

35+ relation_type × 地域別分割 × 平均 6 Issue = 約 210 Issue。

## 1. enshrined_at 系(神→神社、30 Issue)

| 地域別 Issue | 件数推定 |
|---|---|
| 出雲系 | 200+ |
| 伊勢系 | 150+ |
| 諏訪系 | 100+ |
| 鹿島・春日系 | 100+ |
| 宗像・海人系 | 300+ |
| 熊野修験系 | 200+ |
| 三輪山・大和系 | 200+ |
| 八幡系全国 | 600+ |
| 春日系全国 | 200+ |
| 稲荷系全国 | 200+ |
| 天満宮系全国 | 200+ |
| 諏訪系全国 | 200+ |
| 白山系全国 | 100+ |
| 富士浅間系 | 100+ |
| 東北系 | 150+ |
| 九州系 | 200+ |
| 琉球系 | 50+ |
| 渡来系 | 100+ |
| 残余・監査 | 100+ |

→ 30 Issue で各地域 100-600 件、計 **3000+ relation 投入**

## 2. mentioned_in 系(全→text、30 Issue)

| 文献別 Issue | 件数推定 |
|---|---|
| 古事記 | 500+ |
| 日本書紀 | 800+ |
| 出雲国風土記 | 200+ |
| 各風土記(逸文含) | 400+ |
| 延喜式神名帳 | 2861(全式内社) |
| 続日本紀 | 200+ |
| 三代実録 | 100+ |
| 中世神道書群 | 200+ |
| 倭姫命世記 | 50+ |
| 神道五部書 | 100+ |
| 古事記伝 | 100+ |
| 諸社伝 | 500+ |
| (他 18 文献別 Issue) | - |

→ **6000+ relation 投入**

## 3. 系譜系(parent_of/married_to/sibling_of/descended_from、30 Issue)

| 系譜 Issue | 件数推定 |
|---|---|
| deity 親子(国生み・神生み・誓約) | 200+ |
| deity 婚姻(三輪山型・海宮婚 等) | 100+ |
| emperor 系譜 神武〜継体 | 200+ |
| emperor 系譜 継体〜後鳥羽 | 300+ |
| 中央豪族 → 祖神 | 100+ |
| 地方国造 → 祖神 | 200+ |
| 祭祀氏族 → 祖神 | 100+ |
| 技術氏族 → 祖神 | 50+ |
| 渡来氏族 → 祖神 | 100+ |
| (他 21 細分) | - |

→ **2000+ relation 投入**

## 4. 神格・同体系(syncretized_with 派生、30 Issue)

| Issue | 件数推定 |
|---|---|
| 大国主・オオナムチ・オオモノヌシ系 | 50+ |
| アマテラス・ワカヒルメ系 | 30+ |
| 各地の地方変異名 | 200+ |
| 八幡 syncretization | 100+ |
| 熊野 syncretization | 80+ |
| 春日・山王・蔵王 | 100+ |
| 牛頭天王・スサノオ | 50+ |
| 大黒天・弁才天系 | 80+ |
| (他 22 細分) | - |

→ **1500+ relation 投入**

## 5. 政治・支配系(controlled_by/ruled/served、30 Issue)

→ **1000+ relation 投入**

## 6. 神話・出来事系(participated_in/occurred_in/triggered/variant_of、30 Issue)

→ **2000+ relation 投入**

## 7. 考古・祭祀・仮説系(found_at/performed_at/reenacts/supports/contradicts、20 Issue)

→ **1500+ relation 投入**

## 8. 集計

| relation_type 群 | Issue 数 | 推定 relation 投入数 |
|---|---|---|
| enshrined_at 系 | 30 | 3000+ |
| mentioned_in 系 | 30 | 6000+ |
| 系譜系 | 30 | 2000+ |
| 神格・同体系 | 30 | 1500+ |
| 政治・支配系 | 30 | 1000+ |
| 神話・出来事系 | 30 | 2000+ |
| 考古・祭祀・仮説系 | 20 | 1500+ |
| **合計** | **200** | **17,000+ relation** |

→ **#132 Issue 目標 200+ 達成、#137 relation 5000+ 目標を遥かに超過**(将来 Phase 3 で 17,000+ を投入可)

## 9. 各 relation Issue の必須項目

```yaml
issue_id: RLN-EN-001(enshrined_at 系の 1 番目)
title: "出雲系 deity → shrine の enshrined_at 抽出"
purpose: "出雲系神格を出雲圏神社に対し enshrined_at で結合"
scope:
  - 対象 deity: deity_master の category=出雲系 約 30 神格
  - 対象 shrine: 出雲・島根県内+全国分祀 約 200 社
  - 主従区別: primary/secondary
input:
  - docs/master/deity_master.tsv
  - docs/master/shrine_master.tsv
  - 各社の社伝・延喜式
output:
  - docs/relations/relations_enshrined_at_izumo.tsv
expected_relation_count: 200+
suggested_query: |
  MATCH (d:Deity {category:'出雲系'})
  MATCH (s:Shrine)
  WHERE s.prefecture = '島根県' OR ...
  RETURN d, s
acceptance_criteria:
  - 必須カラム全件記載
  - 主祭神 → primary_deity_of, 配祀 → secondary_deity_of
  - 200 行以上
  - 重複なし
risk:
  - bias-central: 中央視点で地方主祭神を矮小化
confidence_policy: |
  社伝確定 → A、延喜式単独 → B、推定 → C
estimated_effort: L (6-8h)
```
