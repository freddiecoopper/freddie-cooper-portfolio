/* Light and dark mode. The choice is saved and shared by every page. */
(function () {
  var p = document.querySelector('.p'), btn = document.getElementById('ttog');
  /* The button shows where it will take you: a moon in light mode, a sun in dark mode. */
  var svg = function (d) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var MOON = svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>');
  var SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>');
  function apply(dark) {
    p.classList.toggle('dark', dark);
    var label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    btn.innerHTML = dark ? SUN : MOON; btn.setAttribute('aria-label', label); btn.title = label;
  }
  var dark = false; try { dark = localStorage.getItem('fc-theme') === 'dark'; } catch (e) {}
  apply(dark);
  btn.addEventListener('click', function () { dark = !dark; try { localStorage.setItem('fc-theme', dark ? 'dark' : 'light'); } catch (e) {} apply(dark); });
  window.addEventListener('storage', function (e) { if (e.key === 'fc-theme') { dark = e.newValue === 'dark'; apply(dark); } });
  var top = document.getElementById('totop');
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
