# Issue カタログ — 主要 Issue 一覧

各 Epic から派生する Issue を **着手しやすい粒度** で列挙する。網羅ではなく **核となる骨格** 。実運用ではここから派生子 Issue が増える。

## 0. 凡例

```
ID | Title | Effort | Priority | Phase | Dep | Output
```

| 略 | 意味 |
|---|---|
| Effort | S(2-3h) / M(4-5h) / L(6-8h) |
| Priority | P0(必須最優先)/ P1 / P2 / P3 |
| Dep | 前提 Issue |

---

## A. 地域編 Issues(EPIC-02〜EPIC-10, EPIC-15〜EPIC-17)

### A.1 伊勢編(EPIC-02)— 12 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| ISE-01 | 伊勢編 基盤(命名規程・対象スコープ確定) | S | P0 | 2 | M1.2 |
| ISE-02 | 内宮(皇大神宮) 由緒・主祭神 | M | P0 | 2 | ISE-01 |
| ISE-03 | 外宮(豊受大神宮) 由緒・主祭神 | M | P0 | 2 | ISE-01 |
| ISE-04 | 別宮 14 社 | M | P1 | 2 | ISE-02,03 |
| ISE-05 | 摂社・末社 | L | P1 | 2 | ISE-04 |
| ISE-06 | 度会氏 系譜・祭祀 | M | P1 | 2 | ISE-03 |
| ISE-07 | 荒木田氏 系譜・祭祀 | M | P1 | 2 | ISE-02 |
| ISE-08 | 斎宮制度・歴代斎王 | M | P1 | 2 | ISE-01 |
| ISE-09 | 式年遷宮 史 | M | P2 | 2 | ISE-02,03 |
| ISE-10 | 中世伊勢神道(度会神道) | M | P2 | 2 | ISE-06 |
| ISE-11 | 両宮論争 hypothesis 化 | M | P2 | 2 | ISE-10 |
| ISE-12 | master 投入 + relation 一括化 | L | P0 | 2 | ISE-01〜11 |

### A.2 諏訪編(EPIC-03)— 11 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| SUW-01 | 基盤(命名・スコープ) | S | P0 | 2 | M1.2 |
| SUW-02 | 上社本宮・上社前宮 | M | P0 | 2 | SUW-01 |
| SUW-03 | 下社秋宮・下社春宮 | M | P0 | 2 | SUW-01 |
| SUW-04 | タケミナカタ 神格・国譲り敗北神話 | M | P0 | 2 | SUW-01 |
| SUW-05 | 八坂刀売・諏訪信仰の女神性 | M | P1 | 2 | SUW-04 |
| SUW-06 | ミシャグジ・洩矢神(縄文系祭祀) | L | P1 | 2 | SUW-01 |
| SUW-07 | 守矢氏(神長官)系譜 | M | P1 | 2 | SUW-06 |
| SUW-08 | 諏訪氏(大祝)系譜 | M | P1 | 2 | SUW-04 |
| SUW-09 | 御柱祭 / 御頭祭(鹿頭) / 蛙狩神事 | M | P1 | 2 | SUW-02 |
| SUW-10 | 諏訪信仰の全国分布(諏訪神社 5000+) | L | P2 | 2 | SUW-04 |
| SUW-11 | master 投入 + relation 一括化 | L | P0 | 2 | SUW-01〜10 |

### A.3 鹿島・香取編(EPIC-04)— 9 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| KSK-01 | 基盤 | S | P0 | 2 | M1.2 |
| KSK-02 | 鹿島神宮 由緒・タケミカヅチ | M | P0 | 2 | KSK-01 |
| KSK-03 | 香取神宮 由緒・経津主 | M | P0 | 2 | KSK-01 |
| KSK-04 | 息栖神社・東国三社の祭祀構造 | M | P1 | 2 | KSK-02,03 |
| KSK-05 | 中臣鹿島・卜部 系譜 | M | P1 | 2 | KSK-02 |
| KSK-06 | 国譲り神話における鹿島香取の役割 | M | P1 | 2 | KSK-02 |
| KSK-07 | 対蝦夷 国境祭祀 | M | P2 | 2 | KSK-02 |
| KSK-08 | 要石・地震信仰 | S | P2 | 2 | KSK-02 |
| KSK-09 | master 投入 + relation 一括化 | L | P0 | 2 | KSK-01〜08 |

### A.4 宗像編(EPIC-05)— 9 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| MNK-01 | 基盤 | S | P0 | 2 | M1.2 |
| MNK-02 | 沖津宮(沖ノ島) | L | P0 | 2 | MNK-01 |
| MNK-03 | 中津宮(大島) | M | P0 | 2 | MNK-01 |
| MNK-04 | 辺津宮(田島) | M | P0 | 2 | MNK-01 |
| MNK-05 | 宗像三女神 神格 | M | P0 | 2 | MNK-01 |
| MNK-06 | 宗像氏(胸形君) 系譜 | M | P1 | 2 | MNK-05 |
| MNK-07 | 沖ノ島祭祀遺跡(4-9 世紀) | L | P1 | 2 | MNK-02 |
| MNK-08 | 海北道中・対朝鮮半島航路 | M | P2 | 2 | MNK-05 |
| MNK-09 | master 投入 + relation 一括化 | L | P0 | 2 | MNK-01〜08 |

### A.5 熊野編(EPIC-06)— 12 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| KMN-01 | 基盤 | S | P0 | 2 | M1.2 |
| KMN-02 | 本宮大社 | M | P0 | 2 | KMN-01 |
| KMN-03 | 速玉大社 | M | P0 | 2 | KMN-01 |
| KMN-04 | 那智大社 | M | P0 | 2 | KMN-01 |
| KMN-05 | 熊野権現・本地仏(阿弥陀/薬師/千手) | M | P0 | 2 | KMN-02-04 |
| KMN-06 | 修験道 役小角 | M | P1 | 2 | KMN-01 |
| KMN-07 | 熊野詣・院政期の権力構造 | M | P1 | 2 | KMN-02 |
| KMN-08 | 那智の滝・補陀洛信仰 | M | P1 | 2 | KMN-04 |
| KMN-09 | 八咫烏・神武東征における役割 | M | P1 | 2 | KMN-01 |
| KMN-10 | 熊野信仰の全国分布(王子・新宮) | L | P2 | 2 | KMN-05 |
| KMN-11 | 熊野修験の地方拠点 | L | P2 | 2 | KMN-06 |
| KMN-12 | master 投入 + relation 一括化 | L | P0 | 2 | KMN-01〜11 |

### A.6 石上編(EPIC-07)— 8 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| ISO-01 | 基盤 | S | P0 | 2 | M1.2 |
| ISO-02 | 石上神宮 由緒・布都御魂 | M | P0 | 2 | ISO-01 |
| ISO-03 | 物部氏 系譜・本拠地 | L | P0 | 2 | ISO-02 |
| ISO-04 | 十種神宝・フルの祭祀 | M | P1 | 2 | ISO-02 |
| ISO-05 | ニギハヤヒ・先代旧事本紀 | M | P1 | 2 | ISO-03 |
| ISO-06 | 物部 vs 蘇我(丁未の乱) | M | P1 | 2 | ISO-03 |
| ISO-07 | 物部分流(穂積・采女・若桜部) | M | P2 | 2 | ISO-03 |
| ISO-08 | master 投入 + relation 一括化 | L | P0 | 2 | ISO-01〜07 |

### A.7 三輪編(EPIC-08)— 9 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| MIW-01 | 基盤 | S | P0 | 2 | M1.2 |
| MIW-02 | 大神神社 由緒・大物主 | M | P0 | 2 | MIW-01 |
| MIW-03 | 三輪山禁足地・神山祭祀 | M | P0 | 2 | MIW-02 |
| MIW-04 | 大田田根子・崇神朝祭祀改革 | M | P1 | 2 | MIW-02 |
| MIW-05 | 三輪氏(大三輪・神部) | M | P1 | 2 | MIW-04 |
| MIW-06 | 賀茂氏(高鴨・葛城) | M | P1 | 2 | MIW-05 |
| MIW-07 | 纒向遺跡・箸墓 | L | P1 | 2 | MIW-03 |
| MIW-08 | 大物主 = 大国主論争 | M | P2 | 2 | MIW-02 |
| MIW-09 | master 投入 + relation 一括化 | L | P0 | 2 | MIW-01〜08 |

### A.8 宇佐編(EPIC-09)— 9 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| USA-01 | 基盤 | S | P0 | 2 | M1.2 |
| USA-02 | 宇佐神宮 由緒 | M | P0 | 2 | USA-01 |
| USA-03 | 八幡神 神格・応神習合 | M | P0 | 2 | USA-02 |
| USA-04 | 比売大神(宗像三女神 or 卑弥呼?) | M | P1 | 2 | USA-02 |
| USA-05 | 神功皇后・三韓征伐神話 | M | P1 | 2 | USA-03 |
| USA-06 | 宇佐氏・辛島氏・大神氏 | M | P1 | 2 | USA-02 |
| USA-07 | 宇佐託宣(道鏡事件等) | M | P2 | 2 | USA-02 |
| USA-08 | 神仏習合発祥 / 放生会 | M | P2 | 2 | USA-03 |
| USA-09 | master 投入 + relation 一括化 | L | P0 | 2 | USA-01〜08 |

### A.9 春日編(EPIC-10)— 8 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| KSG-01 | 基盤 | S | P0 | 2 | M1.2 |
| KSG-02 | 春日大社 由緒 | M | P0 | 2 | KSG-01 |
| KSG-03 | 四柱(タケミカヅチ・経津主・天児屋根・比売) | M | P0 | 2 | KSG-02 |
| KSG-04 | 藤原氏氏神化のプロセス | M | P0 | 2 | KSG-03 |
| KSG-05 | 中臣氏譜 | M | P1 | 2 | KSG-04 |
| KSG-06 | 興福寺 + 春日権現の習合 | M | P1 | 2 | KSG-02 |
| KSG-07 | 春日信仰の全国分布 | M | P2 | 2 | KSG-02 |
| KSG-08 | master 投入 + relation 一括化 | L | P0 | 2 | KSG-01〜07 |

### A.10 海人編(EPIC-11)— 10 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| AMA-01 | 基盤 | S | P0 | 2 | M1.2 |
| AMA-02 | 阿曇氏(志賀海・安曇野) | M | P0 | 2 | AMA-01 |
| AMA-03 | 住吉(住吉三神・住吉氏) | M | P0 | 2 | AMA-01 |
| AMA-04 | 宗像氏(EPIC-05 と連携) | M | P1 | 2 | MNK-09 |
| AMA-05 | 海部氏(籠神社・元伊勢) | M | P0 | 2 | AMA-01 |
| AMA-06 | 尾張氏(熱田・国造) | M | P0 | 2 | AMA-01 |
| AMA-07 | 隼人(火闌降・隼人塚) | M | P1 | 2 | AMA-01 |
| AMA-08 | 安曇磯良・海神宮神話 | M | P1 | 2 | AMA-02 |
| AMA-09 | 渡来航路と海人連合(対韓・対呉越) | L | P2 | 2 | AMA-02-06 |
| AMA-10 | master 投入 + relation 一括化 | L | P0 | 2 | AMA-01〜09 |

### A.11 修験編(EPIC-12)— 9 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| SHU-01 | 基盤 | S | P0 | 2 | M1.2 |
| SHU-02 | 役小角 史伝 | M | P0 | 2 | SHU-01 |
| SHU-03 | 大峰山系(吉野・金峯山・蔵王権現) | M | P0 | 2 | SHU-02 |
| SHU-04 | 出羽三山(羽黒・月山・湯殿) | M | P0 | 2 | SHU-01 |
| SHU-05 | 白山(白山妙理) | M | P1 | 2 | SHU-01 |
| SHU-06 | 富士山(富士浅間・富士信仰) | M | P1 | 2 | SHU-01 |
| SHU-07 | 修験各派(本山派・当山派) | M | P1 | 2 | SHU-02 |
| SHU-08 | 山伏文化と地方コミュニティ | L | P2 | 2 | SHU-07 |
| SHU-09 | master 投入 + relation 一括化 | L | P0 | 2 | SHU-01〜08 |

### A.12 東北編(EPIC-15)— 10 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| TOH-01 | 基盤 | S | P0 | 2 | M1.2 |
| TOH-02 | アラハバキ伝承 | M | P0 | 2 | TOH-01 |
| TOH-03 | 岩木山 / 岩木山神社 | M | P1 | 2 | TOH-01 |
| TOH-04 | 月山 / 月読信仰 | M | P1 | 2 | SHU-04 |
| TOH-05 | 塩竈神社・塩土老翁 | M | P1 | 2 | TOH-01 |
| TOH-06 | 蝦夷 / 大墓公阿弖流為 | M | P1 | 2 | TOH-01 |
| TOH-07 | 東北の熊野系・諏訪系分布 | M | P2 | 2 | KMN-10, SUW-10 |
| TOH-08 | 三内丸山・縄文祭祀の記憶? | L | P2 | 2-4 | TOH-01 |
| TOH-09 | 安日彦・長髄彦の東北流説 | M | P3 | 4 | ISO-05 |
| TOH-10 | master 投入 + relation 一括化 | L | P0 | 2 | TOH-01〜09 |

### A.13 九州編(EPIC-16)— 10 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| KYU-01 | 基盤 | S | P0 | 2 | M1.2 |
| KYU-02 | 阿蘇神社・健磐龍命・阿蘇氏 | L | P0 | 2 | KYU-01 |
| KYU-03 | 霧島神宮・ニニギ・コノハナサクヤ | M | P0 | 2 | KYU-01 |
| KYU-04 | 高千穂・天孫降臨地伝承 | M | P0 | 2 | KYU-03 |
| KYU-05 | 隼人・熊襲 | M | P1 | 2 | AMA-07 |
| KYU-06 | 火山祭祀(阿蘇・桜島・霧島) | M | P1 | 2 | KYU-02 |
| KYU-07 | 九州古代豪族(筑紫・火・肥) | M | P1 | 2 | KYU-01 |
| KYU-08 | 邪馬台国候補地論(九州説の整理) | L | P2 | 4 | KYU-01 |
| KYU-09 | 九州の神仏習合(英彦山等) | M | P2 | 2 | KYU-01 |
| KYU-10 | master 投入 + relation 一括化 | L | P0 | 2 | KYU-01〜09 |

### A.14 琉球編(EPIC-17)— 7 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| OKI-01 | 基盤 | S | P0 | 2 | M1.2 |
| OKI-02 | アマミキヨ神話 | M | P0 | 2 | OKI-01 |
| OKI-03 | ニライカナイ信仰 | M | P0 | 2 | OKI-01 |
| OKI-04 | 御嶽信仰・斎場御嶽 | M | P0 | 2 | OKI-01 |
| OKI-05 | ノロ・ユタ・聞得大君 | M | P1 | 2 | OKI-04 |
| OKI-06 | 首里王朝祭祀 | M | P2 | 2 | OKI-01 |
| OKI-07 | master 投入 + relation 一括化 | M | P0 | 2 | OKI-01〜06 |

---

## B. ネットワーク Issues(EPIC-13〜EPIC-14)

### B.1 製鉄ネットワーク(EPIC-13)— 7 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| MET-01 | 基盤(対象スコープ) | S | P0 | 2 | M1.2 |
| MET-02 | 奥出雲製鉄(踏鞴・たたら) | L | P0 | 2 | MET-01 |
| MET-03 | 吉備製鉄(古代鍛冶遺跡) | M | P1 | 2 | MET-01 |
| MET-04 | 九州製鉄(対馬・筑紫) | M | P1 | 2 | MET-01 |
| MET-05 | 鍛冶神(金山彦・天目一箇) | M | P0 | 2 | MET-01 |
| MET-06 | 渡来系製鉄技術(秦氏 等) | M | P1 | 2 | MET-01 |
| MET-07 | master 投入 + relation 一括化 | L | P0 | 2 | MET-01〜06 |

### B.2 渡来系氏族(EPIC-14)— 8 Issue

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| TOR-01 | 基盤 | S | P0 | 2 | M1.2 |
| TOR-02 | 秦氏(伏見稲荷・松尾・広隆寺) | L | P0 | 2 | TOR-01 |
| TOR-03 | 東漢氏 | M | P1 | 2 | TOR-01 |
| TOR-04 | 西文氏 | M | P1 | 2 | TOR-01 |
| TOR-05 | 百済王氏 | M | P1 | 2 | TOR-01 |
| TOR-06 | 高麗・新羅系 | M | P2 | 2 | TOR-01 |
| TOR-07 | 韓神・園神(渡来系祭祀) | M | P2 | 2 | TOR-02 |
| TOR-08 | master 投入 + relation 一括化 | L | P0 | 2 | TOR-01〜07 |

---

## C. Master 構築 Issues(EPIC-18〜EPIC-23, EPIC-24)

→ 詳細は `08_master_db_issues.md` 参照(本ファイルでは骨格のみ)

| ID | Title | Effort | Priority | Phase | Dep |
|---|---|---|---|---|---|
| MST-DE-01 | deity_master スキーマ最終確認 | S | P0 | 2 | M1.2 |
| MST-DE-02 | deity_master 出雲・伊勢・諏訪統合 | L | P0 | 2 | M2.1, M2.3, M2.4 |
| MST-DE-03 | deity_master 海人系統合 | L | P0 | 2 | M2.12 |
| MST-DE-04 | deity_master 山岳・修験系統合 | L | P1 | 2 | M2.13 |
| MST-DE-05 | deity_master 八幡・春日・熊野系統合 | L | P1 | 2 | M2.7-2.11 |
| MST-DE-06 | deity_master 渡来系統合 | M | P1 | 2 | TOR-08 |
| MST-DE-07 | deity_master 表記ゆれ統合(merged_into) | L | P0 | 2 | MST-DE-02-06 |
| MST-SH-01 | shrine_master 式内社網羅(2861 社の核 800) | L | P0 | 2 | MST-DE-* |
| MST-SH-02 | shrine_master 中世社・近世社追加 | L | P1 | 2 | MST-SH-01 |
| MST-CL-01 | clan_master 中央豪族 50+ | M | P0 | 2 | M2.* |
| MST-CL-02 | clan_master 地方豪族 100+ | L | P0 | 2 | MST-CL-01 |
| MST-CL-03 | clan_master 祭祀・技術氏族 50+ | M | P1 | 2 | MST-CL-02 |
| MST-CL-04 | clan_master 渡来氏族 50+ | M | P1 | 2 | TOR-08 |
| MST-EM-01 | emperor_master 神武〜継体 | M | P0 | 2 | M1.2 |
| MST-EM-02 | emperor_master 継体〜桓武 | L | P0 | 2 | MST-EM-01 |
| MST-EM-03 | emperor_master 桓武〜後鳥羽 | L | P1 | 2 | MST-EM-02 |
| MST-MY-01 | myth_episode_master 国生み・神生み | M | P0 | 2 | M1.2 |
| MST-MY-02 | myth_episode_master 高天原系 | L | P0 | 2 | MST-MY-01 |
| MST-MY-03 | myth_episode_master 国譲り・天孫降臨 | L | P0 | 2 | MST-MY-02 |
| MST-MY-04 | myth_episode_master 神武東征 | M | P0 | 2 | MST-MY-03 |
| MST-MY-05 | myth_episode_master 崇神〜景行(三輪・ヤマトタケル) | L | P1 | 2 | MST-MY-04 |
| MST-MY-06 | myth_episode_master 神功・応神 | M | P1 | 2 | MST-MY-05 |
| MST-EV-01 | event_master 上代史(神賀詞・大化改新 等) | M | P1 | 2 | MST-EM-01-02 |
| MST-EV-02 | event_master 中世(造営・遷宮・社格論争) | M | P1 | 2 | MST-EV-01 |
| MST-ST-01 | site_master 縄文 30+ | M | P1 | 2 | M1.2 |
| MST-ST-02 | site_master 弥生・古墳 50+ | L | P1 | 2 | MST-ST-01 |
| MST-AR-01 | artifact_master 銅鐸・銅剣・銅矛 | M | P1 | 2 | MST-ST-02 |
| MST-AR-02 | artifact_master 鏡・勾玉・神宝 | M | P1 | 2 | MST-AR-01 |
| MST-RT-01 | ritual_master 各地の主要祭事 100+ | L | P1 | 2 | M2.* |
| MST-RG-01 | region_master 古代国 + 主要郡 200+ | M | P0 | 2 | M1.2 |
| MST-TX-01 | text_master 一次史料 30+ | M | P0 | 2 | M1.2 |
| MST-TX-02 | text_master 中世神道書 30+ | M | P1 | 2 | MST-TX-01 |
| MST-TT-01 | title_master 神格カテゴリ・社格 50+ | M | P2 | 2 | M1.2 |
| MST-HY-01 | hypothesis_master 学術仮説整理 | L | P1 | 2-4 | M2.* |
| MST-HY-02 | hypothesis_master 縄文記憶仮説 | L | P2 | 4 | issue#82 |
| MST-HY-03 | hypothesis_master 大胆仮説整理(L4-L5) | L | P3 | 4 | MST-HY-01,02 |

---

## D. Relation 生成 Issues(EPIC-26)

→ 詳細は `07_relation_issues.md` 参照(本ファイルでは骨格のみ)

| ID | Title | Effort | Priority | Phase |
|---|---|---|---|---|
| RLN-EN-01〜08 | enshrined_at 系(地域別 8 分割) | L | P0 | 3 |
| RLN-MI-01〜06 | mentioned_in 系(出典別 6 分割) | L | P0 | 3 |
| RLN-PA-01〜04 | parent_of / married_to / sibling_of | M | P0 | 3 |
| RLN-DE-01〜04 | descended_from / ancestor_deity_of | M | P0 | 3 |
| RLN-SY-01〜04 | syncretized_with(神仏習合) | L | P1 | 3 |
| RLN-SA-01〜03 | same_as / has_alias / regional_variant_of | M | P1 | 3 |
| RLN-CO-01〜04 | controlled_by / ruled / served | M | P1 | 3 |
| RLN-PA-05〜08 | participated_in / occurred_in | M | P0 | 3 |
| RLN-AL-01〜04 | archaeologically_linked | M | P1 | 3 |
| RLN-PE-01〜03 | performed_at / reenacts | M | P1 | 3 |
| RLN-HY-01〜03 | supports / contradicts | M | P2 | 3-4 |

---

## E. 監査 Issues(EPIC-29〜EPIC-30)

→ 詳細は `09_audit_issues.md` 参照

| ID | Title | Effort | Priority | Phase |
|---|---|---|---|---|
| AUD-NM-01〜05 | 表記ゆれ監査(神/神社/氏族/地名/書名) | M | P0 | 4 |
| AUD-SR-01〜04 | 出典監査(古事記/書紀/風土記/延喜式) | M | P0 | 4 |
| AUD-AS-01〜03 | 断定監査(「である」「とされる」検出) | M | P0 | 4 |
| AUD-CB-01〜02 | 中央偏重監査 | M | P1 | 4 |
| AUD-LC-01〜02 | 地方軽視監査 | M | P1 | 4 |
| AUD-RL-01〜03 | relation 整合性監査 | M | P0 | 4 |
| AUD-GM-01〜N | Gemini 反射監査(各 milestone 完了時) | M | P1 | 4 |

---

## F. 文明解析 Issues(EPIC-25, EPIC-28)

| ID | Title | Effort | Priority | Phase | 状態 |
|---|---|---|---|---|---|
| CIV-MO-01 | 神話モチーフ DB 200+ | L | P0 | 2-3 | issue#78 |
| CIV-MO-02 | モチーフ relation 500+ | L | P0 | 2-3 | issue#79 |
| CIV-SK-01 | 9 地域祭祀圏解析 | L | P1 | 2-3 | issue#80 |
| CIV-NW-01 | 海上/山岳/製鉄ネットワーク統合 | L | P1 | 2-3 | issue#81 |
| CIV-JM-01 | 縄文記憶仮説 + 中央/地方 | L | P2 | 4 | issue#82 |
| CIV-KG-01 | 知識グラフ最終構造 | L | P0 | 5 | issue#83 |

---

## G. グラフ DB Issues(EPIC-31〜EPIC-32)

→ 詳細は `10_graphdb_neo4j.md` 参照

| ID | Title | Effort | Priority | Phase |
|---|---|---|---|---|
| GR-NE-01 | Neo4j ラベル・relationship type 写像表 | M | P0 | 5 |
| GR-NE-02 | Neo4j 制約・インデックス Cypher | M | P0 | 5 |
| GR-NE-03 | LOAD CSV パイプライン | L | P0 | 5 |
| GR-NE-04 | 投入テスト(出雲編サブセット) | M | P0 | 5 |
| GR-NE-05 | 全 master 投入 | L | P0 | 5 |
| GR-NE-06 | 全 relation 投入 | L | P0 | 5 |
| GR-VS-01 | 系譜図 可視化 | M | P1 | 5 |
| GR-VS-02 | 神社ネットワーク 可視化 | M | P1 | 5 |
| GR-VS-03 | 神話異伝 可視化 | M | P1 | 5 |
| GR-EX-01 | JSON-LD エクスポート | M | P2 | 5 |
| GR-EX-02 | Wikidata QID 突合 | L | P2 | 5 |

---

## 集計

| カテゴリ | Issue 数 |
|---|---|
| 地域編(A) | 約 130 |
| ネットワーク(B) | 約 15 |
| Master(C) | 約 30 |
| Relation(D) | 約 50 |
| 監査(E) | 約 25 |
| 文明解析(F) | 6(既存)+α |
| グラフ DB(G) | 約 11 |
| **合計** | **約 270 Issue** |

→ 1 Issue 平均 5h と仮定すると 約 1350h(= 約 170 営業日)。Claude を並行 4 セッションで稼働させれば実質 40〜50 営業日(約 2-3 ヶ月)で Phase 2-3 のラフ完了が見える。
