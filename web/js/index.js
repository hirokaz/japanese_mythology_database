// Top page: animate stat counters with real master counts.
(async function () {
  function animateNumber(el, target) {
    const start = 0;
    const duration = 800;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(start + (target - start) * ease).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  try {
    const [shrine, deity, clan, motif, relations] = await Promise.all([
      DataLoader.load('shrine'),
      DataLoader.load('deity'),
      DataLoader.load('clan'),
      DataLoader.load('motif'),
      DataLoader.load('relations'),
    ]);
    animateNumber(document.getElementById('statShrine'), shrine.length);
    animateNumber(document.getElementById('statDeity'), deity.length);
    animateNumber(document.getElementById('statClan'), clan.length);
    animateNumber(document.getElementById('statMotif'), motif.length);
    animateNumber(document.getElementById('statRelation'), relations.length);
  } catch (err) {
    console.error('stat load failed', err);
    ['statShrine', 'statDeity', 'statClan', 'statMotif', 'statRelation'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
  }
})();
