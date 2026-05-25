---
name: データ訂正 / 信頼性監査
about: 既存データの誤り訂正・架空エントリ報告・実在性検証
title: "[Audit] "
labels: data-quality, audit
assignees: ''
---

## 報告内容
誤りまたは疑わしいエントリ:
- 対象 ID (SHR-XXX, DEI-XXX 等):
- 名称:
- 何が問題か:

## 根拠
実在性を疑う / 訂正すべき根拠:
- 外部参照 (神社公式・神社庁等):
- 文献:
- 現地確認:

## 提案する対処
- [ ] エントリの内容を訂正 (具体的修正案: )
- [ ] エントリを削除 (代替: )
- [ ] 別エントリと統合 (`merged_into`:`<ID>`)
- [ ] [要検証] フラグを付与
- [ ] 保留 (人間判断待ち)

## 完了条件
- [ ] master 更新
- [ ] 関連 relation の整合性確認 (削除/置換時)
- [ ] `python3 scripts/audit_kpi.py` 全 PASS
- [ ] CLAUDE.md §4 ルール遵守

## 監査コマンド
```bash
python3 scripts/audit_kpi.py
grep "<対象ID>" docs/relations/relations.tsv  # 影響範囲確認
```

## 関連
- DISC-002 (#178) リスク台帳
- 既存削除実績: PR #229 (211 件) / PR #231 (73 件) で AI 生成 284 件削除
