/* Dashboard: requests inbox, traffic, projects and case studies, wallpapers, sales and updates.
   Talks to /api/requests, /api/stats, /api/projects, /api/upload and the others with the token you type (kept only for this browser session). */
var $ = function (id) { return document.getElementById(id); };
var S = { token: '', tab: 'req', filter: 'open', days: 30, items: [], confirm: '', wp: [], up: [], proj: [], newCount: '' };
function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
function say(m) { $('msg').textContent = m || ''; }
function api(path, opt) {
  opt = opt || {}; opt.headers = Object.assign({ Authorization: 'Bearer ' + S.token }, opt.headers || {});
  return fetch(path, opt).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.status === 401) throw new Error('auth'); if (!r.ok || j.ok === false) throw new Error(j.error || 'Request failed'); return j; }); });
}
/* ---- sign in ---- */
function signIn() {
  var t = $('tok').value.trim(); if (!t) { $('authMsg').textContent = 'Enter your token.'; return; }
  S.token = t; $('authMsg').textContent = 'Checking.';
  api('/api/requests').then(function (j) {
    try { sessionStorage.setItem('fc-token', t); localStorage.setItem('fc-owner', '1'); } catch (e) {}   /* fc-owner keeps your own visits out of the traffic numbers */
    $('auth').hidden = true; $('app').hidden = false; S.items = j.items || []; buildTabs(); renderReq(); showTab(S.tab);
  }).catch(function (e) { $('authMsg').textContent = e.message === 'auth' ? 'That token was not accepted.' : 'Could not load: ' + e.message; });
}
$('load').addEventListener('click', signIn);
$('tok').addEventListener('keydown', function (e) { if (e.key === 'Enter') signIn(); });
$('signout').addEventListener('click', function () { try { sessionStorage.removeItem('fc-token'); } catch (e) {} S.token = ''; $('app').hidden = true; $('auth').hidden = false; $('tok').value = ''; $('authMsg').textContent = ''; });
$('refresh').addEventListener('click', function () { ({ req: loadReq, traffic: loadTraffic, home: loadHomeTab, proj: loadProj, wp: loadWp, sales: loadSales, up: loadUp })[S.tab](); });
try { var saved = sessionStorage.getItem('fc-token'); if (saved) { $('tok').value = saved; signIn(); } } catch (e) {}
/* ---- tabs ---- */
var TABS = [['req', 'Requests'], ['traffic', 'Traffic'], ['home', 'Home page'], ['proj', 'Projects'], ['wp', 'Wallpapers'], ['sales', 'Sales'], ['up', 'Updates']];
function buildTabs() {
  var t = $('tabs'); t.textContent = '';
  TABS.forEach(function (x) {
    var b = el('button', 'tab' + (S.tab === x[0] ? ' on' : ''), x[1]); b.type = 'button'; b.setAttribute('aria-pressed', S.tab === x[0]);
    if (x[0] === 'req') { var bd = el('span', 'badge'); bd.id = 'newCount'; bd.textContent = S.newCount || ''; b.appendChild(document.createTextNode(' ')); b.appendChild(bd); }
    b.addEventListener('click', function () { showTab(x[0]); }); t.appendChild(b);
  });
}
function showTab(t) {
  S.tab = t; TABS.forEach(function (x) { $(x[0] + 'Panel').hidden = x[0] !== t; }); buildTabs(); say('');
  if (t === 'traffic') loadTraffic(); if (t === 'home') loadHomeTab(); if (t === 'proj') loadProj(); if (t === 'wp') loadWp(); if (t === 'sales') loadSales(); if (t === 'up') loadUp();
}
/* ---- requests: an inbox that doubles as a simple sales pipeline ---- */
var STAGES = [['new', 'New'], ['talking', 'In talks'], ['quoted', 'Quoted'], ['won', 'Won'], ['lost', 'Lost']];
var CURRENCIES = ['USD', 'NGN', 'GBP', 'EUR', 'GHS', 'ZAR', 'KES'];
var OPEN = ['new', 'talking', 'quoted'];
function stageOf(r) { var s = r.status || 'new'; return s === 'read' ? 'talking' : (s === 'done' ? 'won' : s); }   /* older requests used read and done */
function stageName(s) { for (var i = 0; i < STAGES.length; i++) if (STAGES[i][0] === s) return STAGES[i][1]; return s; }
function loadReq() { say('Loading.'); api('/api/requests').then(function (j) { S.items = j.items || []; say(''); renderReq(); }).catch(function (e) { say(e.message); }); }
function saveReq(r, patch, note) {
  return api('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ id: r.id }, patch)) })
    .then(function () { Object.assign(r, patch); if ('value' in patch) r.value = patch.value === '' ? null : Number(patch.value); say(note || 'Saved.'); renderReq(); }).catch(function (e) { say(e.message); });
}
function remove(r) {
  if (S.confirm !== r.id) { S.confirm = r.id; renderReq(); return; }
  S.confirm = ''; api('/api/requests?id=' + encodeURIComponent(r.id), { method: 'DELETE' }).then(function () { S.items = S.items.filter(function (x) { return x.id !== r.id; }); say('Deleted.'); renderReq(); }).catch(function (e) { say(e.message); });
}
function act(label, fn) { var b = el('button', 'sbtn', label); b.type = 'button'; b.addEventListener('click', fn); return b; }
function ago(iso) { var s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' minutes ago'; if (s < 86400) return Math.round(s / 3600) + ' hours ago'; return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
function sums(list) { var by = {}; list.forEach(function (r) { var v = Number(r.value); if (v > 0) { var c = r.currency || 'USD'; by[c] = (by[c] || 0) + v; } }); var k = Object.keys(by); return k.length ? k.map(function (c) { return money(by[c], c); }).join(' + ') : 'None yet'; }
function renderReq() {
  var all = S.items, inStage = function (s) { return all.filter(function (r) { return stageOf(r) === s; }); };
  var open = all.filter(function (r) { return OPEN.indexOf(stageOf(r)) >= 0; }), won = inStage('won'), lost = inStage('lost');
  S.newCount = inStage('new').length || ''; if ($('newCount')) $('newCount').textContent = S.newCount;
  var st = $('reqStats'); st.textContent = '';
  [['Open requests', String(open.length)], ['Quoted, waiting', sums(inStage('quoted'))], ['Won', sums(won)], ['Win rate', won.length + lost.length ? Math.round(won.length / (won.length + lost.length) * 100) + '%' : 'None closed']]
    .forEach(function (x) { var d = el('div', 'stat'); d.appendChild(el('span', 'lbl', x[0])); d.appendChild(el('b', '', x[1])); st.appendChild(d); });
  var f = $('filters'); f.textContent = '';
  [['open', 'Open', open.length], ['all', 'All', all.length]].concat(STAGES.map(function (s) { return [s[0], s[1], inStage(s[0]).length]; })).forEach(function (t) {
    var b = el('button', 'fb' + (S.filter === t[0] ? ' on' : ''), t[1] + ' ' + t[2]); b.type = 'button'; b.setAttribute('aria-pressed', S.filter === t[0]); b.addEventListener('click', function () { S.filter = t[0]; renderReq(); }); f.appendChild(b);
  });
  var list = all.filter(function (r) { var s = stageOf(r); return S.filter === 'all' || (S.filter === 'open' ? OPEN.indexOf(s) >= 0 : s === S.filter); });
  $('reqCount').textContent = list.length + (list.length === 1 ? ' request' : ' requests');
  var box = $('reqList'); box.textContent = '';
  if (!list.length) { box.appendChild(el('p', 'empty', all.length ? 'Nothing in this view.' : 'No requests yet. They appear here when someone finishes the Start a project form.')); return; }
  list.forEach(function (r) {
    var stg = stageOf(r), c = el('article', 'req' + (stg === 'won' || stg === 'lost' ? ' done' : ''));
    var top = el('div', 'top'); top.appendChild(el('h2', '', (r.productName || 'Request') + ' from ' + (r.name || 'unknown')));
    top.appendChild(el('span', 'chip ' + stg, stageName(stg) + (r.value > 0 ? ', ' + money(r.value, r.currency) : '') + ', ' + ago(r.submittedAt))); c.appendChild(top);
    var sum = el('div', 'sum');
    [['Topic', r.topic], ['Description', r.description], ['Link', r.link], ['Needs', (r.needs || []).join(', ')], ['Already has', (r.have || []).join(', ')], ['Files link', r.haveLink], ['Timeline', r.timeline], ['Budget', r.budget], ['Email', r.email], ['Company', r.company]].forEach(function (p) { if (p[1]) { sum.appendChild(el('span', 'lbl', p[0])); sum.appendChild(el('span', 'v', p[1])); } });
    c.appendChild(sum);
    /* pipeline: stage saves at once; value and notes save with the button */
    var pipe = el('div', 'pipe'), d = { value: r.value == null ? '' : String(r.value), currency: r.currency || 'USD', notes: r.notes || '' };
    var sw = el('div', 'f'), ss = el('select', 'fld'); STAGES.forEach(function (s) { var o = el('option', '', s[1]); o.value = s[0]; ss.appendChild(o); }); ss.value = stg;
    ss.id = 'stage-' + r.id; sw.appendChild(el('label', 'lbl', 'Stage')).setAttribute('for', ss.id); sw.appendChild(ss);
    ss.addEventListener('change', function () { saveReq(r, { status: ss.value }, 'Moved to ' + stageName(ss.value) + '.'); });
    var vw = el('div', 'f'), vi = el('input', 'fld'); vi.type = 'number'; vi.min = '0'; vi.step = 'any'; vi.inputMode = 'decimal'; vi.value = d.value; vi.id = 'value-' + r.id; vi.placeholder = 'What you quoted';
    vi.addEventListener('input', function () { d.value = vi.value; }); vw.appendChild(el('label', 'lbl', 'Value')).setAttribute('for', vi.id); vw.appendChild(vi);
    var cw = el('div', 'f'), cs = el('select', 'fld'); CURRENCIES.forEach(function (x) { var o = el('option', '', x); o.value = x; cs.appendChild(o); }); cs.value = d.currency; cs.id = 'cur-' + r.id;
    cs.addEventListener('change', function () { d.currency = cs.value; }); cw.appendChild(el('label', 'lbl', 'Currency')).setAttribute('for', cs.id); cw.appendChild(cs);
    var row = el('div', 'piperow'); row.appendChild(sw); row.appendChild(vw); row.appendChild(cw); pipe.appendChild(row);
    var nw = el('div', 'f'), na = el('textarea', 'fld'); na.value = d.notes; na.id = 'notes-' + r.id; na.placeholder = 'Calls, what they said, next step. Only you see this.';
    na.addEventListener('input', function () { d.notes = na.value; }); nw.appendChild(el('label', 'lbl', 'Private notes')).setAttribute('for', na.id); nw.appendChild(na); pipe.appendChild(nw);
    c.appendChild(pipe);
    var a = el('div', 'acts'), sv = el('button', 'btn sm', 'Save value and notes'); sv.type = 'button';
    sv.addEventListener('click', function () { saveReq(r, { value: d.value, currency: d.currency, notes: d.notes }); }); a.appendChild(sv);
    var reply = el('a', 'back', 'Reply'); reply.href = 'mailto:' + r.email + '?subject=' + encodeURIComponent('Re: ' + (r.productName || 'your project request')); a.appendChild(reply);
    a.appendChild(act(S.confirm === r.id ? 'Sure?' : 'Delete', function () { remove(r); }));
    if (r.updatedAt) a.appendChild(el('span', 'hintp', 'Updated ' + ago(r.updatedAt)));
    c.appendChild(a); box.appendChild(c);
  });
}
/* ---- traffic ---- */
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
  j.series.forEach(function (s, i) {
    var ph = s.pv / max * (H - 8), uh = s.uv / max * (H - 8), x = i * bw + bw * 0.15, w = Math.max(bw * 0.7, 1);
    var a = mk('rect', { class: 'pv', x: x, y: H - ph, width: w, height: ph }), tt = mk('title', {}); tt.textContent = s.d + ': ' + s.uv + ' visitors, ' + s.pv + ' page views'; a.appendChild(tt); svg.appendChild(a);
    svg.appendChild(mk('rect', { class: 'uv', x: x, y: H - uh, width: w, height: uh }));
  });
  $('axL').textContent = j.series[0].d; $('axR').textContent = j.series[n - 1].d + ' (peak ' + max + ' page views a day)';
  var tb = $('tbls'); tb.textContent = '';
  var table = function (title, rows, fmt) {
    var d = el('div', 'tbl'); d.appendChild(el('h3', 'lbl', title));
    if (!rows.length) d.appendChild(el('p', 'empty', 'Nothing yet.')); var m = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1]));
    rows.forEach(function (r) { var row = el('div', 'trow'); row.appendChild(el('span', '', fmt ? fmt(r.k) : r.k)); row.appendChild(el('span', '', String(r.v))); var bar = el('i'); bar.style.width = (r.v / m * 100) + '%'; row.appendChild(bar); d.appendChild(row); });
    tb.appendChild(d);
  };
  table('Top pages', j.paths); table('Where visitors come from', j.refs); table('Countries', j.geo, country); table('Devices', j.dev);
  if (!t.pageviews) say('No visits recorded yet. Add js/track.js to every public page and deploy.');
}

/* ---- generic form used by Wallpapers and Updates ---- */
function form(title, fields, data, onSave, onCancel) {
  var box = el('div', 'ed'); box.appendChild(el('span', 'lbl', title)); var vals = Object.assign({}, data), inputs = {};
  fields.forEach(function (f) {
    if (f.type === 'images') { box.appendChild(imagesField(f, vals)); return; }
    if (f.type === 'media') { box.appendChild(mediaField(f.label, vals, f.key, { video: true, hint: f.hint, isVideo: function () { return vals.mediaType === 'video' || /\.(mp4|webm)(\?|$)/i.test(vals[f.key] || ''); }, onChange: function (v) { if (!v) vals.mediaType = ''; else if (!/^blob:/.test(v)) vals.mediaType = /\.(mp4|webm)(\?|$)/i.test(v) ? 'video' : 'image'; }, onFile: function (file) { vals.mediaType = /^video/.test(file.type) ? 'video' : 'image'; } })); return; }
    var wrap = el(f.type === 'checkbox' ? 'label' : 'div', f.type === 'checkbox' ? 'chk' : 'f'), inp;
    if (f.type === 'select') { inp = el('select', 'fld'); f.options.forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; inp.appendChild(op); }); inp.value = vals[f.key] != null ? vals[f.key] : f.options[0][0]; }
    else if (f.type === 'textarea') { inp = el('textarea', 'fld'); inp.value = vals[f.key] || ''; }
    else { inp = el('input', 'fld'); inp.type = f.type || 'text'; if (f.step) inp.step = f.step; if (f.type === 'checkbox') inp.checked = vals[f.key] !== false; else inp.value = vals[f.key] == null ? '' : vals[f.key]; }
    inp.addEventListener(f.type === 'checkbox' ? 'change' : 'input', function () { vals[f.key] = f.type === 'checkbox' ? inp.checked : inp.value; });
    if (f.type === 'checkbox') { wrap.appendChild(inp); wrap.appendChild(document.createTextNode(f.label)); } else { wrap.appendChild(el('span', 'lbl', f.label)); wrap.appendChild(inp); if (f.hint) wrap.appendChild(el('p', 'hintp', f.hint)); }
    inputs[f.key] = inp; box.appendChild(wrap);
    if (f.type === 'checkbox' && vals[f.key] == null) vals[f.key] = true;
    if (f.type === 'select' && vals[f.key] == null) vals[f.key] = f.options[0][0];
  });
  var row = el('div', 'acts'), save = el('button', 'btn', 'Save'); save.type = 'button'; save.addEventListener('click', function () { onSave(vals); });
  var cancel = el('button', 'sbtn', 'Cancel'); cancel.type = 'button'; cancel.addEventListener('click', onCancel); row.appendChild(save); row.appendChild(cancel); box.appendChild(row); return box;
}
function imagesField(f, vals) {
  var wrap = el('div', 'f'), list = el('div', 'imgs'); wrap.appendChild(el('span', 'lbl', f.label)); if (f.hint) wrap.appendChild(el('p', 'hintp', f.hint));
  vals[f.key] = (vals[f.key] || []).map(function (i) { return Object.assign({}, i); });
  function redraw() {
    list.textContent = '';
    vals[f.key].forEach(function (im, n) {
      var row = el('div', 'imgrow');
      [['preview', 'Preview image address'], ['label', 'Name'], ['res', 'Size']].forEach(function (k) { var i = el('input', 'fld'); i.type = 'text'; i.placeholder = k[1]; i.value = im[k[0]] || ''; i.setAttribute('aria-label', k[1] + ' ' + (n + 1)); i.addEventListener('input', function () { im[k[0]] = i.value; }); row.appendChild(i); });
      var d = el('select', 'fld'); [['desktop', 'Desktop'], ['mobile', 'Mobile']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; d.appendChild(op); }); d.value = im.device || 'desktop'; d.addEventListener('change', function () { im.device = d.value; }); row.appendChild(d);
      var rm = el('button', 'sbtn', 'Remove'); rm.type = 'button'; rm.addEventListener('click', function () { vals[f.key].splice(n, 1); redraw(); }); row.appendChild(rm); list.appendChild(row);
    });
  }
  redraw(); wrap.appendChild(list);
  var add = el('button', 'sbtn', 'Add a wallpaper to the pack'); add.type = 'button'; add.addEventListener('click', function () { vals[f.key].push({ preview: '', device: 'desktop', res: '', label: '' }); redraw(); }); wrap.appendChild(add); return wrap;
}
function money(p, c) { return p > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD', minimumFractionDigits: p % 1 ? 2 : 0 }).format(p) : 'Free'; }
function listRow(thumb, title, meta, actions, dim) {
  var r = el('div', 'lrow' + (dim ? ' dim' : '')), t = el('div', 'lthumb'); if (thumb) { var i = document.createElement('img'); i.src = thumb; i.alt = ''; t.appendChild(i); } r.appendChild(t);
  var d = el('div'); d.appendChild(el('p', 'ln', title)); d.appendChild(el('p', 'lm', meta)); r.appendChild(d); var a = el('div', 'acts'); a.style.marginTop = '0'; actions.forEach(function (x) { a.appendChild(x); }); r.appendChild(a); return r;
}
/* ---- wallpapers ---- */
var WP_FIELDS = [
  { key: 'name', label: 'Pack name' }, { key: 'blurb', label: 'Short description' },
  { key: 'price', label: 'Price for the whole pack (0 means a free pack)', type: 'number', step: '0.01' },
  { key: 'currency', label: 'Currency', type: 'select', options: [['USD', 'USD'], ['NGN', 'NGN'], ['GHS', 'GHS'], ['ZAR', 'ZAR'], ['KES', 'KES']] },
  { key: 'images', type: 'images', label: 'Wallpapers in this pack', hint: 'Small, public preview images. Keep them in images/wallpapers/ and use images/wallpapers/name.jpg, or paste an https address.' },
  { key: 'file', label: 'Pack download file address', hint: 'A zip with every wallpaper. Free pack: a public file. Premium pack: a private address that is never shown on the site and is only sent after payment.' },
  { key: 'sampleFile', label: 'Free sample file address, optional', hint: 'One public wallpaper people can download free from a premium pack.' }, { key: 'sampleLabel', label: 'Free sample name, optional' },
  { key: 'order', label: 'Order number (smaller shows first)', type: 'number' },
  { key: 'visible', label: 'Show on the site', type: 'checkbox' }
];
function loadWp(done) { say('Loading.'); api('/api/wallpapers?all=1').then(function (j) { S.wp = j.items || []; say(typeof done === 'string' ? done : ''); renderWp(); }).catch(function (e) { say(e.message); }); }
function saveWp(v) { api('/api/wallpapers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).then(function () { $('wpForm').textContent = ''; loadWp('Saved.'); }).catch(function (e) { say(e.message); }); }
function openWp(w) { var f = $('wpForm'); f.textContent = ''; f.appendChild(form(w.id ? 'Edit pack' : 'New pack', WP_FIELDS, w, saveWp, function () { f.textContent = ''; })); f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
$('wpAdd').addEventListener('click', function () { openWp({ price: 0, currency: 'USD', images: [{ preview: '', device: 'desktop', res: '', label: '' }], visible: true, order: Date.now() }); });
function renderWp() {
  $('wpCount').textContent = S.wp.length + (S.wp.length === 1 ? ' pack' : ' packs');
  var box = $('wpList'); box.textContent = '';
  if (!S.wp.length) { box.appendChild(el('p', 'empty', 'Nothing saved yet. The site shows the built in packs until you add one here. Add all of them first, because the saved list replaces the built in one.')); return; }
  S.wp.forEach(function (w) {
    var del = el('button', 'sbtn', S.confirm === 'w' + w.id ? 'Sure?' : 'Delete'); del.type = 'button';
    del.addEventListener('click', function () { if (S.confirm !== 'w' + w.id) { S.confirm = 'w' + w.id; renderWp(); return; } S.confirm = ''; api('/api/wallpapers?id=' + encodeURIComponent(w.id), { method: 'DELETE' }).then(function () { loadWp('Deleted.'); }).catch(function (e) { say(e.message); }); });
    var ed = el('button', 'sbtn', 'Edit'); ed.type = 'button'; ed.addEventListener('click', function () { openWp(w); });
    box.appendChild(listRow((w.images && w.images[0] && w.images[0].preview) || '', w.name, money(w.price, w.currency) + ', ' + ((w.images || []).length) + ((w.images || []).length === 1 ? ' wallpaper' : ' wallpapers') + (w.visible === false ? ', hidden' : ''), [ed, del], w.visible === false));
  });
}
/* ---- updates ---- */
var UP_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' }, { key: 'status', label: 'Status', type: 'select', options: [['In progress', 'In progress'], ['Planning', 'Planning'], ['Shipped', 'Shipped']] },
  { key: 'title', label: 'Title' }, { key: 'note', label: 'What is happening', type: 'textarea' },
  { key: 'media', type: 'media', label: 'Snippet, optional', hint: 'A work in progress image, or a short silent MP4 under 4.4 MB. Shown small beside the update; visitors can click to enlarge. Only post work you are allowed to show.' },
  { key: 'mediaAlt', label: 'What the snippet shows, optional' },
  { key: 'visible', label: 'Show on the site', type: 'checkbox' }
];
function loadUp(done) { say('Loading.'); api('/api/updates?all=1').then(function (j) { S.up = j.items || []; say(typeof done === 'string' ? done : ''); renderUp(); }).catch(function (e) { say(e.message); }); }
function saveUp(v) { api('/api/updates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).then(function () { $('upForm').textContent = ''; loadUp('Saved. It shows on the site within a minute.'); }).catch(function (e) { say(e.message); }); }
function openUp(u) { var f = $('upForm'); f.textContent = ''; f.appendChild(form(u.id ? 'Edit update' : 'New update', UP_FIELDS, u, saveUp, function () { f.textContent = ''; })); f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
$('upAdd').addEventListener('click', function () { openUp({ date: new Date().toISOString().slice(0, 10), status: 'In progress', visible: true }); });
function renderUp() {
  $('upCount').textContent = S.up.length + (S.up.length === 1 ? ' update' : ' updates');
  var box = $('upList'); box.textContent = '';
  if (!S.up.length) { box.appendChild(el('p', 'empty', 'Nothing saved yet. The site shows its built in updates until you add one here.')); return; }
  S.up.forEach(function (u) {
    var ed = el('button', 'sbtn', 'Edit'); ed.type = 'button'; ed.addEventListener('click', function () { openUp(u); });
    var del = el('button', 'sbtn', S.confirm === 'u' + u.id ? 'Sure?' : 'Delete'); del.type = 'button';
    del.addEventListener('click', function () { if (S.confirm !== 'u' + u.id) { S.confirm = 'u' + u.id; renderUp(); return; } S.confirm = ''; api('/api/updates?id=' + encodeURIComponent(u.id), { method: 'DELETE' }).then(function () { loadUp('Deleted.'); }).catch(function (e) { say(e.message); }); });
    box.appendChild(listRow(u.media && u.mediaType !== 'video' ? u.media : '', u.title, u.date + ', ' + u.status + (u.media ? (u.mediaType === 'video' ? ', with video' : ', with image') : '') + (u.visible === false ? ', hidden' : '') + (u.note ? '. ' + u.note : ''), [ed, del], u.visible === false));
  });
}
/* ---- sales ---- */
function loadSales() { say('Loading.'); api('/api/sales').then(function (j) { S.sales = j.items || []; say(''); renderSales(); }).catch(function (e) { say(e.message); }); }
function renderSales() {
  var items = S.sales || [], byCur = {}, byPack = {};
  items.forEach(function (s) { byCur[s.currency] = (byCur[s.currency] || 0) + s.amount; var p = byPack[s.name] || (byPack[s.name] = { n: 0, rev: {} }); p.n++; p.rev[s.currency] = (p.rev[s.currency] || 0) + s.amount; });
  var st = $('saleStats'); st.textContent = '';
  var revText = Object.keys(byCur).map(function (c) { return money(byCur[c], c); }).join(' and ') || '0';
  [['Orders', String(items.length)], ['Revenue', revText], ['Average order', items.length && Object.keys(byCur).length === 1 ? money(byCur[Object.keys(byCur)[0]] / items.length, Object.keys(byCur)[0]) : (items.length ? 'Mixed currencies' : '0')]].forEach(function (x) { var d = el('div', 'stat'); d.appendChild(el('span', 'lbl', x[0])); d.appendChild(el('b', '', x[1])); st.appendChild(d); });
  var tb = $('saleTbls'); tb.textContent = ''; var d = el('div', 'tbl'); d.appendChild(el('h3', 'lbl', 'By wallpaper'));
  var names = Object.keys(byPack).sort(function (a, b) { return byPack[b].n - byPack[a].n; }), max = Math.max.apply(null, names.map(function (n) { return byPack[n].n; }).concat([1]));
  if (!names.length) d.appendChild(el('p', 'empty', 'No sales yet.'));
  names.forEach(function (n) { var row = el('div', 'trow'); row.appendChild(el('span', '', n)); row.appendChild(el('span', '', byPack[n].n + ' sold, ' + Object.keys(byPack[n].rev).map(function (c) { return money(byPack[n].rev[c], c); }).join(' and '))); var bar = el('i'); bar.style.width = (byPack[n].n / max * 100) + '%'; row.appendChild(bar); d.appendChild(row); });
  tb.appendChild(d);
  var box = $('saleList'); box.textContent = '';
  items.slice(0, 100).forEach(function (s) { box.appendChild(listRow('', s.name + ', ' + money(s.amount, s.currency), new Date(s.paidAt).toLocaleString() + ', ' + s.email + ', ' + (s.downloads || 0) + ' downloads', [])); });
}

/* ---- uploads: images and videos go to /api/upload (Vercel Blob) and come back as an address ---- */
var UPLOAD_MAX = 4.4 * 1024 * 1024;   /* Vercel's request limit is 4.5 MB */
function shrink(file) {
  /* Images over the limit are resized in the browser (longest side 2560px, then smaller) before upload. */
  if (file.size <= UPLOAD_MAX || !/^image\/(jpeg|png|webp|avif)$/.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
  return createImageBitmap(file).then(function (bmp) {
    var tries = [[2560, 0.9], [2048, 0.86], [1600, 0.82]];
    function attempt(n) {
      var t = tries[n], k = Math.min(1, t[0] / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (ok) { c.toBlob(ok, 'image/webp', t[1]); }).then(function (b) {
        if (!b || b.type !== 'image/webp') return new Promise(function (ok) { c.toBlob(ok, file.type === 'image/png' ? 'image/png' : 'image/jpeg', t[1]); });
        return b;
      }).then(function (b) { if (b.size <= UPLOAD_MAX || n === tries.length - 1) return new File([b], file.name, { type: b.type }); return attempt(n + 1); });
    }
    return attempt(0);
  });
}
function uploadFile(file) {
  return shrink(file).then(function (f) {
    if (f.size > UPLOAD_MAX) throw new Error(/^video/.test(f.type) ? 'This video is over 4.4 MB. Compress it (HandBrake works well) or upload it somewhere else and paste its https address.' : 'This file is over 4.4 MB even after resizing.');
    return fetch('/api/upload', { method: 'POST', body: f, headers: { Authorization: 'Bearer ' + S.token, 'Content-Type': 'application/octet-stream', 'x-file-type': f.type, 'x-file-name': encodeURIComponent(f.name).slice(0, 100) } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.status === 413) throw new Error('The file is too large to upload.'); if (!r.ok || !j.url) throw new Error(j.error || 'Upload failed'); return j.url; }); });
  });
}
/* One image (or video) field: a preview, an Upload button and the address, which can also be pasted. */
function mediaField(label, obj, key, opt) {
  opt = opt || {};
  var wrap = el('div', 'f upl'), prev = el('div', 'uprev'), side = el('div'), inp = el('input', 'fld'), row = el('div', 'acts'), note = el('p', 'hintp');
  wrap.appendChild(el('span', 'lbl', label));
  inp.type = 'text'; inp.placeholder = 'Upload a file, or paste an https address'; inp.value = obj[key] || ''; inp.setAttribute('aria-label', label + ' address');
  var file = el('input'); file.type = 'file'; file.accept = opt.video ? 'image/*,video/mp4,video/webm' : 'image/*'; file.hidden = true;
  var pick = el('button', 'sbtn', obj[key] ? 'Replace' : 'Upload'); pick.type = 'button'; pick.addEventListener('click', function () { file.click(); });
  var clear = el('button', 'sbtn', 'Remove'); clear.type = 'button'; clear.addEventListener('click', function () { set(''); });
  function isVideo(u) { return opt.isVideo ? opt.isVideo() : /\.(mp4|webm)(\?|$)/i.test(u); }
  function draw() {
    prev.textContent = ''; var u = obj[key];
    if (!u) { prev.appendChild(el('span', 'lbl', 'None')); clear.hidden = true; pick.textContent = 'Upload'; return; }
    var m = document.createElement(isVideo(u) ? 'video' : 'img'); m.src = u; if (m.tagName === 'VIDEO') { m.muted = true; m.preload = 'metadata'; } else m.alt = ''; prev.appendChild(m); clear.hidden = false; pick.textContent = 'Replace';
  }
  function set(v) { obj[key] = v; inp.value = v; draw(); if (opt.onChange) opt.onChange(v); }
  inp.addEventListener('change', function () { set(inp.value.trim()); });
  file.addEventListener('change', function () {
    var f = file.files[0]; file.value = ''; if (!f) return;
    note.textContent = 'Uploading ' + f.name + '.'; pick.disabled = true;
    uploadFile(f).then(function (url) { note.textContent = opt.hint || ''; set(url); if (opt.onFile) opt.onFile(f); }).catch(function (e) { note.textContent = e.message; }).then(function () { pick.disabled = false; });
  });
  row.style.marginTop = '8px'; row.appendChild(pick); row.appendChild(clear);
  side.appendChild(inp); side.appendChild(row); side.appendChild(note); note.textContent = opt.hint || '';
  var body = el('div', 'uplb'); body.appendChild(prev); body.appendChild(side); wrap.appendChild(body); wrap.appendChild(file); draw(); return wrap;
}
function textField(label, obj, key, opt) {
  opt = opt || {};
  var wrap = el('div', 'f'), inp = el(opt.area ? 'textarea' : 'input', 'fld'); if (!opt.area) inp.type = 'text';
  inp.value = obj[key] == null ? '' : obj[key]; if (opt.placeholder) inp.placeholder = opt.placeholder;
  inp.addEventListener('input', function () { obj[key] = inp.value; });
  wrap.appendChild(el('span', 'lbl', label)); wrap.appendChild(inp); if (opt.hint) wrap.appendChild(el('p', 'hintp', opt.hint)); return wrap;
}
function checkField(label, obj, key, onChange) {
  var w = el('label', 'chk'), i = el('input'); i.type = 'checkbox'; i.checked = !!obj[key];
  i.addEventListener('change', function () { obj[key] = i.checked; if (onChange) onChange(i.checked); }); w.appendChild(i); w.appendChild(document.createTextNode(label)); return w;
}
function group(title, hint) { var g = el('div', 'edg'); g.appendChild(el('h3', 'lbl', title)); if (hint) g.appendChild(el('p', 'hintp', hint)); return g; }
/* A list of items you can add to, remove from and put in order (case study sections and slides). */
function repeater(list, drawItem, addLabel, blank) {
  var box = el('div', 'rep'), items = el('div', 'repl');
  function redraw() {
    items.textContent = '';
    list.forEach(function (it, n) {
      var card = el('div', 'repi'), head = el('div', 'reph'); head.appendChild(el('span', 'lbl', String(n + 1).padStart(2, '0')));
      var acts = el('div', 'acts'); acts.style.marginTop = '0';
      [['Up', n > 0, function () { list.splice(n - 1, 0, list.splice(n, 1)[0]); redraw(); }], ['Down', n < list.length - 1, function () { list.splice(n + 1, 0, list.splice(n, 1)[0]); redraw(); }], ['Remove', true, function () { list.splice(n, 1); redraw(); }]]
        .forEach(function (a) { if (!a[1]) return; var b = el('button', 'sbtn', a[0]); b.type = 'button'; b.addEventListener('click', a[2]); acts.appendChild(b); });
      head.appendChild(acts); card.appendChild(head); card.appendChild(drawItem(it, redraw)); items.appendChild(card);
    });
    if (!list.length) items.appendChild(el('p', 'hintp', 'None yet.'));
  }
  box.appendChild(items); var add = el('button', 'sbtn', addLabel); add.type = 'button'; add.addEventListener('click', function () { list.push(blank()); redraw(); }); box.appendChild(add);
  redraw(); box.redraw = redraw; return box;
}

/* ---- projects and case studies ---- */
var KINDS = [['viz', 'Product visualization'], ['id', 'Industrial design']];
function kindName(k) { return k === 'id' ? 'Industrial design' : 'Product visualization'; }
function loadProj(done) { say('Loading.'); api('/api/projects?all=1').then(function (j) { S.proj = j.items || []; say(done || ''); renderProj(); }).catch(function (e) { say(e.message); }); }
function builtIn() { return ((window.SITE && SITE.projects) || []).map(function (p) { return JSON.parse(JSON.stringify(p)); }); }
function importProj() {
  say('Copying.'); api('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'import', items: builtIn() }) })
    .then(function () { loadProj('Copied. Edit them here from now on.'); }).catch(function (e) { say(e.message); });
}
function saveOrder() { api('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reorder', ids: S.proj.map(function (p) { return p.id; }) }) }).then(function () { say('Order saved.'); }).catch(function (e) { say(e.message); loadProj(); }); }
function renderProj() {
  var n = S.proj.length, feat = S.proj.filter(function (p) { return p.featured && p.visible !== false; }).length;
  $('projCount').textContent = n + (n === 1 ? ' project' : ' projects') + (n ? ', ' + feat + ' featured' : '');
  var box = $('projList'); box.textContent = '';
  if (!n) {
    var e = el('div', 'empty'), b = builtIn().length;
    e.appendChild(el('p', '', 'The site is showing the ' + b + ' built in projects from js/content.js, including the A.R.C.S case study. Copy them here once, then add, edit, reorder and upload images from this tab.'));
    var go = el('button', 'btn', 'Copy the current projects here'); go.type = 'button'; go.style.marginTop = '20px'; go.addEventListener('click', importProj); e.appendChild(go);
    box.appendChild(e); return;
  }
  if (feat > 5) box.appendChild(el('p', 'hintp', 'Featured work on the home page shows the first five featured projects. ' + (feat - 5) + ' more are marked featured.'));
  S.proj.forEach(function (p, i) {
    var acts = [];
    [['Up', i > 0, -1], ['Down', i < n - 1, 1]].forEach(function (m) { if (!m[1]) return; var b = el('button', 'sbtn', m[0]); b.type = 'button'; b.addEventListener('click', function () { var j = i + m[2]; S.proj.splice(j, 0, S.proj.splice(i, 1)[0]); renderProj(); saveOrder(); }); acts.push(b); });
    var ed = el('button', 'sbtn', 'Edit'); ed.type = 'button'; ed.addEventListener('click', function () { openProj(p); }); acts.push(ed);
    var del = el('button', 'sbtn', S.confirm === 'p' + p.id ? 'Sure?' : 'Delete'); del.type = 'button';
    del.addEventListener('click', function () { if (S.confirm !== 'p' + p.id) { S.confirm = 'p' + p.id; renderProj(); return; } S.confirm = ''; api('/api/projects?id=' + encodeURIComponent(p.id), { method: 'DELETE' }).then(function () { loadProj('Deleted.'); }).catch(function (e) { say(e.message); }); });
    acts.push(del);
    var meta = [kindName(p.kind)]; if (p.featured) meta.push('featured'); if (p.caseStudy) meta.push('case study, ' + ((p.caseStudy.slides || []).length) + ' presentation items'); if (p.visible === false) meta.push('hidden');
    box.appendChild(listRow(p.src, p.name, meta.join(', '), acts, p.visible === false));
  });
}
$('projAdd').addEventListener('click', function () { openProj({ kind: 'viz', visible: true, featured: false, featureFade: true, caseStudy: null }); });
function blankCase() { return { on: true, intro: '', role: '', tools: 'Blender', year: String(new Date().getFullYear()), cover: '', coverAlt: '', sections: [{ label: 'Problem', text: '', image: '', alt: '' }, { label: 'Approach', text: '', image: '', alt: '' }, { label: 'Output', text: '', image: '', alt: '' }], slides: [] }; }
function openProj(src) {
  var p = JSON.parse(JSON.stringify(src)), f = $('projForm'); f.textContent = '';
  var box = el('div', 'ed'); box.appendChild(el('span', 'lbl', p.id ? 'Edit project' : 'New project'));

  var g1 = group('Project'); g1.appendChild(textField('Name', p, 'name'));
  var kw = el('div', 'f'), ks = el('select', 'fld'); KINDS.forEach(function (k) { var o = el('option', '', k[1]); o.value = k[0]; ks.appendChild(o); }); ks.value = p.kind || 'viz'; ks.addEventListener('change', function () { p.kind = ks.value; });
  kw.appendChild(el('span', 'lbl', 'Type')); kw.appendChild(ks); g1.appendChild(kw);
  g1.appendChild(mediaField('Thumbnail', p, 'src', { hint: 'The grey version, shown on the projects page. 4:3 works best, for example 1200 x 900.' })); g1.appendChild(mediaField('Thumbnail, colour version', p, 'srcColor', { hint: 'Optional. Shown on hover. Same size and crop as the grey thumbnail.' }));
  g1.appendChild(textField('Thumbnail description', p, 'alt', { hint: 'For screen readers. Say what the image shows.' }));
  g1.appendChild(textField('Short description', p, 'blurb'));
  g1.appendChild(checkField('Show on the site', p, 'visible')); if (p.visible == null) p.visible = true;
  box.appendChild(g1);

  var g2 = group('Featured work on the home page', 'The home page shows the first five featured projects, in the order of this list.');
  var fwrap = el('div', 'edsub'); function drawFeat() { fwrap.textContent = ''; if (!p.featured) return; fwrap.appendChild(mediaField('Tall image', p, 'feature', { hint: 'The grey version. A tall crop, about 1:3, for example 450 x 1400.' })); fwrap.appendChild(mediaField('Tall image, colour version', p, 'featureColor', { hint: 'Optional. Shown on hover. Same size and crop as the grey tall image.' })); fwrap.appendChild(checkField('Fade the bottom edge', p, 'featureFade')); }
  if (p.featureFade == null) p.featureFade = true;
  g2.appendChild(checkField('Show in Featured work', p, 'featured', drawFeat)); g2.appendChild(fwrap); drawFeat(); box.appendChild(g2);

  var g3 = group('Case study', 'A page for this project with a Story view and a Presentation view. Its address is case-study.html?p=' + (p.id || 'the-project-id') + '.');
  var cwrap = el('div', 'edsub'), lwrap = el('div', 'edsub'), state = { on: !!p.caseStudy }, kept = p.caseStudy || null;
  function drawCase() {
    cwrap.textContent = ''; lwrap.textContent = '';
    if (!state.on) { p.caseStudy = null; lwrap.appendChild(textField('Link, optional', p, 'link', { hint: 'Where the project opens when it has no case study, for example a Behance page. Leave empty for none.' })); return; }
    p.caseStudy = kept = kept || blankCase(); var c = p.caseStudy;
    cwrap.appendChild(textField('Intro', c, 'intro', { area: true, hint: 'One or two sentences under the title.' }));
    var meta = el('div', 'edrow'); meta.appendChild(textField('Role', c, 'role')); meta.appendChild(textField('Tools', c, 'tools', { hint: 'Separate with commas.' })); meta.appendChild(textField('Year', c, 'year')); cwrap.appendChild(meta);
    cwrap.appendChild(mediaField('Cover image', c, 'cover', { hint: 'The large image under the details.' })); cwrap.appendChild(textField('Cover description', c, 'coverAlt'));
    cwrap.appendChild(el('h3', 'lbl subh', 'Story sections'));
    cwrap.appendChild(el('p', 'hintp', 'Each section is a row with a label on the left. Leave a blank line in the text to start a new paragraph.'));
    cwrap.appendChild(repeater(c.sections, function (s) {
      var d = el('div', 'repb'); d.appendChild(textField('Label', s, 'label', { placeholder: 'Problem, Approach, Technical detail' })); d.appendChild(textField('Text', s, 'text', { area: true }));
      d.appendChild(mediaField('Image, optional', s, 'image')); d.appendChild(textField('Image description', s, 'alt')); return d;
    }, 'Add a section', function () { return { label: '', text: '', image: '', alt: '' }; }));
    cwrap.appendChild(el('h3', 'lbl subh', 'Presentation'));
    cwrap.appendChild(el('p', 'hintp', 'A tall column of images and videos, shown in this order (left to right, then down). Videos must be MP4 or WebM under 4.4 MB, or paste an https address. Captions only show if presCaptions is turned on in js/case.js.'));
    var slides = repeater(c.slides, function (s, redraw) {
      var d = el('div', 'repb'), tw = el('div', 'f'), ts = el('select', 'fld');
      [['image', 'Image'], ['video', 'Video']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; ts.appendChild(op); }); ts.value = s.type || 'image';
      ts.addEventListener('change', function () { s.type = ts.value; redraw(); }); tw.appendChild(el('span', 'lbl', 'Type')); tw.appendChild(ts); d.appendChild(tw);
      d.appendChild(mediaField(s.type === 'video' ? 'Video' : 'Image', s, 'src', { video: true, isVideo: function () { return s.type === 'video'; }, onFile: function (file) { var v = /^video/.test(file.type) ? 'video' : 'image'; if (v !== s.type) { s.type = v; redraw(); } } }));
      d.appendChild(textField('Description', s, 'alt')); d.appendChild(textField('Caption', s, 'caption')); return d;
    }, 'Add an image or video', function () { return { type: 'image', src: '', alt: '', caption: '' }; });
    slides.classList.add('rep2'); cwrap.appendChild(slides);
    var many = el('input'); many.type = 'file'; many.multiple = true; many.accept = 'image/*,video/mp4,video/webm'; many.hidden = true;
    var manyBtn = el('button', 'sbtn', 'Upload several at once'), manyNote = el('p', 'hintp'); manyBtn.type = 'button'; manyBtn.addEventListener('click', function () { many.click(); });
    many.addEventListener('change', function () {
      var files = Array.prototype.slice.call(many.files); many.value = ''; if (!files.length) return; var done = 0, failed = [];
      manyNote.textContent = 'Uploading 0 of ' + files.length + '.'; manyBtn.disabled = true;
      files.reduce(function (chain, file) {
        return chain.then(function () { return uploadFile(file).then(function (url) { c.slides.push({ type: /^video/.test(file.type) ? 'video' : 'image', src: url, alt: '', caption: '' }); slides.redraw(); }).catch(function (e) { failed.push(file.name + ': ' + e.message); }).then(function () { done++; manyNote.textContent = 'Uploading ' + done + ' of ' + files.length + '.'; }); });
      }, Promise.resolve()).then(function () { manyBtn.disabled = false; manyNote.textContent = failed.length ? 'Not uploaded: ' + failed.join(' ') : 'Added ' + files.length + '. Add descriptions, then save.'; });
    });
    var mrow = el('div', 'acts'); mrow.appendChild(manyBtn); cwrap.appendChild(mrow); cwrap.appendChild(manyNote); cwrap.appendChild(many);
  }
  g3.appendChild(checkField('This project has a case study', state, 'on', drawCase)); g3.appendChild(cwrap); g3.appendChild(lwrap); drawCase(); box.appendChild(g3);

  var row = el('div', 'acts'), save = el('button', 'btn', 'Save project'), cancel = el('button', 'sbtn', 'Cancel'); save.type = cancel.type = 'button';
  save.addEventListener('click', function () {
    if (!String(p.name || '').trim()) { say('Give the project a name.'); return; } if (!p.src) { say('Add a thumbnail.'); return; }
    if (p.featured && !p.feature) { say('Add a tall image for Featured work, or untick Show in Featured work.'); return; }
    save.disabled = true; say('Saving.');
    api('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      .then(function () { f.textContent = ''; loadProj('Saved. It shows on the site within a minute.'); }).catch(function (e) { say(e.message); save.disabled = false; });
  });
  cancel.addEventListener('click', function () { f.textContent = ''; say(''); });
  row.appendChild(save); row.appendChild(cancel); box.appendChild(row);
  f.appendChild(box); f.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---- home page: hero images, About, skills, How I work, Book a call ---- */
function builtInHome() {
  var B = window.SITE || {};
  return JSON.parse(JSON.stringify({ hero: B.hero || { viz: [], id: [] }, about: B.about || '', portrait: B.portrait || { src: '', alt: '' }, skills: B.skills || { viz: [], id: [] }, process: B.process || [], calendly: (B.contact && B.contact.calendly) || '' }));
}
function loadHomeTab(done) {
  say('Loading.');
  api('/api/site?fresh=1').then(function (j) {
    say(typeof done === 'string' ? done : ''); var saved = j.home;
    $('homeNote').textContent = saved ? 'Last saved ' + (saved.savedAt ? ago(saved.savedAt) : '') : 'Not saved yet. This is the built in content from js/content.js. Saving publishes your copy.';
    openHome(Object.assign(builtInHome(), saved || {}));
  }).catch(function (e) { say(e.message); });
}
function numField(label, obj, key, hint) {
  var w = el('div', 'f'), i = el('input', 'fld'); i.type = 'number'; i.step = '1'; i.value = obj[key] == null ? '' : obj[key];
  i.addEventListener('input', function () { obj[key] = i.value === '' ? null : Number(i.value); }); w.appendChild(el('span', 'lbl', label)); w.appendChild(i); if (hint) w.appendChild(el('p', 'hintp', hint)); return w;
}
function openHome(h) {
  var f = $('homeForm'); f.textContent = ''; var box = el('div', 'ed wide');
  h.hero = h.hero || {}; h.hero.viz = h.hero.viz || []; h.hero.id = h.hero.id || [];
  [['viz', 'Hero, product visualization side', 'The left side of the divider. The images take turns, one every 20 seconds.'], ['id', 'Hero, industrial design side', 'The right side of the divider.']].forEach(function (side) {
    var g = group(side[1], side[2] + ' Position and size are percentages of the hero area: left 0, top 0, width 100 fills it. Use transparent PNGs, about 1600 x 900.');
    g.appendChild(repeater(h.hero[side[0]], function (im) {
      var d = el('div', 'repb'); d.appendChild(mediaField('Image', im, 'src')); d.appendChild(textField('Description', im, 'alt'));
      d.appendChild(textField('Caption', im, 'caption', { hint: 'Shown under Featured work in the hero while this image is up.' }));
      var r = el('div', 'edrow'); r.appendChild(numField('Left %', im, 'x')); r.appendChild(numField('Top %', im, 'y')); r.appendChild(numField('Width %', im, 'w')); d.appendChild(r); return d;
    }, 'Add an image', function () { return { src: '', alt: '', caption: '', x: 0, y: 0, w: 100 }; }));
    box.appendChild(g);
  });

  var ga = group('About'); ga.appendChild(textField('About text', h, 'about', { area: true }));
  h.portrait = h.portrait || { src: '', alt: '' };
  ga.appendChild(mediaField('Portrait', h.portrait, 'src', { hint: 'A tall photo works best, about 4:5.' })); ga.appendChild(textField('Portrait description', h.portrait, 'alt'));
  box.appendChild(ga);

  var gs = group('Skills and tools', 'One per line.'), sk = { viz: (h.skills && h.skills.viz || []).join('\n'), id: (h.skills && h.skills.id || []).join('\n') };
  var r2 = el('div', 'edrow two'); r2.appendChild(textField('Product visualization', sk, 'viz', { area: true })); r2.appendChild(textField('Industrial design', sk, 'id', { area: true })); gs.appendChild(r2); box.appendChild(gs);

  var gp = group('How I work', 'The steps in order. Four fit on one row.'); h.process = h.process || [];
  gp.appendChild(repeater(h.process, function (p) { var d = el('div', 'repb'); d.appendChild(textField('Step name', p, 'title')); d.appendChild(textField('What happens', p, 'text', { area: true })); return d; }, 'Add a step', function () { return { title: '', text: '' }; }));
  box.appendChild(gp);

  var gc = group('Contact'); gc.appendChild(textField('Book a call link', h, 'calendly', { hint: 'Your Calendly (or similar) link for the Book a call button.' })); box.appendChild(gc);

  var row = el('div', 'acts'), save = el('button', 'btn', 'Save home page'), reset = el('button', 'sbtn', 'Undo unsaved changes'); save.type = reset.type = 'button';
  save.addEventListener('click', function () {
    var out = JSON.parse(JSON.stringify(h)); delete out.savedAt;
    out.skills = { viz: sk.viz.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), id: sk.id.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) };
    ['viz', 'id'].forEach(function (k) { out.hero[k] = out.hero[k].filter(function (im) { return im.src; }); });
    if (!out.hero.viz.length && !out.hero.id.length) { say('Add at least one hero image.'); return; }
    save.disabled = true; say('Saving.');
    api('/api/site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out) })
      .then(function () { loadHomeTab('Saved. The home page updates within a minute.'); }).catch(function (e) { say(e.message); save.disabled = false; });
  });
  reset.addEventListener('click', function () { loadHomeTab(); });
  box.querySelectorAll('.rep').forEach(function (r) { r.classList.add('rep2'); });
  row.appendChild(save); row.appendChild(reset); box.appendChild(row); f.appendChild(box);
}
