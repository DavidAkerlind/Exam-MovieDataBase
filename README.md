# MMDb: My Movie Database

A movie database with a liquid-glass interface: top-rated and trending movies, trailers,
search for movies **and** people, rich movie pages (IMDb / Rotten Tomatoes / Metascore),
cast and filmographies, and a favorites list that lives in your browser.

Plain HTML, CSS and ES modules: **no build step**. API keys never touch the front
end. The whole app is **one Cloudflare Worker** that serves the website and, under `/api/*`,
a small API that holds the keys ([worker/README.md](worker/README.md)).

```
Browser ──► one Cloudflare Worker (mmdb) ──► TMDb + OMDb
            ├─ /       the website (static files, see .assetsignore)
            └─ /api/*  keys · cache · validation (worker/src)
```

**Putting it online, step by step: [DEPLOY.md](DEPLOY.md).**

## Features

-   **Instant search**: results appear as you type, with posters. Known queries render synchronously from cache,
    new ones are filtered instantly from a local pool while the network answers; an empty field shows
    *Recent searches* and *Trending now*. Rows glide, enter with a stagger and fade out (keyed FLIP list), the
    selection highlight slides between rows, and moving onto a result prefetches its page. Full keyboard support
    (`/` or `Ctrl/Cmd+K` to focus, arrows, Enter, Delete to drop a recent, Esc). On the search page the results
    grid updates live as you type.
-   **Movie stats dashboard**: concentric "activity" rings for IMDb / Rotten Tomatoes / Metascore / TMDB with an
    overall score, animated score bars, a runtime gauge and a wins-vs-nominations pie, all drawn in with count-up numbers
-   **Zoom into a name**: click a director, writer or actor and the page dollies into the name you clicked;
    the person's page emerges from that same name
-   **Favorite celebration**: hearts burst from the button, a heart flies across the page into the header's Favorites
    item and the badge bumps
-   **Home**: 3D trailer carousel (autoplay, swipe, keyboard), top-3 podium, ranks 4-20, trending rail
-   **Movie page**: backdrop hero, trailer modal, cast, "more like this", favorite button
-   **Person page**: portrait, facts, expandable biography, filmography
-   **Favorites**: saved locally, sortable, animated removal with undo, synced across tabs
-   **Design system**: tokens (`styles/tokens.css`), liquid-glass primitives (`styles/glass.css`), skeleton loading, toasts, scroll reveals, cross-page view transitions
-   **Accessible**: semantic landmarks, skip link, ARIA combobox / dialog, visible focus, `prefers-reduced-motion` respected (all effects switch off); 0 axe-core violations
-   **Installable PWA** with offline fallback for pages you've visited
-   Hardened: all API data is HTML-escaped, strict Content-Security-Policy, CORS allow-list on the API

## Run it

**Online (Cloudflare):** follow [DEPLOY.md](DEPLOY.md). Connect the repo's `main` branch in the
Cloudflare dashboard, add the two keys as secrets, done. Every push to `main` redeploys.

**On your computer with real data:** put your keys in a `.dev.vars` file (git-ignored):

```
TMDB_API_KEY=...
OMDB_API_KEY=...
```

```bash
npm install
npm run dev                        # site + API together on http://localhost:8787
```

**Without any keys** (fake catalogue, same Worker code):

```bash
npm run worker:dev:mock            # API on http://localhost:8787
npm start                          # site on http://localhost:5502
# open http://localhost:5502/?api=http://localhost:8787
```

The site calls the API on its own address (`API_BASE_URL = ""` in
[`scripts/config.js`](scripts/config.js)). Only if you host the site and the API separately, set
`API_BASE_URL` to the API's full URL and deploy `worker/` on its own (see [worker/README.md](worker/README.md)).
The `OG` branch keeps the original, pre-overhaul page and is not meant to be deployed.

## Project structure

```
index.html · movie.html · person.html · search.html · favorites.html
scripts/
  script.js            entry point; <body data-page> picks the page module
  config.js            public config (the Worker URL)
  modules/             api.js (the only network code) · carousel.js
  pages/               home · movie · person · search · favorites
  components/          header · footer · layout · movieCard · stats (charts) · feedback · trailerModal
  events/              search (instant combobox) · favorites · burger menu · newsletter
  data/                favorites.js (localStorage + migration of old IMDb ids) · recent.js (recent searches)
  utils/               html (auto-escaping template tag) · format · images · icons · motion · effects · zoom
styles/                tokens · base · glass · header · carousel · podium · movieCard · moviePage · stats · personPage · searchPage · footer · effects
tests/                 front-end unit tests + deployment-config tests
worker/                the API (src/), its unit tests (test/); wrangler.toml here = API-only deploy
wrangler.toml          the deployed Worker: serves the site and /api/* together
.assetsignore          allow-list of the files Cloudflare publishes as the website
DEPLOY.md              step-by-step deploy guide
sw.js · manifest.webmanifest   PWA
```

## Tests

```bash
npm test      # 39 Worker tests (CORS, validation, response shapes, failures, caching, secret leakage)
              # + 17 front-end tests (escaping, formatting, score normalisation, award parsing)
              #   and deployment-config tests (only the public site is published, nothing private)
```

## Security notes

-   Keys are Worker **secrets**; nothing secret is in this repo. Only an allow-list of site files is
    published (`.assetsignore`), and a test fails if anything private is added to it. A previous version of this project
    committed its TMDb/OMDb keys; they remain in the git history, so **revoke those old keys** at TMDb and OMDb.
-   The newsletter form and social links in the footer are placeholders; nothing is sent or stored.

## Credits

Movie data and images by [TMDB](https://www.themoviedb.org). Ratings by [OMDb](https://www.omdbapi.com).
This product uses the TMDB API but is not endorsed or certified by TMDB.
