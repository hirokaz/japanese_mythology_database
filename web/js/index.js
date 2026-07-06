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

  // 1 ファイルの取得失敗が他のカウンタまで巻き込まないよう、stat ごとに独立して描画する
  const STATS = [
    ['statShrine', 'shrine'],
    ['statDeity', 'deity'],
    ['statClan', 'clan'],
    ['statMotif', 'motif'],
    ['statRelation', 'relations'],
  ];
  await Promise.all(STATS.map(async ([elId, source]) => {
    const el = document.getElementById(elId);
    if (!el) return;
    try {
      const rows = await DataLoader.load(source);
      animateNumber(el, rows.length);
    } catch (err) {
      console.error(`stat load failed: ${source}`, err);
      el.textContent = '—';
    }
  }));
})();
