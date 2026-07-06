// Data loader: fetch + cache TSV master files.
// All paths are relative to web/ root (uses ../docs/...)
(function () {
  // Detect base path: web/ or web/pages/
  const inPagesDir = window.location.pathname.includes('/pages/');
  const BASE = inPagesDir ? '../../docs/' : '../docs/';
  const WEB_DATA = inPagesDir ? '../data/' : 'data/';

  const PATHS = {
    deity:   BASE + 'master/deity_master.tsv',
    shrine:  BASE + 'master/shrine_master.tsv',
    clan:    BASE + 'master/clan_master.tsv',
    text:    BASE + 'master/text_master.tsv',
    period:  BASE + 'master/period_master.tsv',
    rank:    BASE + 'master/rank_master.tsv',
    event:   BASE + 'master/event_master.tsv',
    region:  BASE + 'master/region_master.tsv',
    motif:   BASE + 'civilization/01_motif_db.tsv',
    festival: BASE + 'master/festival_master.tsv',
    emperor: BASE + 'master/emperor_master.tsv',
    relations: BASE + 'relations/relations.tsv',
    deity_extended: WEB_DATA + 'deity_extended.tsv',
    shrine_extended: WEB_DATA + 'shrine_extended.tsv',
    clan_extended: WEB_DATA + 'clan_extended.tsv',
    motif_extended: WEB_DATA + 'motif_extended.tsv',
  };

  // Promise 自体をキャッシュする — 同一ソースへの並行 load() が
  // 二重 fetch/parse にならないようにする (失敗時はキャッシュを消して再試行可能に)
  const cache = {};

  function load(name) {
    if (cache[name]) return cache[name];
    const path = PATHS[name];
    if (!path) return Promise.reject(new Error(`Unknown data source: ${name}`));
    cache[name] = fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
        return res.text();
      })
      .then(text => window.TSV.parse(text))
      .catch(err => {
        delete cache[name];
        throw err;
      });
    return cache[name];
  }

  /** Build an index by ID column (e.g. 'master_id', 'deity_id'). */
  function indexBy(rows, idKey) {
    const idx = {};
    for (const row of rows) {
      idx[row[idKey]] = row;
    }
    return idx;
  }

  // ID prefix → (source name, id column, name column)
  const PREFIX_SOURCES = [
    ['DEI-',    'deity',    'master_id',   'canonical_name'],
    ['SHR-',    'shrine',   'master_id',   'canonical_name'],
    ['CLN-',    'clan',     'master_id',   'canonical_name'],
    ['MOTIF-',  'motif',    'motif_id',    'motif_name'],
    ['TXT-',    'text',     'text_id',     'canonical_title'],
    ['PERIOD-', 'period',   'period_id',   'canonical_name'],
    ['RANK-',   'rank',     'rank_id',     'canonical_name'],
    ['EVENT-',  'event',    'event_id',    'canonical_name'],
    ['FES-',    'festival', 'festival_id', 'canonical_name'],
    ['EMP-',    'emperor',  'emperor_id',  'canonical_name'],
    ['REGION-', 'region',   'region_id',   'canonical_name'],
    ['REG-',    'region',   'region_id',   'canonical_name'],
  ];

  // source name → Promise<ID→row index> (nameForId は render loop 内で
  // 大量に呼ばれるため、線形探索ではなく memoized index で O(1) lookup にする)
  const idIndexCache = {};

  function indexFor(name, idKey) {
    if (!idIndexCache[name]) {
      idIndexCache[name] = load(name).then(rows => indexBy(rows, idKey));
    }
    return idIndexCache[name];
  }

  /** Get display name for a master ID, looking up across all loaded masters. */
  async function nameForId(id) {
    if (!id) return id;
    for (const [prefix, name, idKey, nameKey] of PREFIX_SOURCES) {
      if (id.startsWith(prefix)) {
        const idx = await indexFor(name, idKey);
        const r = idx[id];
        return r ? r[nameKey] : id;
      }
    }
    return id;
  }

  /** URL for detail page, given an entity ID. */
  function detailUrl(id) {
    if (!id) return '#';
    const prefix = inPagesDir ? '' : 'pages/';
    const eid = encodeURIComponent(id);
    if (id.startsWith('DEI-'))    return `${prefix}deity.html?id=${eid}`;
    if (id.startsWith('SHR-'))    return `${prefix}shrine.html?id=${eid}`;
    if (id.startsWith('CLN-'))    return `${prefix}clan.html?id=${eid}`;
    if (id.startsWith('MOTIF-'))  return `${prefix}entity.html?type=motif&id=${eid}`;
    if (id.startsWith('TXT-'))    return `${prefix}entity.html?type=text&id=${eid}`;
    if (id.startsWith('PERIOD-')) return `${prefix}entity.html?type=period&id=${eid}`;
    if (id.startsWith('RANK-'))   return `${prefix}entity.html?type=rank&id=${eid}`;
    if (id.startsWith('EVENT-'))  return `${prefix}entity.html?type=event&id=${eid}`;
    if (id.startsWith('FES-'))    return `${prefix}entity.html?type=festival&id=${eid}`;
    if (id.startsWith('EMP-'))    return `${prefix}entity.html?type=emperor&id=${eid}`;
    if (id.startsWith('REGION-') || id.startsWith('REG-'))
                                  return `${prefix}entity.html?type=region&id=${eid}`;
    return '#';
  }

  window.DataLoader = { load, indexBy, nameForId, detailUrl, PATHS };
})();
