/* POST /api/checkout   {id, email}
   Starts a Paystack payment for a premium wallpaper pack and returns {url} to send the buyer to.
   Needs PAYSTACK_SECRET_KEY and SITE_URL (for example https://frddycppr.com).
   The price comes from the saved pack, never from the browser.                                  */
const { kv, body, cut, site } = require('./_lib');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  try {
    const b = body(req), id = cut(b.id, 80), email = cut(b.email, 200);
    if (!/^[a-z0-9-]+$/i.test(id) || !EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Enter a valid email' });
    if (!process.env.PAYSTACK_SECRET_KEY || !site()) return res.status(500).json({ ok: false, error: 'Checkout is not configured' });
    const raw = await kv(['GET', 'wp:' + id]); const w = raw ? JSON.parse(raw) : null;
    if (!w || w.visible === false || !(w.price > 0) || !w.file) return res.status(404).json({ ok: false, error: 'Not available' });
    const ref = 'wp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const r = await fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, amount: Math.round(w.price * 100), currency: w.currency, reference: ref, callback_url: site() + '/wallpapers?paid=1&ref=' + ref, metadata: { wallpaperId: w.id, name: w.name } }) });
    const j = await r.json();
    if (!r.ok || !j.status) return res.status(502).json({ ok: false, error: 'Could not start checkout' });
    return res.status(200).json({ ok: true, url: j.data.authorization_url, ref: ref });
  } catch (e) { return res.status(502).json({ ok: false, error: 'Could not start checkout' }); }
};
