/* /api/site   the home page content edited in the dashboard's Home page tab
   GET    public: { home } or { home: null } when nothing has been saved (the site then uses js/content.js)
   POST   (token) save { hero: {viz, id}, about, portrait, skills: {viz, id}, process, calendly }
   Stored as one JSON value under the key site:home.                                                    */
const { kv, authed, body, cut } = require('./_lib');
const URL_OK = (v) => !v || /^(https:\/\/|\/|images\/)/.test(v);
const num = (v, d, lo, hi) => { const n = Number(v); return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };

function clean(b) {
  const hero = (side) => (Array.isArray(b.hero && b.hero[side]) ? b.hero[side] : []).slice(0, 12)
    .map((h) => ({ src: cut(h && h.src, 800), alt: cut(h && h.alt, 200), caption: cut(h && h.caption, 140), x: num(h && h.x, 0, -100, 100), y: num(h && h.y, 0, -100, 100), w: num(h && h.w, 100, 10, 300) }))
    .filter((h) => h.src);
  const words = (a) => (Array.isArray(a) ? a : []).map((t) => cut(t, 60)).filter(Boolean).slice(0, 24);
  const home = {
    hero: { viz: hero('viz'), id: hero('id') },
    about: cut(b.about, 2000),
    portrait: { src: cut(b.portrait && b.portrait.src, 800), alt: cut(b.portrait && b.portrait.alt, 200) },
    skills: { viz: words(b.skills && b.skills.viz), id: words(b.skills && b.skills.id) },
    process: (Array.isArray(b.process) ? b.process : []).slice(0, 8).map((p) => ({ title: cut(p && p.title, 40), text: cut(p && p.text, 300) })).filter((p) => p.title || p.text),
    calendly: cut(b.calendly, 400)
  };
  const urls = home.hero.viz.concat(home.hero.id).map((h) => h.src).concat([home.portrait.src, home.calendly]);
  if (urls.some((u) => !URL_OK(u))) return { error: 'Each image and link must be an https address or an images/ path' };
  if (!home.hero.viz.length && !home.hero.id.length) return { error: 'The hero needs at least one image' };
  return { home: home };
}
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const raw = await kv(['GET', 'site:home']); let home = null; try { home = raw ? JSON.parse(raw) : null; } catch (e) {}
      res.setHeader('Cache-Control', req.query && req.query.fresh ? 'no-store' : 's-maxage=30, stale-while-revalidate=120');
      return res.status(200).json({ ok: true, home: home });
    }
    if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (req.method === 'POST') {
      const r = clean(body(req)); if (r.error) return res.status(400).json({ ok: false, error: r.error });
      r.home.savedAt = new Date().toISOString();
      await kv(['SET', 'site:home', JSON.stringify(r.home)]); return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST'); return res.status(405).end();
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
