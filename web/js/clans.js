// Clan list page
(async function () {
  const tableBody = document.querySelector('#clanTable tbody');
  const table = document.getElementById('clanTable');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty');
  const searchInput = document.getElementById('searchInput');
  const listStats = document.getElementById('listStats');
  const listIntro = document.getElementById('listIntro');

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) searchInput.value = params.get('q');

  let clans = [];

  try {
    clans = await DataLoader.load('clan');
    listIntro.textContent = `全 ${clans.length.toLocaleString()} 氏族を収録(中央豪族・地方国造・祭祀氏族・技術氏族・渡来氏族)。`;
    loading.hidden = true;
    table.hidden = false;
    render();
  } catch (err) {
    loading.textContent = 'データの読み込みに失敗しました: ' + err.message;
    console.error(err);
  }

  function render() {
    const q = (searchInput.value || '').trim();
    const filtered = clans.filter(c => {
      if (!q) return true;
      const hay = Object.values(c).filter(Boolean).join(' ');
      return hay.includes(q);
    });

    listStats.textContent = `${filtered.length.toLocaleString()} 件 / 全 ${clans.length.toLocaleString()} 件`;

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const cap = 500;
    const display = filtered.slice(0, cap);
    const note = filtered.length > cap ? `<tr><td colspan="4" style="text-align:center; padding:14px; color:#8b7560;">表示は ${cap.toLocaleString()} 件までです。</td></tr>` : '';

    const html = display.map(c => `
      <tr>
        <td class="col-id">${escapeHtml(c.master_id)}</td>
        <td class="col-name">
          <a href="clan.html?id=${encodeURIComponent(c.master_id)}">${escapeHtml(c.canonical_name)}</a>
          <div style="color:#8b7560; font-size:0.85em;">${escapeHtml(c.canonical_reading || '')}</div>
        </td>
        <td class="col-meta">${escapeHtml(c.category || c.clan_category || '')}</td>
        <td class="col-meta" style="max-width:380px;">${escapeHtml((c.notes || '').slice(0, 100))}${(c.notes || '').length > 100 ? '…' : ''}</td>
      </tr>
    `).join('');
    tableBody.innerHTML = html + note;
  }

  let renderTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  });

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
