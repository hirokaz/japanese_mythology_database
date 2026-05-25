// Temporal Persistence Page — DISC-012 採択 Phase 6
// Ritual Epoch / Continuity Break / Persistence Medium の可視化

(function () {
  // タブ切替
  const tabs = document.querySelectorAll('.temporal-tab');
  const sections = document.querySelectorAll('.temporal-section');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      sections.forEach(s => s.classList.toggle('active', s.id === `section-${target}`));
    });
  });

  function parseTsv(text) {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) return { header: [], rows: [] };
    const header = lines[0].split('\t');
    const rows = lines.slice(1).map(line => {
      const cells = line.split('\t');
      return Object.fromEntries(header.map((h, i) => [h, cells[i] || '']));
    });
    return { header, rows };
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // === Ritual Epoch ===
  let epochs = [];
  fetch('../data/ritual_epoch.tsv')
    .then(r => r.text())
    .then(text => {
      const parsed = parseTsv(text);
      epochs = parsed.rows;
      renderEpochs();
    })
    .catch(e => {
      document.getElementById('epochList').innerHTML = `<p style="color:#c44;">読み込み失敗: ${e.message}</p>`;
    });

  function renderEpochs() {
    const cycleFilter = document.getElementById('cycleFilter').value;
    const scopeFilter = document.getElementById('scopeFilter').value;
    const filtered = epochs.filter(e => {
      if (cycleFilter === '-') {
        // continuous / conditional (non-numeric or empty cycle)
        const n = parseInt(e.cycle_length, 10);
        return isNaN(n);
      }
      if (cycleFilter && String(e.cycle_length) !== cycleFilter) return false;
      if (scopeFilter && e.sync_scope !== scopeFilter) return false;
      return true;
    });
    document.getElementById('epochStats').textContent =
      `${filtered.length} / ${epochs.length} 件`;

    const html = filtered.map(e => {
      const cycle = e.cycle_length && e.cycle_unit
        ? `<span class="ti-cycle">${escapeHtml(e.cycle_length)} ${escapeHtml(e.cycle_unit)} 周期</span>` : '';
      const status = e.status ? `<span class="ti-period">${escapeHtml(e.status)}</span>` : '';
      const mediums = (e.persistence_medium || '').split('|').filter(Boolean).map(m =>
        `<span class="badge-medium medium-strong">${escapeHtml(m)}</span>`).join('');
      return `
        <div class="timeline-item">
          <h3>${escapeHtml(e.canonical_name)} (${escapeHtml(e.epoch_id)})</h3>
          <div class="ti-meta">
            ${status}${cycle}
            <span style="color: #8b7560;">${escapeHtml(e.start_year)} → ${escapeHtml(e.end_year)}</span>
            ${e.repetition_count && e.repetition_count !== '不明' ? `<span style="color:#5a4a35;"> · 反復 ${escapeHtml(e.repetition_count)} 回</span>` : ''}
          </div>
          <div class="ti-meta">
            sync: ${escapeHtml(e.sync_scope || '?')} / ${escapeHtml(e.sync_type || '?')}
          </div>
          <div class="ti-meta">${mediums}</div>
          <div class="ti-meta" style="color: #6e5a3a;">${escapeHtml(e.notes || '')}</div>
          <div class="ti-meta" style="color: #8b7560; font-size: 0.82em;">
            出典: ${escapeHtml(e.source_reference || '?')} · inference: ${escapeHtml(e.inference_type || '?')} · confidence: ${escapeHtml(e.time_confidence || '?')}
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('epochList').innerHTML = html || '<p>該当なし</p>';
  }

  document.getElementById('cycleFilter').addEventListener('change', renderEpochs);
  document.getElementById('scopeFilter').addEventListener('change', renderEpochs);

  // === Continuity Break ===
  let breaks = [];
  fetch('../data/continuity_break.tsv')
    .then(r => r.text())
    .then(text => {
      const parsed = parseTsv(text);
      breaks = parsed.rows;
      renderBreaks();
    })
    .catch(e => {
      document.getElementById('breakList').innerHTML = `<p style="color:#c44;">読み込み失敗: ${e.message}</p>`;
    });

  function renderBreaks() {
    const cat = document.getElementById('breakCategoryFilter').value;
    const filtered = breaks.filter(b => {
      const isRewrite = b.is_civilization_rewrite === 'true';
      const isInvented = b.reactivation_type === 'invented';
      if (cat === 'rewrite' && !isRewrite) return false;
      if (cat === 'invented' && !isInvented) return false;
      if (cat === 'individual' && (isRewrite || isInvented)) return false;
      return true;
    });
    document.getElementById('breakStats').textContent =
      `${filtered.length} / ${breaks.length} 件`;

    const html = filtered.map(b => {
      const isRewrite = b.is_civilization_rewrite === 'true';
      const isInvented = b.reactivation_type === 'invented';
      const cls = isInvented ? 'timeline-item invented' : isRewrite ? 'timeline-item rewrite' : 'timeline-item';
      const rewriteBadge = isRewrite ? '<span class="badge-rewrite">civilization rewrite</span>' : '';
      const inventedBadge = isInvented ? '<span class="badge-invented">invented continuity</span>' : '';
      return `
        <div class="${cls}">
          <h3>${escapeHtml(b.canonical_name)} (${escapeHtml(b.break_id)})</h3>
          <div class="ti-meta">
            <span class="ti-period">${escapeHtml(b.start_year)} → ${escapeHtml(b.end_year)}</span>
            ${rewriteBadge} ${inventedBadge}
          </div>
          <div class="ti-meta"><strong>原因:</strong> ${escapeHtml(b.cause || '?')}</div>
          ${b.reactivation_type && b.reactivation_type !== '-' ? `<div class="ti-meta">reactivation: <strong>${escapeHtml(b.reactivation_type)}</strong> (${escapeHtml(b.reactivation_year || '?')})</div>` : ''}
          <div class="ti-meta" style="color: #6e5a3a;">${escapeHtml(b.notes || '')}</div>
          <div class="ti-meta" style="color: #8b7560; font-size: 0.82em;">
            出典: ${escapeHtml(b.source_reference || '?')} · inference: ${escapeHtml(b.inference_type || '?')}
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('breakList').innerHTML = html || '<p>該当なし</p>';
  }

  document.getElementById('breakCategoryFilter').addEventListener('change', renderBreaks);

  // === Persistence Medium ===
  let mediums = [];
  fetch('../data/persistence_medium.tsv')
    .then(r => r.text())
    .then(text => {
      const parsed = parseTsv(text);
      mediums = parsed.rows;
      renderMediums();
    })
    .catch(e => {
      document.getElementById('mediumList').innerHTML = `<p style="color:#c44;">読み込み失敗: ${e.message}</p>`;
    });

  function renderMediums() {
    const mt = document.getElementById('mediumFilter').value;
    const st = document.getElementById('strengthFilter').value;
    const filtered = mediums.filter(m => {
      if (mt && m.medium_type !== mt && !(m.medium_type || '').includes(mt)) return false;
      if (st && m.strength !== st) return false;
      return true;
    });
    document.getElementById('mediumStats').textContent =
      `${filtered.length} / ${mediums.length} 件`;

    const html = filtered.map(m => {
      const strCls = m.strength === 'strong' ? 'medium-strong' :
                     m.strength === 'terminated' ? 'medium-terminated' :
                     'medium-medium';
      const mediumBadges = (m.medium_type || '').split('|').filter(Boolean).map(mt =>
        `<span class="badge-medium ${strCls}">${escapeHtml(mt)}</span>`).join('');
      return `
        <div class="timeline-item">
          <h3>${escapeHtml(m.canonical_name)} (${escapeHtml(m.entry_id)})</h3>
          <div class="ti-meta">
            <code style="font-size: 0.82em;">${escapeHtml(m.entity_id)}</code>
            ${mediumBadges}
            <span class="ti-period">strength: ${escapeHtml(m.strength)}</span>
          </div>
          <div class="ti-meta">継続期間: <strong>${escapeHtml(m.continuity_window || '?')}</strong></div>
          <div class="ti-meta" style="color: #6e5a3a;">${escapeHtml(m.notes || '')}</div>
          <div class="ti-meta" style="color: #8b7560; font-size: 0.82em;">
            出典: ${escapeHtml(m.source_reference || '?')} · inference: ${escapeHtml(m.inference_type || '?')}
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('mediumList').innerHTML = html || '<p>該当なし</p>';
  }

  document.getElementById('mediumFilter').addEventListener('change', renderMediums);
  document.getElementById('strengthFilter').addEventListener('change', renderMediums);

  // === Entity Version (Phase 2 part) ===
  let versions = [];
  fetch('../data/entity_version.tsv')
    .then(r => r.text())
    .then(text => {
      const parsed = parseTsv(text);
      versions = parsed.rows;
      renderVersions();
    })
    .catch(e => {
      document.getElementById('versionList').innerHTML = `<p style="color:#c44;">読み込み失敗: ${e.message}</p>`;
    });

  function continuityBadge(field, value) {
    if (!value || value === '-') return '';
    const cls = (value === 'maintained' || value === 'exact') ? 'medium-strong' :
                (value.includes('broken') || value === 'terminated' || value === 'relocated') ? 'medium-terminated' :
                'medium-medium';
    return `<span class="badge-medium ${cls}" title="${escapeHtml(field)}">${escapeHtml(field.split('_')[0])}: ${escapeHtml(value)}</span>`;
  }

  function renderVersions() {
    const ef = document.getElementById('entityFilter').value;
    const epf = document.getElementById('epochFilterVer').value;
    const filtered = versions.filter(v => {
      if (ef && v.entity_id !== ef) return false;
      if (epf && !(v.epoch || '').includes(epf)) return false;
      return true;
    });
    document.getElementById('versionStats').textContent =
      `${filtered.length} / ${versions.length} 件`;

    const html = filtered.map(v => {
      const continuities = [
        ['physical_continuity', v.physical_continuity],
        ['ritual_continuity', v.ritual_continuity],
        ['institutional_continuity', v.institutional_continuity],
        ['narrative_continuity', v.narrative_continuity],
        ['location_continuity', v.location_continuity],
      ].map(([f, val]) => continuityBadge(f, val)).join(' ');
      const ruptureBadge = (v.rupture_score === 'high') ?
        '<span class="badge-rewrite">rupture: high</span>' :
        v.rupture_score === 'medium' ?
        '<span class="badge-medium medium-medium">rupture: medium</span>' :
        '';
      const revivalBadge = v.revival_status === 'reconstructed' ?
        '<span class="badge-medium medium-medium">revival: reconstructed</span>' :
        v.revival_status === 'revived' ?
        '<span class="badge-medium medium-strong">revival: revived</span>' :
        '';
      return `
        <div class="timeline-item">
          <h3>${escapeHtml(v.entity_id)} ${escapeHtml(v.version_id)} — ${escapeHtml(v.epoch)}</h3>
          <div class="ti-meta">
            <span class="ti-period">${escapeHtml(v.epoch_start)} → ${escapeHtml(v.epoch_end)}</span>
            ${ruptureBadge} ${revivalBadge}
          </div>
          <div class="ti-meta">${continuities}</div>
          <div class="ti-meta" style="color: #6e5a3a;">${escapeHtml(v.notes || '')}</div>
          <div class="ti-meta" style="color: #8b7560; font-size: 0.82em;">
            出典: ${escapeHtml(v.source_reference || '?')} · inference: ${escapeHtml(v.inference_type || '?')}
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('versionList').innerHTML = html || '<p>該当なし</p>';
  }

  document.getElementById('entityFilter').addEventListener('change', renderVersions);
  document.getElementById('epochFilterVer').addEventListener('change', renderVersions);

  // === Narrative Layer (Phase 3) ===
  let narratives = [];
  fetch('../data/narrative_layer.tsv')
    .then(r => r.text())
    .then(text => {
      const parsed = parseTsv(text);
      narratives = parsed.rows;
      renderNarratives();
    })
    .catch(e => {
      document.getElementById('narrativeList').innerHTML = `<p style="color:#c44;">読み込み失敗: ${e.message}</p>`;
    });

  function renderNarratives() {
    const ef = document.getElementById('narrativeEntityFilter').value;
    const of = document.getElementById('overlayFilter').value;
    const filtered = narratives.filter(n => {
      if (ef && n.entity_id !== ef) return false;
      if (of && n.is_overlay_or_overwrite !== of) return false;
      return true;
    });
    document.getElementById('narrativeStats').textContent =
      `${filtered.length} / ${narratives.length} 件`;

    const html = filtered.map(n => {
      const overwriteBadge = n.is_overlay_or_overwrite === 'overwrite' ?
        '<span class="badge-rewrite">overwrite</span>' :
        '<span class="badge-medium medium-strong">overlay</span>';
      return `
        <div class="timeline-item ${n.is_overlay_or_overwrite === 'overwrite' ? 'rewrite' : ''}">
          <h3>${escapeHtml(n.entity_id)} ${escapeHtml(n.layer_id)} — ${escapeHtml(n.epoch)}</h3>
          <div class="ti-meta">
            <span class="ti-period">${escapeHtml(n.epoch_start)} → ${escapeHtml(n.epoch_end)}</span>
            ${overwriteBadge}
          </div>
          <div class="ti-meta" style="margin-top: 6px; line-height: 1.55;">${escapeHtml(n.interpretation_text)}</div>
          <div class="ti-meta" style="color: #6e5a3a;">${escapeHtml(n.notes || '')}</div>
          <div class="ti-meta" style="color: #8b7560; font-size: 0.82em;">
            出典: ${escapeHtml(n.source_reference || '?')} · inference: ${escapeHtml(n.inference_type || '?')}
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('narrativeList').innerHTML = html || '<p>該当なし</p>';
  }

  document.getElementById('narrativeEntityFilter').addEventListener('change', renderNarratives);
  document.getElementById('overlayFilter').addEventListener('change', renderNarratives);
})();
