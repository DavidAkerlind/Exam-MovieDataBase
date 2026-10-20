# MMDb: My Movie Database

A movie database with a liquid-glass interface: top-rated and trending movies, trailers,
search for movies **and** people, rich movie pages (IMDb / Rotten Tomatoes / Metascore),
cast and filmographies, and a favorites list that lives in your browser.

Plain HTML, CSS and ES modules: **no build step**. API keys never touch the front
end: they live in a small [Cloudflare Worker](worker/README.md).

```
Browser (static site) ──► Cloudflare Worker /api/* ──► TMDb + OMDb
 GitHub Pages / any host     keys · CORS · cache
```

## Features

-   **Home**: 3D trailer carousel (autoplay, swipe, keyboard), top-3 podium, ranks 4-20, trending rail
-   **Search**: live suggestions with posters (keyboard friendly combobox), results for movies and people, infinite "load more"
-   **Movie page**: backdrop hero, ratings, trailer in a modal, cast, "more like this", favorite button
-   **Person page**: portrait, facts, expandable biography, filmography
-   **Favorites**: saved locally, sortable, animated removal with undo, synced across tabs
-   **Design system**: tokens (`styles/tokens.css`), liquid-glass primitives (`styles/glass.css`), skeleton loading, toasts, scroll reveals, cross-page view transitions
-   **Accessible**: semantic landmarks, skip link, ARIA combobox / dialog, visible focus, `prefers-reduced-motion` respected
-   **Installable PWA** with offline fallback for pages you've visited
-   Hardened: all API data is HTML-escaped, strict Content-Security-Policy, CORS allow-list on the API

## Run it

**Without any keys** (fake catalogue, same Worker code):

```bash
npm run worker:dev:mock            # API on http://localhost:8787
npm start                          # site on http://localhost:5502
# open http://localhost:5502/?api=http://localhost:8787
```

**With real data:** deploy the Worker (see [worker/README.md](worker/README.md): it takes about 5 minutes),
then put its URL in [`scripts/config.js`](scripts/config.js):

```js
export const API_BASE_URL = "https://mmdb-api.<your-subdomain>.workers.dev";
```

Deploy the site anywhere static: GitHub Pages (Settings → Pages → deploy from branch), Cloudflare Pages
(no build command, output directory `/`) or Netlify. If the site's address changes, add it to
`ALLOWED_ORIGINS` in `worker/wrangler.toml` and redeploy the Worker.

## Project structure

```
index.html · movie.html · person.html · search.html · favorites.html
scripts/
  script.js            entry point; <body data-page> picks the page module
  config.js            public config (the Worker URL)
  modules/             api.js (the only network code) · carousel.js
  pages/               home · movie · person · search · favorites
  components/          header · footer · layout · movieCard · feedback · trailerModal
  events/              search combobox · favorites · burger menu · newsletter
  data/favorites.js    localStorage store (+ migration of old IMDb ids)
  utils/               html (auto-escaping template tag) · format · images · icons · motion
styles/                tokens · base · glass · header · carousel · podium · movieCard · moviePage · personPage · searchPage · footer
worker/                Cloudflare Worker (src/), unit tests (test/), wrangler.toml
sw.js · manifest.webmanifest   PWA
```

## Tests

```bash
npm test      # 37 Worker tests: CORS, validation, response shapes, failures, caching, secret leakage
```

## Security notes

-   Keys are Worker **secrets**; nothing secret is in this repo. A previous version of this project
    committed its TMDb/OMDb keys; they remain in the git history, so **revoke those old keys** at TMDb and OMDb.
-   The newsletter form and social links in the footer are placeholders; nothing is sent or stored.

## Credits

Movie data and images by [TMDB](https://www.themoviedb.org). Ratings by [OMDb](https://www.omdbapi.com).
This product uses the TMDB API but is not endorsed or certified by TMDB.
