// web/js/detail/relations.js
// relation section renderer (shrine/deity/clan 共通)
// Functions: renderRelations

async function renderRelations(grouped, direction) {
  const keys = Object.keys(grouped);
  if (keys.length === 0) return '';

  const dirLabel = direction === 'out' ? '本記録から始まる関係' : '本記録に向かう関係';

  let html = `<div class="detail-section"><h2>${dirLabel} (${Object.values(grouped).reduce((a, b) => a + b.length, 0).toLocaleString()})</h2>`;

  // 重要な関係順にソート
  const importance = {
    primary_deity_of: 1, secondary_deity_of: 2, enshrined_at: 3,
    parent_of: 4, married_to: 5, sibling_of: 6, ancestor_of: 7,
    descended_from: 8, syncretized_with: 9,
    associated_with: 30,
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
