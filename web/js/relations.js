// Relation explorer page
(async function () {
  const tableBody = document.querySelector('#relTable tbody');
  const table = document.getElementById('relTable');
  const tableWrap = document.getElementById('relTableWrap');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty');
  const idInput = document.getElementById('idInput');
  const typeFilter = document.getElementById('typeFilter');
  const layerFilter = document.getElementById('layerFilter');
  const listStats = document.getElementById('listStats');
  const listIntro = document.getElementById('listIntro');

  const params = new URLSearchParams(window.location.search);
  if (params.get('from')) idInput.value = params.get('from');
  if (params.get('type')) typeFilter.value = params.get('type');

  let relations = [];
  let nameMap = {};

  try {
    const [rels, deity, shrine, clan, motif, text, period, rank, event, region] = await Promise.all([
      DataLoader.load('relations'),
      DataLoader.load('deity'),
      DataLoader.load('shrine'),
      DataLoader.load('clan'),
      DataLoader.load('motif'),
      DataLoader.load('text'),
      DataLoader.load('period'),
      DataLoader.load('rank'),
      DataLoader.load('event'),
      DataLoader.load('region'),
    ]);
    relations = rels;

    // Build a global name map
    deity.forEach(r => { nameMap[r.master_id] = r.canonical_name; });
    shrine.forEach(r => { nameMap[r.master_id] = r.canonical_name; });
    clan.forEach(r => { nameMap[r.master_id] = r.canonical_name; });
    motif.forEach(r => { nameMap[r.motif_id] = r.motif_name; });
    text.forEach(r => { nameMap[r.text_id] = r.canonical_title; });
    period.forEach(r => { nameMap[r.period_id] = r.canonical_name; });
    rank.forEach(r => { nameMap[r.rank_id] = r.canonical_name; });
    event.forEach(r => { nameMap[r.event_id] = r.canonical_name; });
    region.forEach(r => { nameMap[r.region_id] = r.canonical_name; });

    // Populate relation type filter
    const types = {};
    relations.forEach(r => { types[r.relation_type] = (types[r.relation_type] || 0) + 1; });
    Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .forEach(([t, n]) => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = `${t} (${n.toLocaleString()})`;
        typeFilter.appendChild(opt);
      });

    listIntro.textContent = `全 ${relations.length.toLocaleString()} 件のリレーションから探索。ID・関係タイプ・確実性層で絞り込めます。`;
    loading.hidden = true;
    if (tableWrap) tableWrap.hidden = false;
    render();
  } catch (err) {
    loading.textContent = 'データの読み込みに失敗しました: ' + err.message;
    console.error(err);
  }

  function render() {
    const id = (idInput.value || '').trim();
    const t = typeFilter.value;
    const l = layerFilter.value;

    const filtered = relations.filter(r => {
      if (id && r.source_id !== id && r.target_id !== id) return false;
      if (t && r.relation_type !== t) return false;
      if (l && r.hypothesis_layer !== l) return false;
      return true;
    });

    listStats.textContent = `${filtered.length.toLocaleString()} 件 / 全 ${relations.length.toLocaleString()} 件`;

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const cap = 500;
    const display = filtered.slice(0, cap);
    const note = filtered.length > cap ? `<tr><td colspan="6" style="text-align:center; padding:14px; color:#8b7560;">表示は ${cap.toLocaleString()} 件までです。さらに絞り込んでください。</td></tr>` : '';

    const html = display.map(r => {
      const srcName = nameMap[r.source_id] || r.source_id;
      const tgtName = nameMap[r.target_id] || r.target_id;
      const srcUrl = DataLoader.detailUrl(r.source_id);
      const tgtUrl = DataLoader.detailUrl(r.target_id);
      const layerBadge = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const srcLink = srcUrl !== '#' ? `<a href="${srcUrl}">${escapeHtml(srcName)}</a>` : escapeHtml(srcName);
      const tgtLink = tgtUrl !== '#' ? `<a href="${tgtUrl}">${escapeHtml(tgtName)}</a>` : escapeHtml(tgtName);
      return `
        <tr>
          <td class="col-id" data-label="RLN ID">${escapeHtml(r.relation_id)}</td>
          <td data-label="ソース">${srcLink}<div style="color:#8b7560; font-size:0.78em;"><code>${escapeHtml(r.source_id)}</code></div></td>
          <td data-label="関係"><span class="relation-type">${escapeHtml(r.relation_type)}</span></td>
          <td data-label="ターゲット">${tgtLink}<div style="color:#8b7560; font-size:0.78em;"><code>${escapeHtml(r.target_id)}</code></div></td>
          <td class="col-meta" data-label="層">${layerBadge}<span style="color:#8b7560; font-size:0.85em;">conf=${escapeHtml(r.confidence_level || '')}</span></td>
          <td class="col-meta" data-label="出典" style="max-width:200px; font-size:0.85em;">${escapeHtml((r.source_reference || '').slice(0, 40))}</td>
        </tr>
      `;
    }).join('');
    tableBody.innerHTML = html + note;
  }

  let renderTimer;
  function debouncedRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }
  idInput.addEventListener('input', debouncedRender);
  typeFilter.addEventListener('change', render);
  layerFilter.addEventListener('change', render);

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
