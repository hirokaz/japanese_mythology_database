// Relation explorer page
(async function () {
  const tableBody = document.querySelector('#relTable tbody');
  const tableWrap = document.getElementById('relTableWrap');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty');
  const idInput = document.getElementById('idInput');
  const typeFilter = document.getElementById('typeFilter');
  const layerFilter = document.getElementById('layerFilter');
  const listStats = document.getElementById('listStats');
  const listIntro = document.getElementById('listIntro');

  const pagination = document.getElementById('pagination');
  const pagePrev = document.getElementById('pagePrev');
  const pageNext = document.getElementById('pageNext');
  const pageInfo = document.getElementById('pageInfo');
  const pageSizeSel = document.getElementById('pageSize');
  const inferenceTypeFilter = document.getElementById('inferenceTypeFilter');
  const personaFilter = document.getElementById('personaFilter');
  const personaHint = document.getElementById('personaHint');

  // DISC-001 v0.2 / DISC-010 Persona view 規約
  const PERSONA_FILTERS = {
    A: {
      hint: 'Persona A 研究者: contradiction-rich query。反対説・L4-L5 含む全表示',
      apply: (r) => true,
    },
    B: {
      hint: 'Persona B 神職: verified + lineage focus (descended_from / parent_of / has_rank / served 等)',
      apply: (r) => {
        const lineageTypes = ['descended_from', 'parent_of', 'sibling_of', 'married_to', 'consort_of', 'syncretized_with', 'merged_into', 'founded_by', 'succeeded_by', 'predecessor_of', 'has_rank', 'served', 'controls', 'controlled_by', 'has_subordinate_shrine'];
        return (!r.hypothesis_layer || ['L0', 'L1', 'L2'].includes(r.hypothesis_layer))
          && lineageTypes.includes(r.relation_type);
      },
    },
    C: {
      hint: 'Persona C 教育者: pedagogically safe (L0 + source_backed/inferential、symbolic/speculative 除外)',
      apply: (r) => {
        return r.hypothesis_layer === 'L0'
          && (r.inference_type === 'source_backed' || r.inference_type === 'inferential')
          && (r.confidence_level === 'A' || r.confidence_level === 'B');
      },
    },
    D: {
      hint: 'Persona D 観光: shrine/region/rank に関わる relation のみ',
      apply: (r) => {
        const tourismTypes = ['enshrined_at', 'primary_deity_of', 'secondary_deity_of', 'located_in', 'located_near', 'located_in_country', 'is_ichinomiya_of', 'has_rank', 'has_festival', 'host_shrine_of'];
        return tourismTypes.includes(r.relation_type)
          && (!r.hypothesis_layer || ['L0', 'L1'].includes(r.hypothesis_layer));
      },
    },
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get('from')) idInput.value = params.get('from');
  // ?type= は <option> 生成後でないと select に反映されないため後段で設定

  let relations = [];
  let nameMap = {};
  let currentPage = 0;
  let pageSize = 100;
  // インデックス (関係探索高速化用): id -> [relation,...], type -> [relation,...]
  let idIndex = null;
  let typeIndex = null;

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

    // インデックス構築 (ID で絞り込む頻度が高いので O(1) lookup を可能に)
    idIndex = {};
    typeIndex = {};
    relations.forEach(r => {
      (idIndex[r.source_id] = idIndex[r.source_id] || []).push(r);
      (idIndex[r.target_id] = idIndex[r.target_id] || []).push(r);
      (typeIndex[r.relation_type] = typeIndex[r.relation_type] || []).push(r);
    });

    // ディープリンク (?type=) を option 生成後に反映
    if (params.get('type')) typeFilter.value = params.get('type');

    listIntro.textContent = `全 ${relations.length.toLocaleString()} 件のリレーションから探索。ID・関係タイプ・確実性層で絞り込めます。`;
    loading.hidden = true;
    if (tableWrap) tableWrap.hidden = false;
    render();
  } catch (err) {
    loading.textContent = 'データの読み込みに失敗しました: ' + err.message;
    console.error(err);
  }

  function render(resetPage) {
    if (resetPage !== false) currentPage = 0;
    // マスター ID は全て大文字 ASCII のため、小文字入力 (shr-016 等) も許容する
    const id = (idInput.value || '').trim().toUpperCase();
    const t = typeFilter.value;
    const l = layerFilter.value;
    const itype = inferenceTypeFilter ? inferenceTypeFilter.value : '';
    const persona = personaFilter ? personaFilter.value : '';

    if (personaHint) {
      personaHint.textContent = persona && PERSONA_FILTERS[persona] ? PERSONA_FILTERS[persona].hint : '';
    }

    // インデックスを使った高速絞り込み
    let candidates;
    if (id && idIndex && idIndex[id]) {
      // ID 指定があればその ID を含む relation だけから開始 (重複除去)
      const seen = new Set();
      candidates = idIndex[id].filter(r => {
        if (seen.has(r.relation_id)) return false;
        seen.add(r.relation_id);
        return true;
      });
    } else if (t && typeIndex && typeIndex[t]) {
      candidates = typeIndex[t];
    } else {
      candidates = relations;
    }

    const personaApply = persona && PERSONA_FILTERS[persona] ? PERSONA_FILTERS[persona].apply : null;
    const filtered = candidates.filter(r => {
      if (id && r.source_id !== id && r.target_id !== id) return false;
      if (t && r.relation_type !== t) return false;
      if (l && r.hypothesis_layer !== l) return false;
      if (itype && r.inference_type !== itype) return false;
      if (personaApply && !personaApply(r)) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    if (currentPage < 0) currentPage = 0;

    const start = currentPage * pageSize;
    const end = Math.min(start + pageSize, total);

    listStats.textContent = total > 0
      ? `${total.toLocaleString()} 件 (${(start + 1).toLocaleString()}–${end.toLocaleString()} を表示) / 全 ${relations.length.toLocaleString()} 件`
      : `0 件 / 全 ${relations.length.toLocaleString()} 件`;

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      empty.hidden = false;
      if (pagination) pagination.hidden = true;
      return;
    }
    empty.hidden = true;

    // ページネーション更新
    if (pagination) {
      pagination.hidden = false;
      pageInfo.textContent = `${currentPage + 1} / ${totalPages} ページ`;
      pagePrev.disabled = currentPage === 0;
      pageNext.disabled = currentPage >= totalPages - 1;
    }

    const display = filtered.slice(start, end);

    const html = display.map(r => {
      const srcName = nameMap[r.source_id] || r.source_id;
      const tgtName = nameMap[r.target_id] || r.target_id;
      const srcUrl = DataLoader.detailUrl(r.source_id);
      const tgtUrl = DataLoader.detailUrl(r.target_id);
      const layerBadge = r.hypothesis_layer ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>` : '';
      const itypeBadge = renderInferenceTypeBadge(r);
      const l45Badge = (r.hypothesis_layer === 'L4' || r.hypothesis_layer === 'L5')
        ? ` <span class="badge-l4-5-warn" title="L4-L5 仮説: 両論並記必須">⚠ L4-L5</span>` : '';
      const srcLink = srcUrl !== '#' ? `<a href="${srcUrl}">${escapeHtml(srcName)}</a>` : escapeHtml(srcName);
      const tgtLink = tgtUrl !== '#' ? `<a href="${tgtUrl}">${escapeHtml(tgtName)}</a>` : escapeHtml(tgtName);
      return `
        <tr>
          <td class="col-id" data-label="RLN ID">${escapeHtml(r.relation_id)}</td>
          <td data-label="ソース">${srcLink}<div style="color:#8b7560; font-size:0.78em;"><code>${escapeHtml(r.source_id)}</code></div></td>
          <td data-label="関係"><span class="relation-type">${escapeHtml(r.relation_type)}</span></td>
          <td data-label="ターゲット">${tgtLink}<div style="color:#8b7560; font-size:0.78em;"><code>${escapeHtml(r.target_id)}</code></div></td>
          <td class="col-meta" data-label="層">${layerBadge}${itypeBadge}${l45Badge}<span style="color:#8b7560; font-size:0.85em; display:block;">conf=${escapeHtml(r.confidence_level || '')}</span></td>
          <td class="col-meta" data-label="出典" style="max-width:200px; font-size:0.85em;">${escapeHtml((r.source_reference || '').slice(0, 40))}</td>
        </tr>
      `;
    }).join('');
    tableBody.innerHTML = html;
    if (window.Era) Era.applyEraConversion(tableBody);
  }

  let renderTimer;
  function debouncedRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }
  idInput.addEventListener('input', debouncedRender);
  typeFilter.addEventListener('change', () => render(true));
  layerFilter.addEventListener('change', () => render(true));
  if (inferenceTypeFilter) inferenceTypeFilter.addEventListener('change', () => render(true));
  if (personaFilter) personaFilter.addEventListener('change', () => render(true));
  if (pageSizeSel) pageSizeSel.addEventListener('change', e => {
    pageSize = parseInt(e.target.value, 10) || 100;
    render(true);
  });
  if (pagePrev) pagePrev.addEventListener('click', () => {
    if (currentPage > 0) { currentPage -= 1; render(false); }
  });
  if (pageNext) pageNext.addEventListener('click', () => {
    currentPage += 1; render(false);
  });

  function renderInferenceTypeBadge(r) {
    const itype = r.inference_type;
    if (!itype || itype === 'source_backed') return '';
    const labels = {
      'inferential':  { text: '推', cls: 'badge-warn', tip: 'inference_type=inferential: 史料からの妥当な推論' },
      'speculative':  { text: '仮', cls: 'badge-speculative', tip: 'inference_type=speculative: 検証困難な仮説' },
      'symbolic':     { text: '象', cls: 'badge-symbolic', tip: 'inference_type=symbolic: 象徴的・神話的解釈 (motif/mythologem)' },
    };
    const lbl = labels[itype];
    if (!lbl) return '';
    return ` <span class="badge ${lbl.cls}" title="${escapeHtml(lbl.tip)}">${escapeHtml(lbl.text)}</span>`;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
