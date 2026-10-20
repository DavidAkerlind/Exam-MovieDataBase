// Public configuration. Nothing in here is secret: the Cloudflare Worker holds
// the TMDb / OMDb keys. After deploying the Worker (see worker/README.md) paste
// its URL below.
export const API_BASE_URL = "https://mmdb-api.YOUR-SUBDOMAIN.workers.dev";

// Poster / backdrop / profile images are served straight from TMDb's CDN.
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
