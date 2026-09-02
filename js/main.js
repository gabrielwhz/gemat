const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }));

  // Subtle live-data flicker on the dashboard mock to suggest real-time readings
  const readings = {
    pm25: { base: 18, unit: ' µg/m³', variance: 2 },
    pm10: { base: 28, unit: ' µg/m³', variance: 3 },
    co2:  { base: 12, unit: ' ppb', variance: 3 },   // SO2
    temp: { base: 8, unit: ' ppb', variance: 2 }     // NOx
  };
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    setInterval(() => {
      Object.entries(readings).forEach(([id, cfg]) => {
        const el = document.getElementById(id);
        if (!el) return;
        const delta = (Math.random() - 0.5) * 2 * cfg.variance;
        const val = cfg.base + delta;
        const shown = cfg.decimals ? val.toFixed(cfg.decimals) : Math.round(val);
        el.textContent = shown + cfg.unit;
      });
    }, 3200);
  }