// web/js/detail/clan.js
// 氏族詳細 page 用 section renderer
// Functions: renderClanProfile, renderClanExtended

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
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
      const name = e ? e.canonical_name : r.target_id;
      let yr = '';
      if (e && e.year_start && e.year_start !== '-') {
        yr = ` (${e.year_start}${e.year_end && e.year_end !== '-' && e.year_end !== e.year_start ? '-' + e.year_end : ''})`;
      }
      const note = r.notes ? ` — ${r.notes.slice(0, 80)}${r.notes.length > 80 ? '…' : ''}` : '';
      html += `<li>${layer}${itypeBadge}${l45Badge} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name + yr)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
    });
    html += `</ul></div>`;
  }

  // ===== 7. 祭事 =====
  const ritualRels = outRels.filter(r => ['performed_ritual', 'performed_at'].includes(r.relation_type));
  if (ritualRels.length) {
    html += `<div class="detail-section"><h2>祭事 (${ritualRels.length})</h2><ul class="relation-list">`;
    ritualRels.forEach(r => {
      const layer = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
      const note = r.notes ? ` — ${r.notes.slice(0, 80)}` : '';
      html += `<li>${layer}${itypeBadge}${l45Badge} <code>${escapeHtml(r.target_id)}</code><span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
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
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
        html += `<li>${layer}${itypeBadge}${l45Badge} ${arrow} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''} <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(otherId)}</code><span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
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
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
      html += `<li>${layer}${itypeBadge}${l45Badge} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(r.target_id)}${url !== '#' ? `</a>` : ''}</li>`;
    });
    if (textRels.length > 20) html += `<li style="color:#8b7560; font-style:italic;">…他 ${textRels.length - 20} 件</li>`;
    html += `</ul></div>`;
  }

  return html;
}

async function renderClanExtended(record) {
  let extended = [];
  try { extended = await DataLoader.load('clan_extended'); } catch (e) { return ''; }
  const entry = extended.find(e => e.clan_id === record.master_id);
  if (!entry) return '';

  let html = `<div class="detail-section"><h2>詳細解説・典拠</h2>`;
  if (entry.extended_summary && entry.extended_summary !== '-') {
    html += `<p class="extended-summary">${escapeHtml(entry.extended_summary)}</p>`;
  }
  if (entry.history && entry.history !== '-') {
    html += `<div class="aux-section"><h3>歴史</h3><p>${escapeHtml(entry.history)}</p></div>`;
  }
  if (entry.notable_descendants && entry.notable_descendants !== '-') {
    html += `<div class="aux-section"><h3>主要な人物・子孫</h3><p>${escapeHtml(entry.notable_descendants)}</p></div>`;
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
