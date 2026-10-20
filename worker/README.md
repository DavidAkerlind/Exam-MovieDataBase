# MMDb API (Cloudflare Worker)

A small Worker that sits between the website and TMDb / OMDb. It holds both API
keys as encrypted secrets, so **no key is ever shipped to the browser or committed
to git**. It also validates input, restricts which sites may call it (CORS),
caches responses at Cloudflare's edge and returns compact JSON the UI can use
directly.

```
Browser ──► Worker (/api/*) ──► TMDb  (catalogue, search, people, trailers)
              │  keys live here └─► OMDb  (IMDb / Rotten Tomatoes ratings)
              └─ edge cache + CORS allow-list + input validation
```

> **Which setup do I want?** Normally the repository root deploys this Worker
> *together with the website* as one Cloudflare Worker (`../wrangler.toml`), so the site
> and `/api/*` share one address and nothing needs connecting. Follow [`../DEPLOY.md`](../DEPLOY.md)
> for that. The deploy options below are for the **API-only** setup, where the site is
> hosted somewhere else (for example GitHub Pages): deploy this folder, set `API_BASE_URL`
> in `scripts/config.js` to the Worker's address and list the site in `ALLOWED_ORIGINS`.

## What you need

-   A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
-   A TMDb API key: <https://www.themoviedb.org/settings/api> (copy the **API Key (v3)**; a v4 "Read Access Token" also works)
-   An OMDb API key: <https://www.omdbapi.com/apikey.aspx>
-   Node.js 20+ (only for the CLI route)

## Deploy, option A: command line (about 5 minutes)

```bash
cd worker
npm install
npx wrangler login                 # opens a browser to authorise Wrangler
npx wrangler deploy                # first run asks you to pick a workers.dev subdomain
npx wrangler secret put TMDB_API_KEY   # paste the key when prompted
npx wrangler secret put OMDB_API_KEY
```

`wrangler deploy` prints your Worker URL, e.g. `https://mmdb-api.<your-subdomain>.workers.dev`.

Check it:

```bash
curl https://mmdb-api.<your-subdomain>.workers.dev/api/health
# {"ok":true,"services":{"tmdb":true,"omdb":true}}
```

Then paste the URL into `scripts/config.js` (`API_BASE_URL`), commit and push. The
site picks it up as soon as GitHub Pages redeploys.

## Deploy, option B: from the Cloudflare dashboard (no CLI)

1. Dashboard → **Workers & Pages** → **Create** → **Import a repository** and pick this repo.
2. Set **Root directory** to `worker`. Deploy command: `npx wrangler deploy`.
3. After the first build open the Worker → **Settings → Variables and secrets** and add
   `TMDB_API_KEY` and `OMDB_API_KEY` as **Secrets**.
4. Copy the Worker URL into `scripts/config.js` as above.

Every push that touches `worker/` then redeploys automatically.

## Deploy, option C: GitHub Actions

`.github/workflows/deploy-worker.yml` deploys on every change to `worker/`. Add these
under repo **Settings → Secrets and variables → Actions**:

| Secret                  | Where to get it                                                            |
| ----------------------- | -------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Dashboard → My Profile → API Tokens → template **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Workers & Pages (right-hand sidebar)                           |
| `TMDB_API_KEY`          | TMDb settings                                                              |
| `OMDB_API_KEY`          | OMDb                                                                       |

## Custom domain (API-only setup)

`wrangler.toml` has a commented-out `[[routes]]` block. Uncomment it and set `pattern` to
a hostname one level under your domain (`mmdb-api.example.com`: that is what the free
Universal certificate covers). On `wrangler deploy` Cloudflare creates the proxied DNS
record and the certificate itself, so do not create the record by hand. The domain must
be a zone in the same Cloudflare account. Then put that address in `API_BASE_URL` in
`scripts/config.js` and the site's address in `ALLOWED_ORIGINS` below.

## Which sites may call the API

Set in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://mmdb.davidakerlind.com,https://davidakerlind.github.io"   # comma separated, wildcards like https://*.pages.dev work
ALLOW_LOCALHOST = "true"                              # http://localhost:<any port> for local development
```

Browsers from any other origin get `403 forbidden_origin`. If you host the site
somewhere else (a custom domain, Cloudflare Pages…), add that origin and redeploy.
Remember to use the exact origin: scheme + host, no path and no trailing slash.

> CORS protects you from other **websites** embedding your API. A script that calls
> the Worker directly (curl) isn't a browser and can ignore CORS, so add a rate limit
> (below) if you ever see abuse. Responses are cached at the edge for hours, so
> repeated requests rarely reach TMDb/OMDb at all.

## Endpoints

| Endpoint                     | Returns                                                     | Edge cache |
| ---------------------------- | ----------------------------------------------------------- | ---------- |
| `GET /api/health`            | `{ ok, services }`: shows which secrets are configured      | none       |
| `GET /api/home`              | top 20 movies, trending, 8 trailer slides                   | 6 h        |
| `GET /api/search?q=&page=`   | movies (paged) + people; `mode=suggest` for the dropdown    | 1 h        |
| `GET /api/movie/:id`         | detail + ratings (TMDb id **or** legacy IMDb id `tt…`)       | 12 h       |
| `GET /api/movies?ids=1,2,3`  | summaries for up to 24 ids (favorites)                      | 12 h       |
| `GET /api/person/:id`        | biography + filmography                                     | 24 h       |
| `GET /api/person?name=`      | same, looked up by name (old links)                         | 24 h       |

Errors are always `{ "error": { "code", "message" } }` with a matching HTTP status.

## Optional: rate limiting

Cheapest option, no code: Dashboard → your domain/zone → **Security → WAF → Rate limiting rules**
(or use Cloudflare's Workers Rate Limiting binding, which the code already supports).
To use the binding add this to `wrangler.toml` (see Cloudflare's "Workers Rate Limiting" docs for details):

```toml
[[ratelimits]]
name = "RATE_LIMITER"
namespace_id = "1001"
  [ratelimits.simple]
  limit = 100
  period = 60
```

## Develop and test locally

```bash
cp .dev.vars.example .dev.vars   # put your real keys in .dev.vars (git-ignored)
npm run dev                      # Worker on http://localhost:8787
npm test                         # 37 unit tests (mocked TMDb/OMDb, no keys needed)
npm run dev:mock                 # same Worker code against a built-in fake catalogue, no keys at all
```

To point the site at your local Worker, open it on localhost with
`http://localhost:5502/?api=http://localhost:8787` (the override only works on localhost;
`?api=reset` removes it).

## Troubleshooting

| Symptom                                       | Cause / fix                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Site says "Almost there: connect the API"     | `API_BASE_URL` in `scripts/config.js` still has the `YOUR-SUBDOMAIN` placeholder      |
| Browser console: CORS error / `403`           | Your site's origin isn't in `ALLOWED_ORIGINS`: add it and `wrangler deploy`           |
| `500 not_configured`                          | A secret is missing: run `wrangler secret put TMDB_API_KEY`                           |
| `502 upstream_auth`                           | TMDb rejected the key: re-check it (v3 API Key) and re-run `secret put`               |
| `/api/health` shows `"omdb": false`           | OMDb secret not set: the site still works, it just won't show IMDb / RT ratings       |
| OMDb ratings vanish late in the day           | OMDb's free tier allows 1,000 requests/day; the Worker degrades gracefully            |
