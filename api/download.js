/* GET /api/download?ref=...&sig=...
   Sends a paying buyer to their wallpaper file. The sig is a signature of the order reference made with
   DOWNLOAD_SECRET, so links cannot be guessed. Each order can download up to 10 times.
   Store premium files somewhere private and time limited if you can (a signed storage URL).       */
const { kv, hmac, site } = require('./_lib');
module.exports = async function handler(req, res) {
  const ref = String((req.query && req.query.ref) || ''), sig = String((req.query && req.query.sig) || '');
  if (!/^[a-z0-9_]+$/i.test(ref) || sig !== hmac(process.env.DOWNLOAD_SECRET || 'change-me', ref)) return res.status(403).send('This link is not valid.');
  try {
    const rs = await kv(['GET', 'sale:' + ref]); if (!rs) return res.status(404).send('Order not found.');
    const sale = JSON.parse(rs); if ((sale.downloads || 0) >= 10) return res.status(429).send('This link has reached its download limit. Reply to your email and I will help.');
    const rw = await kv(['GET', 'wp:' + sale.wpId]); const w = rw ? JSON.parse(rw) : null; if (!w || !w.file) return res.status(404).send('File not found.');
    sale.downloads = (sale.downloads || 0) + 1; await kv(['SET', 'sale:' + ref, JSON.stringify(sale)]);
    res.setHeader('Cache-Control', 'no-store'); res.writeHead(302, { Location: /^https?:/.test(w.file) ? w.file : site() + '/' + w.file.replace(/^\//, '') }); return res.end();
  } catch (e) { return res.status(502).send('Something went wrong. Please try again.'); }
};
