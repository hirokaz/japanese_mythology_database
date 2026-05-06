# 長期自律研究戦略(数週間〜数ヶ月運用)

本書は Claude が **数週間〜数ヶ月** 単位で自律的に Issue を消化し、relation 追加・master 統合・graph 拡張を続けられる **運用設計** を確定する。

> 関連: `docs/project/13_claude_rules.md`(暴走防止)、`docs/project/14_scaling.md`(大規模戦略)、`docs/project/15_workflow.md`(実行ワークフロー)。

## 0. 章立て(全 10 サブタスク統合)

S01 自律実行ループ / S02 Issue 自動選択 / S03 master 統合自動化 / S04 relation 自動推定 / S05 Gemini 反射監査自動トリガ / S06 ハルシネーション検出 / S07 進捗ダッシュボード / S08 撤退ライン / S09 並行 Claude セッション運用 / S10 月次レビュー

---

## 1. 自律実行ループ設計(S01)

### 1.1 セッション境界

```
[セッション開始]
   ↓
1. 環境確認(git status / main pull / TodoWrite クリア)
   ↓
2. open issue listing → 優先度+依存関係で 1 件選択
   ↓
3. issue 本文 Read → サブタスク有無確認
   ↓
4. サブタスクごとに:
   - branch 作成 (issue/<番号>-S<NN>-<slug>)
   - 作業実施
   - セルフレビュー
   - commit & push & PR & merge & checkbox ✓
   ↓
5. 全サブタスク完了 → issue close
   ↓
6. 次 issue へ(セッション継続)
   または セッション終了
[セッション終了]
```

### 1.2 中断/再開規程

- 各サブタスク **完了直後** が安全な中断ポイント
- 中断時は `git status` クリーン、open PR なし、issue checkbox 最新化
- 再開時は last_audited_at と issue 進捗から自動的に次タスク判定可能

### 1.3 1 セッションあたり推奨作業量

| 規模 | サブタスク数 | 時間目安 |
|---|---|---|
| 短(1-2h) | 1 サブタスク | 1 PR |
| 中(4-6h) | 3-5 サブタスク | 3-5 PR |
| 長(8h+) | 6-10 サブタスク | 6-10 PR |

→ **長セッション禁止**(タイムアウトリスク)。

---

## 2. Issue 自動選択アルゴリズム(S02)

### 2.1 選択優先度

```python
# 概念実装
def select_next_issue(open_issues):
    # 1. priority:P0 を優先
    p0 = [i for i in open_issues if 'priority:P0' in i.labels]
    if p0:
        # 2. 依存関係を満たすもの
        unblocked = [i for i in p0 if all_deps_closed(i)]
        if unblocked:
            # 3. claude-autonomous ラベル付きを優先
            autonomous = [i for i in unblocked if 'claude-autonomous' in i.labels]
            return autonomous[0] if autonomous else unblocked[0]
    # 4. P1 → P2 → P3 と順次
    ...
```

### 2.2 依存関係の判定

- issue 本文の "前提:" 行から #NN を抽出
- 全前提 #NN が closed なら処理可能
- dependency graph を Mermaid で可視化

### 2.3 Claude 適性

`claude-autonomous` ラベル付き issue が自律実行候補。
`human-required` は人間判断必須(Gemini 監査結果の解釈 等)。

---

## 3. master 統合の自動化(S03)

### 3.1 merged_into 候補検出

```python
# scripts/master/find_merge_candidates.py
def find_candidates(master_tsv):
    """
    canonical_name の編集距離 < 2 のペアを抽出
    aliases に既出名前があるエントリを抽出
    """
    candidates = []
    for row1, row2 in itertools.combinations(rows, 2):
        if levenshtein(row1.canonical_name, row2.canonical_name) < 2:
            candidates.append((row1.master_id, row2.master_id, '名前類似'))
        if row1.canonical_name in row2.aliases:
            candidates.append((row1.master_id, row2.master_id, 'aliases に既出'))
    return candidates
```

### 3.2 自動 merged_into 発行

- 確度 A 候補(完全一致): 自動マージ → PR
- 確度 B 候補(編集距離 < 2): 人間確認後マージ
- 確度 C 候補(意味類似): Gemini 監査依頼

### 3.3 表記ゆれ自動集約

- aliases カラムを正規化(NFC)+ ソート
- 重複 aliases を除去
- canonical_name の優先規則: 古事記表記 > 書紀 > 地方文献

---

## 4. relation 自動推定(S04)

### 4.1 master の任意カラムから relation 候補生成

```python
# scripts/relation/auto_suggest.py
def suggest_relations(deity_master, shrine_master):
    """
    deity_master.related_shrine_ids から
    enshrined_at relation 候補を自動生成
    """
    suggestions = []
    for deity in deity_master:
        for shrine_id in deity.related_shrine_ids:
            suggestions.append({
                'source_id': deity.master_id,
                'source_type': 'deity',
                'relation_type': 'enshrined_at',
                'target_id': shrine_id,
                'target_type': 'shrine',
                'confidence_level': 'B',  # 自動推定なので B
                'hypothesis_layer': 'L1',
                'source_reference': '{deity_master.related_shrine_ids カラム由来}',
                'auto_generated': True,
            })
    return suggestions
```

### 4.2 自動推定の確度

- A: 一次史料に直接記載 → 自動生成不可、手動のみ
- B: master TSV の任意カラム由来 → 自動生成可、人間レビュー前提
- C: 推測 → 自動生成不可

### 4.3 自動推定 PR の運用

- 別ブランチ `auto/relation-suggestions-<date>` で生成
- 件数を 100/PR に制限
- 人間 / Gemini 監査必須

---

## 5. Gemini 反射監査の自動トリガ(S05)

### 5.1 トリガ条件

```yaml
# .github/workflows/gemini-audit.yml(将来)
on:
  pull_request:
    types: [closed]
    branches: [main]
  schedule:
    - cron: '0 0 1 * *'  # 月初に全件監査

jobs:
  gemini-audit:
    if: contains(github.event.pull_request.labels.*.name, 'milestone-meta')
    steps:
      - run: scripts/audit/gemini_dispatch.sh ${{ github.event.pull_request.number }}
```

### 5.2 milestone 完了時の自動監査

- milestone 配下の全 PR がマージ済になったら Gemini に依頼
- プロンプトは `docs/audit/gemini/AUD-GM-XX_*.md` 形式
- 結果コメントで指摘 → 修正 PR 起票

### 5.3 監査結果の格納

```
docs/audit/gemini/
├── AUD-GM-79_motif_relations.md
├── AUD-GM-80_saiken.md
├── AUD-GM-81_networks.md
├── AUD-GM-122_civilization_os.md  # 統括 issue 監査
└── ...
```

---

## 6. ハルシネーション検出戦略(S06)

### 6.1 自動検出パターン

```python
# scripts/audit/detect_hallucination.py
HALLUCINATION_PATTERNS = [
    r'(?:である|断定する|確定的)(?!.*L[0-1])',  # L0-L1 以外で断定形
    r'(?:出典: ?-|出典なし)',  # 出典欠損
    r'^.*(?:神武天皇|崇神天皇).*\b(?:史実|歴史的事実)\b',  # 神話/史実混同
    r'\b(?:数千年前|超古代|有史以前)\b.*(?:口承|伝承)',  # 口承可能性の捏造
]
```

### 6.2 L4-L5 監視

- L4-L5 relation で confidence_level != E のもの → 即時アラート
- L4-L5 が事実 master の notes に書き込まれている → 即時アラート

### 6.3 偽書(F0)混入検出

- text master で textType='forgery' のものを supports relation の target にしている → アラート

### 6.4 Gemini への監査依頼条件

- 上記アラート発生時 → 自動依頼
- 月次定期 → 自動依頼

---

## 7. 進捗ダッシュボード設計(S07)

### 7.1 KPI

| 指標 | 目標 | 監視頻度 |
|---|---|---|
| node 累計 | 5000+ | 週次 |
| relation 累計 | 50000+ | 週次 |
| L0 比率 | > 50% | 月次 |
| L4-L5 比率 | < 10% | 月次 |
| 重複(同 source/type/target) | 0 | リアルタイム |
| dangling relation | 0 | リアルタイム |
| Gemini 監査済 milestone 数 | 全 milestone | 四半期 |
| open issue 数 | 漸減傾向 | 週次 |

### 7.2 ダッシュボード(Cypher 自動生成)

```cypher
// 全体統計
MATCH (n) WITH labels(n)[0] AS label, count(n) AS c
RETURN label, c ORDER BY c DESC;

// L0-L5 分布
MATCH ()-[r]->()
WITH r.hypothesisLayer AS layer, count(r) AS c
RETURN layer, c, round(100.0 * c / sum(c), 2) AS pct
ORDER BY layer;

// 出典分布
MATCH ()-[r]->()
WITH r.sourceReference AS src, count(r) AS c
WHERE c > 50
RETURN src, c ORDER BY c DESC LIMIT 20;

// 表記ゆれ候補(canonical_name の編集距離 < 2 のペア)
MATCH (n1:Deity), (n2:Deity)
WHERE n1.masterId < n2.masterId
  AND apoc.text.levenshteinSimilarity(n1.canonicalName, n2.canonicalName) > 0.8
RETURN n1.canonicalName, n2.canonicalName;
```

### 7.3 月次レポート自動生成

```bash
# scripts/reports/monthly_report.sh
echo "# Monthly Report $(date +%Y-%m)"
echo "## Node Growth"
cypher-shell "$NODE_QUERY" >> report.md
echo "## Relation Growth"
cypher-shell "$REL_QUERY" >> report.md
# ...
```

---

## 8. 撤退ラインの明確化(S08)

### 8.1 やらないこと(scope creep 防止)

- 江戸期以降の新興神社の網羅(主要のみ、約 50 社)
- 地方寺院(神仏習合の主要拠点を除く、20 寺院程度)
- 個別の神職人物名(主要社家の代表者のみ)
- 全ての風土記逸文(主要逸話のみ)
- 個別の祭祀年中行事(代表的なもののみ、各社 5-10 件)
- 戦後の新宗教(教派神道以外)

### 8.2 撤退判断の基準

- 1 issue が 8h を超える → 分割 or 縮小
- L4-L5 仮説のみで構成される章 → 独立化(主流に混入禁止)
- 偽書由来の記述 → F0 領域に分離

### 8.3 別プロジェクトへの分離候補

- 現代神社観光ガイド → 別 fork
- 神社建築写真集 → 別 fork
- 個別人物伝(社家代表者の伝記) → 別 fork

---

## 9. 並行 Claude セッション運用(S09)

### 9.1 並行運用パターン

```
[セッション 1] issue/123 master 拡張(deity)
[セッション 2] issue/124 master 拡張(shrine)  ← 並行可、別 master
[セッション 3] issue/125 解析文書(独立)     ← 並行可、別ファイル
[セッション 4] issue/126 監査(レビュー専門)  ← 並行可、診断のみ
```

### 9.2 衝突回避ルール

- **同じファイル** を編集する 2 セッションは禁止
- **同じ issue** を担当する 2 セッションは禁止(`status:in-progress` ラベルで排他)
- branch 命名で衝突を可視化(`issue/<番号>-S<NN>-<slug>` で重複検知)

### 9.3 マージ順序

- master 統合 (#137 等) は **必ず単一セッション** で順次
- relation 大量生成 (#137) は **relation_type ごとに並行可**
- 解析文書(#138/#139)は並行可

### 9.4 セッション間コミュニケーション

- issue コメントに「セッション X 着手」「セッション X 完了」と残す
- TodoWrite は **個別セッション** の局所記録(他セッション参照不可)
- 全体把握は GitHub Project Board(将来)

---

## 10. 月次レビュー指針(S10)

### 10.1 月次レビュー項目

毎月 1 日に実施:

- [ ] KPI 達成度確認(§7.1)
- [ ] open issue / closed issue の比率
- [ ] L4-L5 比率推移(L0 比率増加が望ましい)
- [ ] 表記ゆれ候補 list 更新
- [ ] dangling relation 検出
- [ ] Gemini 監査済 milestone 確認
- [ ] 撤退ライン §8.1 を超えていないか
- [ ] 並行セッション運用の衝突発生有無

### 10.2 四半期レビュー項目

3 ヶ月毎:

- [ ] Phase 進捗(`docs/project/01_roadmap.md`)
- [ ] schema 改訂要否
- [ ] 撤退ライン更新(やらないことを増やす方向で)
- [ ] 大規模化対応(`docs/project/14_scaling.md` §11 KPI)
- [ ] Web Atlas 公開準備(Phase 5)

### 10.3 年次レビュー項目

毎年:

- [ ] 全 issue 棚卸し
- [ ] schema バージョン更新
- [ ] CHANGELOG 整理
- [ ] 公開リリース判断(v1.0 → v1.1 等)
- [ ] ライセンス見直し

---

## 11. 結論

| 項目 | 結果 |
|---|---|
| 自律実行ループ | ✅ S01 |
| Issue 自動選択 | ✅ S02 |
| master 統合自動化 | ✅ S03 |
| relation 自動推定 | ✅ S04 |
| Gemini 反射監査自動トリガ | ✅ S05 |
| ハルシネーション検出 | ✅ S06 |
| 進捗ダッシュボード | ✅ S07 |
| 撤退ライン | ✅ S08 |
| 並行セッション運用 | ✅ S09 |
| 月次/四半期/年次レビュー | ✅ S10 |

→ **issue #140 全 10 サブタスク完了**。数週間〜数ヶ月の長期自律運用に耐える設計確定。

---

## 12. CLAUDE.md / 13_claude_rules.md / 14_scaling.md / 15_workflow.md との整合

| 既存文書 | 本書との関係 |
|---|---|
| CLAUDE.md §1 開発ワークフロー | 本書 §1 自律実行ループの前提 |
| CLAUDE.md §4 編集上の注意事項 | 本書 §6 ハルシネーション検出の運用化 |
| 13_claude_rules.md | 本書 §1.2 中断/再開規程の前提 |
| 14_scaling.md §11 KPI | 本書 §7.1 ダッシュボード KPI と完全整合 |
| 15_workflow.md | 本書 §1 セッション境界の前提 |

→ 既存運用ルールを **完全継承+自動化拡張**。
