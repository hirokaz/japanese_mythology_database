// TSV parser (zero-dependency)
window.TSV = {
  /**
   * Parse TSV text into array of objects keyed by header.
   */
  parse(text) {
    const lines = text.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) return [];
    const headers = lines[0].split('\t');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length !== headers.length) {
        // 列数不一致は手編集 TSV の混入タブ等のサイン — 静かに壊さず警告を残す
        console.warn(`TSV row ${i + 1}: ${cols.length} cols, expected ${headers.length}`);
      }
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = cols[j] !== undefined ? cols[j] : '';
      }
      rows.push(row);
    }
    return rows;
  },
};
