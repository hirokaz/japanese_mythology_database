# Master DB 構築 Issue 設計(EPIC-18〜EPIC-24 詳細)

13 種の node_type に対応する **Master TSV** を構築するための Issue 群。Layer A 連表からの **抽出 → 正規化 → 統合** が中心作業。

## 0. 基本方針

1. **1 master = 1 TSV**(`docs/master/<node_type>_master.tsv`)
2. **master_id は一意**(プレフィックス + 連番)
3. **正規化された名前(canonical_name)** を持つ
4. **別名は aliases カラム**(改姓・改称・別表記をカンマ区切り)
5. **重複検知時は merged_into で統合**(削除しない、痕跡を残す)
6. **必須カラム** は `docs/schema/01_node_types.md` を参照

## 1. 13 master 一括ステータス表

| node_type | プレフィックス | TSV ファイル | 目標規模 | 現状 | 担当 Epic |
|---|---|---|---|---|---|
| deity | DEI | `deity_master.tsv` | 600+ | 部分 | EPIC-18 |
| shrine | SHR | `shrine_master.tsv` | 800+ | 部分 | EPIC-19 |
| clan | CLN | `clan_master.tsv` | 250+ | 部分 | EPIC-20 |
| emperor | EMP | `emperor_master.tsv` | 200+ | 未 | EPIC-21 |
| myth_episode | MYTH | `myth_episode_master.tsv` | 200+ | 未 | EPIC-22 |
| event | EVT | `event_master.tsv` | 300+ | 未 | EPIC-23 |
| archaeological_site | SITE | `site_master.tsv` | 100+ | 未 | EPIC-23 |
| artifact | ART | `artifact_master.tsv` | 150+ | 未 | EPIC-23 |
| ritual | RIT | `ritual_master.tsv` | 200+ | 未 | EPIC-23 |
| region | REG | `region_master.tsv` | 200+ | 未 | EPIC-23 |
| text | TXT | `text_master.tsv` | 100+ | 未 | EPIC-23 |
| title | TTL | `title_master.tsv` | 50+ | 未 | EPIC-23 |
| hypothesis | HYP | `hypothesis_master.tsv` | 100+ | 部分 | EPIC-24 |

---

## 2. EPIC-18 deity_master 構築

### Issue 一覧

| ID | Title | Effort | Priority | Dep |
|---|---|---|---|---|
| MST-DE-00 | スキーマ最終確認 + 既存 deity_master.tsv の現状監査 | S | P0 | M1.2 |
| MST-DE-01 | 出雲系 神格抽出・統合(80+) | M | P0 | M2.1 |
| MST-DE-02 | 伊勢系 神格抽出・統合(50+) | M | P0 | M2.3 |
| MST-DE-03 | 諏訪系 神格抽出・統合(40+) | M | P0 | M2.4 |
| MST-DE-04 | 鹿島・香取系 神格抽出・統合(30+) | M | P0 | M2.5 |
| MST-DE-05 | 宗像系 神格抽出・統合(20+) | S | P0 | M2.6 |
| MST-DE-06 | 熊野系 神格抽出・統合(50+) | M | P0 | M2.7 |
| MST-DE-07 | 石上(物部)系 神格抽出・統合(20+) | S | P0 | M2.8 |
| MST-DE-08 | 三輪系 神格抽出・統合(20+) | S | P0 | M2.9 |
| MST-DE-09 | 八幡系 神格抽出・統合(15+) | S | P0 | M2.10 |
| MST-DE-10 | 春日系 神格抽出・統合(10+) | S | P0 | M2.11 |
| MST-DE-11 | 海人系 神格抽出・統合(40+) | M | P0 | M2.12 |
| MST-DE-12 | 修験・山岳系 神格抽出・統合(60+) | M | P0 | M2.13 |
| MST-DE-13 | 東北系 神格抽出・統合(30+) | M | P1 | M2.14 |
| MST-DE-14 | 九州系 神格抽出・統合(40+) | M | P1 | M2.15 |
| MST-DE-15 | 琉球系 神格抽出・統合(15+) | S | P1 | M2.16 |
| MST-DE-16 | 渡来系 神格抽出・統合(20+) | S | P1 | EPIC-14 |
| MST-DE-17 | 表記ゆれ統合(merged_into 発行) | L | P0 | MST-DE-01〜16 |
| MST-DE-18 | parent/consort/syncretism 関係の埋込 | L | P0 | MST-DE-17 |
| MST-DE-19 | category 整理(太陽神/海神/地母神/王権神/穀霊/工神/武神 等) | M | P1 | MST-DE-17 |

### 必須カラム

```
master_id, canonical_name, canonical_reading, category, gender,
main_text_appearance, aliases, aliases_reading, parent_deity_ids,
consort_deity_ids, syncretism, regional_variant, related_shrine_ids,
related_myth_ids, merged_into, notes
```

### Subtask 標準

```markdown
- [ ] 該当地域編 TSV から deity 候補を抽出
- [ ] 既存 deity_master.tsv との重複検査
- [ ] canonical_name の確定 (古事記表記を優先)
- [ ] 別名を aliases に集約
- [ ] category 判定
- [ ] parent_deity_ids 埋め込み
- [ ] syncretism (本地仏など) 記録
- [ ] master_id 採番
- [ ] PR セルフレビュー
```

---

## 3. EPIC-19 shrine_master 構築

### Issue 一覧

| ID | Title | Effort | Priority | Dep |
|---|---|---|---|---|
| MST-SH-00 | スキーマ最終確認 | S | P0 | M1.2 |
| MST-SH-01 | 式内社 大社・名神大社 (約 200 社) | L | P0 | M2.* |
| MST-SH-02 | 式内社 一宮 (各国 1 = 68 社) | M | P0 | MST-SH-01 |
| MST-SH-03 | 式内社 残余 (約 2600 社、地域分割) | XL→4 分割 | P1 | MST-SH-02 |
| MST-SH-03a | └ 五畿七道のうち畿内 | L | P1 | MST-SH-02 |
| MST-SH-03b | └ 東海・東山・北陸 | L | P1 | MST-SH-03a |
| MST-SH-03c | └ 山陰・山陽・南海 | L | P1 | MST-SH-03b |
| MST-SH-03d | └ 西海道(九州) | M | P1 | MST-SH-03c |
| MST-SH-04 | 中世社(熊野系・八幡系・春日系の地方分布) | L | P1 | MST-SH-01-03 |
| MST-SH-05 | 近世・近代社(国家神道期の重要社) | M | P2 | MST-SH-04 |
| MST-SH-06 | 改称履歴(renamed_to 関係発行) | M | P1 | MST-SH-* |
| MST-SH-07 | 摂社・末社の階層付け(parent_shrine_id) | L | P1 | MST-SH-* |

→ 全式内社 2861 社網羅は壮大。**まず核 800 社**を Phase 2 で完了し、残りは Phase 3-4 で漸次。

### 必須カラム

```
master_id, canonical_name, canonical_reading, prefecture, address,
main_deity_ids, old_names, alternative_names, coordinates,
secondary_deity_ids, related_clan_ids, shrine_rank_ancient,
shrine_rank_modern, founding_legend, founding_year_estimated,
parent_shrine_id, notes
```

---

## 4. EPIC-20 clan_master 構築

| ID | Title | Effort | Priority | Dep |
|---|---|---|---|---|
| MST-CL-01 | 中央豪族(大伴・物部・蘇我・中臣・藤原 等)50+ | L | P0 | M1.2 |
| MST-CL-02 | 地方国造・国造系豪族 100+ | L | P0 | MST-CL-01 |
| MST-CL-03 | 祭祀氏族(出雲国造・忌部・卜部 等)40+ | M | P0 | MST-CL-02 |
| MST-CL-04 | 技術氏族(秦・東漢・西文・鍛冶部 等)30+ | M | P1 | MST-CL-03, EPIC-14 |
| MST-CL-05 | 渡来氏族 30+ | M | P1 | EPIC-14 |
| MST-CL-06 | 改姓・カバネ整理(aliases 集約) | M | P1 | MST-CL-01-05 |
| MST-CL-07 | 系譜グラフ整合(descended_from で皇族・祖神に接続) | M | P1 | MST-CL-06 |

### 必須カラム

```
master_id, canonical_name, canonical_reading, clan_type, aliases,
ancestor_deity_id, related_shrine_ids, related_region_ids,
related_emperor_ids, peak_period, notes
```

---

## 5. EPIC-21 emperor_master 構築

| ID | Title | Effort | Priority |
|---|---|---|---|
| MST-EM-01 | 神武〜欠史八代(架空議論含)9 代 | M | P0 |
| MST-EM-02 | 崇神〜継体 16 代 | M | P0 |
| MST-EM-03 | 継体〜桓武 約 35 代 | L | P0 |
| MST-EM-04 | 桓武〜後鳥羽 約 30 代 | L | P1 |
| MST-EM-05 | 鎌倉(後鳥羽以降)10+ 代 | M | P1 |
| MST-EM-06 | 主要后妃・斎宮・皇女 50+ | L | P1 |
| MST-EM-07 | 系譜整合(parent_of, married_to 関係) | M | P0 |

### 注意

- 神武〜開化(欠史八代)は `historicity_level` を低く設定(C-D)
- 神話時代の天皇(神武)も emperor 扱い、`historicity_level` で峻別

---

## 6. EPIC-22 myth_episode_master 構築

| ID | Title | Effort | Priority |
|---|---|---|---|
| MST-MY-01 | 国生み・神生み(古事記上巻冒頭) | M | P0 |
| MST-MY-02 | 高天原系(天石屋戸・スサノオ追放 等) | L | P0 |
| MST-MY-03 | 国譲り・天孫降臨 | L | P0 |
| MST-MY-04 | 神武東征(熊野・橿原即位) | M | P0 |
| MST-MY-05 | 崇神朝(三輪山・四道将軍) | M | P0 |
| MST-MY-06 | ヤマトタケル | M | P0 |
| MST-MY-07 | 神功・応神(三韓征伐) | M | P1 |
| MST-MY-08 | 出雲国風土記独自エピソード | L | P1 |
| MST-MY-09 | 各風土記独自エピソード | L | P1 |
| MST-MY-10 | 後期神話(中世神道書・地方伝承) | L | P2 |

### 必須カラム

```
master_id, canonical_name, canonical_reading, mythic_time,
primary_text_ids, aliases, participating_deity_ids,
location_region_ids, variants, notes
```

`variants` には文献ごとの差分(古事記版/書紀本伝/書紀一書群/風土記)を JSON ライク文字列で格納。

---

## 7. EPIC-23 残り 7 master(event/site/artifact/ritual/region/text/title)

### 7.1 event_master

| ID | Title | Effort |
|---|---|---|
| MST-EV-01 | 上代史(神武即位〜大宝律令)50+ | M |
| MST-EV-02 | 奈良・平安(大化改新・遷都・天慶の乱 等)100+ | L |
| MST-EV-03 | 中世(造営・遷宮・社格論争・神宮焼失 等)100+ | L |
| MST-EV-04 | 神事・祭祀の重要事件(神賀詞奏上 等)50+ | M |

### 7.2 site_master

| ID | Title | Effort |
|---|---|---|
| MST-ST-01 | 縄文遺跡(三内丸山・大湯・若狭三方 等)30+ | M |
| MST-ST-02 | 弥生遺跡(吉野ヶ里・登呂・伊勢遺跡 等)30+ | M |
| MST-ST-03 | 古墳(纏向・箸墓・大仙陵 等)40+ | M |
| MST-ST-04 | 祭祀遺跡(沖ノ島・荒神谷・加茂岩倉・西谷 等)20+ | M |

### 7.3 artifact_master

| ID | Title | Effort |
|---|---|---|
| MST-AR-01 | 銅鐸・銅剣・銅矛 50+ | M |
| MST-AR-02 | 鏡・勾玉・神宝 50+ | M |
| MST-AR-03 | 土偶・埴輪・縄文祭祀資料 50+ | M |

### 7.4 ritual_master

| ID | Title | Effort |
|---|---|---|
| MST-RT-01 | 国家祭祀(大嘗祭・新嘗祭・祈年祭 等)20+ | M |
| MST-RT-02 | 各社年中祭祀 100+ | L |
| MST-RT-03 | 修験・地方祭祀(御柱・御頭祭・神在祭 等)80+ | L |

### 7.5 region_master

| ID | Title | Effort |
|---|---|---|
| MST-RG-01 | 古代国 68 国 | S |
| MST-RG-02 | 古代郡(主要 200+) | M |
| MST-RG-03 | 古代郷(主要 100+) | M |
| MST-RG-04 | 現代県・市町村との対応(parent_region_id) | M |

### 7.6 text_master

| ID | Title | Effort |
|---|---|---|
| MST-TX-01 | 一次史料(古事記・書紀・風土記・延喜式・万葉集 等)20+ | M |
| MST-TX-02 | 系譜資料(新撰姓氏録・先代旧事本紀 等)10+ | S |
| MST-TX-03 | 中世神道書(神道五部書・中臣祓 等)20+ | M |
| MST-TX-04 | 社伝・縁起(主要 30+) | M |
| MST-TX-05 | 近世・近代研究 30+ | M |

### 7.7 title_master

| ID | Title | Effort |
|---|---|---|
| MST-TT-01 | 神格カテゴリ(国魂神・荒神・八百万神 等)30+ | S |
| MST-TT-02 | 社格(式内大社・名神大社・一宮・国幣社 等)20+ | S |

---

## 8. EPIC-24 hypothesis_master 体系化

| ID | Title | Effort | Priority |
|---|---|---|---|
| MST-HY-01 | 学術仮説(L1-L2)整理(銅鐸祭祀文化圏説等) | L | P1 |
| MST-HY-02 | 地方仮説(L3)整理(地方伝承的解釈) | L | P2 |
| MST-HY-03 | 大胆仮説(L4)整理(縄文記憶仮説等) | L | P2 |
| MST-HY-04 | 思想的仮説(L5)整理(構造主義的解釈等) | M | P3 |
| MST-HY-05 | 仮説間 supports/contradicts 整理 | M | P2 |
| MST-HY-06 | 提唱者(proposed_by)関係 | M | P2 |

### 必須カラム

```
master_id, canonical_name, layer, proposer, source_text_ids,
aliases, evidence_pro, evidence_con, status, notes
```

`evidence_pro` / `evidence_con` には他 master_id を **JSON 配列っぽい文字列** で格納(`[SITE-001, SITE-002]`)。

---

## 9. master 統合の絶対ルール

1. **canonical_name は 1 つに確定**(別名は aliases へ)
2. **重複時は merged_into 関係を発行 + 削除しない**
3. **node_type を跨ぐ master_id 衝突禁止**(プレフィックスで分離)
4. **必須カラム欠損禁止**
5. **PR は 1 master / 1 領域 に限定**(レビュー困難回避)
6. **PR 前にスクリプト検証**(将来作成):
   ```bash
   bash scripts/check_master.sh deity_master.tsv
   ```
7. **どの編から抽出した master_id か、コミットメッセージで明記**

## 10. master 命名規約まとめ

```
DEI-001  〜 deity
SHR-001  〜 shrine
CLN-001  〜 clan
EMP-001  〜 emperor
MYTH-001 〜 myth_episode
EVT-001  〜 event
SITE-001 〜 archaeological_site
ART-001  〜 artifact
RIT-001  〜 ritual
REG-001  〜 region
TXT-001  〜 text
HYP-001  〜 hypothesis
TTL-001  〜 title
```

**連番は最大 4 桁を想定**(将来 9999 超えの場合は 5 桁に拡張、既存 ID は維持)。
