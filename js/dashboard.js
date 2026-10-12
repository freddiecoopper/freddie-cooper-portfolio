/* Dashboard: project request inbox and website traffic. */
var $ = function (id) { return document.getElementById(id); };
var S = { token: '', tab: 'req', filter: 'all', days: 30, items: [], confirm: '' };
function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
function say(m) { $('msg').textContent = m || ''; }
function api(path, opt) {
  opt = opt || {}; opt.headers = Object.assign({ Authorization: 'Bearer ' + S.token }, opt.headers || {});
  return fetch(path, opt).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.status === 401) throw new Error('auth'); if (!r.ok || j.ok === false) throw new Error(j.error || 'Request failed'); return j; }); });
}
function signIn() {
  var t = $('tok').value.trim(); if (!t) { $('authMsg').textContent = 'Enter your token.'; return; }
  S.token = t; $('authMsg').textContent = 'Checking.';
  api('/api/requests').then(function (j) {
    try { sessionStorage.setItem('fc-token', t); localStorage.setItem('fc-owner', '1'); } catch (e) {}
    $('auth').hidden = true; $('app').hidden = false; S.items = j.items || []; renderReq(); showTab(S.tab);
  }).catch(function (e) { $('authMsg').textContent = e.message === 'auth' ? 'That token was not accepted.' : 'Could not load: ' + e.message; });
}
$('load').addEventListener('click', signIn);
$('tok').addEventListener('keydown', function (e) { if (e.key === 'Enter') signIn(); });
$('signout').addEventListener('click', function () { try { sessionStorage.removeItem('fc-token'); } catch (e) {} S.token = ''; $('app').hidden = true; $('auth').hidden = false; $('tok').value = ''; $('authMsg').textContent = ''; });
$('refresh').addEventListener('click', function () { S.tab === 'req' ? loadReq() : loadTraffic(); });
try { var saved = sessionStorage.getItem('fc-token'); if (saved) { $('tok').value = saved; signIn(); } } catch (e) {}
function showTab(t) {
  S.tab = t; $('reqPanel').hidden = t !== 'req'; $('trafficPanel').hidden = t !== 'traffic';
  $('tReq').className = 'tab' + (t === 'req' ? ' on' : ''); $('tTraffic').className = 'tab' + (t === 'traffic' ? ' on' : '');
  $('tReq').setAttribute('aria-pressed', t === 'req'); $('tTraffic').setAttribute('aria-pressed', t === 'traffic'); say('');
  if (t === 'traffic') loadTraffic();
}
$('tReq').addEventListener('click', function () { showTab('req'); }); $('tTraffic').addEventListener('click', function () { showTab('traffic'); });
function loadReq() { say('Loading.'); api('/api/requests').then(function (j) { S.items = j.items || []; say(''); renderReq(); }).catch(function (e) { say(e.message); }); }
function setStatus(r, status) { api('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, status: status }) }).then(function () { r.status = status; renderReq(); }).catch(function (e) { say(e.message); }); }
function remove(r) {
  if (S.confirm !== r.id) { S.confirm = r.id; renderReq(); return; }
  S.confirm = ''; api('/api/requests?id=' + encodeURIComponent(r.id), { method: 'DELETE' }).then(function () { S.items = S.items.filter(function (x) { return x.id !== r.id; }); say('Deleted.'); renderReq(); }).catch(function (e) { say(e.message); });
}
function act(label, fn) { var b = el('button', 'sbtn', label); b.type = 'button'; b.addEventListener('click', fn); return b; }
function ago(iso) { var s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' minutes ago'; if (s < 86400) return Math.round(s / 3600) + ' hours ago'; return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
function renderReq() {
  var all = S.items, count = function (s) { return all.filter(function (r) { return (r.status || 'new') === s; }).length; };
  $('newCount').textContent = count('new') || '';
  var f = $('filters'); f.textContent = '';
  [['all', 'All', all.length], ['new', 'New', count('new')], ['read', 'Read', count('read')], ['done', 'Done', count('done')]].forEach(function (t) {
    var b = el('button', 'fb' + (S.filter === t[0] ? ' on' : ''), t[1] + ' ' + t[2]); b.type = 'button'; b.setAttribute('aria-pressed', S.filter === t[0]); b.addEventListener('click', function () { S.filter = t[0]; renderReq(); }); f.appendChild(b);
  });
  var list = all.filter(function (r) { return S.filter === 'all' || (r.status || 'new') === S.filter; });
  $('reqCount').textContent = list.length + (list.length === 1 ? ' request' : ' requests');
  var box = $('reqList'); box.textContent = '';
  if (!list.length) { box.appendChild(el('p', 'empty', all.length ? 'Nothing in this view.' : 'No requests yet. They appear here when someone finishes the Start a project form.')); return; }
  list.forEach(function (r) {
    var st = r.status || 'new', c = el('article', 'req' + (st === 'done' ? ' done' : ''));
    var top = el('div', 'top'); top.appendChild(el('h2', '', (r.productName || 'Request') + ' from ' + (r.name || 'unknown')));
    top.appendChild(el('span', 'chip ' + st, st + ', ' + ago(r.submittedAt))); c.appendChild(top);
    var sum = el('div', 'sum');
    [['Topic', r.topic], ['Description', r.description], ['Link', r.link], ['Needs', (r.needs || []).join(', ')], ['Already has', (r.have || []).join(', ')], ['Files link', r.haveLink], ['Timeline', r.timeline], ['Budget', r.budget], ['Email', r.email], ['Company', r.company]].forEach(function (p) { if (p[1]) { sum.appendChild(el('span', 'lbl', p[0])); sum.appendChild(el('span', 'v', p[1])); } });
    c.appendChild(sum);
    var a = el('div', 'acts'), reply = el('a', 'back', 'Reply'); reply.href = 'mailto:' + r.email + '?subject=' + encodeURIComponent('Re: ' + (r.productName || 'your project request')); a.appendChild(reply);
    if (st !== 'read') a.appendChild(act('Mark read', function () { setStatus(r, 'read'); }));
    if (st !== 'done') a.appendChild(act('Mark done', function () { setStatus(r, 'done'); }));
    if (st !== 'new') a.appendChild(act('Mark new', function () { setStatus(r, 'new'); }));
    a.appendChild(act(S.confirm === r.id ? 'Sure?' : 'Delete', function () { remove(r); })); c.appendChild(a); box.appendChild(c);
  });
}
function renderRanges() {
  var r = $('ranges'); r.textContent = '';
  [7, 30, 90].forEach(function (d) { var b = el('button', 'fb' + (S.days === d ? ' on' : ''), 'Last ' + d + ' days'); b.type = 'button'; b.setAttribute('aria-pressed', S.days === d); b.addEventListener('click', function () { S.days = d; loadTraffic(); }); r.appendChild(b); });
}
function loadTraffic() { renderRanges(); say('Loading.'); api('/api/stats?days=' + S.days).then(function (j) { say(''); renderTraffic(j); }).catch(function (e) { say(e.message === 'auth' ? 'Token not accepted.' : e.message); }); }
function country(c) { try { return new Intl.DisplayNames(undefined, { type: 'region' }).of(c) || c; } catch (e) { return c; } }
function renderTraffic(j) {
  var t = j.totals, ppv = t.visitors ? (t.pageviews / t.visitors).toFixed(1) : '0';
  $('rangeNote').textContent = 'Visitors are counted per day, so a returning visitor counts once each day';
  var st = $('stats'); st.textContent = '';
  [['Visitors', t.visitors], ['Page views', t.pageviews], ['Pages per visitor', ppv]].forEach(function (x) { var d = el('div', 'stat'); d.appendChild(el('span', 'lbl', x[0])); d.appendChild(el('b', '', String(x[1]))); st.appendChild(d); });
  var svg = $('chart'), W = 1000, H = 220, n = j.series.length, max = Math.max.apply(null, j.series.map(function (s) { return s.pv; }).concat([1])), bw = W / n;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.textContent = '';
  var ns = 'http://www.w3.org/2000/svg', mk = function (tag, a) { var e = document.createElementNS(ns, tag); for (var k in a) e.setAttribute(k, a[k]); return e; };
  svg.appendChild(mk('line', { x1: 0, y1: H - 0.5, x2: W, y2: H - 0.5 }));
  j.series.forEach(function (s, i) { var ph = s.pv / max * (H - 8), uh = s.uv / max * (H - 8), x = i * bw + bw * 0.15, w = Math.max(bw * 0.7, 1); var a = mk('rect', { class: 'pv', x: x, y: H - ph, width: w, height: ph }), tt = mk('title', {}); tt.textContent = s.d + ': ' + s.uv + ' visitors, ' + s.pv + ' page views'; a.appendChild(tt); svg.appendChild(a); svg.appendChild(mk('rect', { class: 'uv', x: x, y: H - uh, width: w, height: uh })); });
  $('axL').textContent = j.series[0].d; $('axR').textContent = j.series[n - 1].d + ' (peak ' + max + ' page views a day)';
  var tb = $('tbls'); tb.textContent = '';
  var table = function (title, rows, fmt) { var d = el('div', 'tbl'); d.appendChild(el('h3', 'lbl', title)); if (!rows.length) d.appendChild(el('p', 'empty', 'Nothing yet.')); var m = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1])); rows.forEach(function (r) { var row = el('div', 'trow'); row.appendChild(el('span', '', fmt ? fmt(r.k) : r.k)); row.appendChild(el('span', '', String(r.v))); var bar = el('i'); bar.style.width = (r.v / m * 100) + '%'; row.appendChild(bar); d.appendChild(row); }); tb.appendChild(d); };
  table('Top pages', j.paths); table('Where visitors come from', j.refs); table('Countries', j.geo, country); table('Devices', j.dev);
  if (!t.pageviews) say('No visits recorded yet. Add js/track.js to every public page and deploy.');
}
