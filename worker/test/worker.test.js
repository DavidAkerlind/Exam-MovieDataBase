import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { handleRequest } from "../src/index.js";
import { createUpstream } from "./upstream-mock.js";

const ORIGIN = "https://davidakerlind.github.io";
const TMDB_KEY = "tmdb-secret-key-1234567890abcdef";
const OMDB_KEY = "omdb-secret-key";

const baseEnv = () => ({
    TMDB_API_KEY: TMDB_KEY,
    OMDB_API_KEY: OMDB_KEY,
    ALLOWED_ORIGINS: ORIGIN,
    ALLOW_LOCALHOST: "true",
});

let upstream;
const realFetch = globalThis.fetch;

beforeEach(() => {
    upstream = createUpstream();
    globalThis.fetch = upstream.fetch;
});
process.on("exit", () => {
    globalThis.fetch = realFetch;
});

async function call(path, { env = baseEnv(), origin = ORIGIN, method = "GET", headers = {} } = {}) {
    const request = new Request(`https://api.test${path}`, {
        method,
        headers: { ...(origin ? { Origin: origin } : {}), ...headers },
    });
    const response = await handleRequest(request, env, undefined);
    const text = await response.text();
    let body = null;
    try {
        body = JSON.parse(text);
    } catch {
        /* empty body */
    }
    return { response, body, text };
}

// ---------------------------------------------------------------- CORS

test("allows the configured origin and echoes it back", async () => {
    const { response } = await call("/api/health");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), ORIGIN);
    assert.equal(response.headers.get("vary"), "Origin");
});

test("allows localhost on any port when ALLOW_LOCALHOST is true", async () => {
    for (const origin of ["http://localhost:5502", "http://127.0.0.1:8080"]) {
        const { response } = await call("/api/health", { origin });
        assert.equal(response.status, 200, origin);
        assert.equal(response.headers.get("access-control-allow-origin"), origin);
    }
});

test("blocks localhost when ALLOW_LOCALHOST is off", async () => {
    const env = { ...baseEnv(), ALLOW_LOCALHOST: "false" };
    const { response, body } = await call("/api/health", { env, origin: "http://localhost:3000" });
    assert.equal(response.status, 403);
    assert.equal(body.error.code, "forbidden_origin");
    assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("blocks other websites, including look-alike origins", async () => {
    for (const origin of [
        "https://evil.example",
        "https://davidakerlind.github.io.evil.example",
        "http://davidakerlind.github.io",
        "null",
    ]) {
        const { response } = await call("/api/home", { origin });
        assert.equal(response.status, 403, origin);
    }
});

test("supports wildcard subdomain patterns", async () => {
    const env = { ...baseEnv(), ALLOWED_ORIGINS: "https://*.pages.dev" };
    assert.equal((await call("/api/health", { env, origin: "https://mmdb.pages.dev" })).response.status, 200);
    assert.equal((await call("/api/health", { env, origin: "https://pages.dev" })).response.status, 403);
});

test("answers preflight requests", async () => {
    const { response } = await call("/api/search", { method: "OPTIONS" });
    assert.equal(response.status, 204);
    assert.match(response.headers.get("access-control-allow-methods"), /GET/);

    const denied = await call("/api/search", { method: "OPTIONS", origin: "https://evil.example" });
    assert.equal(denied.response.status, 403);
});

test("allows requests without an Origin header (curl, same-origin)", async () => {
    const { response } = await call("/api/health", { origin: null });
    assert.equal(response.status, 200);
});

test("rejects non-GET methods", async () => {
    const { response, body } = await call("/api/home", { method: "POST" });
    assert.equal(response.status, 405);
    assert.equal(body.error.code, "method_not_allowed");
});

test("unknown routes are 404", async () => {
    const { response, body } = await call("/api/nope");
    assert.equal(response.status, 404);
    assert.equal(body.error.code, "not_found");
});

// ---------------------------------------------------------- validation

test("validates search parameters", async () => {
    assert.equal((await call("/api/search")).response.status, 400);
    assert.equal((await call("/api/search?q=%20%20")).response.status, 400);
    assert.equal((await call(`/api/search?q=${"a".repeat(101)}`)).response.status, 400);
    assert.equal((await call("/api/search?q=matrix&page=0")).response.status, 400);
    assert.equal((await call("/api/search?q=matrix&page=51")).response.status, 400);
    assert.equal((await call("/api/search?q=matrix&page=abc")).response.status, 400);
});

test("validates ids", async () => {
    assert.equal((await call("/api/movie/abc")).response.status, 400);
    assert.equal((await call("/api/movie/12345678901")).response.status, 400);
    assert.equal((await call("/api/person/abc")).response.status, 400);
    assert.equal((await call("/api/movies")).response.status, 400);
    assert.equal((await call("/api/movies?ids=1,2,x")).response.status, 400);
    const tooMany = Array.from({ length: 25 }, (_, i) => i + 1).join(",");
    assert.equal((await call(`/api/movies?ids=${tooMany}`)).response.status, 400);
    assert.equal(upstream.calls.length, 0, "invalid input must never reach the upstream APIs");
});

// ----------------------------------------------------------------- home

test("home returns top 20, trending and trailer slides", async () => {
    const { response, body } = await call("/api/home");
    assert.equal(response.status, 200);
    assert.equal(body.top.length, 20);
    assert.ok(body.trending.length > 0);
    assert.ok(body.trailers.length >= 5 && body.trailers.length <= 8);

    const slide = body.trailers[0];
    assert.ok(slide.backdrop && slide.title);
    // official Trailer beats Teaser
    assert.equal(slide.trailer.key, `yt${slide.id}`);
    assert.deepEqual(Object.keys(body.top[0]).sort(), [
        "backdrop", "id", "overview", "poster", "rating", "releaseDate", "title", "votes", "year",
    ]);
    assert.equal(body.top[0].year, 1994);
    assert.equal(body.top[0].rating, 8.7);
});

test("home does not duplicate slides", async () => {
    const { body } = await call("/api/home");
    const ids = body.trailers.map((slide) => slide.id);
    assert.equal(new Set(ids).size, ids.length);
});

// --------------------------------------------------------------- search

test("search returns movies and people", async () => {
    const { response, body } = await call("/api/search?q=god");
    assert.equal(response.status, 200);
    assert.deepEqual(body.movies.map((m) => m.title), ["The Godfather", "The Godfather Part II"]);
    assert.equal(body.query, "god");
    assert.equal(body.page, 1);

    const people = await call("/api/search?q=pacino");
    assert.equal(people.body.people[0].name, "Al Pacino");
    assert.ok(people.body.people[0].knownFor.includes("The Godfather"));
});

test("suggest mode is capped and only queries page one", async () => {
    const { body } = await call("/api/search?q=the&mode=suggest");
    assert.ok(body.movies.length <= 6);
    assert.ok(body.people.length <= 3);
});

test("search pages beyond the first skip the people lookup", async () => {
    await call("/api/search?q=the&page=2");
    assert.ok(!upstream.calls.some((url) => url.pathname.endsWith("/search/person")));
});

// ---------------------------------------------------------------- movie

test("movie detail merges TMDb and OMDb data", async () => {
    const { response, body } = await call("/api/movie/278");
    assert.equal(response.status, 200);
    assert.equal(body.title, "The Shawshank Redemption");
    assert.equal(body.imdbId, "tt0111161");
    assert.equal(body.year, 1994);
    assert.equal(body.runtime, 142);
    assert.deepEqual(body.genres, ["Drama", "Crime"]);
    assert.equal(body.rated, "R");
    assert.equal(body.ratings.imdb, 9.1);
    assert.equal(body.ratings.rottenTomatoes, 91);
    assert.equal(body.ratings.metascore, 82);
    assert.equal(body.ratings.imdbVotes, 2900000);
    assert.equal(body.ratings.tmdb, 8.7);
    assert.match(body.awards, /Oscars/);
    assert.equal(body.trailer.key, "yt278");
    assert.deepEqual(body.directors, [{ id: 9, name: "Frank Darabont" }]);
    assert.deepEqual(body.writers, [{ id: 9, name: "Frank Darabont" }]);
    assert.equal(body.cast[0].name, "Tim Robbins");
    assert.equal(body.cast[0].profile, "/profile-1.jpg");
    assert.ok(body.similar.length > 0 && body.similar.every((m) => m.id !== 278));
});

test("movie detail still works when OMDb is down", async () => {
    upstream.fail.add("omdb");
    const { response, body } = await call("/api/movie/278");
    assert.equal(response.status, 200);
    assert.equal(body.ratings.imdb, null);
    assert.equal(body.ratings.rottenTomatoes, null);
    assert.equal(body.ratings.tmdb, 8.7);
    assert.equal(body.rated, "R", "falls back to the TMDb certification");
});

test("movie detail works without an OMDb key configured", async () => {
    const env = baseEnv();
    delete env.OMDB_API_KEY;
    const { response, body } = await call("/api/movie/278", { env });
    assert.equal(response.status, 200);
    assert.equal(body.ratings.imdb, null);
    assert.ok(!upstream.calls.some((url) => url.hostname === "www.omdbapi.com"));
});

test("legacy IMDb ids resolve to the same movie", async () => {
    const { response, body } = await call("/api/movie/tt0111161");
    assert.equal(response.status, 200);
    assert.equal(body.id, 278);
});

test("unknown movies are 404", async () => {
    assert.equal((await call("/api/movie/999999")).response.status, 404);
    assert.equal((await call("/api/movie/tt9999999")).response.status, 404);
});

// --------------------------------------------------------------- movies

test("batch lookup keeps order, mixes id kinds and skips unknown ids", async () => {
    const { response, body } = await call("/api/movies?ids=tt0068646,278,999999");
    assert.equal(response.status, 200);
    assert.deepEqual(body.movies.map((m) => m.id), [238, 278]);
    assert.deepEqual(body.movies.map((m) => m.requestedId), ["tt0068646", "278"]);
    assert.ok(body.movies[0].runtime && body.movies[0].genres.length);
});

// --------------------------------------------------------------- person

test("person detail for an actor lists acting credits by popularity", async () => {
    const { response, body } = await call("/api/person/5");
    assert.equal(response.status, 200);
    assert.equal(body.name, "Christian Bale");
    assert.equal(body.profile, "/profile-5.jpg");
    assert.ok(body.credits.length >= 3);
    assert.equal(body.credits[0].title, "Interstellar");
    assert.ok(body.credits.some((c) => c.role === "The Joker") === false);
    assert.ok(body.credits.every((c) => c.id && c.year));
    assert.ok(!("popularity" in body.credits[0]));
});

test("person detail for a director lists directing credits", async () => {
    const { body } = await call("/api/person/8");
    assert.equal(body.department, "Directing");
    assert.ok(body.credits.length >= 3);
    assert.ok(body.credits.every((credit) => credit.role === "Director"));
});

test("deceased people carry a deathday", async () => {
    const { body } = await call("/api/person/6");
    assert.equal(body.deathday, "2008-01-22");
});

test("person lookup by name (legacy links)", async () => {
    const { response, body } = await call("/api/person?name=Morgan%20Freeman");
    assert.equal(response.status, 200);
    assert.equal(body.id, 2);
    assert.equal((await call("/api/person?name=Nobody%20Atall")).response.status, 404);
    assert.equal((await call("/api/person")).response.status, 400);
});

// ------------------------------------------------------ failure handling

test("a rejected upstream key is reported as a 502 without leaking details", async () => {
    upstream.fail.add("tmdb");
    const { response, body, text } = await call("/api/home");
    assert.equal(response.status, 502);
    assert.equal(body.error.code, "upstream_auth");
    assert.ok(!text.includes(TMDB_KEY));
});

test("a missing TMDb secret is a clear 500", async () => {
    const env = baseEnv();
    delete env.TMDB_API_KEY;
    const { response, body } = await call("/api/home", { env });
    assert.equal(response.status, 500);
    assert.equal(body.error.code, "not_configured");
});

test("network failures become 504", async () => {
    globalThis.fetch = async () => {
        throw new TypeError("network down");
    };
    const { response, body } = await call("/api/search?q=matrix");
    assert.equal(response.status, 504);
    assert.equal(body.error.code, "upstream_unavailable");
});

test("upstream rate limiting maps to 503 with Retry-After", async () => {
    globalThis.fetch = async () => new Response("{}", { status: 429 });
    const { response, body } = await call("/api/search?q=matrix");
    assert.equal(response.status, 503);
    assert.equal(body.error.code, "upstream_rate_limited");
    assert.equal(response.headers.get("retry-after"), "30");
});

// ---------------------------------------------------------------- secrets

test("API keys are sent upstream but never returned to the client", async () => {
    const paths = ["/api/home", "/api/search?q=god", "/api/movie/278", "/api/movies?ids=278", "/api/person/5"];
    for (const path of paths) {
        const { text, response } = await call(path);
        assert.ok(!text.includes(TMDB_KEY), path);
        assert.ok(!text.includes(OMDB_KEY), path);
        assert.ok(![...response.headers.values()].join("\n").includes(TMDB_KEY), path);
    }
    const tmdbCalls = upstream.calls.filter((url) => url.hostname === "api.themoviedb.org");
    assert.ok(tmdbCalls.length > 0);
    assert.ok(tmdbCalls.every((url) => url.searchParams.get("api_key") === TMDB_KEY));
    const omdbCalls = upstream.calls.filter((url) => url.hostname === "www.omdbapi.com");
    assert.ok(omdbCalls.every((url) => url.searchParams.get("apikey") === OMDB_KEY));
});

test("a TMDb v4 read token is sent as a Bearer header instead of a query param", async () => {
    const token = "eyJhbGciOiJIUzI1NiJ9.payload.signature";
    const seen = [];
    globalThis.fetch = async (input, init) => {
        seen.push({ url: new URL(input.url ?? String(input)), headers: init.headers });
        return upstream.fetch(input);
    };
    await call("/api/search?q=god", { env: { ...baseEnv(), TMDB_API_KEY: token } });
    assert.ok(seen.length > 0);
    for (const { url, headers } of seen) {
        assert.equal(url.searchParams.get("api_key"), null);
        assert.equal(headers.Authorization, `Bearer ${token}`);
    }
});

// -------------------------------------------------------- caching / limits

function fakeCache() {
    const store = new Map();
    return {
        store,
        async match(request) {
            const hit = store.get(request.url);
            return hit ? hit.clone() : undefined;
        },
        async put(request, response) {
            store.set(request.url, response);
        },
    };
}

test("responses are cached at the edge and the key ignores param order", async () => {
    const env = { ...baseEnv(), CACHE_STORE: fakeCache() };

    const first = await call("/api/search?q=god&page=1", { env });
    assert.equal(first.response.headers.get("x-cache"), "MISS");
    const callsAfterFirst = upstream.calls.length;

    const second = await call("/api/search?page=1&q=god", { env });
    assert.equal(second.response.headers.get("x-cache"), "HIT");
    assert.equal(upstream.calls.length, callsAfterFirst, "no extra upstream calls on a hit");
    assert.deepEqual(second.body, first.body);

    for (const key of env.CACHE_STORE.store.keys()) {
        assert.ok(!key.includes(TMDB_KEY) && !key.includes(OMDB_KEY));
    }
});

test("cached responses still get CORS headers for the requesting origin", async () => {
    const env = { ...baseEnv(), CACHE_STORE: fakeCache() };
    await call("/api/home", { env });
    const { response } = await call("/api/home", { env, origin: "http://localhost:5502" });
    assert.equal(response.headers.get("x-cache"), "HIT");
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5502");
});

test("errors are not cached", async () => {
    const env = { ...baseEnv(), CACHE_STORE: fakeCache() };
    upstream.fail.add("tmdb");
    await call("/api/home", { env });
    assert.equal(env.CACHE_STORE.store.size, 0);
});

test("the rate limiter binding returns 429 when exhausted", async () => {
    const env = { ...baseEnv(), RATE_LIMITER: { limit: async () => ({ success: false }) } };
    const { response, body } = await call("/api/home", { env });
    assert.equal(response.status, 429);
    assert.equal(body.error.code, "rate_limited");
    assert.equal(upstream.calls.length, 0);
});

test("security headers are set on every response", async () => {
    const { response } = await call("/api/health");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
});
