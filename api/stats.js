/* GET /api/stats?days=30   (dashboard only, needs the Bearer token)
   Returns daily visitors and page views plus the top pages, referrers, countries and devices.
   GET /api/stats?view=sales returns the recorded wallpaper sales, newest first.
   (Sales live here rather than in their own file because the Hobby plan allows 12 functions.) */
const { kv, pipeline, authed } = require('./_lib');
const flat = (v) => { if (!v) return []; if (!Array.isArray(v)) return Object.keys(v).map((k) => [k, Number(v[k])]); const o = []; for (let i = 0; i < v.length; i += 2) o.push([v[i], Number(v[i + 1])]); return o; };
const top = (m, n) => Object.keys(m).map((k) => ({ k: k, v: m[k] })).sort((a, b) => b.v - a.v).slice(0, n);

async function sales(res) {
  try {
    const refs = await kv(['ZREVRANGE', 'sales', 0, 499]);
    const items = refs && refs.length ? ((await kv(['MGET'].concat(refs.map((r) => 'sale:' + r)))) || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean) : [];
    res.setHeader('Cache-Control', 'no-store'); return res.status(200).json({ ok: true, items: items });
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
}

module.exports = async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  if (req.query && req.query.view === 'sales') return sales(res);
  const n = Math.max(1, Math.min(90, Number((req.query && req.query.days) || 30)));
  const days = []; for (let i = n - 1; i >= 0; i--) days.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  try {
    const out = await pipeline([].concat.apply([], days.map((d) => [['GET', 'pv:' + d], ['SCARD', 'uv:' + d], ['HGETALL', 'paths:' + d], ['HGETALL', 'refs:' + d], ['HGETALL', 'geo:' + d], ['HGETALL', 'dev:' + d]])));
    const series = [], agg = { paths: {}, refs: {}, geo: {}, dev: {} };
    let pv = 0, uv = 0;
    days.forEach((d, i) => {
      const o = out.slice(i * 6, i * 6 + 6), p = Number(o[0] || 0), u = Number(o[1] || 0);
      series.push({ d: d, pv: p, uv: u }); pv += p; uv += u;
      ['paths', 'refs', 'geo', 'dev'].forEach((k, j) => flat(o[2 + j]).forEach((e) => { agg[k][e[0]] = (agg[k][e[0]] || 0) + e[1]; }));
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, days: n, totals: { pageviews: pv, visitors: uv }, series: series, paths: top(agg.paths, 10), refs: top(agg.refs, 10), geo: top(agg.geo, 10), dev: top(agg.dev, 5) });
  } catch (e) { return res.status(502).json({ ok: false, error: e.message }); }
};
