// web/js/detail/epistemic.js
// DISC-005 / DISC-006 / DISC-011 採択 — verified_status, inference_type, L4-L5 badge
// Functions: renderVerifiedBadge, renderInferenceTypeBadge, renderL45WarnBadge

function renderVerifiedBadge(record) {
  const status = record.verified_status;
  if (!status || status === 'verified') return '';
  // under_review / unverified / known_fabrication の場合のみ表示
  const labels = {
    'under_review': { text: '⚠ 検証中', cls: 'badge-warn', tip: 'このエントリは個別実在検証が未完了です (DISC-006 採用)。一次史料・公式情報による確認を推奨します。' },
    'unverified':   { text: '⚠ 未検証',  cls: 'badge-warn-strong', tip: 'このエントリは外部参照による実在性検証が行われていません。' },
    'known_fabrication': { text: '✗ 架空判明', cls: 'badge-err', tip: 'このエントリは架空と判明済です (内部参照のみ表示)。' },
  };
  const lbl = labels[status];
  if (!lbl) return '';
  return ` <span class="badge ${lbl.cls}" title="${escapeHtml(lbl.tip)}">${escapeHtml(lbl.text)}</span>`;
}

/** DISC-005 inference_type バッジ (Phase 2 採択、Phase 4 UI 実装)。 */

function renderInferenceTypeBadge(r) {
  const itype = r.inference_type;
  if (!itype || itype === 'source_backed') return '';
  const labels = {
    'inferential':  { text: '推', cls: 'badge-warn', tip: 'inference_type=inferential: 史料からの妥当な推論 (DISC-005)' },
    'speculative':  { text: '仮', cls: 'badge-speculative', tip: 'inference_type=speculative: 検証困難な仮説 (DISC-005、L4-L5 該当)' },
    'symbolic':     { text: '象', cls: 'badge-symbolic', tip: 'inference_type=symbolic: 象徴的・神話的解釈 (DISC-005、motif/mythologem 系)' },
  };
  const lbl = labels[itype];
  if (!lbl) return '';
  return ` <span class="badge ${lbl.cls}" title="${escapeHtml(lbl.tip)}">${escapeHtml(lbl.text)}</span>`;
}

/** L4-L5 仮説の警告強調 (DISC-011 採択 Phase 2)。 */

function renderL45WarnBadge(r) {
  if (r.hypothesis_layer !== 'L4' && r.hypothesis_layer !== 'L5') return '';
  return ` <span class="badge-l4-5-warn" title="L4-L5 仮説: 大胆仮説または検証困難な思想的記載。引用時は両論並記必須 (CLAUDE.md §4.1)">⚠ L4-L5</span>`;
}

/** deity の詳細解説・一次資料・典拠リンク(deity_extended.tsv から) */
