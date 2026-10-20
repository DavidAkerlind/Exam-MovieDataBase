// The only module that talks to the network. Everything goes through the
// Cloudflare Worker, which holds the TMDb / OMDb keys; no secret ever ships here.
import { API_BASE_URL } from "../config.js";

export class ApiError extends Error {
    constructor(message, { status = 0, code = "network_error" } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
const OVERRIDE_KEY = "mmdb:api";
const CACHE_TTL = 5 * 60 * 1000;
const REQUEST_TIMEOUT = 15000;

/** On localhost only, `?api=http://localhost:8787` points the app at a local Worker. */
function readLocalOverride() {
    if (!LOCAL_HOSTS.includes(window.location.hostname)) return null;
    try {
        const param = new URLSearchParams(window.location.search).get("api");
        if (param === "reset") localStorage.removeItem(OVERRIDE_KEY);
        else if (param) localStorage.setItem(OVERRIDE_KEY, param);
        return localStorage.getItem(OVERRIDE_KEY);
    } catch {
        return null;
    }
}

const baseUrl = (readLocalOverride() || API_BASE_URL).replace(/\/+$/, "");

export const isApiConfigured = () => !baseUrl.includes("YOUR-SUBDOMAIN");

// Open the connection to the API (DNS + TLS) before the first search needs it.
if (isApiConfigured() && typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = new URL(baseUrl).origin;
    link.crossOrigin = "";
    document.head.append(link);
}

/** "  The   GODFATHER " -> "the godfather": more cache hits at every layer. */
export const normalizeQuery = (query) => query.trim().replace(/\s+/g, " ").toLowerCase();

const memo = new Map();

function buildUrl(path, params) {
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            search.set(name, value);
        }
    }
    const query = search.toString();
    return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

async function request(path, params = {}, { signal } = {}) {
    if (!isApiConfigured()) {
        throw new ApiError(
            "The API URL has not been set up yet. Deploy the Worker and add its URL to scripts/config.js.",
            { code: "not_configured" }
        );
    }

    const url = buildUrl(path, params);
    const cached = memo.get(url);
    if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;

    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let response;
    try {
        response = await fetch(url, {
            signal: combined,
            headers: { Accept: "application/json" },
        });
    } catch (error) {
        if (signal?.aborted) throw error; // caller cancelled: let it through untouched
        throw new ApiError("Couldn't reach the movie service. Check your connection.", {
            code: "network_error",
        });
    }

    let body = null;
    try {
        body = await response.json();
    } catch {
        /* handled below */
    }

    if (!response.ok) {
        throw new ApiError(
            body?.error?.message || `The movie service answered with ${response.status}.`,
            { status: response.status, code: body?.error?.code || "http_error" }
        );
    }
    if (body === null) {
        throw new ApiError("The movie service sent an unreadable answer.", {
            status: response.status,
            code: "bad_response",
        });
    }

    memo.set(url, { time: Date.now(), data: body });
    return body;
}

/** Trailer slides, the top 20 list and this week's trending movies. */
export const fetchHome = () => request("/api/home");

/** Movies (+ people on page 1) matching a text query. */
export const searchAll = (query, { page = 1, signal } = {}) =>
    request("/api/search", { q: normalizeQuery(query), page }, { signal });

/** Synchronous cache lookups: let the UI paint results before any await. */
export function peekSearch(query, page = 1) {
    const hit = memo.get(buildUrl("/api/search", { q: normalizeQuery(query), page }));
    return hit && Date.now() - hit.time < CACHE_TTL ? hit.data : null;
}

/** Lightweight results for the search-as-you-type dropdown. */
export const suggest = (query, { signal } = {}) =>
    request("/api/search", { q: normalizeQuery(query), mode: "suggest" }, { signal });

export function peekSuggest(query) {
    const hit = memo.get(buildUrl("/api/search", { q: normalizeQuery(query), mode: "suggest" }));
    return hit && Date.now() - hit.time < CACHE_TTL ? hit.data : null;
}

/** Warm the HTTP cache for a page the visitor is about to open. */
const prefetched = new Set();
function prefetch(path) {
    if (prefetched.has(path) || !isApiConfigured()) return;
    prefetched.add(path);
    request(path).catch(() => prefetched.delete(path));
}
export const prefetchMovie = (id) => prefetch(`/api/movie/${encodeURIComponent(id)}`);
export const prefetchPerson = (id) => prefetch(`/api/person/${encodeURIComponent(id)}`);

/** Full detail for one movie. Accepts a TMDb id or a legacy IMDb id. */
export const fetchMovie = (id) => request(`/api/movie/${encodeURIComponent(id)}`);

/** Summaries for a list of ids (used by favorites). Sent in chunks of 24. */
export async function fetchMovies(ids) {
    const chunks = [];
    for (let i = 0; i < ids.length; i += 24) chunks.push(ids.slice(i, i + 24));

    const results = await Promise.all(
        chunks.map((chunk) => request("/api/movies", { ids: chunk.join(",") }))
    );
    return results.flatMap((result) => result.movies);
}

export const fetchPerson = (id) => request(`/api/person/${encodeURIComponent(id)}`);

/** Legacy links used ?name=; the Worker resolves the name to a person. */
export const fetchPersonByName = (name) => request("/api/person", { name });
