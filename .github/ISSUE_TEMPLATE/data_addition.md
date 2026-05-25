---
name: データ追加 (master / relations)
about: master または relations にレコードを追加するタスク
title: "[Data] "
labels: data, master
assignees: ''
---

## 目的
何のために、どんなデータを追加するか。

## 対象ファイル
- [ ] `docs/master/<file>.tsv`
- [ ] `docs/relations/relations.tsv`
- [ ] その他: 

## 対象エントリの根拠
- 出典 (古事記・日本書紀・延喜式 等):
- 該当章/段:
- 引用要約:

## 仮説層 (L0-L5)
- [ ] L0 (史料記載)
- [ ] L1 (一般的解釈)
- [ ] L2 (学術仮説)
- [ ] L3 (民間伝承)
- [ ] L4 (大胆仮説)
- [ ] L5 (検証困難)

L4-L5 の場合は **反対説 / 保留理由 / 検証不能性を必ず併記**。

## 完了条件 (Definition of Done)
- [ ] 該当ファイルにレコード追加
- [ ] CLAUDE.md §4.1 出典表記ルール遵守
- [ ] CLAUDE.md §4.2 distinctive feature 含む
- [ ] `python3 scripts/audit_kpi.py` 全 PASS
- [ ] `python3 scripts/generate_stats.py --readme` で README 更新
- [ ] 1 PR あたり 20 件以下 (大量投入の場合は複数 PR に分割)

## 監査コマンド
```bash
python3 scripts/audit_kpi.py
python3 scripts/generate_stats.py
```

## 注意すべき史料・仮説レベル
- AI 生成プレースホルダーの混入禁止 (DISC-002 RISK-31)
- 旧国名網羅シリーズの禁止 (例: 各旧国に春日神社 1 件ずつ等)
- 「(地名)+(神格)+(神社/宮)」型合成名は実在検証必須

## 関連
- DISC-001 (#177) persona 設計
- DISC-002 (#178) リスク台帳 35 項目
- DISC-003 (#179) 公開レイヤ + verified_status
