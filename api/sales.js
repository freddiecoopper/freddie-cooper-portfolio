/* GET /api/sales   (token) the recorded wallpaper sales, newest first.   */
const { kv, authed } = require('./_lib');
module.exports = async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  try {
    const refs = await kv(['ZREVRANGE', 'sales', 0, 499]);
    const items = refs && refs.length ? ((await kv(['MGET'].concat(refs.map((r) => 'sale:' + r)))) || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean) : [];
    res.setHeader('Cache-Control', 'no-store'); return res.status(200).json({ ok: true, items: items });
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
