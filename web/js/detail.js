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
          ${type === 'shrine' ? await renderEnshrinedDeities(record) : ''}
          ${type === 'shrine' ? renderMap(record) : ''}
          ${type === 'clan' ? await renderClanProfile(record, outgoing, incoming) : ''}
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

/** 氏族の詳細プロファイル(clan 用):来歴・系譜・神社・地域・天皇・歴史・祭事・氏族関係 */
async function renderClanProfile(record, outRels, inRels) {
  const [deities, shrines, clans, events, regions] = await Promise.all([
    DataLoader.load('deity'),
    DataLoader.load('shrine'),
    DataLoader.load('clan'),
    DataLoader.load('event'),
    DataLoader.load('region'),
  ]);
  const di = {}; deities.forEach(d => { di[d.master_id] = d; });
  const si = {}; shrines.forEach(s => { si[s.master_id] = s; });
  const ci = {}; clans.forEach(c => { ci[c.master_id] = c; });
  const ei = {}; events.forEach(e => { ei[e.event_id] = e; });
  const ri = {}; regions.forEach(r => { ri[r.region_id] = r; });

  let html = '';

  // ===== 1. 来歴・備考 =====
  const hasMeta = [record.clan_type, record.peak_period, record.notes].some(v => v && v !== '-');
  if (hasMeta) {
    html += `<div class="detail-section"><h2>来歴・備考</h2><dl class="kv-list">`;
    if (record.clan_type && record.clan_type !== '-') html += `<dt>分類</dt><dd>${escapeHtml(record.clan_type)}</dd>`;
    if (record.peak_period && record.peak_period !== '-') html += `<dt>最盛期</dt><dd>${escapeHtml(record.peak_period)}</dd>`;
    if (record.notes && record.notes !== '-') html += `<dt>来歴・解説</dt><dd>${escapeHtml(record.notes)}</dd>`;
    html += `</dl></div>`;
  }

  // ===== 2. 系譜:祖神 =====
  const ancestors = [];
  if (record.ancestor_deity_id && record.ancestor_deity_id !== '-') {
    record.ancestor_deity_id.split('|').forEach(id => ancestors.push(id.trim()));
  }
  outRels.filter(r => r.relation_type === 'descended_from' && r.target_type === 'deity')
    .forEach(r => { if (!ancestors.includes(r.target_id)) ancestors.push(r.target_id); });
  if (ancestors.length) {
    html += `<div class="detail-section"><h2>系譜:祖神 (${ancestors.length})</h2>`;
    html += `<div class="deity-grid">`;
    ancestors.forEach(id => {
      const d = di[id];
      const url = DataLoader.detailUrl(id);
      if (d) {
        const cat = d.category && d.category !== '-' ? d.category : '';
        const notes = d.notes && d.notes !== '-' ? d.notes.slice(0, 60) + (d.notes.length > 60 ? '…' : '') : '';
        html += `<a href="${url}" class="deity-card deity-card-main">
          <span class="deity-name">${escapeHtml(d.canonical_name)}</span>
          ${d.canonical_reading && d.canonical_reading !== '-' ? `<span class="deity-reading">${escapeHtml(d.canonical_reading)}</span>` : ''}
          <span class="deity-id"><code>${escapeHtml(id)}</code></span>
          ${cat ? `<span class="deity-cat">${escapeHtml(cat)}</span>` : ''}
          ${notes ? `<span class="deity-notes">${escapeHtml(notes)}</span>` : ''}
        </a>`;
      } else {
        html += `<a href="${url}" class="deity-card deity-card-main"><span class="deity-name">${escapeHtml(id)}</span></a>`;
      }
    });
    html += `</div></div>`;
  }

  // ===== 3. 拠点・祭祀神社 =====
  const shrineMap = new Map();  // id -> set of role labels
  function addShrine(id, role) {
    if (!shrineMap.has(id)) shrineMap.set(id, new Set());
    shrineMap.get(id).add(role);
  }
  if (record.related_shrine_ids && record.related_shrine_ids !== '-') {
    record.related_shrine_ids.split('|').forEach(id => addShrine(id.trim(), '関連'));
  }
  outRels.filter(r => r.target_type === 'shrine' &&
                       ['controls', 'controls_shrine', 'associated_with'].includes(r.relation_type))
    .forEach(r => addShrine(r.target_id, r.relation_type));
  if (shrineMap.size) {
    html += `<div class="detail-section"><h2>拠点・祭祀神社 (${shrineMap.size})</h2>`;
    html += `<div class="deity-grid">`;
    for (const [id, roles] of shrineMap) {
      const s = si[id];
      const url = DataLoader.detailUrl(id);
      const roleBadges = Array.from(roles).map(r => `<span class="relation-type">${escapeHtml(r)}</span>`).join(' ');
      if (s) {
        html += `<a href="${url}" class="deity-card">
          <span class="deity-name">${escapeHtml(s.canonical_name)}</span>
          ${s.canonical_reading && s.canonical_reading !== '-' ? `<span class="deity-reading">${escapeHtml(s.canonical_reading)}</span>` : ''}
          <span class="deity-id"><code>${escapeHtml(id)}</code></span>
          ${s.prefecture && s.prefecture !== '-' ? `<span class="deity-cat">${escapeHtml(s.prefecture)}</span>` : ''}
          <span class="deity-notes">${roleBadges}</span>
        </a>`;
      } else {
        html += `<a href="${url}" class="deity-card"><span class="deity-name">${escapeHtml(id)}</span><span class="deity-notes">${roleBadges}</span></a>`;
      }
    }
    html += `</div></div>`;
  }

  // ===== 4. 拠点地域 =====
  const regionSet = new Set();
  if (record.related_region_ids && record.related_region_ids !== '-') {
    record.related_region_ids.split('|').forEach(r => { const t = r.trim(); if (t) regionSet.add(t); });
  }
  outRels.filter(r => r.target_type === 'region' &&
                       ['located_in_country', 'located_in'].includes(r.relation_type))
    .forEach(r => regionSet.add(r.target_id));
  if (regionSet.size) {
    html += `<div class="detail-section"><h2>拠点地域 (${regionSet.size})</h2><ul class="relation-list">`;
    for (const rid of regionSet) {
      const reg = ri[rid];
      const url = DataLoader.detailUrl(rid);
      const name = reg ? reg.canonical_name : rid;
      const type = reg && reg.region_type && reg.region_type !== '-' ? reg.region_type : '';
      html += `<li>${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''} <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(rid)}</code>${type ? ` <span class="badge badge-rank">${escapeHtml(type)}</span>` : ''}</li>`;
    }
    html += `</ul></div>`;
  }

  // ===== 5. 関連天皇・皇族 =====
  const emperors = [];
  if (record.related_emperor_ids && record.related_emperor_ids !== '-') {
    record.related_emperor_ids.split('|').forEach(e => { const t = e.trim(); if (t) emperors.push(t); });
  }
  outRels.filter(r => r.relation_type === 'served' && r.target_type === 'emperor')
    .forEach(r => { if (!emperors.includes(r.target_id)) emperors.push(r.target_id); });
  outRels.filter(r => r.relation_type === 'married_into' && r.target_type === 'deity')
    .forEach(r => {
      const d = di[r.target_id];
      if (d && (d.category || '').includes('皇統') && !emperors.includes(r.target_id)) emperors.push(r.target_id);
    });
  if (emperors.length) {
    html += `<div class="detail-section"><h2>関連天皇・皇族 (${emperors.length})</h2><ul class="relation-list">`;
    emperors.forEach(id => {
      const d = di[id];
      const url = DataLoader.detailUrl(id);
      const name = d ? d.canonical_name : id;
      html += `<li>${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''} <code style="font-size:0.78em;">${escapeHtml(id)}</code></li>`;
    });
    html += `</ul></div>`;
  }

  // ===== 6. 歴史的出来事 =====
  const eventRels = outRels.filter(r => r.relation_type === 'participated_in' && r.target_type === 'event');
  if (eventRels.length) {
    html += `<div class="detail-section"><h2>関連する歴史的出来事 (${eventRels.length})</h2><ul class="relation-list">`;
    eventRels.forEach(r => {
      const e = ei[r.target_id];
      const url = DataLoader.detailUrl(r.target_id);
      const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const name = e ? e.canonical_name : r.target_id;
      let yr = '';
      if (e && e.year_start && e.year_start !== '-') {
        yr = ` (${e.year_start}${e.year_end && e.year_end !== '-' && e.year_end !== e.year_start ? '-' + e.year_end : ''})`;
      }
      const note = r.notes ? ` — ${r.notes.slice(0, 80)}${r.notes.length > 80 ? '…' : ''}` : '';
      html += `<li>${layer} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name + yr)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
    });
    html += `</ul></div>`;
  }

  // ===== 7. 祭事 =====
  const ritualRels = outRels.filter(r => ['performed_ritual', 'performed_at'].includes(r.relation_type));
  if (ritualRels.length) {
    html += `<div class="detail-section"><h2>祭事 (${ritualRels.length})</h2><ul class="relation-list">`;
    ritualRels.forEach(r => {
      const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const note = r.notes ? ` — ${r.notes.slice(0, 80)}` : '';
      html += `<li>${layer} <code>${escapeHtml(r.target_id)}</code><span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
    });
    html += `</ul></div>`;
  }

  // ===== 8. 氏族関係(子氏族・婚姻・対立・滅亡) =====
  const CLAN_REL_LABELS = {
    parent_clan_of: '子氏族(分家)',
    descended_from: '祖系',
    married_into: '婚姻',
    rivaled: '対立',
    allied_with: '同盟',
    destroyed_by: '滅亡(対手)',
    succeeded_by: '後継',
  };
  const outClanRels = outRels.filter(r => r.target_type === 'clan' && CLAN_REL_LABELS[r.relation_type]);
  const inClanRels = inRels.filter(r => r.source_type === 'clan' && CLAN_REL_LABELS[r.relation_type]);
  if (outClanRels.length || inClanRels.length) {
    html += `<div class="detail-section"><h2>氏族関係 (${outClanRels.length + inClanRels.length})</h2>`;
    const grouped = {};
    [...outClanRels.map(r => ({ ...r, dir: 'out' })), ...inClanRels.map(r => ({ ...r, dir: 'in' }))].forEach(r => {
      (grouped[r.relation_type] = grouped[r.relation_type] || []).push(r);
    });
    Object.entries(grouped).forEach(([t, items]) => {
      html += `<h3 class="enshrined-label"><span class="relation-type">${escapeHtml(t)}</span> <span style="color:#8b7560; font-weight:400;">${escapeHtml(CLAN_REL_LABELS[t])} · ${items.length} 件</span></h3>`;
      html += `<ul class="relation-list">`;
      items.forEach(r => {
        const otherId = r.dir === 'out' ? r.target_id : r.source_id;
        const c = ci[otherId];
        const url = DataLoader.detailUrl(otherId);
        const name = c ? c.canonical_name : otherId;
        const arrow = r.dir === 'out' ? '→' : '←';
        const note = r.notes ? ` — ${r.notes.slice(0, 80)}` : '';
        const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
        html += `<li>${layer} ${arrow} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''} <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(otherId)}</code><span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
      });
      html += `</ul>`;
    });
    html += `</div>`;
  }

  // ===== 9. 言及文献 =====
  const textRels = outRels.filter(r => r.relation_type === 'mentioned_in' && r.target_type === 'text');
  if (textRels.length) {
    html += `<div class="detail-section"><h2>言及文献 (${textRels.length})</h2><ul class="relation-list">`;
    textRels.slice(0, 20).forEach(r => {
      const url = DataLoader.detailUrl(r.target_id);
      const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      html += `<li>${layer} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(r.target_id)}${url !== '#' ? `</a>` : ''}</li>`;
    });
    if (textRels.length > 20) html += `<li style="color:#8b7560; font-style:italic;">…他 ${textRels.length - 20} 件</li>`;
    html += `</ul></div>`;
  }

  return html;
}

/** 主祭神 / 配祀神 セクション(shrine 用) */
async function renderEnshrinedDeities(record) {
  const main = (record.main_deity_ids || '').split('|').map(s => s.trim()).filter(s => s && s !== '-');
  const sec = (record.secondary_deity_ids || '').split('|').map(s => s.trim()).filter(s => s && s !== '-');
  if (main.length === 0 && sec.length === 0) return '';

  const deities = await DataLoader.load('deity');
  const idx = {};
  deities.forEach(d => { idx[d.master_id] = d; });

  function card(id, role) {
    const d = idx[id];
    const url = DataLoader.detailUrl(id);
    const roleClass = role === 'main' ? 'deity-card-main' : 'deity-card-secondary';
    if (!d) {
      return `<a href="${url}" class="deity-card ${roleClass}">
        <span class="deity-name">${escapeHtml(id)}</span>
        <span class="deity-id">(deity_master 未登録)</span>
      </a>`;
    }
    const reading = d.canonical_reading && d.canonical_reading !== '-' ? d.canonical_reading : '';
    const cat = d.category && d.category !== '-' ? d.category : '';
    const notes = d.notes && d.notes !== '-' ? d.notes.slice(0, 60) + (d.notes.length > 60 ? '…' : '') : '';
    return `<a href="${url}" class="deity-card ${roleClass}">
      <span class="deity-name">${escapeHtml(d.canonical_name)}</span>
      ${reading ? `<span class="deity-reading">${escapeHtml(reading)}</span>` : ''}
      <span class="deity-id"><code>${escapeHtml(id)}</code></span>
      ${cat ? `<span class="deity-cat">${escapeHtml(cat)}</span>` : ''}
      ${notes ? `<span class="deity-notes">${escapeHtml(notes)}</span>` : ''}
    </a>`;
  }

  let html = `<div class="detail-section"><h2>主祭神 / 配祀神</h2>`;
  if (main.length) {
    html += `<h3 class="enshrined-label"><span class="role-badge role-main">主祭神</span> ${main.length} 柱</h3>`;
    html += `<div class="deity-grid">${main.map(id => card(id, 'main')).join('')}</div>`;
  }
  if (sec.length) {
    html += `<h3 class="enshrined-label"><span class="role-badge role-secondary">配祀神</span> ${sec.length} 柱</h3>`;
    html += `<div class="deity-grid">${sec.map(id => card(id, 'secondary')).join('')}</div>`;
  }
  html += `</div>`;
  return html;
}

/** Google Map 埋め込みセクション(shrine 用) */
function renderMap(record) {
  const coords = (record.coordinates || '').trim();
  const validCoords = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(coords);
  const queryParts = [record.canonical_name, record.address, record.prefecture]
    .filter(x => x && x !== '-');
  const fallbackQuery = queryParts.join(' ');

  let embedQ, openQ, source;
  if (validCoords) {
    embedQ = coords;
    openQ = coords;
    source = `座標: ${coords}`;
  } else if (fallbackQuery) {
    embedQ = fallbackQuery;
    openQ = fallbackQuery;
    source = `住所検索: ${queryParts.join(' / ')}`;
  } else {
    // 表示する地理情報なし
    return '';
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedQ)}&z=${validCoords ? 15 : 13}&output=embed`;
  const openUrl = validCoords
    ? `https://www.google.com/maps?q=${encodeURIComponent(openQ)}`
    : `https://www.google.com/maps/search/${encodeURIComponent(openQ)}`;

  return `
    <div class="detail-section">
      <h2>所在地マップ</h2>
      <div class="map-embed">
        <iframe
          src="${escapeHtml(embedUrl)}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
          title="${escapeHtml(record.canonical_name || '所在地')} の地図"></iframe>
      </div>
      <p class="map-meta">
        ${escapeHtml(source)} ·
        <a href="${escapeHtml(openUrl)}" target="_blank" rel="noopener">Google マップで開く ↗</a>
      </p>
      ${!validCoords ? `<p class="map-note">※ 正確な座標は未収録のため、住所・社名で検索した結果を表示しています。実際の位置と異なる場合があります。</p>` : ''}
    </div>
  `;
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
      ['aliases', '別名'],
      ['aliases_reading', '別名読み'],
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
