/* /api/wallpapers   wallpaper PACKS. A pack has several wallpaper images, one price and one download file.
   GET            public list of visible packs. A premium pack's file address is never included.
   GET ?all=1     (token) every pack with its file address, for the dashboard
   POST           (token) create or update   DELETE ?id=   (token) remove                               */
const { pipeline, kv, authed, body, cut, slug } = require('./_lib');
const URL_OK = (v) => /^(https:\/\/|\/|images\/)/.test(v);
async function all() {
  const ids = await kv(['ZRANGE', 'wallpapers', 0, -1]); if (!ids || !ids.length) return [];
  return ((await kv(['MGET'].concat(ids.map((i) => 'wp:' + i)))) || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
}
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const admin = req.query && req.query.all && authed(req);
      let items = await all();
      if (!admin) items = items.filter((w) => w.visible !== false).map((w) => Object.assign({}, w, { file: w.price > 0 ? '' : w.file }));
      res.setHeader('Cache-Control', admin ? 'no-store' : 's-maxage=30, stale-while-revalidate=120');
      return res.status(200).json({ ok: true, items: items });
    }
    if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (req.method === 'POST') {
      const b = body(req), price = Number(b.price);
      const images = (Array.isArray(b.images) ? b.images : []).slice(0, 40).map((i) => ({ preview: String((i && i.preview) || ''), device: i && i.device === 'mobile' ? 'mobile' : 'desktop', res: cut(i && i.res, 40), label: cut(i && i.label, 100) }));
      if (!cut(b.name, 120) || !(price >= 0 && price <= 1000) || ['USD', 'NGN', 'GHS', 'ZAR', 'KES'].indexOf(b.currency) < 0) return res.status(400).json({ ok: false, error: 'Check the name, price and currency' });
      if (!images.length || images.some((i) => !URL_OK(i.preview))) return res.status(400).json({ ok: false, error: 'A pack needs at least one wallpaper, and each preview needs an address' });
      if (price === 0 && !URL_OK(String(b.file || ''))) return res.status(400).json({ ok: false, error: 'A free pack needs a download file address' });
      if (b.sampleFile && !URL_OK(String(b.sampleFile))) return res.status(400).json({ ok: false, error: 'Check the free sample address' });
      const id = /^[a-z0-9-]+$/i.test(String(b.id || '')) ? String(b.id) : slug(b.name);
      const w = { id: id, name: cut(b.name, 120), blurb: cut(b.blurb, 400), price: price, currency: b.currency, images: images, file: cut(b.file, 600), sampleFile: cut(b.sampleFile, 600), sampleLabel: cut(b.sampleLabel, 100), visible: b.visible !== false };
      await pipeline([['SET', 'wp:' + id, JSON.stringify(w)], ['ZADD', 'wallpapers', Number(b.order) || Date.now(), id]]);
      return res.status(200).json({ ok: true, id: id });
    }
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || ''); if (!/^[a-z0-9-]+$/i.test(id)) return res.status(400).json({ ok: false, error: 'Bad request' });
      await pipeline([['DEL', 'wp:' + id], ['ZREM', 'wallpapers', id]]); return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE'); return res.status(405).end();
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
