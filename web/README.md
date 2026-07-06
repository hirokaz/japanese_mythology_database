# 神話 OS Web アプリ

日本神話・神道史データベースを閲覧する静的 Web アプリ。

## 起動方法

`file://` 直接では CORS 制約で TSV が読めません。簡易 HTTP サーバを起動してください:

```bash
cd /path/to/japanese_mythology_database
python3 -m http.server 8000
# ブラウザで http://localhost:8000/web/ を開く
```

または Node の場合:

```bash
npx http-server . -p 8000
```

## ディレクトリ構成

```
web/
├── index.html              # トップページ
├── css/
│   └── main.css            # 共通スタイル
├── js/
│   ├── tsv_parser.js       # TSV パーサ(ゼロ依存)
│   ├── data_loader.js      # データ読み込み + 名前解決
│   ├── index.js            # トップページ用 JS
│   ├── shrines.js          # 神社一覧
│   ├── deities.js          # 神格一覧
│   ├── clans.js            # 氏族一覧
│   ├── detail/             # 詳細ページ (utils/epistemic/relations/shrine/deity/clan/core)
│   └── relations.js        # 関係探索
├── images/                 # ロゴ・アイコン(SVG)
└── pages/
    ├── shrines.html        # 神社一覧
    ├── deities.html        # 神格一覧
    ├── clans.html          # 氏族一覧
    ├── shrine.html         # 神社詳細(?id=SHR-001)
    ├── deity.html          # 神格詳細(?id=DEI-001)
    ├── clan.html           # 氏族詳細(?id=CLN-001)
    ├── relations.html      # 関係探索
    └── about.html          # 本基盤について
```

## 機能

- **トップページ**:収録規模統計のアニメ表示、6 軸ネットワーク説明、L0-L5 確実性層の可視化、注目体系のサンプル
- **神社一覧**:777 件、検索・都道府県(北→南順)・社格フィルタ、表示は最大 500 件
- **神格一覧**:595 件、検索・カテゴリ・性別フィルタ
- **氏族一覧**:254 件、検索
- **モチーフ一覧**:500 件 + extended 41 件 (詳細解説)
- **詳細ページ**:基本情報 + 入出力リレーション一覧(関係タイプ別グルーピング) + 検証状態表示 (verified_status 導入予定)
- **関係探索**:15,196 件のリレーションを ID・タイプ・確実性層で絞り込み

※ 件数はリポジトリルート `scripts/generate_stats.py` で実データから自動集計可能。

## データソース

すべて `../docs/master/*.tsv` および `../docs/relations/relations.tsv` を fetch して描画。
バックエンドは不要です。

## 公開

GitHub Pages 等の静的ホスティングで公開可能です。
ルートを `web/` にするか、リポジトリルートを公開して `/web/` でアクセスします。

## 凡例

| バッジ | 意味 |
|---|---|
| `L0` | 史料記載の整理 |
| `L1` | 一般的な研究上の解釈 |
| `L2` | 複数研究者が言及する推定 |
| `L3` | 民間伝承・地域伝承 |
| `L4` | 大胆な仮説(両論対称的記録) |
