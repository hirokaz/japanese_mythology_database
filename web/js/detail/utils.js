// web/js/detail/utils.js
// 汎用ユーティリティ — escapeHtml, _mkIdx, renderExternalLinks

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _mkIdx(arr, key) {
  const m = {};
  arr.forEach(r => { m[r[key]] = r; });
  return m;
}

/**
 * external_links フィールド (" / " 区切り、"ラベル URL" 形式) を描画。
 * deity/shrine/clan の各 extended セクションで共用。
 */
function renderExternalLinks(linksField, heading) {
  if (!linksField || linksField === '-') return '';
  let html = `<div class="external-links"><strong>${escapeHtml(heading)}:</strong><ul class="external-link-list">`;
  linksField.split(' / ').forEach(item => {
    const trimmed = item.trim();
    const m = trimmed.match(/(https?:\/\/[^\s]+)/);
    if (m) {
      const url = m[1];
      const label = trimmed.replace(url, '').trim() || url;
      html += `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} <span class="ext-arrow">↗</span></a></li>`;
    } else if (trimmed) {
      html += `<li class="ext-note">${escapeHtml(trimmed)}</li>`;
    }
  });
  html += `</ul></div>`;
  return html;
}
