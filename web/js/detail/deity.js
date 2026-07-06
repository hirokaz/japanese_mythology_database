// web/js/detail/deity.js
// 神格詳細 page 用 section renderer
// Functions: renderDeityExtended, renderEmperorReign

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
  html += renderExternalLinks(entry.external_links, '外部リンク・原文');
  html += `</div>`;
  return html;
}

/** 皇統 deity の在位・代数情報(emperor_reign.js が読まれていればのみ) */
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
