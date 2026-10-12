/* ===== Start a project: six step request form =====================================
  Posts answers to the Vercel endpoint in api/start-project.js. If delivery and
  storage are unavailable, the visitor can still send a prefilled email draft. */
var ENDPOINT = '/api/start-project';
var RECIPIENT = 'favour02fred@gmail.com';

var TOPICS = ['Product visualization', 'Product animation and simulation', 'Industrial design and mechanical modeling', 'Custom Blender tools', 'Consultation'];
var NEEDS = ['Still renders', 'Product video', '360 spin', 'Physics simulation', 'Technical drawings', 'Source files', 'Not sure yet'];
var HAVE = ['CAD files', 'Photos', 'Brand guidelines', 'Reference images', 'Nothing yet'];
var TIMES = ['Under 2 weeks', '2 to 4 weeks', '1 to 2 months', 'Flexible'];
var BUDGETS = ['Under $1,000', '$1,000 to $3,000', '$3,000 to $7,500', '$7,500 to $15,000', 'Above $15,000', 'Not sure'];
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, LINK_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
var linkOk = function (v) { return !v.trim() || LINK_RE.test(v.trim()); };
var $ = function (id) { return document.getElementById(id); };
var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

var S = { step: 0, dir: 1, sending: false, sendState: '', touched: {}, a: { topic: '', productName: '', description: '', link: '', needs: [], have: [], haveLink: '', timeline: '', budget: '', name: '', email: '', company: '' } };
/* Arriving from the home page slider: product visualization (right end) or industrial design (left end). */
(function () {
  var mode = ''; try { mode = sessionStorage.getItem('fc-mode') || ''; } catch (e) {}
  var q = new URLSearchParams(window.location.search).get('mode'); if (q) mode = q;
  if (mode === 'viz') S.a.topic = TOPICS[0]; else if (mode === 'id') S.a.topic = TOPICS[2];
})();

function valid(step) {
  var A = S.a;
  if (step === 0) return !!A.topic;
  if (step === 1) return !!A.productName.trim() && !!A.description.trim() && linkOk(A.link);
  if (step === 2) return A.needs.length > 0;
  if (step === 3) return A.have.length > 0 && linkOk(A.haveLink);
  if (step === 4) return !!A.timeline && !!A.budget;
  if (step === 5) return !!A.name.trim() && EMAIL_RE.test(A.email.trim());
  return false;
}
function opts(kind, name, list, sel) {
  return '<div class="opts" role="' + (kind === 'radio' ? 'radiogroup' : 'group') + '">' + list.map(function (l) {
    var on = kind === 'radio' ? sel === l : sel.indexOf(l) >= 0;
    return '<label class="opt' + (on ? ' on' : '') + '"><input type="' + kind + '" name="' + name + '" value="' + esc(l) + '"' + (on ? ' checked' : '') + '><i></i><span>' + esc(l) + '</span></label>';
  }).join('') + '</div>';
}
function field(label, id, key, type, ph, extra) {
  return '<div class="f"><label class="lbl" for="' + id + '">' + label + '</label><input class="in2" id="' + id + '" data-k="' + key + '" type="' + type + '" autocomplete="off" value="' + esc(S.a[key]) + '" placeholder="' + esc(ph) + '"' + (extra || '') + '><p class="err" data-err="' + key + '"></p></div>';
}
function stepHTML() {
  var s = S.step, A = S.a, cls = 'sp ' + (S.dir === -1 ? 'rev' : 'fwd');
  var head = function (q, h) { return '<h2 class="q">' + q + '</h2><p class="hint">' + h + '</p>'; };
  if (s === 0) return '<div class="' + cls + '">' + head('What would you like to start a conversation about?', 'Pick the closest fit. We can sort out the details later.') + opts('radio', 'topic', TOPICS, A.topic) + '</div>';
  if (s === 1) return '<div class="' + cls + '">' + head('What are you making?', 'The product name and a short description are enough to start.') + '<div class="fgrid">' + field('Product name', 'fProduct', 'productName', 'text', 'What is it called?') + field('Short description', 'fDesc', 'description', 'text', 'What does it do, and who is it for?') + field('Link, if one exists', 'fLink', 'link', 'text', 'Website, store page or listing', ' inputmode="url"') + '</div></div>';
  if (s === 2) return '<div class="' + cls + '">' + head('What do you need from me?', 'Choose all that apply.') + opts('checkbox', 'needs', NEEDS, A.needs) + '</div>';
  if (s === 3) return '<div class="' + cls + '">' + head('What do you already have?', 'Choose all that apply.') + opts('checkbox', 'have', HAVE, A.have) + '<div class="more">' + field('Link to files, optional', 'fFiles', 'haveLink', 'text', 'A shared folder on Drive, Dropbox or WeTransfer', ' inputmode="url"') + '</div></div>';
  if (s === 4) return '<div class="' + cls + '">' + head('Timeline and budget.', 'A rough range is fine. Budget is in US dollars.') + '<div class="grp"><span class="lbl">Timeline</span>' + opts('radio', 'timeline', TIMES, A.timeline) + '</div><div class="grp"><span class="lbl">Budget range</span>' + opts('radio', 'budget', BUDGETS, A.budget) + '</div></div>';
  if (s === 5) return '<div class="' + cls + '">' + head('Where should I reply?', 'I only use these details to answer your request.') + '<div class="fgrid">' + field('Name', 'fName', 'name', 'text', 'Your name') + field('Email', 'fEmail', 'email', 'email', 'you@company.com', ' inputmode="email"') + field('Company, optional', 'fCompany', 'company', 'text', 'Where you work, if it applies') + '</div></div>';
  var rows = summaryRows(), failed = S.sendState === 'failed', first = A.name.trim().split(/\s+/)[0] || '';
  return '<div class="' + cls + '"><h2 class="q">' + (failed ? 'One more step.' : esc('Thank you' + (first ? ', ' + first : '') + '.')) + '</h2><p class="status">' + (failed ? 'Your request did not send automatically. Press the button below and your email app opens with all your answers filled in.' : 'I have your request. I read every one myself.') + '</p>' +
    (failed ? '<div class="acts" style="margin:0 0 48px"><a class="btn" href="' + esc(mailto(rows)) + '">Send by email</a></div>' : '') +
    '<div class="sum">' + rows.map(function (r) { return '<span class="lbl">' + esc(r[0]) + '</span><span class="v">' + esc(r[1]) + '</span>'; }).join('') + '</div>' +
    '<h3 class="lbl" style="margin:64px 0 0">What happens next</h3><div class="nx"><div class="nxi"><b>01</b><p>I read your answers and open any link you shared.</p></div><div class="nxi"><b>02</b><p>I reply by email with questions, a rough scope, or a clear no if it is not a fit.</p></div><div class="nxi"><b>03</b><p>If it looks right, we book a short call to settle scope, timeline and budget.</p></div></div><div class="acts"><a class="back" href="index.html">Back to home</a></div></div>';
}
function summaryRows() {
  var A = S.a; return [['Topic', A.topic], ['Project', [A.productName.trim(), A.description.trim()].filter(Boolean).join(': ')], ['Link', A.link.trim()], ['Needs', A.needs.join(', ')], ['Already have', A.have.join(', ')], ['Files link', A.haveLink.trim()], ['Timeline', A.timeline], ['Budget', A.budget], ['Reply to', [A.name.trim(), A.email.trim(), A.company.trim()].filter(Boolean).join(', ')]].filter(function (r) { return r[1]; });
}
function mailto(rows) {
  var body = ['New project request', ''].concat(rows.map(function (r) { return r[0] + ': ' + r[1]; })).join('\n');
  return 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent('Project request from ' + (S.a.name.trim() || 'the site')) + '&body=' + encodeURIComponent(body);
}
function messages() {
  var A = S.a, T = S.touched, em = A.email.trim(), m = {};
  m.productName = T.productName && !A.productName.trim() ? 'Enter the product name.' : '';
  m.description = T.description && !A.description.trim() ? 'Add a short description.' : '';
  m.link = A.link.trim() && !linkOk(A.link) ? 'That link does not look right. Include the full address.' : '';
  m.haveLink = A.haveLink.trim() && !linkOk(A.haveLink) ? 'That link does not look right. Include the full address.' : '';
  m.name = T.name && !A.name.trim() ? 'Enter your name.' : '';
  m.email = T.email ? (!em ? 'Enter your email address.' : (EMAIL_RE.test(em) ? '' : 'That email address does not look right.')) : '';
  return m;
}
function refresh() {
  var s = Math.min(S.step + 1, 6);
  $('counter').textContent = s + '/6'; $('fill').style.width = (s / 6 * 100) + '%'; $('bar').setAttribute('aria-valuenow', s);
  var m = messages(); document.querySelectorAll('[data-err]').forEach(function (n) { n.textContent = m[n.getAttribute('data-err')] || ''; });
  $('ctl').style.display = S.step <= 5 ? 'flex' : 'none';
  $('bBack').disabled = S.step === 0 || S.sending;
  $('bNext').disabled = !valid(S.step) || S.sending;
  $('bNext').textContent = S.step === 5 ? (S.sending ? 'SENDING' : 'SEND REQUEST') : 'NEXT';
}
function render(focusSel) {
  $('stage').innerHTML = stepHTML(); refresh();
  if (focusSel) { var n = $('stage').querySelector(focusSel); if (n) n.focus(); }
}
function go(d) { S.dir = d > 0 ? 1 : -1; S.step = Math.max(0, Math.min(5, S.step + d)); render(); }
function next() { if (S.step > 5 || S.sending || !valid(S.step)) return; if (S.step < 5) go(1); else submit(); }
function toggleIn(key, value, none) {
  var cur = S.a[key], has = cur.indexOf(value) >= 0;
  S.a[key] = has ? cur.filter(function (x) { return x !== value; }) : (value === none ? [value] : cur.filter(function (x) { return x !== none; }).concat(value));
}
$('stage').addEventListener('change', function (e) {
  var t = e.target; if (t.tagName !== 'INPUT' || (t.type !== 'radio' && t.type !== 'checkbox')) return;
  if (t.name === 'needs') toggleIn('needs', t.value, 'Not sure yet'); else if (t.name === 'have') toggleIn('have', t.value, 'Nothing yet'); else S.a[t.name] = t.value;
  render('input[name="' + t.name + '"][value="' + t.value.replace(/"/g, '\\"') + '"]');
});
$('stage').addEventListener('input', function (e) { var k = e.target.getAttribute('data-k'); if (k) { S.a[k] = e.target.value; refresh(); } });
$('stage').addEventListener('focusout', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (k) { S.touched[k] = true; refresh(); } });
$('bBack').addEventListener('click', function () { go(-1); });
$('bNext').addEventListener('click', next);
window.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' || e.isComposing) return;
  var tag = (e.target && e.target.tagName) || ''; if (tag === 'BUTTON' || tag === 'A' || tag === 'TEXTAREA') return;
  if (S.step <= 5 && valid(S.step)) { e.preventDefault(); next(); }
});
function payload() {
  var A = S.a; return { to: RECIPIENT, source: 'start-a-project', topic: A.topic, productName: A.productName.trim(), description: A.description.trim(), link: A.link.trim(), needs: A.needs, have: A.have, haveLink: A.haveLink.trim(), timeline: A.timeline, budget: A.budget, name: A.name.trim(), email: A.email.trim(), company: A.company.trim(), submittedAt: new Date().toISOString() };
}
function submit() {
  S.sending = true; refresh();
  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null, timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 10000) : null;
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()), signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) { return !!r && r.ok; }, function () { return false; })
    .then(function (ok) { if (timer) clearTimeout(timer); S.sending = false; S.sendState = ok ? 'sent' : 'failed'; S.step = 6; S.dir = 1; render(); });
}
render();
