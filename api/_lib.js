/* Shared helpers for the API functions. Files starting with an underscore are not exposed as routes on Vercel.
   Storage is Upstash Redis (or Vercel KV), reached over its REST API, so no packages are needed. */
const KV_URL = (process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';

async function pipeline(cmds) {
  if (!KV_URL || !KV_TOKEN) throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN are not set');
  const r = await fetch(KV_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('store failed: ' + r.status);
  return (await r.json()).map((x) => x.result);
}
async function kv(cmd) { return (await pipeline([cmd]))[0]; }

/* Dashboard endpoints need the Bearer token set in DASHBOARD_TOKEN. */
function authed(req) {
  const token = process.env.DASHBOARD_TOKEN || '';
  const given = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || given.length !== token.length) return false;
  let diff = 0; for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}
function body(req) {
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b || {};
}
const crypto = require('crypto');
const hmac = (secret, msg, alg) => crypto.createHmac(alg || 'sha256', secret).update(msg).digest('hex');
const site = () => (process.env.SITE_URL || '').replace(/\/$/, '');
const cut = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const slug = (s) => (cut(s, 60).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item') + '-' + Date.now().toString(36);
async function readRaw(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  return await new Promise((ok, no) => { let d = ''; req.on('data', (c) => { d += c; }); req.on('end', () => ok(d)); req.on('error', no); });
}
/* Sends an email through Resend. Needs RESEND_API_KEY. */
async function mail(o) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.FROM_EMAIL || 'Freddie Cooper Site <onboarding@resend.dev>', to: [o.to], reply_to: o.reply_to, subject: o.subject, text: o.text }) });
  if (!r.ok) throw new Error('email failed: ' + r.status);
}
module.exports = { pipeline, kv, authed, body, hmac, site, cut, slug, readRaw, mail };
