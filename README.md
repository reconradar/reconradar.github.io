# RECON RADAR

Static site. No build step, no dependencies, no framework. Every file sits in the root
so it can be uploaded straight through GitHub's web interface.

Live at **https://reconradar.github.io/**

```
index.html      home — hero, latest articles, the ledger, subscribe
article.html    single article page, reads ?id=slug
styles.css      all styling
app.js          countdown + articles list + ledger
article.js      renders one article
claims.json     THE LEDGER — every claim and its verdict
articles.json   published articles (starts empty on purpose)
logo.png        avatar / favicon
og.png          social share card
```

---

## The one rule

**Never add an entry for something that does not exist.**

`articles.json` starts as an empty array. The site renders an honest
"Nothing published yet" state when it is empty. That is correct behaviour — do not
fill it with placeholder or example articles to make the page look busier. Every
article on this site must correspond to a real, published piece of work, and every
link must actually go somewhere.

The same applies to `claims.json`: every entry needs a real source you have checked.

---

## Adding an article

Two steps: write the entry, then it is live. No files to create.

Add an object to the `articles` array in `articles.json`:

```json
{
  "id": "cyberleek-subpoena-deadline",
  "kicker": "Leaks",
  "title": "Take-Two's subpoena deadline lands on 4 September",
  "standfirst": "Microsoft and Discord have until Friday to hand over account records. Here is what that actually means.",
  "date": "2026-09-01",
  "readingTime": "4 min read",
  "videoUrl": "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
  "body": [
    "An ordinary paragraph is just a string.",
    { "h": "A subheading" },
    { "p": "Or use an explicit paragraph object." },
    { "quote": "A pulled quote, styled with a pink rule." },
    { "link": { "text": "Read the court filing", "url": "https://..." } }
  ]
}
```

- `id` becomes the URL: `article.html?id=cyberleek-subpoena-deadline`
- `date` is ISO `YYYY-MM-DD`. Newest sorts to the top automatically.
- `videoUrl` is optional — include it only if the video is actually published.
- Everything is escaped on render, so quotes and apostrophes are safe.

### Every short gets an article

One short, one article. No exceptions. The short is what people arrive for and
the article is what still exists in six months when search sends someone here.

Pair them with `short`, which embeds the video at the top of the page:

```json
"short": { "youtubeId": "REAL_ID", "title": "Is the map really six times bigger?" }
```

### Proof

Claims are shown, not asserted. Put the document or the page itself on the
article as an image, and make that image a link to the official source:

```json
"proof": [
  {
    "image": "proof/subpoena-2026-09-04.png",
    "alt": "Page one of Take-Two's subpoena to Discord",
    "caption": "Take-Two Interactive v. Doe, subpoena to Discord Inc.",
    "sourceName": "S.D.N.Y. docket via CourtListener",
    "sourceUrl": "https://www.courtlistener.com/docket/REAL/",
    "retrieved": "2026-09-01"
  }
]
```

A proof entry **needs** both `image` and `sourceUrl` or it is not rendered.
The whole point is that the reader can go and check it themselves.

- Screenshots go in `site/proof/`.
- `sourceUrl` is a **deep link to the specific document or page** — never a
  homepage, and never a screenshot of a screenshot. A picture of a legal
  document posted to X is not the document; trace it to the court docket and
  link that.
- A single proof can also be dropped mid-body: `{ "proof": { … } }`.

Never reproduce leaked or stolen material as "proof". Public records, official
posts and court filings only — that distinction is the entire brand.

**Workflow:** make the video → publish it → write the article → add the entry.
The article is the durable, searchable version of the video. That is what earns
Google traffic long after the video stops being recommended.

## Adding to the ledger

Add an object to the `claims` array in `claims.json`:

```json
{
  "id": "short-slug",
  "claim": "The thing someone is claiming",
  "status": "confirmed",
  "date": "2026-09-01",
  "source": "Who said it",
  "sourceUrl": "https://...",
  "note": "The detail, and the reasoning behind the verdict."
}
```

`status` must be exactly `confirmed`, `unverified` or `debunked`.
Bump the top-level `"updated"` date whenever you add one.

---

## The newsletter

The subscribe form posts to Buttondown at `buttondown.com/api/emails/embed-subscribe/reconradargg`.

It will not accept subscribers until the Buttondown account clears review — finish
the onboarding questionnaire at buttondown.com/home to trigger that.

## Deploying updates

Edit a file → commit → GitHub Pages redeploys in about a minute. For JSON-only
changes you can edit the file directly in GitHub's web editor and commit from the browser.
