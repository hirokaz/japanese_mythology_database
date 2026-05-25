---
name: Web 改善
about: web/ 配下の UI / UX / 機能改善
title: "[Web] "
labels: web, enhancement
assignees: ''
---

## 改善対象
- [ ] `web/index.html` (トップ)
- [ ] `web/pages/<name>.html`
- [ ] `web/js/<name>.js`
- [ ] `web/css/main.css`
- [ ] `web/data/*.tsv`
- [ ] その他: 

## 現状の問題
スクショまたは再現手順:

## 改善案
- 具体的な UI / 振る舞いの変更:
- 影響範囲:

## 完了条件
- [ ] 該当 HTML/JS/CSS 修正
- [ ] ローカル `python3 -m http.server 8000` で動作確認
- [ ] モバイル表示確認 (375px 幅)
- [ ] iOS Safari 動作確認 (PR #214 教訓: CSS class が SVG 子に効かない問題に注意)
- [ ] 既存機能の regression なし

## 関連
- DISC-003 (#179) 公開レイヤ設計 (verified_status バッジ等)
