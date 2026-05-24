// 皇統系譜の SVG レンダラ
(async function () {
  const loading = document.getElementById('loading');
  const wrap = document.getElementById('genealogyWrap');
  const svg = document.getElementById('genealogySvg');
  const intro = document.getElementById('genealogyIntro');

  // 寸法定数(在位行追加でノード高さを拡張)
  const NODE_W = 150;
  const NODE_H = 72;
  const GAP_X = 18;
  const GAP_Y = 112;
  const MARGIN = 30;

  let zoom = 1.0;

  try {
    const [deities, relations] = await Promise.all([
      DataLoader.load('deity'),
      DataLoader.load('relations'),
    ]);

    // 1. 皇統 deity を抽出
    //    category に「皇統」を含む、または親子関係で含まれる神々
    const imperialIdSet = new Set();
    deities.forEach(d => {
      if ((d.category || '').includes('皇統')) imperialIdSet.add(d.master_id);
    });
    // 神話系で皇統に直結する祖先(神武の祖父・曾祖父まで)+ 母系 玉依姫
    const NEAR_ANCESTORS = [
      'DEI-015',  // ニニギ(曾祖父)
      'DEI-083',  // コノハナサクヤ(曾祖母)
      'DEI-085',  // ヒコホホデミ=山幸彦(祖父)
      'DEI-088',  // 豊玉姫(祖母)
      'DEI-090',  // ウガヤフキアエズ(父)
      'DEI-089',  // 玉依姫(母)★ 追加
      'DEI-016',  // ヤマトタケル(景行皇子)
    ];
    NEAR_ANCESTORS.forEach(id => imperialIdSet.add(id));

    const deityIdx = {};
    deities.forEach(d => { deityIdx[d.master_id] = d; });

    // 2. parent_of リレーションでツリー構築(皇統だけ)
    const parents = {};   // child -> parent (1人)
    const children = {};  // parent -> [child]
    const marriages = {}; // a -> Set(spouses)

    relations.forEach(r => {
      if (r.source_type !== 'deity' || r.target_type !== 'deity') return;
      const src = r.source_id, tgt = r.target_id;
      if (!imperialIdSet.has(src) || !imperialIdSet.has(tgt)) return;
      if (r.relation_type === 'parent_of') {
        parents[tgt] = src;
        (children[src] = children[src] || []).push(tgt);
      } else if (r.relation_type === 'married_to') {
        (marriages[src] = marriages[src] || new Set()).add(tgt);
        (marriages[tgt] = marriages[tgt] || new Set()).add(src);
      }
    });

    // 3. 世代計算(DFS、ルート=parent が無いノード)
    const generation = {};
    function calcGen(id, visited = new Set()) {
      if (id in generation) return generation[id];
      if (visited.has(id)) return 0; // cycle 保護
      visited.add(id);
      const p = parents[id];
      generation[id] = p ? (calcGen(p, visited) + 1) : 0;
      return generation[id];
    }
    Array.from(imperialIdSet).forEach(id => calcGen(id));

    // 4. 世代ごとに整理
    const byGen = {};
    Array.from(imperialIdSet).forEach(id => {
      const g = generation[id];
      (byGen[g] = byGen[g] || []).push(id);
    });

    // 5. 各世代内でソート(親が同じ兄弟は隣に + ID 順安定化)
    const generations = Object.keys(byGen).map(Number).sort((a, b) => a - b);
    generations.forEach(g => {
      byGen[g].sort((a, b) => {
        const pa = parents[a] || '';
        const pb = parents[b] || '';
        if (pa !== pb) return pa.localeCompare(pb);
        return a.localeCompare(b);
      });
    });

    // 6. 座標決定
    const positions = {};
    let maxX = 0, maxY = 0;
    generations.forEach(g => {
      const ids = byGen[g];
      const y = g * GAP_Y + MARGIN;
      ids.forEach((id, i) => {
        const x = i * (NODE_W + GAP_X) + MARGIN;
        positions[id] = { x, y };
        if (x + NODE_W > maxX) maxX = x + NODE_W;
        if (y + NODE_H > maxY) maxY = y + NODE_H;
      });
    });

    const svgW = maxX + MARGIN;
    const svgH = maxY + MARGIN;

    // 7. SVG 描画(defs + edges + nodes)
    let svgInner = '';

    // arrow marker
    svgInner += `
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L0,8 L7,4 z" fill="#8b3a3a"></path>
        </marker>
      </defs>
    `;

    // 親子線(L 字)— SVG 属性で直接指定(CSS が SVG <a> 内で効かない iOS Safari 対策)
    for (const child in parents) {
      const parent = parents[child];
      const cp = positions[child], pp = positions[parent];
      if (!cp || !pp) continue;
      const x1 = pp.x + NODE_W / 2, y1 = pp.y + NODE_H;
      const x2 = cp.x + NODE_W / 2, y2 = cp.y;
      const midY = (y1 + y2) / 2;
      svgInner += `<path d="M${x1},${y1} V${midY} H${x2} V${y2}" fill="none" stroke="#8b3a3a" stroke-width="1.5"></path>`;
    }

    // 婚姻線(横、破線)
    const drawnMarriages = new Set();
    for (const a in marriages) {
      marriages[a].forEach(b => {
        const key = [a, b].sort().join('_');
        if (drawnMarriages.has(key)) return;
        drawnMarriages.add(key);
        const pa = positions[a], pb = positions[b];
        if (!pa || !pb) return;
        if (Math.abs(pa.y - pb.y) > 5) return; // 同世代のみ
        const y = pa.y + NODE_H / 2;
        const x1 = Math.min(pa.x, pb.x) + NODE_W;
        const x2 = Math.max(pa.x, pb.x);
        if (x1 < x2) {
          svgInner += `<path d="M${x1},${y} H${x2}" fill="none" stroke="#c9a878" stroke-width="1.5" stroke-dasharray="4 3"></path>`;
        }
      });
    }

    // ノード(SVG 属性で fill/stroke/font を直接指定 — CSS 依存を排除)
    Array.from(imperialIdSet).forEach(id => {
      const p = positions[id];
      if (!p) return;
      const d = deityIdx[id];
      const name = d ? d.canonical_name : id;
      const reading = d ? (d.canonical_reading || '') : '';
      const cat = d ? (d.category || '') : '';
      const isAncestor = NEAR_ANCESTORS.includes(id);
      const isKesshi = cat.includes('欠史八代');
      const isEmpress = !isAncestor && !isKesshi && (d && d.gender === '女');

      // 色決定
      let fillBg, strokeColor;
      if (isAncestor)      { fillBg = '#f4efe8'; strokeColor = '#5a8a5a'; }
      else if (isKesshi)   { fillBg = '#ffffff'; strokeColor = '#c9a878'; }
      else if (isEmpress)  { fillBg = '#fcf6e8'; strokeColor = '#8b3a3a'; }
      else                 { fillBg = '#ffffff'; strokeColor = '#4a3520'; }
      const dashAttr = isKesshi ? ' stroke-dasharray="4 3"' : '';

      const url = `deity.html?id=${encodeURIComponent(id)}`;
      const shortName = name.length > 9 ? name.slice(0, 9) + '…' : name;
      const shortReading = reading.length > 13 ? reading.slice(0, 13) : reading;

      // 在位情報(emperor_reign.js から)
      const reignInfo = (window.EmperorReign && window.EmperorReign[id]) || null;
      const daiText = reignInfo && reignInfo.dai ? `第${reignInfo.dai}代` : '';
      const reignText = reignInfo ? reignInfo.reign : '';

      svgInner += `<a href="${url}" target="_self">
        <rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="6" ry="6"
              fill="${fillBg}" stroke="${strokeColor}" stroke-width="1.5"${dashAttr}></rect>
        ${daiText ? `<text x="${p.x + NODE_W / 2}" y="${p.y + 14}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" font-weight="700" fill="#8b3a3a">${escapeXml(daiText)}</text>` : ''}
        <text x="${p.x + NODE_W / 2}" y="${p.y + 30}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="13" font-weight="700" fill="#4a3520">${escapeXml(shortName)}</text>
        <text x="${p.x + NODE_W / 2}" y="${p.y + 44}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" fill="#8b7560">${escapeXml(shortReading)}</text>
        ${reignText ? `<text x="${p.x + NODE_W / 2}" y="${p.y + 57}" text-anchor="middle"
              font-family="Hiragino Sans, Yu Gothic, Meiryo, sans-serif"
              font-size="9" font-weight="600" fill="#5a4a35">${escapeXml(reignText.length > 18 ? reignText.slice(0, 18) + '…' : reignText)}</text>` : ''}
        <text x="${p.x + NODE_W / 2}" y="${p.y + 67}" text-anchor="middle"
              font-family="SFMono-Regular, Consolas, Menlo, monospace"
              font-size="8" fill="#b09878">${escapeXml(id)}</text>
      </a>`;
    });

    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', svgW);
    svg.setAttribute('height', svgH);
    svg.innerHTML = svgInner;

    intro.textContent = `${imperialIdSet.size} 神格・${generations.length} 世代を表示。各ノードをタップで詳細へ。`;
    loading.hidden = true;
    wrap.hidden = false;

    // ===== 追加セクション:皇族・皇后/外戚氏族 =====
    await renderRoyalsAndAffines(deities, deityIdx, relations, imperialIdSet);
    if (window.Era) Era.applyEraConversion(document.querySelector('main'));

    // ズーム
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoom * 1.2));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoom / 1.2));
    document.getElementById('zoomReset').addEventListener('click', () => setZoom(1.0));
    function setZoom(v) {
      zoom = Math.max(0.3, Math.min(3.0, v));
      svg.style.width = (svgW * zoom) + 'px';
      svg.style.height = (svgH * zoom) + 'px';
      document.getElementById('zoomReset').textContent = `${Math.round(zoom * 100)}%`;
    }
  } catch (err) {
    loading.textContent = '読み込み失敗: ' + err.message;
    console.error(err);
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

  /** 皇統に連なる皇族・皇后 と 外戚氏族 を別カード群として表示 */
  async function renderRoyalsAndAffines(deities, deityIdx, relations, imperialIdSet) {
    const main = document.querySelector('main .container');
    if (!main) return;

    // ----- 1. 皇族・皇后(皇統 deity と婚姻関係 or 子関係にある女神 / 親王) -----
    // category に「皇族」「皇后」「皇統」を含むが、imperialIdSet にもう含まれているものは除外しない
    // (皇統本系の人物 = imperialIdSet。本系外の皇族・皇后 = 別出し)
    const royalConsorts = new Set();
    relations.forEach(r => {
      if (r.source_type !== 'deity' || r.target_type !== 'deity') return;
      if (r.relation_type !== 'married_to') return;
      // 皇統 deity と婚姻関係にある相手
      if (imperialIdSet.has(r.source_id) && !imperialIdSet.has(r.target_id)) {
        royalConsorts.add(r.target_id);
      }
      if (imperialIdSet.has(r.target_id) && !imperialIdSet.has(r.source_id)) {
        royalConsorts.add(r.source_id);
      }
    });
    // 既知の皇族(EmperorReign に登録された reign:'皇族' のもの)
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

    // ----- 2. 外戚氏族(皇統 deity と婚姻 or 仕えた氏族、関係種別ごと) -----
    // clan → 皇統 deity の関係を集める
    const clanRelations = {};  // clan_id → { roles: Set, deities: Set }
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

      // ロール優先度でグループ分け
      const grouped = { married_into: [], descended_from: [], served: [], associated_with: [] };
      Object.entries(clanRelations).forEach(([cid, info]) => {
        // 最も重要なロールを優先
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

          // 関連天皇名
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
