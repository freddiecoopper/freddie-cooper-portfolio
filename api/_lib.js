/* Shared helpers for Vercel API functions. */
const KV_URL = (process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';

async function pipeline(cmds) {
  if (!KV_URL || !KV_TOKEN) throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN are not set');
  const r = await fetch(KV_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('store failed: ' + r.status);
  return (await r.json()).map((x) => x.result);
}
async function kv(cmd) { return (await pipeline([cmd]))[0]; }
function authed(req) {
  const token = process.env.DASHBOARD_TOKEN || '';
  const given = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || given.length !== token.length) return false;
  let diff = 0; for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}
function body(req) { let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } } return b || {}; }
module.exports = { pipeline, kv, authed, body };
