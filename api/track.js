/* POST /api/track  (called by js/track.js on every page view)
   Privacy friendly counting: no cookies, no IP address stored. A visitor is a hash of IP, browser and the
   date, mixed with TRACK_SALT, so it cannot be traced back and changes every day.
   Keys per day: pv (page views), uv (set of visitor hashes), paths, refs, geo, dev (counters). */
const crypto = require('crypto');
const { pipeline, body } = require('./_lib');
const KEEP = 60 * 60 * 24 * 400;   /* keep 400 days */
const cut = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  const ua = req.headers['user-agent'] || '';
  if (/bot|crawl|spider|preview|monitor|headless|lighthouse|curl|wget/i.test(ua)) return res.status(204).end();
  const b = body(req);
  const path = cut(b.p, 200); if (path.charAt(0) !== '/') return res.status(204).end();
  const ref = cut(b.r, 100).toLowerCase() || 'direct';
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || '';
  const day = new Date().toISOString().slice(0, 10);
  const vid = crypto.createHash('sha256').update([ip, ua, day, process.env.TRACK_SALT || 'change-me'].join('|')).digest('hex').slice(0, 16);
  const cc = cut(req.headers['x-vercel-ip-country'], 2).toUpperCase() || '??';
  const w = Number(b.w) || 0, device = w && w < 768 ? 'mobile' : (w && w < 1100 ? 'tablet' : 'desktop');
  const keys = ['pv', 'uv', 'paths', 'refs', 'geo', 'dev'].map((k) => k + ':' + day);
  try {
    await pipeline([
      ['INCR', keys[0]], ['SADD', keys[1], vid], ['HINCRBY', keys[2], path, 1], ['HINCRBY', keys[3], ref, 1], ['HINCRBY', keys[4], cc, 1], ['HINCRBY', keys[5], device, 1]
    ].concat(keys.map((k) => ['EXPIRE', k, KEEP])));
  } catch (e) { console.error('track', e.message); }
  return res.status(204).end();
};
