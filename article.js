/* RECON RADAR — single article renderer.
   Reads ?id=slug from the URL and renders that entry from articles.json.
   If the id doesn't exist we say so plainly. We never render a placeholder. */

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmt = iso => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const piece = document.getElementById('piece');
const id = new URLSearchParams(location.search).get('id');

function notFound(msg) {
  piece.innerHTML = `
    <h1>Not found</h1>
    <p class="standfirst">${esc(msg)}</p>
    <a class="back" href="./">&larr; Back to RECON RADAR</a>`;
}

if (!id) {
  notFound('No article was specified.');
} else {
  fetch('articles.json')
    .then(r => r.json())
    .then(data => {
      const a = (data.articles || []).find(x => x.id === id);
      if (!a) return notFound('That article does not exist.');

      document.title = a.title + ' — RECON RADAR';
      const desc = document.querySelector('meta[name="description"]');
      if (desc && a.standfirst) desc.setAttribute('content', a.standfirst);

      // body is an array of blocks so entries stay easy to write by hand
      const body = (a.body || []).map(block => {
        if (typeof block === 'string') return `<p>${esc(block)}</p>`;
        if (block.h)     return `<h2>${esc(block.h)}</h2>`;
        if (block.quote) return `<blockquote>${esc(block.quote)}</blockquote>`;
        if (block.p)     return `<p>${esc(block.p)}</p>`;
        if (block.link)  return `<p><a href="${esc(block.link.url)}" target="_blank" rel="noopener nofollow">${esc(block.link.text)} &rarr;</a></p>`;
        return '';
      }).join('');

      piece.innerHTML = `
        <span class="kicker">${esc(a.kicker || 'News')}</span>
        <h1>${esc(a.title)}</h1>
        ${a.standfirst ? `<p class="standfirst">${esc(a.standfirst)}</p>` : ''}
        <p class="meta">${fmt(a.date)}${a.readingTime ? ' &middot; ' + esc(a.readingTime) : ''}</p>
        <div class="body">${body}</div>
        ${a.videoUrl ? `<p class="stamp-row"><a href="${esc(a.videoUrl)}" target="_blank" rel="noopener">Watch the video on YouTube &rarr;</a></p>` : ''}
        <a class="back" href="./">&larr; Back to RECON RADAR</a>`;
    })
    .catch(() => notFound('Could not load that article. Refresh to try again.'));
}
