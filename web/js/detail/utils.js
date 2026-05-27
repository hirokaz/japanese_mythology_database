// web/js/detail/utils.js
// 汎用ユーティリティ — escapeHtml, _mkIdx

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

/** 神社の詳細プロファイル:来歴・歴史・社家・神話モチーフ・分祀・祭事・近接 */
