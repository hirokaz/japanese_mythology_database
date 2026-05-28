// web/js/detail/core.js
// detail page core: entry point + section isolation + basic/sidebar
// Functions: renderDetail, safeRenderSection, getTypeLabel, renderBasic, renderSidebar

async function safeRenderSection(name, fn) {
  try {
    console.log(`[detail:${name}] start`);
    const result = await fn();
    console.log(`[detail:${name}] end`);
    return result;
  } catch (err) {
    console.error(`[detail:${name}] FAILED:`, err);
    if (err.stack) console.error(`[detail:${name}] stack:`, err.stack);
    return `<div class="detail-section" style="border-left:4px solid #c44;background:#fff5f5;">
      <h2 style="color:#c44;">⚠ ${name} セクションの読込失敗</h2>
      <p style="color:#6e5a3a;font-size:0.9em;">このセクションは現在表示できません。他のセクションは表示されています。</p>
      <details style="font-size:0.82em;color:#8b7560;">
        <summary>技術的詳細 (開発者向け)</summary>
        <pre style="background:#fff;padding:8px;border-radius:4px;overflow-x:auto;">${(err.message || err).toString().replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre>
      </details>
    </div>`;
  }
}

async function renderDetail() {
  const type = window.detailType;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');

  console.log('[detail] start', { type, id });

  if (!loading || !content) {
    console.error('[detail] #loading or #content element not found');
    return;
  }

  if (!id) {
    loading.textContent = 'ID が指定されていません。';
    loading.hidden = false;
    console.warn('[detail] no id parameter');
    return;
  }

  try {
    console.log('[detail] loading data...');
    const [data, relations] = await Promise.all([
      DataLoader.load(type),
      DataLoader.load('relations'),
    ]);
    console.log(`[detail] data loaded: ${data.length} ${type} rows, ${relations.length} relations`);

    const record = data.find(r => r.master_id === id);
    if (!record) {
      loading.textContent = `${id} が見つかりません。`;
      loading.hidden = false;
      console.warn(`[detail] record not found: ${id}`);
      return;
    }
    if (!record.master_id) {
      console.warn('[schema] record missing master_id:', record);
    }

    // Find relations involving this id
    const incoming = relations.filter(r => r.target_id === id);
    const outgoing = relations.filter(r => r.source_id === id);

    // Malformed relation detection
    const malformed = relations.filter(r =>
      (r.source_id === id || r.target_id === id) && (!r.target_id || !r.source_id || !r.relation_type)
    );
    if (malformed.length) {
      console.warn(`[detail] ${malformed.length} malformed relations involving ${id}:`, malformed.slice(0, 3));
    }

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

    // Header (header は基本的に常時表示、try/catch なし)
    let html = `
      <div class="detail-header">
        <h1>${escapeHtml(record.canonical_name || record.canonical_title || '')}</h1>
        <p class="subtitle">${escapeHtml(record.canonical_reading || '')}</p>
        <p class="meta"><code>${escapeHtml(id)}</code> · ${escapeHtml(getTypeLabel(type))} · 関係数: ${(incoming.length + outgoing.length).toLocaleString()}${renderVerifiedBadge(record)}</p>
      </div>

      <div class="detail-grid">
        <div>
          ${await safeRenderSection('basic', () => renderBasic(record, type))}
          ${type === 'deity' ? await safeRenderSection('emperor_reign', () => renderEmperorReign(record)) : ''}
          ${type === 'deity' ? await safeRenderSection('deity_extended', () => renderDeityExtended(record)) : ''}
          ${type === 'shrine' ? await safeRenderSection('enshrined_deities', () => renderEnshrinedDeities(record)) : ''}
          ${type === 'shrine' ? await safeRenderSection('shrine_profile', () => renderShrineProfile(record, outgoing, incoming)) : ''}
          ${type === 'shrine' ? await safeRenderSection('shrine_extended', () => renderShrineExtended(record)) : ''}
          ${type === 'shrine' ? await safeRenderSection('map', () => renderMap(record)) : ''}
          ${type === 'shrine' ? await safeRenderSection('precinct_map', () => renderPrecinctMap(record)) : ''}
          ${type === 'clan' ? await safeRenderSection('clan_profile', () => renderClanProfile(record, outgoing, incoming)) : ''}
          ${type === 'clan' ? await safeRenderSection('clan_extended', () => renderClanExtended(record)) : ''}
          ${await safeRenderSection('relations_out', () => renderRelations(outGrouped, 'out', record))}
          ${await safeRenderSection('relations_in', () => renderRelations(inGrouped, 'in', record))}
        </div>
        <aside>
          ${await safeRenderSection('sidebar', () => renderSidebar(record, type))}
        </aside>
      </div>
    `;
    content.innerHTML = html;
    if (window.Era) {
      try { Era.applyEraConversion(content); }
      catch (err) { console.error('[detail:era] failed:', err); }
    }
    // 境内マップ (Leaflet) は DOM 挿入後に初期化 (issue #301)
    if (type === 'shrine' && typeof initPrecinctMap === 'function') {
      try { initPrecinctMap(); }
      catch (err) { console.error('[detail:precinct_map] init failed:', err); }
    }
    console.log('[detail] complete');
  } catch (err) {
    loading.hidden = false;
    loading.textContent = '読み込みに失敗しました: ' + err.message + ' (DevTools console で詳細を確認してください)';
    console.error('[detail] FATAL error:', err);
    if (err.stack) console.error('[detail] stack:', err.stack);
  }
}

function getTypeLabel(t) {
  return { shrine: '神社', deity: '神格', clan: '氏族' }[t] || t;
}

/** DISC-006 verified_status バッジ。Phase 1 = warning のみ表示。 */

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
