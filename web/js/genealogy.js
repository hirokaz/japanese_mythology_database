// 皇統系譜の SVG レンダラ
// デフォルト表示 B: 天照大神起点 (天照→天忍穂耳→邇邇芸→…→歴代天皇)
// 上展開 C: 造化三神起点 (天之御中主→別天津神→神世七代→イザナギ/イザナミ→天照→…)
(async function () {
  const loading = document.getElementById('loading');
  const wrap = document.getElementById('genealogyWrap');
  const svg = document.getElementById('genealogySvg');
  const intro = document.getElementById('genealogyIntro');

  // 寸法定数
  const NODE_W = 150;
  const NODE_H = 72;
  const GAP_X = 18;
  const GAP_Y = 112;
  const MARGIN = 30;

  let zoom = 1.0;

  // B 層 (天照起点) 直系祖先 — 天照大神を最上位に置く
  const ANCESTORS_B = [
    'DEI-003',  // 天照大神(B 起点)
    'DEI-599',  // 天忍穂耳(天照の子)
    'DEI-600',  // 栲幡千千姫(天忍穂耳の妻、高皇産霊の娘)
    'DEI-015',  // 邇邇芸(曾祖父)
    'DEI-083',  // 木花咲耶姫(曾祖母)
    'DEI-085',  // 彦火火出見=山幸彦(祖父)
    'DEI-088',  // 豊玉姫(祖母)
    'DEI-090',  // ウガヤフキアエズ(父)
    'DEI-089',  // 玉依姫(母)
    'DEI-016',  // ヤマトタケル(景行皇子)
  ];

  // C 層 (造化三神起点) 宇宙生成神 — 天照の上に展開
  const ANCESTORS_C = [
    'DEI-304',  // 天之御中主神  (造化三神 1)
    'DEI-007',  // 高皇産霊神    (造化三神 2)
    'DEI-008',  // 神産巣日神    (造化三神 3)
    'DEI-604',  // 宇摩志阿斯訶備比古遅神 (別天津神 4)
    'DEI-605',  // 天之常立神    (別天津神 5)
    'DEI-606',  // 国之常立神    (神世七代 1)
    'DEI-607',  // 豊雲野神      (神世七代 2)
    'DEI-608',  // 宇比地邇神    (神世七代 3 男)
    'DEI-609',  // 須比智邇神    (神世七代 3 女)
    'DEI-610',  // 角杙神        (神世七代 4 男)
    'DEI-611',  // 活杙神        (神世七代 4 女)
    'DEI-612',  // 意富斗能地神  (神世七代 5 男)
    'DEI-613',  // 大斗乃弁神    (神世七代 5 女)
    'DEI-614',  // 於母陀流神    (神世七代 6 男)
    'DEI-615',  // 阿夜訶志古泥神(神世七代 6 女)
    'DEI-005',  // 伊邪那岐神    (神世七代 7 男)
    'DEI-006',  // 伊邪那美神    (神世七代 7 女)
  ];

  let showCosmogony = false;  // C 層展開フラグ
  let deities, relations, deityIdx;

  // C 層サブタイプ分類 (DISC-009 Phase 1)
  // 造化三神 / 別天津神 / 神世七代独神 / 神世七代対偶神 を視覚区別するためのメタデータ
  const COSMOGONY_SUBTYPE = {
    'DEI-304': 'sozo',         'DEI-007': 'sozo',         'DEI-008': 'sozo',         // 造化三神
    'DEI-604': 'kotoamatsu',   'DEI-605': 'kotoamatsu',                              // 別天津神 (残り2柱)
    'DEI-606': 'kamiyo_solo',  'DEI-607': 'kamiyo_solo',                             // 神世七代 独神
    'DEI-608': 'kamiyo_pair',  'DEI-609': 'kamiyo_pair',                             // 神世七代 対偶神 第3
    'DEI-610': 'kamiyo_pair',  'DEI-611': 'kamiyo_pair',                             //  〃 第4
    'DEI-612': 'kamiyo_pair',  'DEI-613': 'kamiyo_pair',                             //  〃 第5
    'DEI-614': 'kamiyo_pair',  'DEI-615': 'kamiyo_pair',                             //  〃 第6
    'DEI-005': 'kamiyo_pair',  'DEI-006': 'kamiyo_pair',                             //  〃 第7 (伊邪那岐/伊邪那美)
  };
  const COSMOGONY_LABEL = {
    sozo:         '造化三神',
    kotoamatsu:   '別天津神',
    kamiyo_solo:  '神世七代・独神',
    kamiyo_pair:  '神世七代・対偶神',
  };

  // 重要な傍系兄弟ノード — 直系皇祖ではないが系譜理解に不可欠
  const SIBLING_NODES = [
    'DEI-002',  // 須佐之男命 (天照の弟、三貴子)
    'DEI-004',  // 月読命     (天照の弟、三貴子)
  ];
  // 同母兄弟グループ — 親が表示外でも兄弟ブラケットで連結
  const SIBLING_GROUPS = [
    { members: ['DEI-002', 'DEI-003', 'DEI-004'], label: '三貴子' },
  ];

  try {
    [deities, relations] = await Promise.all([
      DataLoader.load('deity'),
      DataLoader.load('relations'),
    ]);
    deityIdx = {};
    deities.forEach(d => { deityIdx[d.master_id] = d; });

    renderGenealogy();
    loading.hidden = true;
    wrap.hidden = false;

    // ===== 追加セクション:皇族・皇后/外戚氏族 (一度だけ) =====
    const imperialFull = computeImperialSet(false);
    await renderRoyalsAndAffines(deities, deityIdx, relations, imperialFull);
    if (window.Era) Era.applyEraConversion(document.querySelector('main'));

    // ズーム
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoom * 1.2));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoom / 1.2));
    document.getElementById('zoomReset').addEventListener('click', () => setZoom(1.0));
  } catch (err) {
    loading.textContent = '読み込み失敗: ' + err.message;
    console.error(err);
  }

  function computeImperialSet(includeCosmogony) {
    const set = new Set();
    deities.forEach(d => {
      const cat = d.category || '';
      // 「皇統」を含むが「公卿」始まり (例: 和気清麻呂 = 公卿/皇統護持) は皇統本系ではない
      if (cat.includes('皇統') && !cat.startsWith('公卿')) set.add(d.master_id);
    });
    ANCESTORS_B.forEach(id => set.add(id));
    if (includeCosmogony) {
      ANCESTORS_C.forEach(id => set.add(id));
    }
    return set;
  }

  function renderGenealogy() {
    const imperialIdSet = computeImperialSet(showCosmogony);
    // 傍系兄弟ノードはツリーにのみ追加 (aux section の computeImperialSet には含めない)
    SIBLING_NODES.forEach(id => imperialIdSet.add(id));

    // parent_of (実子系譜) + succeeded_by (神代記の出現順) でツリー構築
    const parents = {};         // child -> parent
    const edgeKind = {};        // child -> 'parent' | 'inferred' | 'succession'
    const children = {};
    const marriages = {};

    relations.forEach(r => {
      if (r.source_type !== 'deity' || r.target_type !== 'deity') return;
      const src = r.source_id, tgt = r.target_id;
      if (!imperialIdSet.has(src) || !imperialIdSet.has(tgt)) return;
      if (r.relation_type === 'parent_of') {
        // source_backed (直接の親子) を優先し、後の inferential (近祖参照) で上書きしない
        if (parents[tgt] && edgeKind[tgt] === 'parent') return;
        parents[tgt] = src;
        // 「近祖参照」note を持つ relation のみ inferred (中間代省略) として可視化
        // 欠史八代等の inference_type=inferential は通常の親子線で描画
        const isNearAncestorSkip = (r.notes || '').includes('近祖参照');
        edgeKind[tgt] = isNearAncestorSkip ? 'inferred' : 'parent';
        (children[src] = children[src] || []).push(tgt);
      } else if (r.relation_type === 'succeeded_by' && showCosmogony) {
        if (!parents[tgt]) {
          parents[tgt] = src;
          edgeKind[tgt] = 'succession';
          (children[src] = children[src] || []).push(tgt);
        }
      } else if (r.relation_type === 'married_to') {
        (marriages[src] = marriages[src] || new Set()).add(tgt);
        (marriages[tgt] = marriages[tgt] || new Set()).add(src);
      }
    });

    // 世代計算
    const generation = {};
    function calcGen(id, visited = new Set()) {
      if (id in generation) return generation[id];
      if (visited.has(id)) return 0;
      visited.add(id);
      const p = parents[id];
      generation[id] = p ? (calcGen(p, visited) + 1) : 0;
      return generation[id];
    }
    Array.from(imperialIdSet).forEach(id => calcGen(id));

    // 対偶神 fixup: parent なし + 配偶者が決定済みなら配偶者と同世代
    Array.from(imperialIdSet).forEach(id => {
      if (parents[id]) return;
      const sps = marriages[id];
      if (!sps) return;
      for (const sp of sps) {
        if (parents[sp]) {
          generation[id] = generation[sp];
          return;
        }
      }
    });

    // 世代ごとに整理
    const byGen = {};
    Array.from(imperialIdSet).forEach(id => {
      const g = generation[id];
      (byGen[g] = byGen[g] || []).push(id);
    });

    const generations = Object.keys(byGen).map(Number).sort((a, b) => a - b);
    generations.forEach(g => {
      byGen[g].sort((a, b) => {
        const pa = parents[a] || '';
        const pb = parents[b] || '';
        if (pa !== pb) return pa.localeCompare(pb);
        return a.localeCompare(b);
      });
    });

    // 座標決定 — Y 軸の最小世代が必ず 0 から始まるようオフセット
    // 上部に toggle ボタン + 兄弟ブラケット用の余白を常に確保
    const TOP_RESERVE = 56;
    const minGen = generations[0] || 0;
    const positions = {};
    let maxX = 0, maxY = 0;
    generations.forEach(g => {
      const ids = byGen[g];
      const y = (g - minGen) * GAP_Y + MARGIN + TOP_RESERVE;
      ids.forEach((id, i) => {
        const x = i * (NODE_W + GAP_X) + MARGIN;
        positions[id] = { x, y };
        if (x + NODE_W > maxX) maxX = x + NODE_W;
        if (y + NODE_H > maxY) maxY = y + NODE_H;
      });
    });

    const svgW = maxX + MARGIN;
    const svgH = maxY + MARGIN;

    let svgInner = '';
    svgInner += `
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L0,8 L7,4 z" fill="#8b3a3a"></path>
        </marker>
      </defs>
    `;

    // 親子線 / 出現順線 (L 字)
    for (const child in parents) {
      const parent = parents[child];
      const cp = positions[child], pp = positions[parent];
      if (!cp || !pp) continue;
      const x1 = pp.x + NODE_W / 2, y1 = pp.y + NODE_H;
      const x2 = cp.x + NODE_W / 2, y2 = cp.y;
      const midY = (y1 + y2) / 2;
      if (edgeKind[child] === 'succession') {
        // 神代記 出現順 — 灰色破線
        svgInner += `<path d="M${x1},${y1} V${midY} H${x2} V${y2}" fill="none" stroke="#a89878" stroke-width="1.3" stroke-dasharray="3 4"></path>`;
      } else if (edgeKind[child] === 'inferred') {
        // 近祖参照 (中間代省略) — 橙破線
        svgInner += `<path d="M${x1},${y1} V${midY} H${x2} V${y2}" fill="none" stroke="#d68a3a" stroke-width="1.5" stroke-dasharray="6 4"></path>`;
      } else {
        svgInner += `<path d="M${x1},${y1} V${midY} H${x2} V${y2}" fill="none" stroke="#8b3a3a" stroke-width="1.5"></path>`;
      }
    }

    // 婚姻線
    const drawnMarriages = new Set();
    for (const a in marriages) {
      marriages[a].forEach(b => {
        const key = [a, b].sort().join('_');
        if (drawnMarriages.has(key)) return;
        drawnMarriages.add(key);
        const pa = positions[a], pb = positions[b];
        if (!pa || !pb) return;
        if (Math.abs(pa.y - pb.y) > 5) return;
        const y = pa.y + NODE_H / 2;
        const x1 = Math.min(pa.x, pb.x) + NODE_W;
        const x2 = Math.max(pa.x, pb.x);
        if (x1 < x2) {
          svgInner += `<path d="M${x1},${y} H${x2}" fill="none" stroke="#c9a878" stroke-width="1.5" stroke-dasharray="4 3"></path>`;
        }
      });
    }

    // 兄弟ブラケット — 親が表示外の同母兄弟群を上部の括線で連結 (例: 三貴子)
    SIBLING_GROUPS.forEach(group => {
      const mem = group.members.filter(id => positions[id] && !parents[id]);
      if (mem.length < 2) return;  // 親が表示中 (C 層等) なら親子線で連結済みのためスキップ
      mem.sort((a, b) => positions[a].x - positions[b].x);
      const barY = positions[mem[0]].y - 13;
      const leftCx = positions[mem[0]].x + NODE_W / 2;
      const rightCx = positions[mem[mem.length - 1]].x + NODE_W / 2;
      svgInner += `<path d="M${leftCx},${barY} H${rightCx}" fill="none" stroke="#7a8a9a" stroke-width="1.4"></path>`;
      mem.forEach(id => {
        const cx = positions[id].x + NODE_W / 2;
        svgInner += `<path d="M${cx},${barY} V${positions[id].y}" fill="none" stroke="#7a8a9a" stroke-width="1.4"></path>`;
      });
    });

    // ノード描画
    Array.from(imperialIdSet).forEach(id => {
      const p = positions[id];
      if (!p) return;
      const d = deityIdx[id];
      const name = d ? d.canonical_name : id;
      const reading = d ? (d.canonical_reading || '') : '';
      const cat = d ? (d.category || '') : '';
      const isSibling = SIBLING_NODES.includes(id);
      const isAncestorB = ANCESTORS_B.includes(id);
      const isAncestorC = ANCESTORS_C.includes(id);
      const isKesshi = cat.includes('欠史八代');
      const isEmpress = !isSibling && !isAncestorB && !isAncestorC && !isKesshi && (d && d.gender === '女');

      let fillBg, strokeColor;
      if (isSibling)           { fillBg = '#eef1f4'; strokeColor = '#7a8a9a'; }  // 傍系兄弟: 寒色
      else if (isAncestorC)    { fillBg = '#eef0ee'; strokeColor = '#6a7a6a'; }  // C 層: 灰緑
      else if (isAncestorB)    { fillBg = '#f4efe8'; strokeColor = '#5a8a5a'; }  // B 層: 薄緑
      else if (isKesshi)       { fillBg = '#ffffff'; strokeColor = '#c9a878'; }
      else if (isEmpress)      { fillBg = '#fcf6e8'; strokeColor = '#8b3a3a'; }
      else                     { fillBg = '#ffffff'; strokeColor = '#4a3520'; }
      const dashAttr = (isKesshi || isAncestorC || isSibling) ? ' stroke-dasharray="4 3"' : '';

      const url = `deity.html?id=${encodeURIComponent(id)}`;
      const shortName = name.length > 9 ? name.slice(0, 9) + '…' : name;
      const shortReading = reading.length > 13 ? reading.slice(0, 13) : reading;

      const reignInfo = (window.EmperorReign && window.EmperorReign[id]) || null;
      const daiText = reignInfo && reignInfo.dai ? `第${reignInfo.dai}代` : '';
      const reignText = reignInfo ? reignInfo.reign : '';

      // C 層は「神代」ラベル、B 層 (神代部分) は「神代」ラベル、傍系兄弟は「三貴子」等
      // C 層は subtype 別ラベル (造化三神 / 別天津神 / 神世七代・独神 / 神世七代・対偶神)
      const layerText = isSibling ? '神代/傍系'
        : isAncestorC ? (COSMOGONY_LABEL[COSMOGONY_SUBTYPE[id]] || '神代(宇宙生成)')
        : (isAncestorB && !daiText ? '神代' : '');

      svgInner += `<a href="${url}" target="_self">
        <rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="6" ry="6"
              fill="${fillBg}" stroke="${strokeColor}" stroke-width="1.5"${dashAttr}></rect>
        ${daiText ? `<text x="${p.x + NODE_W / 2}" y="${p.y + 14}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" font-weight="700" fill="#8b3a3a">${escapeXml(daiText)}</text>` : ''}
        ${layerText ? `<text x="${p.x + NODE_W / 2}" y="${p.y + 14}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" font-weight="600" fill="#6a7a6a">${escapeXml(layerText)}</text>` : ''}
        <text x="${p.x + NODE_W / 2}" y="${p.y + 30}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="13" font-weight="700" fill="#4a3520">${escapeXml(shortName)}</text>
        <text x="${p.x + NODE_W / 2}" y="${p.y + 44}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" fill="#8b7560">${escapeXml(shortReading)}</text>
        ${reignText ? `<text x="${p.x + NODE_W / 2}" y="${p.y + 58}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" font-weight="600" fill="#5a4a35">${escapeXml(reignText.length > 18 ? reignText.slice(0, 18) + '…' : reignText)}</text>` : ''}
      </a>`;
    });

    // 天照大神ノードの上に「▲ 宇宙起源を展開 / ▼ 折りたたむ」トグルボタンを描く
    const amaPos = positions['DEI-003'];
    if (amaPos) {
      const btnLabel = showCosmogony
        ? '▼ 宇宙起源(造化三神)を折りたたむ'
        : '▲ 宇宙起源(造化三神)を展開';
      const btnFill = showCosmogony ? '#eef0ee' : '#fdf3e0';
      const btnStroke = showCosmogony ? '#6a7a6a' : '#d68a3a';
      const btnY = amaPos.y - 46;
      const btnX = amaPos.x - 30;
      const btnW = NODE_W + 60;
      svgInner += `<g class="cosmogony-toggle" style="cursor:pointer;" data-toggle="cosmogony">
        <rect x="${btnX}" y="${btnY}" width="${btnW}" height="26" rx="13" ry="13"
              fill="${btnFill}" stroke="${btnStroke}" stroke-width="1.5"></rect>
        <text x="${btnX + btnW / 2}" y="${btnY + 17}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="11" font-weight="700" fill="#5a4a35">${escapeXml(btnLabel)}</text>
      </g>`;
    }

    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', svgW);
    svg.setAttribute('height', svgH);
    svg.innerHTML = svgInner;

    // toggle ボタンのクリックハンドラ — SVG 要素なので個別 attach
    const toggleEl = svg.querySelector('[data-toggle="cosmogony"]');
    if (toggleEl) {
      toggleEl.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        showCosmogony = !showCosmogony;
        renderGenealogy();
        // ズーム維持
        setZoom(zoom);
      });
    }

    intro.textContent = showCosmogony
      ? `${imperialIdSet.size} 神格・${generations.length} 世代を表示中 (造化三神起点 C 層展開)。各ノードをタップで詳細へ。`
      : `${imperialIdSet.size} 神格・${generations.length} 世代を表示中 (天照大神起点 B 層)。天照ノード上のボタンで宇宙起源 (造化三神) を展開可。`;

    // ズーム再適用用に svgW/svgH を保持
    svg._svgW = svgW;
    svg._svgH = svgH;
  }

  function setZoom(v) {
    zoom = Math.max(0.3, Math.min(3.0, v));
    const svgW = svg._svgW || parseFloat(svg.getAttribute('width')) || 800;
    const svgH = svg._svgH || parseFloat(svg.getAttribute('height')) || 600;
    svg.style.width = (svgW * zoom) + 'px';
    svg.style.height = (svgH * zoom) + 'px';
    document.getElementById('zoomReset').textContent = `${Math.round(zoom * 100)}%`;
  }

  function escapeXml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** 皇統に連なる皇族・皇后 と 外戚氏族 を別カード群として表示 (toggle に依存しない) */
  async function renderRoyalsAndAffines(deities, deityIdx, relations, imperialIdSet) {
    const main = document.querySelector('main .container');
    if (!main) return;

    const royalConsorts = new Set();
    relations.forEach(r => {
      if (r.source_type !== 'deity' || r.target_type !== 'deity') return;
      if (r.relation_type !== 'married_to') return;
      if (imperialIdSet.has(r.source_id) && !imperialIdSet.has(r.target_id)) {
        royalConsorts.add(r.target_id);
      }
      if (imperialIdSet.has(r.target_id) && !imperialIdSet.has(r.source_id)) {
        royalConsorts.add(r.source_id);
      }
    });
    if (window.EmperorReign) {
      Object.entries(window.EmperorReign).forEach(([id, info]) => {
        if (info.reign === '皇族' && !imperialIdSet.has(id) && deityIdx[id]) {
          royalConsorts.add(id);
        }
      });
    }

    if (royalConsorts.size > 0) {
      let h = `<section class="aux-section">
        <h2 class="aux-title">皇族・皇后(系譜に連なる人物)</h2>
        <p class="aux-lead">皇統本系と婚姻・配偶関係にある皇族・皇后・親王。各カードで詳細へ。</p>
        <div class="deity-grid">`;
      Array.from(royalConsorts).forEach(id => {
        const d = deityIdx[id];
        const url = `deity.html?id=${encodeURIComponent(id)}`;
        const info = window.EmperorReign && window.EmperorReign[id];
        const name = d ? d.canonical_name : id;
        const reading = d ? (d.canonical_reading || '') : '';
        const cat = d ? (d.category || '') : '';
        const role = info && info.note ? info.note : (info && info.reign ? info.reign : cat);
        h += `<a href="${url}" class="deity-card deity-card-${(d && d.gender === '女') ? 'secondary' : 'main'}">
          <span class="deity-name">${escapeHtml(name)}</span>
          ${reading && reading !== '-' ? `<span class="deity-reading">${escapeHtml(reading)}</span>` : ''}
          <span class="deity-id"><code>${escapeHtml(id)}</code></span>
          ${cat ? `<span class="deity-cat">${escapeHtml(cat)}</span>` : ''}
          ${role && role !== cat ? `<span class="deity-notes">${escapeHtml(role)}</span>` : ''}
        </a>`;
      });
      h += `</div></section>`;
      main.insertAdjacentHTML('beforeend', h);
    }

    const clanRelations = {};
    relations.forEach(r => {
      if (r.source_type !== 'clan' || r.target_type !== 'deity') return;
      if (!imperialIdSet.has(r.target_id)) return;
      const okType = ['married_into', 'served', 'descended_from', 'associated_with'].includes(r.relation_type);
      if (!okType) return;
      const cid = r.source_id;
      if (!clanRelations[cid]) clanRelations[cid] = { roles: new Set(), deities: new Set(), notes: [] };
      clanRelations[cid].roles.add(r.relation_type);
      clanRelations[cid].deities.add(r.target_id);
      if (r.notes && r.notes !== '-') clanRelations[cid].notes.push(r.notes);
    });

    if (Object.keys(clanRelations).length > 0) {
      const clans = await DataLoader.load('clan');
      const clanIdx = {};
      clans.forEach(c => { clanIdx[c.master_id] = c; });

      const roleLabels = {
        married_into: '外戚(婚姻)',
        served: '仕官',
        descended_from: '皇別氏族(皇統由来)',
        associated_with: '関連',
      };

      const grouped = { married_into: [], descended_from: [], served: [], associated_with: [] };
      Object.entries(clanRelations).forEach(([cid, info]) => {
        for (const role of ['married_into', 'descended_from', 'served', 'associated_with']) {
          if (info.roles.has(role)) {
            grouped[role].push({ cid, info });
            break;
          }
        }
      });

      let h = `<section class="aux-section">
        <h2 class="aux-title">外戚・氏族の連なり</h2>
        <p class="aux-lead">天皇家と婚姻・出自・奉仕の関係を持った主要氏族。藤原・蘇我・宗像・葛城・出雲国造 等。</p>`;
      let hasAny = false;
      for (const role of ['married_into', 'descended_from', 'served', 'associated_with']) {
        const items = grouped[role];
        if (!items.length) continue;
        hasAny = true;
        h += `<h3 class="aux-subtitle"><span class="relation-type">${escapeHtml(role)}</span>
          <span style="color:#8b7560; font-weight:400; font-size:0.85em;">${escapeHtml(roleLabels[role])} · ${items.length} 件</span></h3>`;
        h += `<div class="deity-grid">`;
        items.forEach(({ cid, info }) => {
          const c = clanIdx[cid];
          const url = `clan.html?id=${encodeURIComponent(cid)}`;
          const name = c ? c.canonical_name : cid;
          const reading = c ? (c.canonical_reading || '') : '';
          const clanType = c ? (c.clan_type || '') : '';
          const peak = c && c.peak_period && c.peak_period !== '-' ? c.peak_period : '';

          const relatedNames = Array.from(info.deities).slice(0, 3).map(did => {
            const d = deityIdx[did];
            return d ? d.canonical_name : did;
          }).join('・');
          const moreCount = info.deities.size - 3;

          h += `<a href="${url}" class="deity-card">
            <span class="deity-name">${escapeHtml(name)}</span>
            ${reading && reading !== '-' ? `<span class="deity-reading">${escapeHtml(reading)}</span>` : ''}
            <span class="deity-id"><code>${escapeHtml(cid)}</code></span>
            ${clanType ? `<span class="deity-cat">${escapeHtml(clanType)}</span>` : ''}
            ${peak ? `<span class="deity-notes">最盛期:${escapeHtml(peak)}</span>` : ''}
            <span class="deity-notes">天皇:${escapeHtml(relatedNames)}${moreCount > 0 ? ` 他${moreCount}` : ''}</span>
          </a>`;
        });
        h += `</div>`;
      }
      h += `</section>`;
      if (hasAny) main.insertAdjacentHTML('beforeend', h);
    }
  }
})();
