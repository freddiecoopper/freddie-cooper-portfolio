/* /api/requests   (dashboard only, needs the Bearer token)
   GET     list the saved project requests, newest first
   POST    {"id", "status"?, "value"?, "currency"?, "notes"?}  move a request through the pipeline:
           status new | talking | quoted | won | lost (older read and done are still accepted),
           value is what you quoted or won, notes are private and never shown to the client
   DELETE  ?id=...  remove a request                                                              */
const { pipeline, kv, authed, body, cut } = require('./_lib');
const STAGES = ['new', 'talking', 'quoted', 'won', 'lost', 'read', 'done'];
const CURRENCIES = ['USD', 'NGN', 'GBP', 'EUR', 'GHS', 'ZAR', 'KES'];

module.exports = async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const ids = await kv(['ZREVRANGE', 'requests', 0, 199]);
      if (!ids || !ids.length) return res.status(200).json({ ok: true, items: [] });
      const rows = await kv(['MGET'].concat(ids.map((i) => 'req:' + i)));
      const items = (rows || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
      return res.status(200).json({ ok: true, items: items });
    }
    if (req.method === 'POST') {
      const b = body(req), id = String(b.id || '');
      if (!/^[a-z0-9]+$/i.test(id)) return res.status(400).json({ ok: false, error: 'Bad request' });
      if (b.status != null && STAGES.indexOf(String(b.status)) < 0) return res.status(400).json({ ok: false, error: 'Unknown stage' });
      if (b.value != null && b.value !== '' && !(Number(b.value) >= 0 && Number(b.value) < 1e10)) return res.status(400).json({ ok: false, error: 'Enter the value as a number' });
      if (b.currency != null && CURRENCIES.indexOf(String(b.currency)) < 0) return res.status(400).json({ ok: false, error: 'Unknown currency' });
      const cur = await kv(['GET', 'req:' + id]); if (!cur) return res.status(404).json({ ok: false, error: 'Not found' });
      const r = JSON.parse(cur), now = new Date().toISOString();
      if (b.status != null && b.status !== r.status) { r.status = String(b.status); r.stageAt = now; if (r.status === 'won' || r.status === 'lost') r.closedAt = now; }
      if (b.value != null) r.value = b.value === '' ? null : Number(b.value);
      if (b.currency != null) r.currency = String(b.currency);
      if (b.notes != null) r.notes = cut(b.notes, 4000);
      r.updatedAt = now; await kv(['SET', 'req:' + id, JSON.stringify(r)]);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || ''); if (!/^[a-z0-9]+$/i.test(id)) return res.status(400).json({ ok: false, error: 'Bad request' });
      await pipeline([['DEL', 'req:' + id], ['ZREM', 'requests', id]]);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE'); return res.status(405).end();
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
