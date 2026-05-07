// Deity list page
(async function () {
  const tableBody = document.querySelector('#deityTable tbody');
  const table = document.getElementById('deityTable');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const genderFilter = document.getElementById('genderFilter');
  const listStats = document.getElementById('listStats');
  const listIntro = document.getElementById('listIntro');

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) searchInput.value = params.get('q');
  if (params.get('cat')) categoryFilter.value = params.get('cat');

  let deities = [];

  try {
    deities = await DataLoader.load('deity');

    // Populate category options (top 30 most common)
    const cats = {};
    deities.forEach(d => {
      const c = (d.category || '').split('/').map(s => s.trim()).filter(Boolean);
      c.forEach(x => { cats[x] = (cats[x] || 0) + 1; });
    });
    Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .forEach(([cat, n]) => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `${cat} (${n})`;
        categoryFilter.appendChild(opt);
      });

    listIntro.textContent = `全 ${deities.length.toLocaleString()} 神格を収録(神代の神々から近代神格化された天皇・武将まで)。`;
    loading.hidden = true;
    table.hidden = false;
    render();
  } catch (err) {
    loading.textContent = 'データの読み込みに失敗しました: ' + err.message;
    console.error(err);
  }

  function render() {
    const q = (searchInput.value || '').trim();
    const cat = categoryFilter.value;
    const gender = genderFilter.value;

    const filtered = deities.filter(d => {
      if (cat && !(d.category || '').includes(cat)) return false;
      if (gender && d.gender !== gender) return false;
      if (q) {
        const hay = [
          d.canonical_name, d.canonical_reading, d.aliases, d.aliases_reading, d.notes,
        ].filter(Boolean).join(' ');
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    listStats.textContent = `${filtered.length.toLocaleString()} 件 / 全 ${deities.length.toLocaleString()} 件`;

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const cap = 500;
    const display = filtered.slice(0, cap);
    const note = filtered.length > cap ? `<tr><td colspan="5" style="text-align:center; padding:14px; color:#8b7560;">表示は ${cap.toLocaleString()} 件までです。さらに絞り込んでください。</td></tr>` : '';

    const html = display.map(d => `
      <tr>
        <td class="col-id">${escapeHtml(d.master_id)}</td>
        <td class="col-name">
          <a href="deity.html?id=${encodeURIComponent(d.master_id)}">${escapeHtml(d.canonical_name)}</a>
          <div style="color:#8b7560; font-size:0.85em;">${escapeHtml(d.canonical_reading || '')}</div>
        </td>
        <td>${escapeHtml(d.category || '')} ${d.gender ? `<span style="color:#8b7560; font-size:0.85em;">(${escapeHtml(d.gender)})</span>` : ''}</td>
        <td class="col-meta">${escapeHtml(d.main_text_appearance || '')}</td>
        <td class="col-meta" style="max-width:380px;">${escapeHtml((d.notes || '').slice(0, 80))}${(d.notes || '').length > 80 ? '…' : ''}</td>
      </tr>
    `).join('');
    tableBody.innerHTML = html + note;
  }

  let renderTimer;
  function debouncedRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }
  searchInput.addEventListener('input', debouncedRender);
  categoryFilter.addEventListener('change', render);
  genderFilter.addEventListener('change', render);

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
