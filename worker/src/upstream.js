// Calls to TMDb and OMDb. API keys only ever live here, server side.

import { HttpError } from "./http.js";

const DEFAULT_TMDB_BASE = "https://api.themoviedb.org/3";
const DEFAULT_OMDB_BASE = "https://www.omdbapi.com/";
const TIMEOUT_MS = 8000;

async function fetchJson(url, init, service) {
    let response;
    try {
        response = await fetch(url, {
            ...init,
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        console.error(`${service} request failed:`, error?.message);
        throw new HttpError(
            504,
            "upstream_unavailable",
            `${service} did not respond in time.`
        );
    }

    if (response.status === 404) {
        throw new HttpError(404, "not_found", "Nothing was found.");
    }
    if (response.status === 401 || response.status === 403) {
        console.error(`${service} rejected the API key (${response.status}).`);
        throw new HttpError(
            502,
            "upstream_auth",
            `${service} rejected the Worker's API key.`
        );
    }
    if (response.status === 429) {
        throw new HttpError(
            503,
            "upstream_rate_limited",
            `${service} rate limit reached. Try again shortly.`,
            { "Retry-After": "30" }
        );
    }
    if (!response.ok) {
        throw new HttpError(
            502,
            "upstream_error",
            `${service} answered with status ${response.status}.`
        );
    }

    try {
        return await response.json();
    } catch {
        throw new HttpError(
            502,
            "upstream_error",
            `${service} returned an unreadable response.`
        );
    }
}

/**
 * TMDb v3. Accepts either a v3 API key or a v4 "read access token"
 * (a JWT starting with "eyJ"), whichever was stored as the secret.
 */
export function tmdb(env, path, params = {}) {
    const key = env.TMDB_API_KEY;
    if (!key) {
        throw new HttpError(
            500,
            "not_configured",
            "The TMDB_API_KEY secret is not set on the Worker."
        );
    }

    const url = new URL(`${env.TMDB_BASE || DEFAULT_TMDB_BASE}${path}`);
    url.searchParams.set("language", "en-US");
    for (const [name, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(name, String(value));
        }
    }

    const headers = { Accept: "application/json" };
    if (key.startsWith("eyJ")) {
        headers.Authorization = `Bearer ${key}`;
    } else {
        url.searchParams.set("api_key", key);
    }

    return fetchJson(url, { headers }, "TMDb");
}

/**
 * OMDb is only used to enrich a movie with IMDb / Rotten Tomatoes ratings,
 * so it is strictly best effort: any failure resolves to null.
 */
export async function omdb(env, params) {
    if (!env.OMDB_API_KEY) return null;

    const url = new URL(env.OMDB_BASE || DEFAULT_OMDB_BASE);
    for (const [name, value] of Object.entries(params)) {
        url.searchParams.set(name, String(value));
    }
    url.searchParams.set("apikey", env.OMDB_API_KEY);

    try {
        const data = await fetchJson(
            url,
            { headers: { Accept: "application/json" } },
            "OMDb"
        );
        return data?.Response === "False" ? null : data;
    } catch {
        return null;
    }
}
