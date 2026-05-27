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

/** 神社の詳細解説・由緒・祭事・典拠(shrine_extended.tsv から) */

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
