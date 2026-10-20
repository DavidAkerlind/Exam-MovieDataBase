// Public configuration. Nothing in here is secret: the Cloudflare Worker holds
// the TMDb / OMDb keys. This is the Worker's custom domain (see worker/wrangler.toml
// and worker/README.md); use its https://mmdb-api.<subdomain>.workers.dev URL instead
// if you deploy without a custom domain.
export const API_BASE_URL = "https://mmdb-api.davidakerlind.com";

// Poster / backdrop / profile images are served straight from TMDb's CDN.
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
