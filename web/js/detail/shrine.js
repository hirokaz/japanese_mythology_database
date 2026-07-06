// web/js/detail/shrine.js
// 神社詳細 page 用 section renderer
// Functions: renderShrineProfile, renderShrineExtended, renderEnshrinedDeities, renderMap

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
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
      let yr = '';
      if (e && e.year_start && e.year_start !== '-') {
        yr = ` (${e.year_start}${e.year_end && e.year_end !== '-' && e.year_end !== e.year_start ? '-' + e.year_end : ''})`;
      }
      const dirLabel = r._dir === 'in' ? '当社で発生' : '関与';
      const note = r.notes ? ` — ${r.notes.slice(0, 80)}${r.notes.length > 80 ? '…' : ''}` : '';
      html += `<li>${layer}${itypeBadge}${l45Badge} <span class="relation-type">${dirLabel}</span> ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name + yr)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
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
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
      const note = r.notes ? ` — ${r.notes.slice(0, 60)}` : '';
      html += `<li>${layer}${itypeBadge}${l45Badge} ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(name)}${url !== '#' ? `</a>` : ''}<span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
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
  // associated_with に加え localized_via_shrine (モチーフの当社への土着化) も含める
  const motifRels = inRels.filter(r => r.source_type === 'motif_abstract' &&
    ['associated_with', 'localized_via_shrine'].includes(r.relation_type));
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
        const itypeBadge = renderInferenceTypeBadge(f);
        const l45Badge = renderL45WarnBadge(f);
        const cat = f.category && f.category !== '-' ? `<span class="badge badge-cat">${escapeHtml(f.category)}</span>` : '';
        const period = f.founded_period && f.founded_period !== '-' ? `<span class="festival-period">起源:${escapeHtml(f.founded_period)}</span>` : '';
        html += `<div class="festival-card">
          <div class="festival-head">
            <a href="${url}" class="festival-name">${escapeHtml(f.canonical_name)}</a>
            ${f.canonical_reading && f.canonical_reading !== '-' ? `<span class="festival-reading">${escapeHtml(f.canonical_reading)}</span>` : ''}
            ${layer}${itypeBadge}${l45Badge} ${cat}
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
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = renderL45WarnBadge(r);
          const note = r.notes ? ` — ${r.notes.slice(0, 80)}` : '';
          html += `<li>${layer}${itypeBadge}${l45Badge} <code>${escapeHtml(r.source_id)}</code><span style="color:#8b7560; font-size:0.88em;">${escapeHtml(note)}</span></li>`;
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

/** 神社の詳細解説・由緒・祭事・典拠(shrine_extended.tsv から) */
async function renderShrineExtended(record) {
  let extended = [];
  try { extended = await DataLoader.load('shrine_extended'); } catch (e) { return ''; }
  const entry = extended.find(e => e.shrine_id === record.master_id);
  if (!entry) return '';

  let html = `<div class="detail-section"><h2>詳細解説・由緒</h2>`;
  if (entry.extended_summary && entry.extended_summary !== '-') {
    html += `<p class="extended-summary">${escapeHtml(entry.extended_summary)}</p>`;
  }
  if (entry.history && entry.history !== '-') {
    html += `<div class="aux-section"><h3>歴史</h3><p>${escapeHtml(entry.history)}</p></div>`;
  }
  if (entry.rituals_culture && entry.rituals_culture !== '-') {
    html += `<div class="aux-section"><h3>祭事・文化</h3><p>${escapeHtml(entry.rituals_culture)}</p></div>`;
  }
  if (entry.primary_sources && entry.primary_sources !== '-') {
    html += `<div class="primary-sources"><strong>一次資料・典拠:</strong> `;
    html += entry.primary_sources.split('|').map(s =>
      `<span class="source-pill">${escapeHtml(s.trim())}</span>`).join(' ');
    html += `</div>`;
  }
  html += renderExternalLinks(entry.external_links, '外部リンク・公式');
  html += `</div>`;
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
