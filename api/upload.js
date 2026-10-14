/* /api/upload   (token) stores one image or video for the dashboard and returns its public address.
   The dashboard sends the file as the raw request body (Content-Type application/octet-stream, which
   Vercel hands over as a Buffer), with its type in the x-file-type header and its
   name in x-file-name. Files go to Vercel Blob (needs BLOB_READ_WRITE_TOKEN, added by the Blob integration).
   Vercel caps a request at 4.5 MB, so the dashboard shrinks large images before sending them.            */
const { authed } = require('./_lib');
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' };
const MAX = 4.4 * 1024 * 1024;

async function readBuffer(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'binary');
  const parts = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX) throw new Error('too large'); parts.push(c); }
  return Buffer.concat(parts);
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ ok: false, error: 'Uploads are not set up yet. Add Vercel Blob to the project (see README).' });
  const type = String(req.headers['x-file-type'] || '').toLowerCase(), ext = TYPES[type];
  if (!ext) return res.status(400).json({ ok: false, error: 'Use a JPG, PNG, WebP, GIF, AVIF, MP4 or WebM file' });
  try {
    const buf = await readBuffer(req);
    if (!buf.length) return res.status(400).json({ ok: false, error: 'The file was empty' });
    if (buf.length > MAX) return res.status(413).json({ ok: false, error: 'The file is over 4.4 MB' });
    const base = String(req.headers['x-file-name'] || 'file').replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file';
    const { put } = require('@vercel/blob');
    const out = await put('site/' + base + '.' + ext, buf, { access: 'public', contentType: type, addRandomSuffix: true, cacheControlMaxAge: 31536000 });
    return res.status(200).json({ ok: true, url: out.url });
  } catch (e) {
    return res.status(e.message === 'too large' ? 413 : 502).json({ ok: false, error: e.message === 'too large' ? 'The file is over 4.4 MB' : 'Upload failed: ' + e.message });
  }
};
