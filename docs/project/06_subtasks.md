# Subtask 分解パターン

各 Issue は **チェックリスト形式の Subtask** で内訳を持つ。Subtask は 30 分〜2 時間で完了する単位とする。Claude が長時間自律実行する際、各 Subtask 完了ごとに **進捗コメント** を残すのが推奨運用。

## 0. 共通 Subtask 雛形

ほぼ全ての Issue で適用される共通 Subtask:

```markdown
- [ ] 関連する既存ファイルを Read で全件確認
- [ ] スキーマ (`docs/schema/*`) の該当部分を再確認
- [ ] CLAUDE.md §3 のカラム定義を再確認
- [ ] 出典候補の選定 (一次史料を優先)
- [ ] TSV ヘッダー作成 (29 列遵守 or master 用必須カラム)
- [ ] 本体データの記述
- [ ] 出典欄を全行に記載
- [ ] 史実性レベル / 仮説レベルの付与
- [ ] 文字コード UTF-8、改行 LF を確認
- [ ] git diff 確認
- [ ] PR セルフレビュー
```

## 1. パターン A — 1 神社の DB 構築

### 例: 「ISE-02 内宮(皇大神宮)由緒・主祭神」

```markdown
- [ ] 内宮の主祭神(アマテラスオオミカミ)の社伝確認
- [ ] 別号(天照坐皇大御神)・神格カテゴリ整理
- [ ] 創建伝承(垂仁朝・倭姫巡幸)整理
- [ ] 古事記・日本書紀 該当箇所の記述差確認
- [ ] 延喜式神名帳・神宮儀式帳 該当箇所確認
- [ ] 皇大神宮儀式帳 編纂背景確認
- [ ] 中世の社格変動(明神大社→中近世)確認
- [ ] 近世・近代の式年遷宮の言及行追加
- [ ] 主祭神 1 行 + 社伝・由緒 6〜10 行を TSV 化
- [ ] master 候補の抽出メモ (deity, shrine, ritual, text)
- [ ] 表記ゆれ確認 (大日孁貴 / 天照大御神 等)
- [ ] PR セルフレビュー
```

## 2. パターン B — 1 氏族の系譜整理

### 例: 「ISE-06 度会氏 系譜・祭祀」

```markdown
- [ ] 度会氏の遠祖(天牟羅雲命/天日鷲命説)整理
- [ ] 中世度会神道の主要人物 (行忠・家行 等)
- [ ] 度会本系図・度会譜 確認
- [ ] 外宮への奉仕職譜
- [ ] 「神道五部書」との関係
- [ ] 中世以降の権力闘争(両宮論争での立場)
- [ ] 系譜の世代単位で TSV 行に分解
- [ ] master 候補の抽出 (clan, deity, text)
- [ ] 表記ゆれ確認 (度会・度合・渡会)
- [ ] PR セルフレビュー
```

## 3. パターン C — 1 神話エピソードの構造化

### 例: 「MST-MY-03 国譲り・天孫降臨」

```markdown
- [ ] 古事記版 国譲り 該当箇所の構造化
  - 関係 deity の列挙(大国主・タケミカヅチ・コトシロヌシ・タケミナカタ)
  - 場面の分割(使者派遣・諾否・幽事への退き・祭祀の請求)
- [ ] 書紀(本伝・第一〜九段一書)の異伝
- [ ] 出雲国造神賀詞 該当箇所
- [ ] 各文献の編纂年・編纂背景
- [ ] 異伝の論点(誰が国を譲ったか/どこで起きたか/見返り条件)
- [ ] 仮説候補(銅鐸祭祀終焉対応説、ヤマト王権進出説)
- [ ] myth_episode_master に主エピソード 1 行
- [ ] variant 表現を mentioned_in relation 複数で記録
- [ ] hypothesis 候補の抽出
- [ ] PR セルフレビュー
```

## 4. パターン D — relation 抽出 Issue

### 例: 「RLN-EN-04 海人系 enshrined_at 抽出」

```markdown
- [ ] deity_master から category=海神/海人系 の filter (DEI 一覧化)
- [ ] shrine_master から該当神社候補を全件抽出
- [ ] 各神社の主祭神を社伝で確認
- [ ] 主祭神は primary_deity_of, 配祀は secondary_deity_of 付与
- [ ] confidence_level の判定 (社伝確定→A、伝承不確定→C)
- [ ] hypothesis_layer 付与 (基本 L0、習合経由は L1+)
- [ ] source_reference 記載 (社伝 or 延喜式)
- [ ] valid_from / valid_until が必要な行 (祭神交代史) を抽出
- [ ] 重複検出 (同 source/type/target の有無)
- [ ] relations_enshrined_at_marine.tsv 出力
- [ ] PR セルフレビュー
```

## 5. パターン E — Master 投入 Issue

### 例: 「MST-DE-03 deity_master 海人系統合」

```markdown
- [ ] 出雲編・地方研究・海人編 (M2.12) で出現した deity 候補リストアップ
- [ ] 既存 deity_master.tsv との重複検査
- [ ] 重複は merged_into で統合(canonical_name 確定)
- [ ] 別名は aliases カラムへ
- [ ] parent_deity_ids / consort_deity_ids を埋める
- [ ] syncretism (本地仏など) を該当行に記録
- [ ] regional_variant 情報を埋める
- [ ] master_id を採番 (DEI-XXX)
- [ ] 必須カラム充足チェック
- [ ] PR セルフレビュー
```

## 6. パターン F — 監査 Issue(表記ゆれ)

### 例: 「AUD-NM-01 神名表記ゆれ監査」

```markdown
- [ ] deity_master を全件読み込み
- [ ] aliases を含む全表記を集約
- [ ] Unicode 正規化(NFC)で揺れ検出
- [ ] 別表記候補をスコア付け(編集距離 or 既知パターン)
- [ ] 候補ペアごとに統合可否を判定
- [ ] 統合する場合は merged_into 関係を発行
- [ ] レポート md 化 (`docs/audit/10_*.md`)
- [ ] 統合反映 PR
- [ ] Gemini 監査依頼コメント生成
```

## 7. パターン G — 監査 Issue(出典)

### 例: 「AUD-SR-02 日本書紀引用の出典監査」

```markdown
- [ ] 出典に「日本書紀」を含む全行を抽出
- [ ] 引用箇所(巻数・段落)が明示されているか確認
- [ ] 異伝(一書)の場合、第何の一書かが明示されているか
- [ ] 紀年(神代上下/神武〜)が妥当か
- [ ] 引用と本文の主張が乖離している行を検出
- [ ] 補強候補 (一次史料原文 URL 等) を提案
- [ ] 監査結果 md 化 + 修正 PR
```

## 8. パターン H — 文明解析 Issue(motif DB)

### 例: 「CIV-MO-01 神話モチーフ DB(issue #78)」

```markdown
- [ ] CLAUDE.md と docs/schema/ を再確認
- [ ] motif の定義(抽象パターン)を再確認
- [ ] 必須 40+ モチーフのカテゴリ分け
  (太陽神 / 海神 / 蛇神 / 鍛冶神 / 国譲り型 / 異界訪問型 ...)
- [ ] motif ごとに related_deities 抽出 (deity_master 参照)
- [ ] motif ごとに related_shrines 抽出
- [ ] motif ごとに related_regions 抽出
- [ ] motif ごとに earliest_sources 確認
- [ ] symbolic_meaning / ritual_meaning / political_meaning
- [ ] archaeological_possible_relation (例: 蛇神→銅鐸の蛇文)
- [ ] 200 行以上の TSV 化
- [ ] PR セルフレビュー
```

## 9. パターン I — Neo4j 投入 Issue

### 例: 「GR-NE-03 LOAD CSV パイプライン」

```markdown
- [ ] master TSV を staging dir にコピー
- [ ] tab → comma 変換 or LOAD CSV WITH FIELDTERMINATOR '\t'
- [ ] node_type ごとの CREATE CONSTRAINT 発行
- [ ] node ロード Cypher 全 13 パターン
- [ ] relation ロード Cypher (relation_type 大文字スネーク化)
- [ ] サンプル投入 (出雲編サブセット)
- [ ] count(*) で node 数・edge 数の検証
- [ ] 重複検出クエリ実行
- [ ] パイプラインスクリプト化 (`pipeline/load_neo4j.cypher`)
- [ ] README 追加
```

---

## 10. Subtask 設計の原則

1. **Subtask 1 つあたり 30 分〜2 時間**
2. **チェックボックス形式必須**(進捗の機械集計のため)
3. **可能な限り独立に進められる順序にする**(直列強制を避ける)
4. **末尾は必ず PR セルフレビュー**
5. **大規模 Subtask は更に内訳をネスト**:
   ```markdown
   - [ ] 主祭神確認
     - [ ] 公式社伝
     - [ ] 延喜式
     - [ ] 中世記録
   ```
6. **「考える」「検討する」のような曖昧 Subtask 禁止** — 必ず動詞を含む具体的アクション
7. **Subtask 完了 = TSV/Markdown のどこに何が増えたかが説明できる状態**
