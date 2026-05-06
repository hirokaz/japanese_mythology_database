# 出典強度監査

**監査日**: 2026-05-06
**監査対象**: 出雲編161行、deity_master.tsv 30件、shrine_master.tsv 28件、clan_master.tsv 20件、hypothesis_master.tsv 8件

---

## 1. 出典強度6レベル(再掲)

`docs/schema/07_source_reliability.md` で定義:
1. primary(一次史料)/ 2. official(公文書) / 3. academic(学術研究) / 4. local_tradition(地方伝承) / 5. folklore(民俗) / 6. speculative(仮説)

---

## 2. 出雲編 161 行の出典強度分類

| 行番号範囲 | 主題 | 主出典 | レベル | 備考 |
|---|---|---|---|---|
| IZM-001 | 砂原遺跡(石器、年代論争) | 松藤和人ほか発掘報告(2009-) | academic | 年代論争で学術的検証中 |
| IZM-002 | 縄文遺跡群 | 島根県教育委員会発掘報告 | academic + official | 公的発掘報告 |
| IZM-003 | 弥生集落 | 田和山遺跡発掘報告 | academic | |
| IZM-004 | 四隅突出型墳丘墓 | 近藤義郎ほか研究 | academic | 主流説 |
| IZM-005-008 | 西谷・荒神谷・加茂岩倉 | 島根県教育委員会発掘報告 | academic + official | |
| IZM-009 | 銅鐸祭祀終焉 | 佐原真ほか研究 | academic | 仮説部分は L2 |
| IZM-010-015 | 古墳期 | 渡辺貞幸ほか研究 | academic | |
| IZM-016-023 | スサノオ・大国主神話本体 | 古事記・日本書紀 | primary | 神話の一次史料 |
| IZM-024 | 風土記スサノオ | 出雲国風土記 | primary | |
| IZM-025-028 | 出雲在来神社 | 出雲国風土記、延喜式神名帳、各社社伝 | primary + official + local_tradition | |
| IZM-029 | 中世スサノオ祭神化 | 中世神道書(『塩冶系図』『出雲国造家文書』類) | official(中世期)+ speculative(中世神話の創作部) | 慎重 |
| IZM-030 | スサノオ両義性 | 中世以降諸書、近代研究 | academic + speculative | |
| IZM-031-045 | 大国主神話 | 古事記・日本書紀・出雲国造神賀詞 | primary | |
| IZM-046-058 | 国譲り神話 | 古事記・日本書紀・出雲国造神賀詞 | primary | |
| IZM-059 | 神賀詞奏上 | 続日本紀霊亀2年2月条 | primary | 史料 |
| IZM-060 | 国譲り政治史読解 | 近代研究(津田左右吉、岡田精司、瀧音能之) | academic | L2 仮説 |
| IZM-061-070 | タケミナカタ・諏訪 | 古事記、諏訪大社社伝、守矢家文書、菅江真澄 | primary + official + local_tradition | |
| IZM-071 | 諏訪縄文遺跡 | 長野県教育委員会発掘報告 | academic + official | |
| IZM-072 | 翡翠ロード仮説 | 寺村光晴、藤田富士夫研究 | academic | L3 仮説 |
| IZM-073 | 中世武家信仰化 | 諏訪大明神絵詞、武家文書 | primary + official | |
| IZM-074-088 | 出雲国造系譜・神賀詞 | 古事記・日本書紀・続日本紀・延喜式・出雲国造家文書 | primary + official | |
| IZM-089-094 | 製鉄伝承(オロチ製鉄説等) | 谷川健一、小川光暘研究 + 大澤正己反証研究 | academic | L2-L4 |
| IZM-095-101 | 銅鐸論争 | 佐原真、春成秀爾、難波洋三研究 | academic | |
| IZM-102-116 | 出雲国風土記 | 出雲国風土記 | primary | |
| IZM-117-131 | 出雲大社の歴史 | 古事記・日本書紀・延喜式・各遷宮記録・心御柱発掘報告 | primary + official + academic | |
| IZM-132-145 | 主要神社個別 | 各社社伝、出雲国風土記 | primary + official + local_tradition | |
| IZM-146-161 | 出雲系ネットワーク | 古事記・延喜式・近世国学・近代研究 | primary + academic | |

### 2.1 出雲編 出典強度分布

| レベル | 件数(概算) | 比率 |
|---|---|---|
| primary | 80 | 50% |
| official | 30 | 19% |
| academic | 35 | 22% |
| local_tradition | 12 | 7% |
| folklore | 2 | 1% |
| speculative | 2 | 1% |

→ **primary 中心の良好な構成**。近代研究(academic)が L2 仮説を支えており、speculative が極小なのは健全。

---

## 3. deity_master.tsv 30 件の出典強度

| ID範囲 | 主出典 | レベル |
|---|---|---|
| DEI-001 大国主 | 古事記・日本書紀・出雲国風土記・出雲国造神賀詞 | primary |
| DEI-002 スサノオ | 古事記・日本書紀・出雲国風土記 | primary |
| DEI-003 アマテラス | 古事記・日本書紀・延喜式 | primary |
| DEI-004 ツクヨミ | 古事記・日本書紀 | primary |
| DEI-005-006 イザナギ・イザナミ | 古事記・日本書紀 | primary |
| DEI-007-008 産霊神 | 古事記・日本書紀 | primary |
| DEI-009-014 出雲・大和神々 | 古事記・日本書紀・神賀詞 | primary |
| DEI-015 ニニギ・DEI-016 ヤマトタケル | 古事記・日本書紀 | primary |
| DEI-017-019 宗像三女神 | 古事記・日本書紀 | primary |
| DEI-020-023 出雲・越神々 | 古事記・日本書紀・各風土記 | primary |
| DEI-024 八束水臣津野・DEI-025 佐太大神 | 出雲国風土記 | primary |
| DEI-026-028 葛城・国譲り神々 | 古事記・日本書紀 | primary |
| DEI-029 八坂刀売 | 諏訪大社社伝・諸古文献 | official + local_tradition |
| DEI-030 牛頭天王 | 備後国風土記逸文・中世神道書 | primary + official |

### 3.1 deity_master 出典強度分布

| レベル | 件数 |
|---|---|
| primary | 28 |
| official | 2(主) |
| academic | 0 |
| local_tradition | 1(主) |
| folklore | 0 |
| speculative | 0 |

→ **primary 中心の理想的構成**。神格の根拠は基本的に一次史料で十分。

---

## 4. shrine_master.tsv 28 件の出典強度

| ID範囲 | 主出典 | レベル |
|---|---|---|
| SHR-001 出雲大社 | 古事記書紀+延喜式+現代社誌 | primary + official |
| SHR-002-003 伊勢神宮 | 日本書紀+延喜式+神宮社誌 | primary + official |
| SHR-004 出雲熊野 | 出雲国風土記+延喜式 | primary + official |
| SHR-005 紀伊熊野本宮 | 各社社伝+延喜式 | official + local_tradition |
| SHR-006 諏訪大社 | 諏訪大社社伝+延喜式 | official + local_tradition |
| SHR-007-008 鹿島・香取 | 各社社伝+常陸国風土記+延喜式 | primary + official |
| SHR-009 宗像大社 | 各社社伝+延喜式+発掘報告 | official + academic |
| SHR-010 大神神社 | 古事記書紀+延喜式 | primary + official |
| SHR-011 石上神宮 | 書紀+石上社伝+発掘報告 | primary + official + academic |
| SHR-012 春日大社 | 春日社伝+続日本紀 | primary + official |
| SHR-013-014 賀茂(山城) | 賀茂社家文書+延喜式 | official |
| SHR-015 住吉 | 住吉大社神代記+延喜式 | official + primary |
| SHR-016 宇佐神宮 | 宇佐宮御託宣集(中世)+延喜式 | official |
| SHR-017 八坂神社 | 八坂社伝+祇園社縁起 | official |
| SHR-018 氷川神社 | 氷川社伝+延喜式 | official |
| SHR-019 神田明神 | 神田明神社伝 | official |
| SHR-020-028 出雲系神社 | 各社社伝+出雲国風土記 | primary + official + local_tradition |

### 4.1 shrine_master 出典強度分布

| レベル | 件数 |
|---|---|
| primary + official 併用 | 17 |
| official 単独 | 8 |
| local_tradition 含む | 6(諏訪、出雲在来等) |
| academic 含む | 3(発掘記録) |
| speculative | 0 |

→ 神社の創建・由緒は **社伝(official)が主** であることを反映。primary は風土記登載社が中心。speculative なし良好。

---

## 5. hypothesis_master.tsv 8 件の出典強度

| ID | 仮説 | layer | 主出典 | レベル |
|---|---|---|---|---|
| HYP-001 縄文海進記憶 | L5 | 在野研究者 | speculative |
| HYP-002 ヤマタノオロチ製鉄民 | L4 | 谷川健一・小川光暘 | academic + speculative |
| HYP-003 出雲広域連合 | L2 | 渡辺貞幸・瀧音能之 | academic |
| HYP-004 国譲り政治史 | L2 | 津田左右吉・岡田精司・瀧音能之 | academic |
| HYP-005 大物主大国主同体 | L2 | 古事記+本居宣長 | primary + academic |
| HYP-006 翡翠ロード | L3 | 寺村光晴・藤田富士夫 | academic |
| HYP-007 スサノオ新羅渡来 | L4 | 書紀一書+近代神話学 | primary + speculative |
| HYP-008 神賀詞出雲側視点 | L1 | 近代研究の一般的解釈 | academic |

### 5.1 仮説層と出典強度の整合性

| layer | 期待される source level |
|---|---|
| L0 | primary |
| L1 | primary + academic |
| L2 | academic |
| L3 | academic + local_tradition |
| L4 | speculative + academic(議論あり) |
| L5 | speculative |

→ 現行 hypothesis_master 8 件は概ね整合。HYP-002 が L4 + academic という二重評価で良好。

---

## 6. 出典欠落の指摘(SRC_MISS)

| 対象 | 問題 | 修正提案 | 重要度 |
|---|---|---|---|
| relations_sample.tsv RLN-000005 | source_reference「太政官布告(明治4年)」だが布告号数なし | 「太政官布告 明治4年7月29日(神社の社号変更)」を明記 | 低 |
| 各 master の `notes` 内主張 | notes に書かれた論争・補足の出典が個別に明示されていない | notes 内主張に出典の括弧書きを推奨(例: 「(瀧音 2003)」) | 中 |
| IZM-029 中世スサノオ祭神化 | 出典「中世神道書(『塩冶系図』『出雲国造家文書』類)」と複数記載だが、具体的な出典文書の特定が弱い | 個別文書名(『塩冶判官系譜』『出雲国造家鬼神図』等)を明記 | 中 |
| DEI-029 八坂刀売 | 「諸古文献」が漠然 | 「『諏訪大明神絵詞』『信濃国式内社調査』」等を明記 | 中 |

---

## 7. 推奨出典機関リスト

別ファイル `06_recommended_sources.md` を参照(同一 issue で作成)。
