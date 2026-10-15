/* Light and dark mode. The choice is saved and shared by every page.
   Also applies the page backgrounds set in the dashboard (Home page tab, saved in /api/site as colors). */
(function () {
  var p = document.querySelector('.p'), btn = document.getElementById('ttog'), meta = document.querySelector('meta[name="theme-color"]');
  var DEF = { light: '#d6d6d6', dark: '#1c1c1c' }, cols = null, dark = false;

  /* Backgrounds: the last ones seen are kept in this browser, so a page opens in the right colour straight away. */
  try { cols = JSON.parse(localStorage.getItem('fc-colors') || 'null'); } catch (e) {}
  function paint() {
    ['light', 'dark'].forEach(function (k) { var v = cols && cols[k], n = k === 'light' ? '--bg-l' : '--bg-d'; if (v) p.style.setProperty(n, v); else p.style.removeProperty(n); });
    if (meta) meta.content = (cols && cols[dark ? 'dark' : 'light']) || DEF[dark ? 'dark' : 'light'];
  }
  /* The dashboard calls this to try colours on the page before saving (null goes back to the saved ones),
     and with keep = true once they are saved. */
  var saved = cols, trying = false;
  function keep(c) { saved = c; try { if (c) localStorage.setItem('fc-colors', JSON.stringify(c)); else localStorage.removeItem('fc-colors'); } catch (e) {} }
  window.fcPaint = function (c, k) { if (k) keep(c); trying = !!c && !k; cols = c || saved; paint(); };

  /* The button shows where it will take you: a moon in light mode, a sun in dark mode. */
  var svg = function (d) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var MOON = svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>');
  var SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>');
  function apply(d) {
    dark = d; p.classList.toggle('dark', d); paint();
    var label = d ? 'Switch to light mode' : 'Switch to dark mode';
    btn.innerHTML = d ? SUN : MOON; btn.setAttribute('aria-label', label); btn.title = label;
  }
  try { dark = localStorage.getItem('fc-theme') === 'dark'; } catch (e) {}
  apply(dark);
  btn.addEventListener('click', function () { try { localStorage.setItem('fc-theme', !dark ? 'dark' : 'light'); } catch (e) {} apply(!dark); });
  window.addEventListener('storage', function (e) { if (e.key === 'fc-theme') apply(e.newValue === 'dark'); });

  /* Then check the saved colours. window.fcSite is the same request loadHome() in js/live.js reuses on the home page. */
  window.fcSite = fetch('/api/site', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  window.fcSite.then(function (j) {
    if (!j || !j.ok) return;                        /* API unreachable (for example when working locally): keep what we have */
    keep((j.home && j.home.colors) || null); if (!trying) { cols = saved; paint(); }
  });

  var top = document.getElementById('totop');
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
