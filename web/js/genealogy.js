// 皇統系譜の SVG レンダラ
(async function () {
  const loading = document.getElementById('loading');
  const wrap = document.getElementById('genealogyWrap');
  const svg = document.getElementById('genealogySvg');
  const intro = document.getElementById('genealogyIntro');

  // 寸法定数
  const NODE_W = 140;
  const NODE_H = 56;
  const GAP_X = 18;
  const GAP_Y = 96;
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
    // 神話系で皇統に直結する祖先(神武の祖父・曾祖父まで)を追加
    const NEAR_ANCESTORS = ['DEI-015', 'DEI-083', 'DEI-085', 'DEI-088', 'DEI-090', 'DEI-016'];
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

    // 親子線(L 字)
    for (const child in parents) {
      const parent = parents[child];
      const cp = positions[child], pp = positions[parent];
      if (!cp || !pp) continue;
      const x1 = pp.x + NODE_W / 2, y1 = pp.y + NODE_H;
      const x2 = cp.x + NODE_W / 2, y2 = cp.y;
      const midY = (y1 + y2) / 2;
      svgInner += `<path class="edge edge-parent" d="M${x1},${y1} V${midY} H${x2} V${y2}"></path>`;
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
          svgInner += `<path class="edge edge-marriage" d="M${x1},${y} H${x2}"></path>`;
        }
      });
    }

    // ノード
    Array.from(imperialIdSet).forEach(id => {
      const p = positions[id];
      if (!p) return;
      const d = deityIdx[id];
      const name = d ? d.canonical_name : id;
      const reading = d ? (d.canonical_reading || '') : '';
      const cat = d ? (d.category || '') : '';
      const isAncestor = NEAR_ANCESTORS.includes(id);
      const isKesshi = cat.includes('欠史八代');
      let cls = 'node';
      if (isAncestor) cls += ' node-ancestor';
      else if (isKesshi) cls += ' node-kesshi';
      else if (cat.includes('女')) cls += ' node-empress';
      const url = `deity.html?id=${encodeURIComponent(id)}`;

      // ノード本体
      svgInner += `<a href="${url}" class="${cls}">
        <rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="6"></rect>
        <text x="${p.x + NODE_W / 2}" y="${p.y + 22}" class="node-name" text-anchor="middle">${escapeXml(name.slice(0, 8))}${name.length > 8 ? '…' : ''}</text>
        <text x="${p.x + NODE_W / 2}" y="${p.y + 38}" class="node-reading" text-anchor="middle">${escapeXml(reading.slice(0, 12))}</text>
        <text x="${p.x + NODE_W / 2}" y="${p.y + 50}" class="node-id" text-anchor="middle">${escapeXml(id)}</text>
      </a>`;
    });

    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', svgW);
    svg.setAttribute('height', svgH);
    svg.innerHTML = svgInner;

    intro.textContent = `${imperialIdSet.size} 神格・${generations.length} 世代を表示。各ノードをタップで詳細へ。`;
    loading.hidden = true;
    wrap.hidden = false;

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
})();
