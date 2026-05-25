#!/usr/bin/env python3
"""DISC-006 verified_status field を 8 master に追加 + 初期値設定。

追加 field (5 種):
- verified_status:        verified / under_review / unverified / known_fabrication
- verification_dimension: existence / textual / interpretive / genealogical / ritual
- verified_at:            ISO8601
- verified_by:            agent / reviewer / claude / codex / human
- verification_source:    URL or 出典文字列

初期値ロジック (DISC-006 で確定):
- shrine: 古代社格 (式内社/名神大社/一宮/二宮 等) または 近代社格 (官幣/国幣/別表/府社/県社/郷社) → verified
- shrine: 著名社保護リスト 130 件 → verified
- shrine: その他既存 → under_review
- deity: 記紀記載 (古事記/日本書紀/延喜式 を notes/source_reference に含む) → verified
- deity: その他 → under_review
- clan: 公卿補任/新撰姓氏録 等の記載があるもの → verified、他は under_review
- text/period/rank/event/region/festival: 既存は全て under_review (個別判定は別 PR)
"""

import csv
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NEW_FIELDS = [
    'verified_status',
    'verification_dimension',
    'verified_at',
    'verified_by',
    'verification_source',
]

NOW = datetime.datetime(2026, 5, 25).isoformat()  # 本日付

# 著名社保護リスト (PR #229 で 130 件確定したものから shrine 主要)
PROTECTED_SHRINES = {
    '鶴岡八幡宮','富岡八幡宮','大宮八幡宮','葛飾八幡宮','鳩森八幡神社','蒲田八幡神社',
    '由比若宮','川越八幡宮','大分八幡宮','古要神社','薦神社','八幡八雲神社',
    '筥崎宮','石清水八幡宮','宇佐神宮','誉田八幡宮','箱根神社','岩清水八幡宮',
    '太宰府天満宮','北野天満宮','防府天満宮','大阪天満宮','道明寺天満宮',
    '湯島天満宮','亀戸天神社','平野神社','菅原天満宮','長岡天満宮',
    '綱敷天満宮','綱敷天満宮(神戸)','綱敷天満宮稲荷',
    '伏見稲荷大社','笠間稲荷神社','豊川稲荷','祐徳稲荷神社','白笹稲荷神社',
    '装束稲荷神社','高山稲荷神社','源九郎稲荷神社','瓢箪山稲荷神社',
    '春日大社','春日若宮','枚岡神社','大原野神社','大宮売神社',
    '諏訪大社','諏訪大社上社本宮','諏訪大社上社前宮','諏訪大社下社春宮','諏訪大社下社秋宮',
    '白山比咩神社','白山神社','加賀白山中宮',
    '富士山本宮浅間大社','北口本宮冨士浅間神社','駿河国総社浅間神社','静岡浅間神社',
    '住吉大社','住吉神社(筑前)','住吉神社(下関)',
    '出雲大社','出雲大神宮','熊野大社','美保神社',
    '皇大神宮','豊受大神宮','倭姫宮','瀧原宮','風日祈宮','風宮','土宮',
    '熱田神宮','建部大社','三嶋大社','寒川神社','大山祇神社','大神神社',
    '石上神宮','鹿島神宮','香取神宮','枚聞神社','霧島神宮',
    '阿蘇神社','阿蘇神社摂社','阿蘇国造神社','阿蘇国造祖神社',
    '香椎宮','宗像大社','宗像大社辺津宮','宗像大社中津宮','宗像大社沖津宮',
    '気多神社','気多大社','気比神宮','彌彦神社','弥彦神社','上賀茂神社','下鴨神社',
    '賀茂別雷神社','賀茂御祖神社','賀茂神社','吉備津神社','吉備津神社(備後)',
    '吉備津彦神社','吉備津彦神社摂社','吉備大臣社',
    '武田八幡宮','武田八幡諏訪相殿',
    '近江神宮','平安神宮','橿原神宮','宮崎神宮','明治神宮','靖国神社',
    '出石神社','伊和神社','伊弉諾神宮','志賀海神社','和多都美神社',
    '伊勢山皇大神宮','梅宮大社','松尾大社','八坂神社','日吉大社','建勲神社',
    '尾山神社','豊國神社(京)','豊國神社(大阪)','豊國神社(名古屋)',
    '湊川神社','護王神社','晴明神社','鎌倉宮','安積国造神社',
    '中山神社','広瀬大社','龍田大社',
    '七宮神社',  # SHR-208 修正後の名前
}

# 古代社格を含む単語 (regex でなく contains で判定)
ANCIENT_RANK_KEYWORDS = ['名神大社','式内社','式内','一宮','二宮','官幣','国幣','勅祭','二十二社']
MODERN_RANK_KEYWORDS = ['官幣','国幣','別表','府社','県社','郷社','勅祭']


def classify_shrine(r):
    """shrine_master 1 行の verified_status を決定"""
    name = r.get('canonical_name', '')
    ancient = r.get('shrine_rank_ancient', '') or ''
    modern = r.get('shrine_rank_modern', '') or ''

    # 古代社格保持
    if any(k in ancient for k in ANCIENT_RANK_KEYWORDS):
        return 'verified', '古代社格保持'
    # 近代社格保持 (官幣/国幣/別表/府社/県社/郷社)
    if any(k in modern for k in MODERN_RANK_KEYWORDS):
        return 'verified', '近代社格保持'
    # 著名社保護リスト
    if name in PROTECTED_SHRINES:
        return 'verified', '著名社保護リスト'
    return 'under_review', '初期値'


def classify_deity(r):
    """deity_master 1 行の判定"""
    notes = r.get('notes', '') or ''
    # 記紀・延喜式に記載がある (notes 内に明示) なら verified
    if any(k in notes for k in ['古事記', '日本書紀', '延喜式', '記紀', '風土記']):
        return 'verified', '記紀・延喜式記載'
    # merged_into は under_review (統合済の名残)
    if 'merged_into' in notes or '[統合済' in notes:
        return 'under_review', '統合済'
    return 'under_review', '初期値'


def classify_clan(r):
    """clan_master 1 行の判定"""
    notes = r.get('notes', '') or ''
    if any(k in notes for k in ['新撰姓氏録', '公卿補任', '尊卑分脈', '古事記', '日本書紀']):
        return 'verified', '系譜資料記載'
    return 'under_review', '初期値'


def classify_default(r):
    """その他 master のデフォルト判定"""
    return 'under_review', '初期値'


# (file_path, dimension, classifier)
TARGETS = [
    ('docs/master/shrine_master.tsv', 'existence', classify_shrine),
    ('docs/master/deity_master.tsv', 'textual', classify_deity),
    ('docs/master/clan_master.tsv', 'genealogical', classify_clan),
    ('docs/master/festival_master.tsv', 'ritual', classify_default),
    ('docs/master/text_master.tsv', 'textual', classify_default),
    ('docs/master/period_master.tsv', 'textual', classify_default),
    ('docs/master/rank_master.tsv', 'textual', classify_default),
    ('docs/master/event_master.tsv', 'textual', classify_default),
    ('docs/master/region_master.tsv', 'existence', classify_default),
    ('docs/civilization/01_motif_db.tsv', 'interpretive', classify_default),
]


def process_file(path, dimension, classifier):
    """1 master ファイルに verified_status 等の 5 field を追加"""
    full = ROOT / path
    with open(full, encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t'))
    header = rows[0]

    # 既に追加済か確認
    if 'verified_status' in header:
        print(f'  {path}: 既に追加済、スキップ')
        return

    # ヘッダに 5 field 追加
    new_header = header + NEW_FIELDS
    # 各行の処理
    new_rows = [new_header]
    stats = {'verified': 0, 'under_review': 0, 'unverified': 0, 'known_fabrication': 0}
    for r in rows[1:]:
        # dict 化して classifier に渡す
        d = dict(zip(header, r))
        status, reason = classifier(d)
        new_row = r + [status, dimension, NOW, 'claude', f'auto-init: {reason}']
        new_rows.append(new_row)
        stats[status] = stats.get(status, 0) + 1

    with open(full, 'w', encoding='utf-8') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        for r in new_rows:
            w.writerow(r)
    total = sum(stats.values())
    print(f'  {path}: total {total} = ' + ' / '.join(f'{k}={v}' for k, v in stats.items() if v > 0))


def main():
    print('=== verified_status 5 field 追加開始 ===')
    for path, dimension, classifier in TARGETS:
        process_file(path, dimension, classifier)
    print('=== 完了 ===')


if __name__ == '__main__':
    main()
