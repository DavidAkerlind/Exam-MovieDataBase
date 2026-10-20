// Public configuration. Nothing in here is secret: the Cloudflare Worker holds
// the TMDb / OMDb keys.
//
// "" means the API lives on the same address as the site (/api/...), which is how
// the single Cloudflare Worker in wrangler.toml serves everything. Only set a full
// URL (e.g. "https://mmdb-api.example.com") if you host the API separately, see
// worker/README.md.
export const API_BASE_URL = "";

// Poster / backdrop / profile images are served straight from TMDb's CDN.
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
