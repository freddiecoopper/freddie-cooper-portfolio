/* Dashboard-only request inbox API. GET lists, POST updates status, DELETE removes. */
const { pipeline, kv, authed, body } = require('./_lib');

module.exports = async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const ids = await kv(['ZREVRANGE', 'requests', 0, 199]);
      if (!ids || !ids.length) return res.status(200).json({ ok: true, items: [] });
      const rows = await kv(['MGET'].concat(ids.map((i) => 'req:' + i)));
      const items = (rows || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
      return res.status(200).json({ ok: true, items });
    }
    if (req.method === 'POST') {
      const b = body(req), id = String(b.id || ''), status = String(b.status || '');
      if (!/^[a-z0-9]+$/i.test(id) || ['new', 'read', 'done'].indexOf(status) < 0) return res.status(400).json({ ok: false, error: 'Bad request' });
      const cur = await kv(['GET', 'req:' + id]); if (!cur) return res.status(404).json({ ok: false, error: 'Not found' });
      const r = JSON.parse(cur); r.status = status; await kv(['SET', 'req:' + id, JSON.stringify(r)]);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || '');
      if (!/^[a-z0-9]+$/i.test(id)) return res.status(400).json({ ok: false, error: 'Bad request' });
      await pipeline([['DEL', 'req:' + id], ['ZREM', 'requests', id]]);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE'); return res.status(405).end();
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
