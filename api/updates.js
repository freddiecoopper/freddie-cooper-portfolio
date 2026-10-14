/* /api/updates   the "Now working on" feed
   GET            public list of visible updates, newest first
   GET ?all=1     (token) all updates, including hidden ones
   POST           (token) create or update {id?, date YYYY-MM-DD, status, title, note, media?, mediaType?, visible}
                  media is an optional work in progress image or short video (https address or images/ path)
   DELETE ?id=    (token) remove                                                                       */
const { pipeline, kv, authed, body, cut, slug } = require('./_lib');
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const admin = req.query && req.query.all && authed(req);
      const ids = await kv(['ZREVRANGE', 'updates', 0, 49]);
      let items = ids && ids.length ? ((await kv(['MGET'].concat(ids.map((i) => 'up:' + i)))) || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean) : [];
      if (!admin) items = items.filter((u) => u.visible !== false);
      res.setHeader('Cache-Control', admin ? 'no-store' : 's-maxage=15, stale-while-revalidate=60');
      return res.status(200).json({ ok: true, items: items });
    }
    if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (req.method === 'POST') {
      const b = body(req), date = String(b.date || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || ['In progress', 'Shipped', 'Planning'].indexOf(b.status) < 0 || !cut(b.title, 120)) return res.status(400).json({ ok: false, error: 'Check the date, status and title' });
      const id = /^[a-z0-9-]+$/i.test(String(b.id || '')) ? String(b.id) : slug(b.title);
      const media = cut(b.media, 800);
      if (media && !/^(https:\/\/|\/|images\/)/.test(media)) return res.status(400).json({ ok: false, error: 'The image or video must be an https address or an images/ path' });
      const mediaType = !media ? '' : (b.mediaType === 'video' || b.mediaType === 'image' ? b.mediaType : (/\.(mp4|webm)(\?|$)/i.test(media) ? 'video' : 'image'));
      const u = { id: id, date: date, status: b.status, title: cut(b.title, 120), note: cut(b.note, 400), media: media, mediaType: mediaType, mediaAlt: cut(b.mediaAlt, 200), visible: b.visible !== false };
      await pipeline([['SET', 'up:' + id, JSON.stringify(u)], ['ZADD', 'updates', Number(date.replace(/-/g, '')), id]]);
      return res.status(200).json({ ok: true, id: id });
    }
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || ''); if (!/^[a-z0-9-]+$/i.test(id)) return res.status(400).json({ ok: false, error: 'Bad request' });
      await pipeline([['DEL', 'up:' + id], ['ZREM', 'updates', id]]); return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE'); return res.status(405).end();
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
