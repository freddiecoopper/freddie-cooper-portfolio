/* Case study page: Story and Presentation views. Slides come from js/content.js. */
var CASE = {
  "presWidth": 65,
  "presHeight": 80,
  "presPad": 0,
  "presGap": 0,
  "presCaptions": false,
  "storyW": 75
};   /* the old design tweaks: image width %, max height vh, padding px, gap px, captions, story image width % */
var $ = function (id) { return document.getElementById(id); };
$('storyImg').style.width = CASE.storyW + '%';
var col = $('mcol');
SITE.slides.forEach(function (s) {
  var f = document.createElement('figure'); f.className = 'mc'; f.style.padding = CASE.presPad + 'px'; f.style.background = s.bg || 'transparent';
  var m = document.createElement(s.type === 'video' ? 'video' : 'img');
  m.src = s.src; if (s.type === 'video') { m.controls = true; m.setAttribute('playsinline', ''); m.preload = 'metadata'; if (s.poster) m.poster = s.poster; } else m.alt = s.alt || '';
  m.style.width = CASE.presWidth + '%'; m.style.maxHeight = CASE.presHeight + 'vh'; f.appendChild(m);
  if (CASE.presCaptions && s.caption) { var c = document.createElement('figcaption'); c.className = 'pcap'; c.textContent = s.caption; f.appendChild(c); }
  col.appendChild(f);
});
col.style.gap = CASE.presGap + 'px';
function mode(pres) {
  $('story').style.display = pres ? 'none' : 'block'; $('pres').style.display = pres ? 'block' : 'none';
  $('bStory').className = 'fb' + (pres ? '' : ' on'); $('bPres').className = 'fb' + (pres ? ' on' : '');
  $('bStory').setAttribute('aria-pressed', !pres); $('bPres').setAttribute('aria-pressed', pres);
}
$('bStory').addEventListener('click', function () { mode(false); }); $('bPres').addEventListener('click', function () { mode(true); });
