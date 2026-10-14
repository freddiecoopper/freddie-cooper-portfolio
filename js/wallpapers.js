/* Wallpapers page. A pack holds several wallpapers (desktop and mobile). Free packs download directly.
   Premium packs go to checkout (api/checkout.js) and the download link is emailed after payment.
   Packs come from /api/wallpapers, else js/content.js. */
var $ = function (id) { return document.getElementById(id); };
var S = { price: 'all', device: 'all', buying: '', busy: false, note: '', err: false, items: [], sel: {} };
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function chips(box, cur, list, key) {
  box.textContent = '';
  list.forEach(function (f) { var b = mk('button', 'fb' + (cur === f[0] ? ' on' : ''), f[1]); b.type = 'button'; b.setAttribute('aria-pressed', cur === f[0]); b.addEventListener('click', function () { S[key] = f[0]; S.buying = ''; render(); }); box.appendChild(b); });
}
function buyBox(w) {
  var box = mk('div', 'buy'), lab = document.createElement('label'); lab.appendChild(mk('span', 'lbl', 'Email for the download link'));
  var inp = document.createElement('input'); inp.className = 'bin'; inp.type = 'email'; inp.autocomplete = 'email'; inp.placeholder = 'you@email.com'; inp.value = S.email || ''; lab.appendChild(inp); box.appendChild(lab);
  var row = mk('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:20px;align-items:center';
  var go = mk('button', 'btn', S.busy ? 'One moment' : 'Continue to checkout'); go.type = 'button';
  var cancel = mk('button', 'sbtn3', 'Cancel'); cancel.type = 'button'; row.appendChild(go); row.appendChild(cancel); box.appendChild(row);
  var note = mk('p', 'bnote' + (S.err ? ' err' : ''), S.note || 'You pay on the next page. The download link is emailed to you.'); note.setAttribute('role', 'status'); box.appendChild(note);
  var ok = function () { return EMAIL_RE.test((S.email || '').trim()) && !S.busy; };
  go.disabled = !ok(); inp.addEventListener('input', function () { S.email = inp.value; go.disabled = !ok(); });
  cancel.addEventListener('click', function () { S.buying = ''; S.note = ''; S.err = false; render(); });
  go.addEventListener('click', function () {
    S.busy = true; S.note = ''; S.err = false; render();
    fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: w.id, email: S.email.trim() }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.url) throw new Error(j.error || 'no url'); return j; }); })
      .then(function (j) { S.note = 'Taking you to checkout.'; render(); window.location.href = j.url; })
      .catch(function () { S.busy = false; S.err = true; S.note = 'Checkout is not available right now. Please try again later.'; render(); });
  });
  return box;
}
function render() {
  chips($('fPrice'), S.price, [['all', 'All'], ['free', 'Free'], ['premium', 'Premium']], 'price'); chips($('fDevice'), S.device, [['all', 'All'], ['desktop', 'Desktop'], ['mobile', 'Mobile']], 'device');
  var view = S.items.filter(function (w) { return w.visible !== false && (S.price === 'all' || (S.price === 'free' ? w.price === 0 : w.price > 0)); })
    .map(function (w) { return { w: w, gal: (w.images || []).filter(function (im) { return S.device === 'all' || im.device === S.device; }) }; }).filter(function (x) { return x.gal.length; });
  $('wcount').textContent = pad(view.length) + (view.length === 1 ? ' pack' : ' packs'); $('wempty').hidden = view.length > 0;
  var box = $('wlist'); box.textContent = '';
  view.forEach(function (x, i) {
    var w = x.w, gal = x.gal, at = Math.min(S.sel[w.id] || 0, gal.length - 1), im = gal[at];
    var c = mk('article', 'wc pk'); c.style.animationDelay = (i * 0.07).toFixed(2) + 's';
    var main = mk('div', 'wi ' + (im.device === 'mobile' ? 'm' : 'd')), img = document.createElement('img'); img.src = im.preview; img.alt = im.label || w.name; main.appendChild(img); c.appendChild(main);
    var th = mk('div', 'th2s'); gal.forEach(function (k, n) { var b = mk('button', 'th2' + (n === at ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', 'Show ' + (k.label || 'wallpaper')); var t = document.createElement('img'); t.src = k.preview; t.alt = ''; b.appendChild(t); b.addEventListener('click', function () { S.sel[w.id] = n; render(); }); th.appendChild(b); }); c.appendChild(th);
    var cap = mk('p', 'wf', (im.label || '') + ', ' + (im.res || '') + ', ' + (im.device === 'mobile' ? 'mobile' : 'desktop')); cap.style.margin = '10px 0 0'; c.appendChild(cap);
    var h = mk('div', 'wh'); h.style.marginTop = '22px'; h.appendChild(mk('span', 'lbl', 'Pack of ' + (w.images || []).length)); h.appendChild(mk('span', 'wp', money(w.price, w.currency))); c.appendChild(h);
    c.appendChild(mk('h2', 'wn', w.name)); c.appendChild(mk('p', 'wb', w.blurb || ''));
    var devs = []; (w.images || []).forEach(function (k) { var d = k.device === 'mobile' ? 'Mobile' : 'Desktop'; if (devs.indexOf(d) < 0) devs.push(d); });
    c.appendChild(mk('p', 'wf', devs.join(' and ') + ', ' + (w.images || []).length + ((w.images || []).length === 1 ? ' wallpaper' : ' wallpapers')));
    var a = mk('div', 'wa');
    if (w.price === 0) { var d = mk('a', 'btn o2', 'Download the pack'); d.href = w.file; d.setAttribute('download', ''); a.appendChild(d); }
    else {
      if (S.buying !== w.id) { var b = mk('button', 'btn', 'Buy the pack, ' + money(w.price, w.currency)); b.type = 'button'; b.addEventListener('click', function () { S.buying = w.id; S.note = ''; S.err = false; S.busy = false; render(); }); a.appendChild(b); }
      if (w.sampleFile) { var s = mk('a', 'sbtn3', 'Free sample: ' + (w.sampleLabel || 'one wallpaper')); s.href = w.sampleFile; s.setAttribute('download', ''); a.appendChild(s); }
    }
    c.appendChild(a); if (S.buying === w.id) c.appendChild(buyBox(w)); box.appendChild(c);
  });
}
var q = new URLSearchParams(window.location.search);
if (q.get('paid')) $('paid').textContent = 'Payment received. Your download link is on its way to your email. It can take a minute.';
loadWallpapers().then(function (items) { S.items = items; render(); });
render();
