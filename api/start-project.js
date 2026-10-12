/* Vercel serverless endpoint: sends the project request and saves it to the dashboard inbox. */
const { pipeline } = require('./_lib');
const TO = process.env.TO_EMAIL || 'favour02fred@gmail.com';
const FROM = process.env.FROM_EMAIL || 'Freddie Cooper Site <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const cut = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const list = (v) => Array.isArray(v) ? v.slice(0, 20).map((x) => cut(x, 80)) : [];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function clean(b) {
  return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), submittedAt: new Date().toISOString(), topic: cut(b.topic, 120), productName: cut(b.productName, 160), description: cut(b.description, 800), link: cut(b.link, 300), needs: list(b.needs), have: list(b.have), haveLink: cut(b.haveLink, 300), timeline: cut(b.timeline, 60), budget: cut(b.budget, 60), name: cut(b.name, 120), email: cut(b.email, 200), company: cut(b.company, 160) };
}
function lines(r) { return [['Topic', r.topic], ['Product', r.productName], ['Description', r.description], ['Link', r.link], ['Needs', r.needs.join(', ')], ['Already has', r.have.join(', ')], ['Files link', r.haveLink], ['Timeline', r.timeline], ['Budget', r.budget], ['Name', r.name], ['Email', r.email], ['Company', r.company]].filter((x) => x[1]); }
async function sendEmail(r) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const rows = lines(r), response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [TO], reply_to: r.email, subject: 'New project request: ' + (r.productName || r.name), text: rows.map((x) => x[0] + ': ' + x[1]).join('\n'), html: '<table cellpadding="6">' + rows.map((x) => '<tr><td><b>' + esc(x[0]) + '</b></td><td>' + esc(x[1]) + '</td></tr>').join('') + '</table>' }) });
  if (!response.ok) throw new Error('email failed: ' + response.status);
}
async function saveRecord(r) { await pipeline([['SET', 'req:' + r.id, JSON.stringify(Object.assign({ status: 'new' }, r))], ['ZADD', 'requests', Date.now(), r.id]]); }
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'POST only' }); }
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } } b = b || {};
  if (b.website) return res.status(200).json({ ok: true });
  const r = clean(b);
  if (!r.topic || !r.productName || !r.description || !r.name || !EMAIL_RE.test(r.email)) return res.status(400).json({ ok: false, error: 'Missing or invalid fields' });
  const out = await Promise.allSettled([sendEmail(r), saveRecord(r)]);
  out.forEach((o, i) => { if (o.status === 'rejected') console.error(['email', 'save'][i], o.reason && o.reason.message); });
  if (out.every((o) => o.status === 'rejected')) return res.status(502).json({ ok: false, error: 'Could not deliver' });
  return res.status(200).json({ ok: true });
};
