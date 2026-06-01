// Sacred Topology Atlas — DISC-008 採択 (issue #300: 全神社表示 + 社格フィルター)
// shrine_master.tsv の全神社を対象とし、座標を持つ神社を Leaflet に描画。
// 社格フィルター (デフォルト=名神大社) + 座標未登録件数の可視化。
//
// Narrative Intoxication 警告 (Codex 規律):
//   「線が引ける・近くにある・分布が似ている」だけで因果断定しない。correlation ≠ causation。

(function () {
  const TSV_URL = '../../docs/master/shrine_master.tsv';

  // 社格カテゴリ定義 — 1 神社が複数カテゴリに属しうる (例: 名神大社|一宮)
  // key: filter id / label: 表示名 / test: (anc, mod) => boolean / color: marker 色
  const CATEGORIES = [
    { key: 'myojin',    label: '名神大社',   color: '#c83232', test: (a) => a.includes('名神大社') },
    { key: 'ichinomiya',label: '一宮',       color: '#d4a017', test: (a) => a.includes('一宮') },
    { key: 'shikinai',  label: '式内社',     color: '#4a8c5a', test: (a) => a.includes('式内社') },
    { key: 'nijuni',    label: '二十二社',   color: '#9a5fb0', test: (a) => a.includes('二十二社') },
    { key: 'kankoku',   label: '官幣・国幣社', color: '#3a7ca5', test: (a, m) => m.includes('官幣') || m.includes('国幣') },
  ];
  const OTHER = { key: 'other', label: 'その他', color: '#8a8a8a' };

  // marker 色は優先度順 (最初に一致したカテゴリ色)
  function primaryColor(cats) {
    for (const c of CATEGORIES) if (cats.has(c.key)) return c.color;
    return OTHER.color;
  }

  const map = L.map('map', { center: [36.5, 137.5], zoom: 5, minZoom: 4, maxZoom: 14 });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ' +
      'Data: <a href="../../LICENSE-DATA">CC BY-SA 4.0</a>',
  }).addTo(map);

  // marker 群を保持するレイヤ (markercluster プラグインがあればクラスタ、無ければ通常 layerGroup)
  const cluster = (typeof L.markerClusterGroup === 'function')
    ? L.markerClusterGroup({ maxClusterRadius: 45, spiderfyOnMaxZoom: true, chunkedLoading: true })
    : L.layerGroup();
  cluster.addTo(map);

  // 凡例
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = CATEGORIES.map(c =>
      `<div class="legend-row"><span class="legend-dot" style="background:${c.color}"></span> ${c.label}</div>`
    ).join('') +
      `<div class="legend-row"><span class="legend-dot" style="background:${OTHER.color}"></span> ${OTHER.label}</div>`;
    return div;
  };
  legend.addTo(map);

  const records = [];   // { marker, cats:Set }
  let coordedCount = 0, noCoordCount = 0, totalCount = 0;

  fetch(TSV_URL)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(text => {
      const lines = text.trim().split(/\r?\n/);
      const header = lines[0].split('\t');
      const col = (name) => header.indexOf(name);
      const ci = {
        id: col('master_id'), name: col('canonical_name'), reading: col('canonical_reading'),
        pref: col('prefecture'), coords: col('coordinates'),
        anc: col('shrine_rank_ancient'), mod: col('shrine_rank_modern'),
        verified: col('verified_status'), acc: col('coordinates_accuracy'),
        csrc: col('coordinates_source'), viz: col('visualization_confidence'),
      };

      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split('\t');
        if (!cells[ci.id]) continue;
        totalCount++;

        const rawCoords = (cells[ci.coords] || '').trim();
        const parts = rawCoords.split(',').map(s => parseFloat(s.trim()));
        const hasCoords = parts.length === 2 && parts.every(Number.isFinite);
        if (!hasCoords) { noCoordCount++; continue; }
        coordedCount++;

        const [lat, lon] = parts;
        const anc = cells[ci.anc] || '';
        const mod = cells[ci.mod] || '';
        const cats = new Set();
        CATEGORIES.forEach(c => { if (c.test(anc, mod)) cats.add(c.key); });
        if (cats.size === 0) cats.add(OTHER.key);

        const marker = L.circleMarker([lat, lon], {
          radius: 7, color: '#2c1810', weight: 2,
          fillColor: primaryColor(cats), fillOpacity: 0.85,
        });

        const id = cells[ci.id];
        const rankStr = [anc, mod].filter(v => v && v !== '-').join(' / ');
        marker.bindPopup(`
          <h3>${esc(cells[ci.name])}</h3>
          <div class="pop-meta">${esc(cells[ci.reading] || '')} / ${esc(cells[ci.pref] || '')}</div>
          ${rankStr ? `<div class="pop-meta">社格: ${esc(rankStr)}</div>` : ''}
          ${cells[ci.verified] ? `<div class="pop-meta">verified_status: ${esc(cells[ci.verified])}</div>` : ''}
          ${cells[ci.acc] ? `<div class="pop-meta">coordinates_accuracy: ${esc(cells[ci.acc])}${cells[ci.csrc] ? ` (source: ${esc(cells[ci.csrc])})` : ''}</div>` : ''}
          ${cells[ci.viz] ? `<div class="pop-meta">visualization_confidence: <strong>${esc(cells[ci.viz])}</strong></div>` : ''}
          <a class="pop-link" href="shrine.html?id=${encodeURIComponent(id)}">詳細を見る</a>
        `);
        records.push({ marker, cats });
      }

      setText('totalCount', totalCount);
      setText('coordedCount', coordedCount);
      setText('noCoordCount', noCoordCount);
      applyFilter();
    })
    .catch(err => {
      console.error('atlas data load failed', err);
      document.getElementById('map').innerHTML =
        '<p style="padding:24px;color:#c83232;">地図データの読み込みに失敗しました。</p>';
    });

  // 選択中カテゴリ集合
  function checkedKeys() {
    const set = new Set();
    [...CATEGORIES, OTHER].forEach(c => {
      const el = document.getElementById('filter_' + c.key);
      if (el && el.checked) set.add(c.key);
    });
    return set;
  }

  function applyFilter() {
    const checked = checkedKeys();
    cluster.clearLayers();
    let visible = 0;
    const batch = [];
    records.forEach(({ marker, cats }) => {
      let show = false;
      for (const k of cats) { if (checked.has(k)) { show = true; break; } }
      if (show) { batch.push(marker); visible++; }
    });
    if (typeof cluster.addLayers === 'function') cluster.addLayers(batch);
    else batch.forEach(m => cluster.addLayer(m));
    setText('visibleCount', visible);
  }

  // フィルタ UI イベント
  [...CATEGORIES, OTHER].forEach(c => {
    const el = document.getElementById('filter_' + c.key);
    if (el) el.addEventListener('change', applyFilter);
  });
  const allBtn = document.getElementById('filterAll');
  if (allBtn) allBtn.addEventListener('click', () => {
    [...CATEGORIES, OTHER].forEach(c => {
      const el = document.getElementById('filter_' + c.key);
      if (el) el.checked = true;
    });
    applyFilter();
  });
  const noneBtn = document.getElementById('filterNone');
  if (noneBtn) noneBtn.addEventListener('click', () => {
    [...CATEGORIES, OTHER].forEach(c => {
      const el = document.getElementById('filter_' + c.key);
      if (el) el.checked = false;
    });
    applyFilter();
  });

  function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
