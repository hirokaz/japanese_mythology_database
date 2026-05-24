// Data loader: fetch + cache TSV master files.
// All paths are relative to web/ root (uses ../docs/...)
(function () {
  // Detect base path: web/ or web/pages/
  const inPagesDir = window.location.pathname.includes('/pages/');
  const BASE = inPagesDir ? '../../docs/' : '../docs/';

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
    relations: BASE + 'relations/relations.tsv',
  };

  const cache = {};

  async function load(name) {
    if (cache[name]) return cache[name];
    const path = PATHS[name];
    if (!path) throw new Error(`Unknown data source: ${name}`);
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
    const text = await res.text();
    cache[name] = window.TSV.parse(text);
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

  /** Get display name for a master ID, looking up across all loaded masters. */
  async function nameForId(id) {
    if (!id) return id;
    if (id.startsWith('DEI-')) {
      const data = await load('deity');
      const r = data.find(x => x.master_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('SHR-')) {
      const data = await load('shrine');
      const r = data.find(x => x.master_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('CLN-')) {
      const data = await load('clan');
      const r = data.find(x => x.master_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('MOTIF-')) {
      const data = await load('motif');
      const r = data.find(x => x.motif_id === id);
      return r ? r.motif_name : id;
    }
    if (id.startsWith('TXT-')) {
      const data = await load('text');
      const r = data.find(x => x.text_id === id);
      return r ? r.canonical_title : id;
    }
    if (id.startsWith('PERIOD-')) {
      const data = await load('period');
      const r = data.find(x => x.period_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('RANK-')) {
      const data = await load('rank');
      const r = data.find(x => x.rank_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('EVENT-')) {
      const data = await load('event');
      const r = data.find(x => x.event_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('FES-')) {
      const data = await load('festival');
      const r = data.find(x => x.festival_id === id);
      return r ? r.canonical_name : id;
    }
    if (id.startsWith('REGION-') || id.startsWith('REG-')) {
      const data = await load('region');
      const r = data.find(x => x.region_id === id);
      return r ? r.canonical_name : id;
    }
    return id;
  }

  /** URL for detail page, given an entity ID. */
  function detailUrl(id) {
    if (!id) return '#';
    const prefix = inPagesDir ? '' : 'pages/';
    if (id.startsWith('DEI-'))    return `${prefix}deity.html?id=${id}`;
    if (id.startsWith('SHR-'))    return `${prefix}shrine.html?id=${id}`;
    if (id.startsWith('CLN-'))    return `${prefix}clan.html?id=${id}`;
    if (id.startsWith('MOTIF-'))  return `${prefix}entity.html?type=motif&id=${id}`;
    if (id.startsWith('TXT-'))    return `${prefix}entity.html?type=text&id=${id}`;
    if (id.startsWith('PERIOD-')) return `${prefix}entity.html?type=period&id=${id}`;
    if (id.startsWith('RANK-'))   return `${prefix}entity.html?type=rank&id=${id}`;
    if (id.startsWith('EVENT-'))  return `${prefix}entity.html?type=event&id=${id}`;
    if (id.startsWith('FES-'))    return `${prefix}entity.html?type=festival&id=${id}`;
    if (id.startsWith('REGION-') || id.startsWith('REG-'))
                                  return `${prefix}entity.html?type=region&id=${id}`;
    return '#';
  }

  window.DataLoader = { load, indexBy, nameForId, detailUrl, PATHS };
})();
