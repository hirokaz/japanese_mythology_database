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
          ${type === 'deity' ? renderEmperorReign(record) : ''}
          ${type === 'deity' ? await renderDeityExtended(record) : ''}
          ${type === 'shrine' ? await renderEnshrinedDeities(record) : ''}
          ${type === 'shrine' ? await renderShrineProfile(record, outgoing, incoming) : ''}
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
    if (window.Era) Era.applyEraConversion(content);
  } catch (err) {
    loading.textContent = '読み込みに失敗しました: ' + err.message;
    console.error(err);
  }
}

function getTypeLabel(t) {
  return { shrine: '神社', deity: '神格', clan: '氏族' }[t] || t;
}

/** deity の詳細解説・一次資料・典拠リンク(deity_extended.tsv から) */
async function renderDeityExtended(record) {
  let extended = [];
  try { extended = await DataLoader.load('deity_extended'); } catch (e) { return ''; }
  const entry = extended.find(e => e.deity_id === record.master_id);
  if (!entry) return '';

  let html = `<div class="detail-section"><h2>詳細解説・典拠</h2>`;
  if (entry.extended_summary && entry.extended_summary !== '-') {
    html += `<p class="extended-summary">${escapeHtml(entry.extended_summary)}</p>`;
  }
  if (entry.primary_sources && entry.primary_sources !== '-') {
    html += `<div class="primary-sources"><strong>一次資料・典拠:</strong> `;
    html += entry.primary_sources.split('|').map(s =>
      `<span class="source-pill">${escapeHtml(s.trim())}</span>`).join(' ');
    html += `</div>`;
  }
  if (entry.external_links && entry.external_links !== '-') {
    html += `<div class="external-links"><strong>外部リンク・原文:</strong><ul class="external-link-list">`;
    entry.external_links.split(' / ').forEach(item => {
      const trimmed = item.trim();
      const m = trimmed.match(/(https?:\/\/[^\s]+)/);
      if (m) {
        const url = m[1];
        const label = trimmed.replace(url, '').trim() || url;
        html += `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} <span class="ext-arrow">↗</span></a></li>`;
      } else {
        html += `<li class="ext-note">${escapeHtml(trimmed)}</li>`;
      }
    });
    html += `</ul></div>`;
  }
  html += `</div>`;
  return html;
}

/** 皇統 deity に在位・代数情報を表示(emperor_reign.js が読まれていればのみ) */
function renderEmperorReign(record) {
  if (!window.EmperorReign) return '';
  const info = window.EmperorReign[record.master_id];
  if (!info) return '';
  return `<div class="detail-section">
    <h2>在位・代数</h2>
    <dl class="kv-list">
      ${info.dai ? `<dt>代数</dt><dd>第${info.dai}代</dd>` : ''}
      ${info.reign ? `<dt>在位</dt><dd>${escapeHtml(info.reign)}</dd>` : ''}
      ${info.note ? `<dt>備考</dt><dd>${escapeHtml(info.note)}</dd>` : ''}
    </dl>
  </div>`;
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

  // ===== 7.5 氏族系譜(親→自分→子・兄弟・婚姻先 を階層表示) =====
  {
    // 親氏族(自分が descended_from / parent_clan_of の target)
    const parentClans = new Set();
    outRels.filter(r => r.target_type === 'clan' && r.relation_type === 'descended_from')
      .forEach(r => parentClans.add(r.target_id));
    inRels.filter(r => r.source_type === 'clan' && r.relation_type === 'parent_clan_of')
      .forEach(r => parentClans.add(r.source_id));

    // 子氏族(自分が parent_clan_of の source)
    const childClans = new Set();
    outRels.filter(r => r.target_type === 'clan' && r.relation_type === 'parent_clan_of')
      .forEach(r => childClans.add(r.target_id));
    inRels.filter(r => r.source_type === 'clan' && r.relation_type === 'descended_from')
      .forEach(r => childClans.add(r.source_id));

    // 兄弟氏族(同じ親氏族を共有):全 relations から探索
    const siblingClans = new Set();
    if (parentClans.size > 0) {
      const allRels = await DataLoader.load('relations');
      parentClans.forEach(pid => {
        allRels.forEach(r => {
          if (r.relation_type === 'parent_clan_of' && r.source_id === pid &&
              r.target_type === 'clan' && r.target_id !== record.master_id) {
            siblingClans.add(r.target_id);
          }
          if (r.relation_type === 'descended_from' && r.target_id === pid &&
              r.source_type === 'clan' && r.source_id !== record.master_id) {
            siblingClans.add(r.source_id);
          }
        });
      });
    }

    // 婚姻先
    const marryClans = new Set();
    outRels.filter(r => r.target_type === 'clan' && r.relation_type === 'married_into')
      .forEach(r => marryClans.add(r.target_id));
    inRels.filter(r => r.source_type === 'clan' && r.relation_type === 'married_into')
      .forEach(r => marryClans.add(r.source_id));

    const hasLineage = parentClans.size + childClans.size + siblingClans.size + marryClans.size > 0;
    if (hasLineage) {
      function pill(cid, isSelf) {
        const c = ci[cid];
        const url = DataLoader.detailUrl(cid);
        const name = c ? c.canonical_name : cid;
        const reading = c && c.canonical_reading && c.canonical_reading !== '-' ? c.canonical_reading : '';
        if (isSelf) {
          return `<span class="lineage-pill lineage-self">
            <span class="pill-name">${escapeHtml(name)}</span>
            <span class="pill-id">${escapeHtml(cid)}(本記録)</span>
          </span>`;
        }
        return `<a href="${url}" class="lineage-pill">
          <span class="pill-name">${escapeHtml(name)}</span>
          ${reading ? `<span class="pill-note">${escapeHtml(reading)}</span>` : ''}
          <span class="pill-id">${escapeHtml(cid)}</span>
        </a>`;
      }

      html += `<div class="detail-section"><h2>氏族系譜(階層)</h2><div class="lineage-tree">`;

      if (parentClans.size) {
        html += `<div class="lineage-tier">
          <span class="lineage-tier-label">親氏族(${parentClans.size})</span>
          <div class="lineage-row">${Array.from(parentClans).map(id => pill(id)).join('')}</div>
        </div>`;
        html += `<div class="lineage-conn">↓</div>`;
      }

      html += `<div class="lineage-tier">
        <span class="lineage-tier-label">自身</span>
        <div class="lineage-row">${pill(record.master_id, true)}`;
      if (marryClans.size) {
        html += `<span style="align-self:center; color:#c9a878; font-weight:700; font-size:1.1em; margin:0 4px;">‒‒</span>`;
        Array.from(marryClans).forEach(id => {
          html += pill(id);
        });
        html += `<span style="align-self:center; color:#8b7560; font-size:0.8em; margin-left:6px;">(婚姻)</span>`;
      }
      html += `</div></div>`;

      if (siblingClans.size) {
        html += `<div class="lineage-tier">
          <span class="lineage-tier-label">兄弟氏族(同じ親氏族から、${siblingClans.size})</span>
          <div class="lineage-row">${Array.from(siblingClans).slice(0, 20).map(id => pill(id)).join('')}</div>
        </div>`;
      }

      if (childClans.size) {
        html += `<div class="lineage-conn">↓</div>`;
        html += `<div class="lineage-tier">
          <span class="lineage-tier-label">子氏族・分家(${childClans.size})</span>
          <div class="lineage-row">${Array.from(childClans).slice(0, 30).map(id => pill(id)).join('')}</div>
        </div>`;
      }

      html += `</div></div>`;
    }
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

function _mkIdx(arr, key) {
  const m = {};
  arr.forEach(r => { m[r[key]] = r; });
  return m;
}

/** 神社の詳細プロファイル:来歴・歴史・社家・神話モチーフ・分祀・祭事・近接 */
async function renderShrineProfile(record, outRels, inRels) {
  const [shrines, clans, events, regions, texts, motifs, periods, ranks] = await Promise.all([
    DataLoader.load('shrine'),
    DataLoader.load('clan'),
    DataLoader.load('event'),
    DataLoader.load('region'),
    DataLoader.load('text'),
    DataLoader.load('motif'),
    DataLoader.load('period'),
    DataLoader.load('rank'),
  ]);
  const idx = {
    shrine: _mkIdx(shrines, 'master_id'),
    clan: _mkIdx(clans, 'master_id'),
    event: _mkIdx(events, 'event_id'),
    region: _mkIdx(regions, 'region_id'),
    text: _mkIdx(texts, 'text_id'),
    motif: _mkIdx(motifs, 'motif_id'),
    period: _mkIdx(periods, 'period_id'),
    rank: _mkIdx(ranks, 'rank_id'),
  };

  let html = '';

  // ===== 1. 来歴・解説 =====
  const hasOrigin = ['founding_year_estimated', 'founding_legend', 'notes']
    .some(k => record[k] && record[k] !== '-');
  if (hasOrigin) {
    html += `<div class="detail-section"><h2>来歴・解説</h2><dl class="kv-list">`;
    if (record.founding_year_estimated && record.founding_year_estimated !== '-') {
      html += `<dt>創建年代</dt><dd>${escapeHtml(record.founding_year_estimated)}</dd>`;
    }
    if (record.founding_legend && record.founding_legend !== '-') {
      html += `<dt>創建伝承</dt><dd>${escapeHtml(record.founding_legend)}</dd>`;
    }
    if (record.notes && record.notes !== '-') {
      html += `<dt>来歴・備考</dt><dd>${escapeHtml(record.notes)}</dd>`;
    }
    html += `</dl></div>`;
  }

  // ===== 2. 関連する歴史的出来事 =====
  const outEvents = outRels.filter(r => r.relation_type === 'participated_in' && r.target_type === 'event');
  const inEvents = inRels.filter(r => r.relation_type === 'occurred_at' && r.source_type === 'event');
  const allEvents = [
    ...outEvents.map(r => ({ ...r, _dir: 'out' })),
    ...inEvents.map(r => ({ ...r, _dir: 'in' })),
  ];
  if (allEvents.length) {
    html += `<div class="detail-section"><h2>関連する歴史的出来事 (${allEvents.length})</h2><ul class="relation-list">`;
    allEvents.forEach(r => {
      const eid = r._dir === 'out' ? r.target_id : r.source_id;
      const e = idx.event[eid];
      const url = DataLoader.detailUrl(eid);
      const name = e ? e.canonical_name : eid;
      const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      let yr = '';
      if (e && e.year_start && e.year_start !== '-') {
        yr = ` (${e.year_start}${e.year_end && e.year_end !== '-' && e.year_end !== e.year_start ? '-' + e.year_end : ''})`;
      }
      const dirLabel = r._dir === 'in' ? '当社で発生' : '関与';
      const note = r.notes ? ` — ${r.notes.slice(0, 80)}${r.notes.length > 80 ? '…' : ''}` : '';
      html += `<li>${layer} <span class="relation-type">${dirLabel}</span> ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name + yr)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
    });
    html += `</ul></div>`;
  }

  // ===== 3. 言及文献 =====
  const textRels = outRels.filter(r => r.relation_type === 'mentioned_in' && r.target_type === 'text');
  if (textRels.length) {
    html += `<div class="detail-section"><h2>言及文献 (${textRels.length})</h2><ul class="relation-list">`;
    textRels.slice(0, 20).forEach(r => {
      const t = idx.text[r.target_id];
      const url = DataLoader.detailUrl(r.target_id);
      const name = t ? t.canonical_title : r.target_id;
      const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const note = r.notes ? ` — ${r.notes.slice(0, 60)}` : '';
      html += `<li>${layer} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
    });
    if (textRels.length > 20) html += `<li style="color:#8b7560; font-style:italic;">…他 ${textRels.length - 20} 件</li>`;
    html += `</ul></div>`;
  }

  // ===== 4. 社家・祭祀氏族 =====
  const clanCtrl = inRels.filter(r =>
    r.source_type === 'clan' &&
    ['controls', 'controls_shrine', 'associated_with'].includes(r.relation_type)
  );
  if (clanCtrl.length) {
    html += `<div class="detail-section"><h2>社家・祭祀氏族 (${clanCtrl.length})</h2><div class="deity-grid">`;
    clanCtrl.forEach(r => {
      const c = idx.clan[r.source_id];
      const url = DataLoader.detailUrl(r.source_id);
      if (c) {
        const cat = c.clan_type && c.clan_type !== '-' ? c.clan_type : '';
        const peak = c.peak_period && c.peak_period !== '-' ? c.peak_period : '';
        html += `<a href="${url}" class="deity-card">
          <span class="deity-name">${escapeHtml(c.canonical_name)}</span>
          ${c.canonical_reading && c.canonical_reading !== '-' ? `<span class="deity-reading">${escapeHtml(c.canonical_reading)}</span>` : ''}
          <span class="deity-id"><code>${escapeHtml(r.source_id)}</code></span>
          ${cat ? `<span class="deity-cat">${escapeHtml(cat)}</span>` : ''}
          ${peak ? `<span class="deity-notes">最盛期: ${escapeHtml(peak)}</span>` : ''}
          <span class="deity-notes"><span class="relation-type">${escapeHtml(r.relation_type)}</span></span>
        </a>`;
      } else {
        html += `<a href="${url}" class="deity-card"><span class="deity-name">${escapeHtml(r.source_id)}</span></a>`;
      }
    });
    html += `</div></div>`;
  }

  // ===== 5. 関連神話・モチーフ =====
  const motifRels = inRels.filter(r => r.source_type === 'motif_abstract' && r.relation_type === 'associated_with');
  if (motifRels.length) {
    html += `<div class="detail-section"><h2>関連神話・モチーフ (${motifRels.length})</h2><ul class="relation-list">`;
    motifRels.slice(0, 30).forEach(r => {
      const m = idx.motif[r.source_id];
      const url = DataLoader.detailUrl(r.source_id);
      const name = m ? m.motif_name : r.source_id;
      const cat = m && m.category && m.category !== '-' ? `<span class="badge badge-cat">${escapeHtml(m.category)}</span>` : '';
      const summary = m && m.summary && m.summary !== '-' ? ` — ${m.summary.slice(0, 80)}${m.summary.length > 80 ? '…' : ''}` : '';
      html += `<li>${cat} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(summary)}</span></li>`;
    });
    if (motifRels.length > 30) html += `<li style="color:#8b7560; font-style:italic;">…他 ${motifRels.length - 30} 件</li>`;
    html += `</ul></div>`;
  }

  // ===== 6. 分祀ネットワーク =====
  const NET_LABELS = {
    descended_from: '親社・本社',
    parent_shrine_of: '子社・分祀先',
    sibling_shrine_of: '兄弟社',
    has_subordinate_shrine: '配下社',
  };
  const outNet = outRels.filter(r => r.target_type === 'shrine' && NET_LABELS[r.relation_type]);
  const inNet = inRels.filter(r => r.source_type === 'shrine' && NET_LABELS[r.relation_type]);
  if (outNet.length || inNet.length) {
    html += `<div class="detail-section"><h2>分祀ネットワーク (${outNet.length + inNet.length})</h2>`;
    const grouped = {};
    [...outNet.map(r => ({ ...r, _dir: 'out' })), ...inNet.map(r => ({ ...r, _dir: 'in' }))]
      .forEach(r => { (grouped[r.relation_type] = grouped[r.relation_type] || []).push(r); });
    Object.entries(grouped).forEach(([t, items]) => {
      html += `<h3 class="enshrined-label"><span class="relation-type">${escapeHtml(t)}</span> <span style="color:#8b7560; font-weight:400;">${escapeHtml(NET_LABELS[t])} · ${items.length} 件</span></h3>`;
      html += `<ul class="relation-list">`;
      items.slice(0, 15).forEach(r => {
        const otherId = r._dir === 'out' ? r.target_id : r.source_id;
        const s = idx.shrine[otherId];
        const url = DataLoader.detailUrl(otherId);
        const name = s ? s.canonical_name : otherId;
        const arrow = r._dir === 'out' ? '→' : '←';
        const pref = s && s.prefecture && s.prefecture !== '-' ? ` <span class="badge badge-rank">${escapeHtml(s.prefecture)}</span>` : '';
        const note = r.notes ? ` — ${r.notes.slice(0, 60)}` : '';
        html += `<li>${arrow} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''} <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(otherId)}</code>${pref}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
      });
      if (items.length > 15) html += `<li style="color:#8b7560; font-style:italic;">…他 ${items.length - 15} 件</li>`;
      html += `</ul>`;
    });
    html += `</div>`;
  }

  // ===== 7. 分類・属性(時代・社格・地域) =====
  const periodRels = outRels.filter(r => r.target_type === 'period');
  const rankRels = outRels.filter(r => r.target_type === 'rank');
  const regionRels = outRels.filter(r => r.target_type === 'region');
  if (periodRels.length || rankRels.length || regionRels.length) {
    html += `<div class="detail-section"><h2>分類・属性</h2><dl class="kv-list">`;
    if (periodRels.length) {
      html += `<dt>時代区分</dt><dd>` + periodRels.map(r => {
        const p = idx.period[r.target_id];
        const u = DataLoader.detailUrl(r.target_id);
        return `<a href="${u}">${escapeHtml(p ? p.canonical_name : r.target_id)}</a>`;
      }).join(' / ') + `</dd>`;
    }
    if (rankRels.length) {
      html += `<dt>社格(タグ)</dt><dd>` + rankRels.map(r => {
        const k = idx.rank[r.target_id];
        const u = DataLoader.detailUrl(r.target_id);
        return `<a href="${u}">${escapeHtml(k ? k.canonical_name : r.target_id)}</a>`;
      }).join(' / ') + `</dd>`;
    }
    if (regionRels.length) {
      html += `<dt>関連地域</dt><dd>` + regionRels.slice(0, 8).map(r => {
        const reg = idx.region[r.target_id];
        const u = DataLoader.detailUrl(r.target_id);
        return `<a href="${u}">${escapeHtml(reg ? reg.canonical_name : r.target_id)}</a>`;
      }).join(' / ') + `</dd>`;
    }
    html += `</dl></div>`;
  }

  // ===== 8. 祭事・行事(festival_master ベースの詳細表示) =====
  const ritualRels = inRels.filter(r => r.relation_type === 'performed_at');
  if (ritualRels.length) {
    // festival_master を別途ロード(他で読まれていないので)
    let festivals = [];
    try { festivals = await DataLoader.load('festival'); } catch (e) { /* no festival master */ }
    const fi = {};
    festivals.forEach(f => { fi[f.festival_id] = f; });

    // FES- 始まりの祭事(詳細カード表示)とその他(レガシー RIT- 等、リスト表示)を分離
    const festRels = ritualRels.filter(r => r.source_id.startsWith('FES-'));
    const otherRels = ritualRels.filter(r => !r.source_id.startsWith('FES-'));

    if (festRels.length || otherRels.length) {
      html += `<div class="detail-section"><h2>祭事・行事 (${ritualRels.length})</h2>`;

      // 詳細カード(FES-)
      festRels.forEach(r => {
        const f = fi[r.source_id];
        if (!f) {
          html += `<div class="festival-card"><a href="${DataLoader.detailUrl(r.source_id)}"><strong>${escapeHtml(r.source_id)}</strong></a></div>`;
          return;
        }
        const url = DataLoader.detailUrl(r.source_id);
        const layer = f.hypothesis_layer ? `<span class="badge badge-${f.hypothesis_layer.toLowerCase()}">${escapeHtml(f.hypothesis_layer)}</span>` : '';
        const cat = f.category && f.category !== '-' ? `<span class="badge badge-cat">${escapeHtml(f.category)}</span>` : '';
        const period = f.founded_period && f.founded_period !== '-' ? `<span class="festival-period">起源:${escapeHtml(f.founded_period)}</span>` : '';
        html += `<div class="festival-card">
          <div class="festival-head">
            <a href="${url}" class="festival-name">${escapeHtml(f.canonical_name)}</a>
            ${f.canonical_reading && f.canonical_reading !== '-' ? `<span class="festival-reading">${escapeHtml(f.canonical_reading)}</span>` : ''}
            ${layer} ${cat}
          </div>
          ${f.date_pattern && f.date_pattern !== '-' ? `<div class="festival-meta"><strong>時期:</strong> ${escapeHtml(f.date_pattern)} ${period}</div>` : period ? `<div class="festival-meta">${period}</div>` : ''}
          ${f.summary && f.summary !== '-' ? `<p class="festival-summary">${escapeHtml(f.summary)}</p>` : ''}
          ${f.ritual_content && f.ritual_content !== '-' ? `<p class="festival-detail"><strong>内容:</strong> ${escapeHtml(f.ritual_content)}</p>` : ''}
          ${f.history && f.history !== '-' ? `<p class="festival-detail"><strong>経緯:</strong> ${escapeHtml(f.history)}</p>` : ''}
          ${f.notes && f.notes !== '-' ? `<p class="festival-note">${escapeHtml(f.notes)}</p>` : ''}
          <div class="festival-foot">
            <code>${escapeHtml(f.festival_id)}</code>
            ${f.source_reference && f.source_reference !== '-' ? `<span class="festival-source">出典:${escapeHtml(f.source_reference)}</span>` : ''}
          </div>
        </div>`;
      });

      // レガシー RIT- 等の簡易リスト
      if (otherRels.length) {
        html += `<h3 class="enshrined-label">その他の祭事関連レコード (${otherRels.length})</h3>`;
        html += `<ul class="relation-list">`;
        otherRels.slice(0, 20).forEach(r => {
          const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
          const note = r.notes ? ` — ${r.notes.slice(0, 80)}` : '';
          html += `<li>${layer} <code>${escapeHtml(r.source_id)}</code><span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
        });
        if (otherRels.length > 20) html += `<li style="color:#8b7560; font-style:italic;">…他 ${otherRels.length - 20} 件</li>`;
        html += `</ul>`;
      }

      html += `</div>`;
    }
  }

  // ===== 9. 近接神社(located_near) =====
  const nearRels = outRels.filter(r => r.relation_type === 'located_near' && r.target_type === 'shrine');
  if (nearRels.length) {
    const showCount = Math.min(nearRels.length, 8);
    html += `<div class="detail-section"><h2>近接神社 (${showCount}${nearRels.length > 8 ? ' / ' + nearRels.length : ''})</h2><ul class="relation-list">`;
    nearRels.slice(0, 8).forEach(r => {
      const s = idx.shrine[r.target_id];
      const url = DataLoader.detailUrl(r.target_id);
      const name = s ? s.canonical_name : r.target_id;
      const pref = s && s.prefecture && s.prefecture !== '-' ? ` <span class="badge badge-rank">${escapeHtml(s.prefecture)}</span>` : '';
      html += `<li>${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''} <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(r.target_id)}</code>${pref}</li>`;
    });
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
      // founding_year_estimated / founding_legend / notes は
      // renderShrineProfile の「来歴・解説」専用セクションへ移管
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
