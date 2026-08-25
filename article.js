/* RECON RADAR — single article renderer.
   Reads ?id=slug from the URL and renders that entry from articles.json.
   If the id doesn't exist we say so plainly. We never render a placeholder. */

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmt = iso => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });


/* A piece of evidence: the document or page itself, not our description of it.
   The image is always a link to the official source, so a reader can go and
   check it without taking our word for anything. An entry with no sourceUrl
   is not proof and is not rendered as proof - name the source in text
   instead. Same rule the ledger runs on. */
function proofFigure(p) {
  if (!p || !p.image || !p.sourceUrl) return '';
  const cap = [p.caption, p.sourceName, p.retrieved ? 'retrieved ' + fmt(p.retrieved) : '']
    .filter(Boolean).map(esc).join(' &middot; ');
  return `
    <figure class="proof">
      <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener nofollow">
        <img src="${esc(p.image)}" alt="${esc(p.alt || p.caption || 'Source document')}" loading="lazy">
      </a>
      <figcaption>${cap} <span class="proof-go">View the original &rarr;</span></figcaption>
    </figure>`;
}

function proofBlock(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<section class="proof-set">
      <h2>The evidence</h2>
      ${list.map(proofFigure).join('')}
    </section>`;
}

/* Every short gets an article, and the article carries the short. The video
   is the thing people arrive for; the article is what still exists in six
   months when search sends someone here. */
function shortEmbed(s) {
  if (!s || !s.youtubeId) return '';
  return `
    <div class="short-embed">
      <iframe src="https://www.youtube.com/embed/${esc(s.youtubeId)}"
        title="${esc(s.title || 'RECON RADAR short')}"
        loading="lazy" allowfullscreen
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>`;
}

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
        if (block.proof) return proofFigure(block.proof);
        if (block.image) return `
          <figure class="shot">
            <img src="${esc(block.image.src)}" alt="${esc(block.image.alt || '')}" loading="lazy">
            ${block.image.caption ? `<figcaption>${esc(block.image.caption)}</figcaption>` : ''}
          </figure>`;
        if (block.status) return `
          <p class="status status-${esc(block.status.verdict)}">
            <b>${esc(block.status.verdict)}</b> ${esc(block.status.text)}
          </p>`;
        return '';
      }).join('');

      piece.innerHTML = `
        <span class="kicker">${esc(a.kicker || 'News')}</span>
        <h1>${esc(a.title)}</h1>
        ${a.standfirst ? `<p class="standfirst">${esc(a.standfirst)}</p>` : ''}
        <p class="meta">${fmt(a.date)}${a.readingTime ? ' &middot; ' + esc(a.readingTime) : ''}</p>
        ${shortEmbed(a.short)}
        <div class="body">${body}</div>
        ${proofBlock(a.proof)}
        ${a.videoUrl ? `<p class="stamp-row"><a href="${esc(a.videoUrl)}" target="_blank" rel="noopener">Watch on YouTube &rarr;</a></p>` : ''}
        <a class="back" href="./">&larr; Back to RECON RADAR</a>`;
    })
    .catch(() => notFound('Could not load that article. Refresh to try again.'));
}
