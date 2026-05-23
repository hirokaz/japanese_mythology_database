// 汎用詳細ページ: motif / text / period / rank / event / region
(async function () {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const id = params.get('id');
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');

  if (!type || !id) {
    loading.textContent = 'type または id が指定されていません。';
    return;
  }

  // master 種別ごとのフィールド定義 (key, label)
  const FIELD_DEFS = {
    motif: {
      idKey: 'motif_id',
      nameKey: 'motif_name',
      readingKey: null,
      typeLabel: 'モチーフ',
      fields: [
        ['motif_name', '名称'],
        ['category', 'カテゴリ'],
        ['summary', '要約'],
        ['symbolic_meaning', '象徴的意味'],
        ['ritual_meaning', '祭祀的意味'],
        ['political_meaning', '政治的意味'],
        ['archaeological_possible_relation', '考古学的関連'],
        ['related_folklore', '関連民俗'],
        ['earliest_sources', '最古出典'],
        ['related_deities', '関連神格 ID'],
        ['related_shrines', '関連神社 ID'],
        ['related_clans', '関連氏族 ID'],
        ['related_regions', '関連地域'],
        ['related_myths', '関連神話'],
        ['notes', '備考'],
      ],
    },
    text: {
      idKey: 'text_id',
      nameKey: 'canonical_title',
      readingKey: 'canonical_reading',
      typeLabel: '文献',
      fields: [
        ['canonical_title', '正式名称'],
        ['canonical_reading', '読み'],
        ['alternative_titles', '別名'],
        ['compilation_year', '成立年'],
        ['compilation_period', '成立時代'],
        ['compiler', '編者・撰者'],
        ['text_type', '文献種別'],
        ['language', '言語'],
        ['extant_status', '現存状況'],
        ['primary_themes', '主要主題'],
        ['confidence_level', '確実性'],
        ['hypothesis_layer', '仮説層'],
        ['source_reference', '出典'],
        ['notes', '備考'],
      ],
    },
    period: {
      idKey: 'period_id',
      nameKey: 'canonical_name',
      readingKey: 'canonical_reading',
      typeLabel: '時代区分',
      fields: [
        ['canonical_name', '名称'],
        ['canonical_reading', '読み'],
        ['era_start_year', '開始年'],
        ['era_end_year', '終了年'],
        ['era_type', '区分種別'],
        ['alternative_names', '別名'],
        ['source_reference', '出典'],
        ['notes', '備考'],
      ],
    },
    rank: {
      idKey: 'rank_id',
      nameKey: 'canonical_name',
      readingKey: 'canonical_reading',
      typeLabel: '社格',
      fields: [
        ['canonical_name', '名称'],
        ['canonical_reading', '読み'],
        ['alternative_names', '別名'],
        ['era', '時代'],
        ['governing_body', '管掌'],
        ['source_reference', '出典'],
        ['notes', '備考'],
      ],
    },
    event: {
      idKey: 'event_id',
      nameKey: 'canonical_name',
      readingKey: 'canonical_reading',
      typeLabel: 'イベント',
      fields: [
        ['canonical_name', '名称'],
        ['canonical_reading', '読み'],
        ['year_start', '開始'],
        ['year_end', '終了'],
        ['era', '時代'],
        ['category', '分類'],
        ['location', '場所'],
        ['hypothesis_layer', '仮説層'],
        ['source_reference', '出典'],
        ['notes', '備考'],
      ],
    },
    region: {
      idKey: 'region_id',
      nameKey: 'canonical_name',
      readingKey: 'canonical_reading',
      typeLabel: '地域',
      fields: [
        ['canonical_name', '名称'],
        ['canonical_reading', '読み'],
        ['region_type', '種別'],
        ['parent_region_id', '上位地域'],
        ['alternative_names', '別名'],
        ['source_reference', '出典'],
        ['notes', '備考'],
      ],
    },
  };

  const def = FIELD_DEFS[type];
  if (!def) {
    loading.textContent = `未対応の type: ${type}`;
    return;
  }

  try {
    const [data, relations] = await Promise.all([
      DataLoader.load(type),
      DataLoader.load('relations'),
    ]);

    const record = data.find(r => r[def.idKey] === id);
    if (!record) {
      loading.textContent = `${id} が見つかりません。`;
      return;
    }

    const name = record[def.nameKey] || id;
    const reading = def.readingKey ? record[def.readingKey] : '';

    document.title = `${name} | 神話 OS`;

    // この id に関わるリレーション
    const outgoing = relations.filter(r => r.source_id === id);
    const incoming = relations.filter(r => r.target_id === id);

    const grouped = (arr) => {
      const m = {};
      arr.forEach(r => {
        (m[r.relation_type] = m[r.relation_type] || []).push(r);
      });
      return m;
    };
    const outGrouped = grouped(outgoing);
    const inGrouped = grouped(incoming);

    loading.hidden = true;
    content.hidden = false;

    let html = `
      <div class="detail-header">
        <h1>${escapeHtml(name)}</h1>
        ${reading && reading !== '-' ? `<p class="subtitle">${escapeHtml(reading)}</p>` : ''}
        <p class="meta"><code>${escapeHtml(id)}</code> · ${escapeHtml(def.typeLabel)} · 関係数: ${(incoming.length + outgoing.length).toLocaleString()}</p>
      </div>

      <div class="detail-grid">
        <div>
          ${renderFields(record, def)}
          ${await renderRelations(outGrouped, 'out')}
          ${await renderRelations(inGrouped, 'in')}
        </div>
        <aside>
          ${renderSidebar(type, id)}
        </aside>
      </div>
    `;
    content.innerHTML = html;
  } catch (err) {
    loading.textContent = '読み込み失敗: ' + err.message;
    console.error(err);
  }

  function renderFields(record, def) {
    let html = `<div class="detail-section"><h2>基本情報</h2><dl class="kv-list">`;
    for (const [k, label] of def.fields) {
      const v = record[k];
      if (!v || v === '-') continue;
      // related_deities / related_shrines / related_clans は ID リンク化
      let valueHtml;
      if (k === 'related_deities' || k === 'related_shrines' || k === 'related_clans') {
        valueHtml = v.split('|').map(x => {
          const t = x.trim();
          const url = DataLoader.detailUrl(t);
          return url !== '#'
            ? `<a href="${url}">${escapeHtml(t)}</a>`
            : escapeHtml(t);
        }).join(' / ');
      } else if (k === 'hypothesis_layer') {
        valueHtml = `<span class="badge badge-${v.toLowerCase()}">${escapeHtml(v)}</span>`;
      } else {
        valueHtml = escapeHtml(v);
      }
      html += `<dt>${label}</dt><dd>${valueHtml}</dd>`;
    }
    html += `</dl></div>`;
    return html;
  }

  async function renderRelations(grouped, direction) {
    const keys = Object.keys(grouped);
    if (keys.length === 0) return '';
    const dirLabel = direction === 'out' ? '本記録から始まる関係' : '本記録に向かう関係';
    const total = Object.values(grouped).reduce((a, b) => a + b.length, 0);

    const importance = {
      primary_deity_of: 1, secondary_deity_of: 2, enshrined_at: 3,
      parent_of: 4, married_to: 5, sibling_of: 6, ancestor_of: 7,
      descended_from: 8, syncretized_with: 9,
      associated_with: 30,
      mentioned_in: 50, located_in: 60, located_in_period: 61,
      located_in_country: 62, has_rank: 63, located_near: 70,
    };
    const sortedKeys = keys.sort((a, b) => (importance[a] || 99) - (importance[b] || 99));

    let html = `<div class="detail-section"><h2>${dirLabel} (${total.toLocaleString()})</h2>`;
    for (const t of sortedKeys) {
      const items = grouped[t];
      html += `<h3 style="font-size:1em; margin:14px 0 6px; color:#5a4a35;">
        <span class="relation-type">${escapeHtml(t)}</span>
        <span style="color:#8b7560; font-weight:400; font-size:0.9em;">${items.length.toLocaleString()} 件</span>
      </h3><ul class="relation-list">`;
      const cap = 30;
      for (let i = 0; i < Math.min(items.length, cap); i++) {
        const r = items[i];
        const otherId = direction === 'out' ? r.target_id : r.source_id;
        const otherName = await DataLoader.nameForId(otherId);
        const url = DataLoader.detailUrl(otherId);
        const layerBadge = r.hypothesis_layer
          ? `<span class="badge badge-${r.hypothesis_layer.toLowerCase()}">${escapeHtml(r.hypothesis_layer)}</span>`
          : '';
        const note = r.notes
          ? `<span style="color:#8b7560; font-size:0.88em;"> — ${escapeHtml(r.notes.slice(0, 80))}${r.notes.length > 80 ? '…' : ''}</span>`
          : '';
        html += `<li>
          ${layerBadge}
          ${url !== '#' ? `<a href="${url}">` : ''}${escapeHtml(otherName)}${url !== '#' ? `</a>` : ''}
          <code style="font-size:0.78em; color:#8b7560;">${escapeHtml(otherId)}</code>
          ${note}
        </li>`;
      }
      if (items.length > cap) {
        html += `<li style="color:#8b7560; font-style:italic;">…他 ${(items.length - cap).toLocaleString()} 件</li>`;
      }
      html += `</ul>`;
    }
    html += `</div>`;
    return html;
  }

  function renderSidebar(type, id) {
    const masterFiles = {
      motif: 'civilization/01_motif_db.tsv',
      text: 'master/text_master.tsv',
      period: 'master/period_master.tsv',
      rank: 'master/rank_master.tsv',
      event: 'master/event_master.tsv',
      region: 'master/region_master.tsv',
    };
    const filePath = masterFiles[type] || '';
    return `<div class="detail-section">
      <h2>外部リンク</h2>
      <ul class="relation-list">
        <li><a href="https://github.com/hirokaz/japanese_mythology_database/blob/main/docs/${filePath}" target="_blank">GitHub: ${escapeHtml(filePath)}</a></li>
        <li><a href="relations.html?from=${encodeURIComponent(id)}">この ID から関係探索</a></li>
      </ul>
    </div>
    <div class="detail-section">
      <h2>確実性レベル</h2>
      <ul class="relation-list" style="font-size:0.85em;">
        <li><span class="badge badge-l0">L0</span> 史料記載の整理</li>
        <li><span class="badge badge-l1">L1</span> 一般的な研究上の解釈</li>
        <li><span class="badge badge-l2">L2</span> 複数研究者の推定</li>
        <li><span class="badge badge-l3">L3</span> 民間伝承・地域伝承</li>
        <li><span class="badge badge-l4">L4</span> 大胆な仮説</li>
      </ul>
    </div>`;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
