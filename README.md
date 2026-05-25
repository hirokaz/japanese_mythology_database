# 日本神話・神道史 文明 OS データベース

氷河期・旧石器・縄文時代から鎌倉時代までの日本列島に関する **神話・神社・豪族・皇統・祭祀・地方伝承・考古学** を統合する巨大知識グラフ。Excel 互換の TSV と、ブラウザで閲覧できる静的 Web アプリで提供する。

## 🌐 Web アプリで閲覧する

**➡ [Web アプリを開く（`web/index.html`）](./web/index.html)**

GitHub Pages 公開時はトップ URL から自動的に Web アプリへ移動します。
神社・神格・氏族の一覧/検索、15,000+ 件の関係探索、確実性レベル（L0–L5）の可視化ができます。

ローカルで動かす場合（`file://` だと CORS で TSV が読めないため簡易サーバを使用）:

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000/ または http://localhost:8000/web/ を開く
```

## 収録規模（自動集計、`scripts/generate_stats.py --readme` で更新）

<!-- BEGIN:STATS -->
| エンティティ | 件数 |
|---|---|
| 神格 (deity) | 595 |
| 神社 (shrine) | 777 |
| 氏族 (clan) | 254 |
| モチーフ (motif) | 500 |
| 文献 (text) | 20 |
| 時代 (period) | 22 |
| 社格 (rank) | 15 |
| 事件 (event) | 26 |
| 地域 (region) | 347 |
| 祭事 (festival) | 40 |
| | |
| **関係 (relations)** | **15,196** |
<!-- END:STATS -->

KPI: L0 比率 61.4%、L4–L5 仮説 0.04%、dangling 参照 0、整合性 100%（`scripts/audit_kpi.py` で検証）。

※ 2026 年 5 月の信頼性監査で AI 生成プレースホルダー 284 件 + 国造 47 件等を削除済 (PR #229 / #231)。詳細は `docs/discussions/DISC-002_resolution.md`。

## ディレクトリ構成

```
.
├── index.html            # → web/ への自動リダイレクト
├── web/                  # 静的 Web アプリ（HTML/CSS/JS、ゼロ依存）
│   ├── index.html
│   ├── pages/            # shrines / deities / clans / relations / detail / about
│   ├── css/ js/ images/
│   └── README.md
├── docs/
│   ├── master/           # deity / shrine / clan / text / period / rank / event / region / festival master (TSV)
│   ├── relations/        # relations.tsv (件数は scripts/generate_stats.py で自動集計)
│   ├── civilization/     # 文明 OS 分析文書（縄文記憶・海洋民族・中央 vs 地方 等）
│   ├── project/          # プロジェクト管理（ロードマップ・Issue カタログ）
│   └── 出雲編/ 等        # 連表 TSV（29 列）
├── scripts/
│   └── audit_kpi.py      # KPI / 整合性 監査（ゼロ依存）
└── CLAUDE.md             # 編纂規程
```

## データ仕様

- 形式: **TSV (タブ区切り)** — Excel に直接貼り付け可能、UTF-8 / LF
- 連表 TSV は全 29 列の固定スキーマ（編纂規程 [`CLAUDE.md`](./CLAUDE.md) §3.2 参照）
- master ID 規約: `DEI-NNN`（神格）`SHR-NNN`（神社）`CLN-NNN`（氏族）`RLN-NNNNNN`（関係）等

## 確実性レベル（L0–L5）

すべての記述・関係に確実性レベルを付与し、史料記載と仮説を厳密に分離している。

- **L0** 史料記載の整理（古事記・日本書紀・延喜式 等）
- **L1** 一般的な研究上の解釈
- **L2** 複数研究者が言及する推定
- **L3** 民間伝承・地域伝承（縄文残存仮説 等）
- **L4–L5** 大胆な仮説（邪馬台国論争 等、両論を対称的に記録）

## 主な分析文書（`docs/civilization/`）

- `14_completion_report.md` — 完成レポート（全体像）
- `15_maritime_peoples.md` — 日本の海洋民族（海人族）総合分析
- `05_jomon_memory.md` — 縄文記憶仮説
- `06_central_vs_regional.md` — 中央史観 vs 地方視点
- `08_civilization_os_schema.md` — 103 node × 340 relation スキーマ

## 免責事項

本基盤は **学術整理** であり、各神社の社伝は各社が正本です。L4–L5 仮説の引用時は両論並記をお願いします。教育用途では、社伝と歴史学的推定を区別してください。

## 編纂規程

編纂のルールは [`CLAUDE.md`](./CLAUDE.md) に定義。
