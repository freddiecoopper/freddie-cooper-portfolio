/* Light and dark mode. The choice is saved and shared by every page. */
(function () {
  var p = document.querySelector('.p'), btn = document.getElementById('ttog');
  function apply(dark) { p.classList.toggle('dark', dark); btn.setAttribute('aria-pressed', dark); btn.textContent = dark ? 'Light mode' : 'Dark mode'; }
  var dark = false; try { dark = localStorage.getItem('fc-theme') === 'dark'; } catch (e) {}
  apply(dark);
  btn.addEventListener('click', function () { dark = !dark; try { localStorage.setItem('fc-theme', dark ? 'dark' : 'light'); } catch (e) {} apply(dark); });
  window.addEventListener('storage', function (e) { if (e.key === 'fc-theme') { dark = e.newValue === 'dark'; apply(dark); } });
})();
