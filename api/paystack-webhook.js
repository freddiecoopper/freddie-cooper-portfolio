/* POST /api/paystack-webhook
   Paystack calls this when a payment succeeds. Set it as the webhook URL in your Paystack dashboard
   (Settings, API Keys and Webhooks): https://YOUR-SITE/api/paystack-webhook
   It re-checks the payment with Paystack, records the sale once, and emails the buyer a download link.
   Needs PAYSTACK_SECRET_KEY, SITE_URL, DOWNLOAD_SECRET, RESEND_API_KEY. Optional TO_EMAIL for sale alerts.  */
const { pipeline, kv, hmac, site, mail, readRaw } = require('./_lib');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  const key = process.env.PAYSTACK_SECRET_KEY || '';
  try {
    const raw = await readRaw(req), sig = req.headers['x-paystack-signature'];
    if (sig && key && typeof raw === 'string' && hmac(key, raw, 'sha512') !== sig) return res.status(401).end();
    const ev = typeof raw === 'string' ? JSON.parse(raw || '{}') : (req.body || {});
    if (ev.event !== 'charge.success' || !ev.data || !ev.data.reference) return res.status(200).end();
    const ref = String(ev.data.reference);
    /* Never trust the webhook alone: ask Paystack whether this payment really succeeded. */
    const v = await (await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + key } })).json();
    if (!v.status || !v.data || v.data.status !== 'success') return res.status(200).end();
    const meta = v.data.metadata || {}; const rawW = await kv(['GET', 'wp:' + meta.wallpaperId]); const w = rawW ? JSON.parse(rawW) : null;
    if (!w || Math.round(w.price * 100) !== v.data.amount || w.currency !== v.data.currency) return res.status(200).end();
    const sale = { ref: ref, wpId: w.id, name: w.name, email: v.data.customer && v.data.customer.email, amount: v.data.amount / 100, currency: v.data.currency, paidAt: v.data.paid_at || new Date().toISOString(), downloads: 0 };
    const made = await kv(['SET', 'sale:' + ref, JSON.stringify(sale), 'NX']);
    if (!made) return res.status(200).end();                       /* already handled, Paystack retries webhooks */
    await pipeline([['ZADD', 'sales', Date.now(), ref]]);
    const link = site() + '/api/download?ref=' + encodeURIComponent(ref) + '&sig=' + hmac(process.env.DOWNLOAD_SECRET || 'change-me', ref);
    await mail({ to: sale.email, subject: 'Your wallpaper: ' + w.name, text: 'Thank you for your purchase.\n\nDownload ' + w.name + ' here:\n' + link + '\n\nThe link works for a limited number of downloads. Reply to this email if you have any trouble.\n\nFreddie Cooper' }).catch((e) => console.error('buyer mail', e.message));
    if (process.env.TO_EMAIL) await mail({ to: process.env.TO_EMAIL, subject: 'New sale: ' + w.name, text: w.name + '\n' + sale.amount + ' ' + sale.currency + '\n' + sale.email + '\nRef ' + ref }).catch(() => {});
    return res.status(200).end();
  } catch (e) { console.error('webhook', e.message); return res.status(200).end(); }
};
module.exports.config = { api: { bodyParser: false } };
