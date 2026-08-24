/* RECON RADAR — homepage: countdown, articles, ledger */

/* ---------------- countdown ---------------- */
const LAUNCH = new Date('2026-11-19T00:00:00Z');
const pad = n => String(n).padStart(2, '0');

function tick() {
  const el = id => document.getElementById(id);
  const diff = LAUNCH - Date.now();
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<span><b>OUT</b> now</span><em class="until">Grand Theft Auto VI</em>';
    return;
  }
  const s = Math.floor(diff / 1000);
  el('d').textContent = Math.floor(s / 86400);
  el('h').textContent = pad(Math.floor(s / 3600) % 24);
  el('m').textContent = pad(Math.floor(s / 60) % 60);
  el('s').textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

/* ---------------- helpers ---------------- */
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmt = iso => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/* ---------------- articles ----------------
   Renders ONLY real, published articles. If articles.json is empty we show an
   honest empty state — we never invent placeholder stories.                */
const articlesEl = document.getElementById('articles');

fetch('articles.json')
  .then(r => r.json())
  .then(data => {
    const list = (data.articles || []).slice()
      .sort((a, b) => b.date.localeCompare(a.date));

    if (!list.length) {
      articlesEl.innerHTML = `
        <div class="no-articles">
          <strong>Nothing published yet.</strong>
          <span>The first write-up lands with Rockstar&rsquo;s extended gameplay reveal on 27 August.</span>
        </div>`;
      return;
    }

    articlesEl.innerHTML = list.map(a => `
      <a class="article-row" href="article.html?id=${encodeURIComponent(a.id)}">
        <span class="kicker">${esc(a.kicker || 'News')}</span>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.standfirst || '')}</p>
        <p class="byline">${fmt(a.date)}${a.readingTime ? ' &middot; ' + esc(a.readingTime) : ''}</p>
      </a>`).join('');
  })
  .catch(() => {
    articlesEl.innerHTML =
      '<div class="no-articles"><strong>Couldn&rsquo;t load articles.</strong><span>Refresh to try again.</span></div>';
  });

/* ---------------- the ledger ---------------- */
const results = document.getElementById('results');
const empty   = document.getElementById('empty');
const search  = document.getElementById('search');
const chips   = [...document.querySelectorAll('.chip')];

let claims = [];
let filter = 'all';

function counts() {
  const n = { all: claims.length, confirmed: 0, unverified: 0, debunked: 0 };
  claims.forEach(c => { if (n[c.status] !== undefined) n[c.status]++; });
  Object.entries(n).forEach(([k, v]) => {
    const el = document.getElementById('c-' + k);
    if (el) el.textContent = v;
  });
}

function render() {
  const q = search.value.trim().toLowerCase();
  const shown = claims.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (!q) return true;
    return (c.claim + ' ' + (c.note || '') + ' ' + (c.source || '')).toLowerCase().includes(q);
  });

  empty.hidden = shown.length > 0;
  results.innerHTML = shown.map(c => `
    <article class="row ${esc(c.status)}">
      <div class="rail" aria-hidden="true"></div>
      <div class="row-body">
        <p class="attrib">Claimed ${fmt(c.date)} &middot; ${esc(c.source)}</p>
        <h3>${esc(c.claim)}</h3>
        ${c.note ? `<p class="why">${esc(c.note)}</p>` : ''}
        ${c.sourceUrl ? `<p class="stamp-row"><a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener nofollow">See the source &rarr;</a></p>` : ''}
      </div>
      <div class="verdict">${esc(c.status)}</div>
    </article>`).join('');
}

chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('is-active'));
  chip.classList.add('is-active');
  filter = chip.dataset.filter;
  render();
}));
search.addEventListener('input', render);

fetch('claims.json')
  .then(r => r.json())
  .then(data => {
    claims = data.claims.sort((a, b) => b.date.localeCompare(a.date));
    document.getElementById('updated').textContent = 'Ledger last updated ' + fmt(data.updated);
    counts();
    render();
  })
  .catch(() => {
    empty.hidden = false;
    empty.textContent = 'Could not load the ledger. Refresh to try again.';
  });
