// Sacred Topology Atlas — DISC-008 採択 Phase 1
// 名神大社・一宮を中心とする network hub 神社の Leaflet 可視化。
//
// Narrative Intoxication 警告 (Codex 規律):
//   「線が引ける・近くにある・分布が似ている」だけで因果断定しない。
//   correlation ≠ causation。

(function () {
  const TSV_URL = '../data/atlas_hubs.tsv';

  const map = L.map('map', {
    center: [36.0, 137.5],   // 日本中央付近
    zoom: 5,
    minZoom: 4,
    maxZoom: 12,
  });

  // OpenStreetMap tile (DISC-008 採択、Google Maps scraping 回避)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ' +
      'Data: <a href="../../LICENSE-DATA">CC BY-SA 4.0</a>',
  }).addTo(map);

  // 凡例
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="legend-row"><span class="legend-dot legend-dot-myojin"></span> 名神大社</div>
      <div class="legend-row"><span class="legend-dot legend-dot-ichinomiya"></span> 一宮 (非名神大社)</div>
      <div class="legend-row"><span class="legend-dot legend-dot-other"></span> その他 verified</div>
    `;
    return div;
  };
  legend.addTo(map);

  // Marker 色決定
  function classify(rankAncient) {
    if (!rankAncient) return 'other';
    if (rankAncient.includes('名神大社')) return 'myojin';
    if (rankAncient.includes('一宮')) return 'ichinomiya';
    return 'other';
  }

  function colorFor(kind) {
    return { myojin: '#c83232', ichinomiya: '#d4a017', other: '#6a8caf' }[kind];
  }

  const layers = { myojin: L.layerGroup(), ichinomiya: L.layerGroup(), other: L.layerGroup() };
  Object.values(layers).forEach(l => l.addTo(map));

  let totalCount = 0;

  fetch(TSV_URL)
    .then(r => r.text())
    .then(text => {
      const lines = text.trim().split(/\r?\n/);
      const header = lines[0].split('\t');
      const col = (name) => header.indexOf(name);

      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split('\t');
        const id = cells[col('master_id')];
        const name = cells[col('canonical_name')];
        const reading = cells[col('canonical_reading')];
        const pref = cells[col('prefecture')];
        const coords = cells[col('coordinates')];
        const rank = cells[col('shrine_rank_ancient')];
        const verified = cells[col('verified_status')];

        if (!coords || !/^[\d.]+,[\d.]+$/.test(coords)) continue;
        const [lat, lon] = coords.split(',').map(parseFloat);

        const kind = classify(rank);
        const marker = L.circleMarker([lat, lon], {
          radius: 7,
          color: '#2c1810',
          weight: 2,
          fillColor: colorFor(kind),
          fillOpacity: 0.85,
        });

        const accuracy = cells[col('coordinates_accuracy')] || '';
        const coordsSource = cells[col('coordinates_source')] || '';
        const vizConf = cells[col('visualization_confidence')] || '';

        const popup = `
          <h3>${escapeHtml(name)}</h3>
          <div class="pop-meta">${escapeHtml(reading || '')} / ${escapeHtml(pref || '')}</div>
          ${rank ? `<div class="pop-meta">社格: ${escapeHtml(rank)}</div>` : ''}
          ${verified ? `<div class="pop-meta">verified_status: ${escapeHtml(verified)}</div>` : ''}
          ${accuracy ? `<div class="pop-meta">coordinates_accuracy: ${escapeHtml(accuracy)} (source: ${escapeHtml(coordsSource)})</div>` : ''}
          ${vizConf ? `<div class="pop-meta">visualization_confidence: <strong>${escapeHtml(vizConf)}</strong></div>` : ''}
          <a class="pop-link" href="shrine.html?id=${encodeURIComponent(id)}">詳細を見る</a>
        `;
        marker.bindPopup(popup);
        layers[kind].addLayer(marker);
        totalCount++;
      }

      document.getElementById('totalCount').textContent = totalCount;
      updateVisibleCount();
    })
    .catch(err => {
      console.error('atlas data load failed', err);
      document.getElementById('map').innerHTML =
        '<p style="padding: 24px; color: #c83232;">地図データの読み込みに失敗しました。</p>';
    });

  function updateVisibleCount() {
    let visible = 0;
    Object.entries(layers).forEach(([kind, layer]) => {
      if (map.hasLayer(layer)) visible += layer.getLayers().length;
    });
    document.getElementById('visibleCount').textContent = visible;
  }

  // フィルタ
  const bindFilter = (id, kind) => {
    const el = document.getElementById(id);
    el.addEventListener('change', () => {
      if (el.checked) map.addLayer(layers[kind]);
      else map.removeLayer(layers[kind]);
      updateVisibleCount();
    });
  };
  bindFilter('filterMyojin', 'myojin');
  bindFilter('filterIchinomiya', 'ichinomiya');
  bindFilter('filterOther', 'other');

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
