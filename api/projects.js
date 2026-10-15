/* /api/projects   projects, the home page Featured work, and each project's case study
   GET               public list of visible projects, in display order
   GET ?all=1        (token) every project, including hidden ones
   POST              (token) create or update one project
   POST {action:'reorder', ids:[...]}   (token) save the display order
   POST {action:'import', items:[...]}  (token) save several projects at once (used to copy in the built in list)
   DELETE ?id=       (token) remove
   Images are addresses: upload them in the dashboard (api/upload.js) or use images/... paths in the site. */
const { pipeline, kv, authed, body, cut, slug } = require('./_lib');
const URL_OK = (v) => !v || /^(https:\/\/|\/|images\/)/.test(v);
const ID_OK = (v) => /^[a-z0-9-]{1,80}$/i.test(String(v || ''));

function clean(b) {
  const list = (a, n) => (Array.isArray(a) ? a : []).slice(0, n);
  const p = {
    id: ID_OK(b.id) ? String(b.id) : slug(b.name), name: cut(b.name, 120), kind: b.kind === 'id' ? 'id' : 'viz',
    slug: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(b.slug || '')) ? String(b.slug).slice(0, 80) : '',   /* its page: /work/<slug> */
    src: cut(b.src, 800), srcColor: cut(b.srcColor, 800), alt: cut(b.alt, 200), blurb: cut(b.blurb, 400), link: cut(b.link, 800),
    featured: b.featured === true, feature: cut(b.feature, 800), featureColor: cut(b.featureColor, 800), featureFade: b.featureFade !== false, visible: b.visible !== false, caseStudy: null
  };
  const c = b.caseStudy;
  if (c && c.on !== false) {
    p.caseStudy = {
      on: true, intro: cut(c.intro, 600), role: cut(c.role, 120), tools: cut(c.tools, 200), year: cut(c.year, 20),
      cover: cut(c.cover, 800), coverAlt: cut(c.coverAlt, 200),
      sections: list(c.sections, 20).map((s) => ({ label: cut(s && s.label, 60), text: cut(s && s.text, 4000), image: cut(s && s.image, 800), alt: cut(s && s.alt, 200) })).filter((s) => s.label || s.text || s.image),
      slides: list(c.slides, 60).map((s) => ({ type: s && s.type === 'video' ? 'video' : 'image', src: cut(s && s.src, 800), alt: cut(s && s.alt, 200), caption: cut(s && s.caption, 120) })).filter((s) => s.src)
    };
  }
  const urls = [p.src, p.srcColor, p.feature, p.featureColor, p.link].concat(p.caseStudy ? [p.caseStudy.cover].concat(p.caseStudy.sections.map((s) => s.image), p.caseStudy.slides.map((s) => s.src)) : []);
  if (!p.name) return { error: 'Give the project a name' };
  if (!p.src) return { error: 'Add a thumbnail image' };
  if (urls.some((u) => !URL_OK(u))) return { error: 'Each image or link must be an https address or an images/ path' };
  return { p: p };
}
async function all() {
  const ids = await kv(['ZRANGE', 'projects', 0, -1]); if (!ids || !ids.length) return [];
  return ((await kv(['MGET'].concat(ids.map((i) => 'proj:' + i)))) || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
}
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const admin = req.query && req.query.all && authed(req);
      let items = await all(); if (!admin) items = items.filter((p) => p.visible !== false);
      res.setHeader('Cache-Control', admin ? 'no-store' : 's-maxage=30, stale-while-revalidate=120');
      return res.status(200).json({ ok: true, items: items });
    }
    if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (req.method === 'POST') {
      const b = body(req);
      if (b.action === 'reorder') {
        const ids = (Array.isArray(b.ids) ? b.ids : []).filter(ID_OK).slice(0, 200); if (!ids.length) return res.status(400).json({ ok: false, error: 'Nothing to order' });
        await pipeline(ids.map((id, i) => ['ZADD', 'projects', 'XX', i + 1, id])); return res.status(200).json({ ok: true });
      }
      const batch = b.action === 'import' ? (Array.isArray(b.items) ? b.items.slice(0, 100) : []) : [b], cmds = [];
      let next = Number(await kv(['ZCARD', 'projects'])) || 0;
      for (const raw of batch) {
        const r = clean(raw || {}); if (r.error) return res.status(400).json({ ok: false, error: (raw && raw.name ? raw.name + ': ' : '') + r.error });
        const known = await kv(['ZSCORE', 'projects', r.p.id]);
        cmds.push(['SET', 'proj:' + r.p.id, JSON.stringify(r.p)]); if (known == null) cmds.push(['ZADD', 'projects', ++next, r.p.id]);
      }
      if (!cmds.length) return res.status(400).json({ ok: false, error: 'Nothing to save' });
      await pipeline(cmds); return res.status(200).json({ ok: true, id: batch.length === 1 ? cmds[0][1].slice(5) : undefined });
    }
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || ''); if (!ID_OK(id)) return res.status(400).json({ ok: false, error: 'Bad request' });
      await pipeline([['DEL', 'proj:' + id], ['ZREM', 'projects', id]]); return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE'); return res.status(405).end();
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
