// Generic detail page renderer for shrine / deity / clan
// Requires: window.detailType ('shrine' | 'deity' | 'clan')
async function renderDetail() {
  const type = window.detailType;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');

  if (!id) {
    loading.textContent = 'ID が指定されていません。';
    return;
  }

  try {
    const [data, relations] = await Promise.all([
      DataLoader.load(type),
      DataLoader.load('relations'),
    ]);

    const record = data.find(r => r.master_id === id);
    if (!record) {
      loading.textContent = `${id} が見つかりません。`;
      return;
    }

    // Find relations involving this id
    const incoming = relations.filter(r => r.target_id === id);
    const outgoing = relations.filter(r => r.source_id === id);

    // Group relations by type
    const groupByType = (arr, dirField) => {
      const m = {};
      arr.forEach(r => {
        const key = r.relation_type || '(unknown)';
        if (!m[key]) m[key] = [];
        m[key].push(r);
      });
      return m;
    };
    const outGrouped = groupByType(outgoing, 'target_id');
    const inGrouped = groupByType(incoming, 'source_id');

    document.title = `${record.canonical_name || record.canonical_title || id} | 神話 OS`;
    loading.hidden = true;
    content.hidden = false;

    // Header
    let html = `
      <div class="detail-header">
        <h1>${escapeHtml(record.canonical_name || record.canonical_title || '')}</h1>
        <p class="subtitle">${escapeHtml(record.canonical_reading || '')}</p>
        <p class="meta"><code>${escapeHtml(id)}</code> · ${escapeHtml(getTypeLabel(type))} · 関係数: ${(incoming.length + outgoing.length).toLocaleString()}</p>
      </div>

      <div class="detail-grid">
        <div>
          ${renderBasic(record, type)}
          ${await renderRelations(outGrouped, 'out', record)}
          ${await renderRelations(inGrouped, 'in', record)}
        </div>
        <aside>
          ${renderSidebar(record, type)}
        </aside>
      </div>
    `;
    content.innerHTML = html;
  } catch (err) {
    loading.textContent = '読み込みに失敗しました: ' + err.message;
    console.error(err);
  }
}

function getTypeLabel(t) {
  return { shrine: '神社', deity: '神格', clan: '氏族' }[t] || t;
}

function renderBasic(record, type) {
  const fields = {
    shrine: [
      ['canonical_name', '名称'],
      ['canonical_reading', '読み'],
      ['old_names', '旧称'],
      ['alternative_names', '別名'],
      ['prefecture', '都道府県'],
      ['address', '所在地'],
      ['shrine_rank_ancient', '古代社格'],
      ['shrine_rank_modern', '近代社格'],
      ['founding_year_estimated', '創建年代'],
      ['founding_legend', '創建伝承'],
      ['notes', '備考'],
    ],
    deity: [
      ['canonical_name', '名称'],
      ['canonical_reading', '読み'],
      ['aliases', '別名'],
      ['aliases_reading', '別名読み'],
      ['category', 'カテゴリ'],
      ['gender', '性別'],
      ['main_text_appearance', '主要文献'],
      ['syncretism', '神仏習合'],
      ['regional_variant', '地域変異'],
      ['notes', '備考'],
    ],
    clan: [
      ['canonical_name', '名称'],
      ['canonical_reading', '読み'],
      ['alternative_names', '別名'],
      ['category', 'カテゴリ'],
      ['notes', '備考'],
    ],
  };
  const list = fields[type] || [];

  let html = `<div class="detail-section"><h2>基本情報</h2><dl class="kv-list">`;
  for (const [key, label] of list) {
    const v = record[key];
    if (v && v !== '-') {
      html += `<dt>${label}</dt><dd>${escapeHtml(v)}</dd>`;
    }
  }
  html += `</dl></div>`;
  return html;
}

async function renderRelations(grouped, direction, record) {
  const keys = Object.keys(grouped);
  if (keys.length === 0) return '';

  const dirLabel = direction === 'out' ? '本記録から始まる関係' : '本記録に向かう関係';

  let html = `<div class="detail-section"><h2>${dirLabel} (${Object.values(grouped).reduce((a, b) => a + b.length, 0).toLocaleString()})</h2>`;

  // 重要な関係順にソート
  const importance = {
    primary_deity_of: 1, secondary_deity_of: 2, enshrined_at: 3,
    parent_of: 4, married_to: 5, sibling_of: 6, ancestor_of: 7,
    descended_from: 8, syncretized_with: 9,
    mentioned_in: 50, located_in: 60, located_in_period: 61,
    located_in_country: 62, has_rank: 63, located_near: 70,
  };
  const sortedKeys = keys.sort((a, b) => (importance[a] || 99) - (importance[b] || 99));

  for (const relType of sortedKeys) {
    const items = grouped[relType];
    if (items.length === 0) continue;
    html += `<h3 style="font-size:1em; margin:14px 0 6px; color:#5a4a35;">
      <span class="relation-type">${escapeHtml(relType)}</span>
      <span style="color:#8b7560; font-weight:400; font-size:0.9em;">${items.length.toLocaleString()} 件</span>
    </h3>`;
    html += `<ul class="relation-list">`;
    const cap = 30;
    for (let i = 0; i < Math.min(items.length, cap); i++) {
      const r = items[i];
      const otherId = direction === 'out' ? r.target_id : r.source_id;
      const otherType = direction === 'out' ? r.target_type : r.source_type;
      const name = await DataLoader.nameForId(otherId);
      const url = DataLoader.detailUrl(otherId);
      const layerBadge = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const note = r.notes ? `<span style="color:#8b7560; font-size:0.88em;"> — ${escapeHtml(r.notes.slice(0, 60))}${r.notes.length > 60 ? '…' : ''}</span>` : '';
      html += `<li>
        ${layerBadge}
        ${url !== '#' ? `<a href="${url}">` : ''}
        ${escapeHtml(name)}
        ${url !== '#' ? `</a>` : ''}
        <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(otherId)}</code>
        ${note}
      </li>`;
    }
    if (items.length > cap) {
      html += `<li style="color:#8b7560; font-style:italic;">…他 ${(items.length - cap).toLocaleString()} 件</li>`;
    }
    html += `</ul>`;
  }
  html += `</div>`;
  return html;
}

function renderSidebar(record, type) {
  let html = `<div class="detail-section">
    <h2>外部リンク</h2>
    <ul class="relation-list">
      <li><a href="https://github.com/hirokaz/japanese_mythology_database/blob/main/docs/master/${type}_master.tsv" target="_blank">GitHub: ${type}_master.tsv</a></li>
      <li><a href="relations.html?from=${encodeURIComponent(record.master_id)}">この ID から関係探索</a></li>
    </ul>
  </div>`;

  // 凡例
  html += `<div class="detail-section">
    <h2>確実性レベル</h2>
    <ul class="relation-list" style="font-size:0.85em;">
      <li><span class="badge badge-l0">L0</span> 史料記載の整理</li>
      <li><span class="badge badge-l1">L1</span> 一般的な研究上の解釈</li>
      <li><span class="badge badge-l2">L2</span> 複数研究者の推定</li>
      <li><span class="badge badge-l3">L3</span> 民間伝承・地域伝承</li>
      <li><span class="badge badge-l4">L4</span> 大胆な仮説</li>
    </ul>
  </div>`;

  return html;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
