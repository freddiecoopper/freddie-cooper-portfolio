/* Privacy-conscious page-view tracker. Skips local development and Do Not Track. */
(function () {
  try {
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    if (navigator.doNotTrack === '1' || localStorage.getItem('fc-owner') === '1') return;
    var ref = ''; try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (ref === location.hostname) ref = '';
    var data = JSON.stringify({ p: location.pathname.replace(/\/index\.html$/, '/') || '/', r: ref, w: window.innerWidth });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([data], { type: 'application/json' }));
    else fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data, keepalive: true });
  } catch (e) {}
})();
