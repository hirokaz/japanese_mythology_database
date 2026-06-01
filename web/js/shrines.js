// Shrine list page
(async function () {
  const tableBody = document.querySelector('#shrineTable tbody');
  const table = document.getElementById('shrineTable');
  const tableWrap = document.getElementById('shrineTableWrap');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty');
  const searchInput = document.getElementById('searchInput');
  const prefFilter = document.getElementById('prefFilter');
  const rankFilter = document.getElementById('rankFilter');
  const listStats = document.getElementById('listStats');
  const listIntro = document.getElementById('listIntro');

  // Read query params
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) searchInput.value = params.get('q');
  if (params.get('pref')) prefFilter.value = params.get('pref');

  let shrines = [];
  let deityIndex = {};

  try {
    const [shrineData, deityData] = await Promise.all([
      DataLoader.load('shrine'),
      DataLoader.load('deity'),
    ]);
    shrines = shrineData;
    deityIndex = DataLoader.indexBy(deityData, 'master_id');

    // Populate prefecture filter (北から南順、外地・特殊は末尾)
    const PREF_ORDER = [
      '北海道',
      '青森県','岩手県','宮城県','秋田県','山形県','福島県',
      '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
      '新潟県','富山県','石川県','福井県','山梨県','長野県',
      '岐阜県','静岡県','愛知県','三重県',
      '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
      '鳥取県','島根県','岡山県','広島県','山口県',
      '徳島県','香川県','愛媛県','高知県',
      '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
      // 旧外地・歴史地域
      'サハリン','樺太','千島',
      'ソウル(歴史)','京畿道(歴史)','朝鮮','韓国',
      '台湾','台北(歴史)','旅順(歴史)','満州','南洋',
      // 集合・広域
      '東北','関東','東北・関東','全国',
      '不明',
    ];
    const prefs = new Set();
    shrines.forEach(s => { if (s.prefecture && s.prefecture !== '-') prefs.add(s.prefecture); });
    const sortedPrefs = Array.from(prefs).sort((a, b) => {
      const ia = PREF_ORDER.indexOf(a);
      const ib = PREF_ORDER.indexOf(b);
      // 両方リストに存在する場合はリスト順
      if (ia >= 0 && ib >= 0) return ia - ib;
      // 片方のみリスト存在: リストにあるものを優先 (リスト外は末尾)
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      // 両方リスト外: 五十音順
      return a.localeCompare(b, 'ja');
    });
    sortedPrefs.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      prefFilter.appendChild(opt);
    });

    // Populate rank filter (常用社格)
    const rankPatterns = ['名神大社', '式内社', '一宮', '二宮', '官幣大社', '官幣中社', '官幣小社', '国幣大社', '国幣中社', '国幣小社', '別格官幣社', '府社', '県社', '郷社', '村社', '二十二社'];
    rankPatterns.forEach(rk => {
      const opt = document.createElement('option');
      opt.value = rk;
      opt.textContent = rk;
      rankFilter.appendChild(opt);
    });

    listIntro.textContent = `全 ${shrines.length.toLocaleString()} 件の神社・寺院・祭祀地を収録。検索やフィルタで絞り込めます。`;
    loading.hidden = true;
    if (tableWrap) tableWrap.hidden = false;
    render();
  } catch (err) {
    loading.textContent = 'データの読み込みに失敗しました: ' + err.message;
    console.error(err);
  }

  function render() {
    const q = (searchInput.value || '').trim();
    const pref = prefFilter.value;
    const rank = rankFilter.value;

    const filtered = shrines.filter(s => {
      if (pref && s.prefecture !== pref) return false;
      if (rank) {
        const allRank = (s.shrine_rank_ancient || '') + '|' + (s.shrine_rank_modern || '');
        if (!allRank.includes(rank)) return false;
      }
      if (q) {
        const hay = [
          s.canonical_name, s.canonical_reading, s.alternative_names,
          s.old_names, s.address, s.prefecture, s.notes,
        ].filter(Boolean).join(' ');
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    listStats.textContent = `${filtered.length.toLocaleString()} 件 / 全 ${shrines.length.toLocaleString()} 件`;

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    // Cap displayed rows at 500 for performance
    const cap = 500;
    const display = filtered.slice(0, cap);
    const note = filtered.length > cap ? `<tr><td colspan="5" style="text-align:center; padding:14px; color:#8b7560;">表示は ${cap.toLocaleString()} 件までです。さらに絞り込んでください。</td></tr>` : '';

    const html = display.map(s => {
      const deityName = renderDeities(s.main_deity_ids);
      const ranks = [s.shrine_rank_ancient, s.shrine_rank_modern].filter(x => x && x !== '-').join(' / ');
      return `
        <tr>
          <td class="col-id" data-label="ID">${escapeHtml(s.master_id)}</td>
          <td class="col-name" data-label="名称">
            <a href="shrine.html?id=${encodeURIComponent(s.master_id)}">${escapeHtml(s.canonical_name)}</a>
            <div style="color:#8b7560; font-size:0.85em;">${escapeHtml(s.canonical_reading || '')}</div>
          </td>
          <td data-label="所在地">${escapeHtml(s.prefecture || '')}<div style="color:#8b7560; font-size:0.85em;">${escapeHtml(s.address || '')}</div></td>
          <td class="col-meta" data-label="主祭神">${deityName}</td>
          <td class="col-meta" data-label="社格">${escapeHtml(ranks)}</td>
        </tr>
      `;
    }).join('');
    tableBody.innerHTML = html + note;
    if (window.Era) Era.applyEraConversion(tableBody);
  }

  function renderDeities(idsField) {
    if (!idsField || idsField === '-') return '';
    const ids = idsField.split('|').slice(0, 4);
    return ids.map(id => {
      const id_t = id.trim();
      const d = deityIndex[id_t];
      const name = d ? d.canonical_name : id_t;
      return `<a href="deity.html?id=${encodeURIComponent(id_t)}" style="font-size:0.9em;">${escapeHtml(name)}</a>`;
    }).join('、');
  }

  // debounce helper
  let renderTimer;
  function debouncedRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }

  searchInput.addEventListener('input', debouncedRender);
  prefFilter.addEventListener('change', render);
  rankFilter.addEventListener('change', render);

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
