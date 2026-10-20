// Entry point: CORS, optional rate limiting, edge caching and routing.

import {
    HttpError,
    errorResponse,
    isOriginAllowed,
    corsHeaders,
    jsonResponse,
} from "./http.js";
import { routes } from "./routes.js";

function getCache(env) {
    return env.CACHE_STORE ?? globalThis.caches?.default ?? null;
}

/** Cache key without any secrets: same path + sorted query => same entry. */
function cacheKeyFor(url) {
    const params = [...url.searchParams.entries()].sort(([a], [b]) =>
        a.localeCompare(b)
    );
    const query = new URLSearchParams(params).toString();
    return new Request(`https://cache.mmdb.invalid${url.pathname}?${query}`);
}

async function enforceRateLimit(request, env) {
    if (!env.RATE_LIMITER?.limit) return;

    const key = request.headers.get("CF-Connecting-IP") || "anonymous";
    const { success } = await env.RATE_LIMITER.limit({ key });
    if (!success) {
        throw new HttpError(
            429,
            "rate_limited",
            "Too many requests. Please slow down.",
            { "Retry-After": "60" }
        );
    }
}

export async function handleRequest(request, env = {}, ctx) {
    const origin = request.headers.get("Origin");

    try {
        if (request.method === "OPTIONS") {
            if (!isOriginAllowed(origin, env)) {
                throw new HttpError(403, "forbidden_origin", "Origin not allowed.");
            }
            return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
        }
        if (request.method !== "GET" && request.method !== "HEAD") {
            throw new HttpError(405, "method_not_allowed", "Only GET is supported.", {
                Allow: "GET, HEAD, OPTIONS",
            });
        }
        // Browsers always send Origin on cross-site fetches; reject unknown sites.
        if (origin && !isOriginAllowed(origin, env)) {
            throw new HttpError(403, "forbidden_origin", "Origin not allowed.");
        }

        const url = new URL(request.url);
        const path = url.pathname.replace(/\/+$/, "") || "/";

        if (path === "/") {
            return jsonResponse(
                { name: "mmdb-api", endpoints: routes.map((r) => String(r.pattern)) },
                { origin, env }
            );
        }

        let match = null;
        const route = routes.find((candidate) => (match = path.match(candidate.pattern)));
        if (!route) throw new HttpError(404, "not_found", "Unknown endpoint.");

        await enforceRateLimit(request, env);

        const cache = route.ttl > 0 ? getCache(env) : null;
        const key = cache ? cacheKeyFor(url) : null;

        let data;
        let cacheStatus = "BYPASS";
        const hit = cache ? await cache.match(key) : null;

        if (hit) {
            data = await hit.json();
            cacheStatus = "HIT";
        } else {
            data = await route.handler({
                env,
                query: url.searchParams,
                params: match.slice(1),
            });

            if (cache) {
                cacheStatus = "MISS";
                const stored = new Response(JSON.stringify(data), {
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": `public, max-age=${route.ttl}`,
                    },
                });
                const write = cache.put(key, stored);
                if (ctx?.waitUntil) ctx.waitUntil(write);
                else await write;
            }
        }

        return jsonResponse(data, {
            origin,
            env,
            cacheControl: route.ttl
                ? "public, max-age=300, stale-while-revalidate=3600"
                : "no-store",
            extra: { "X-Cache": cacheStatus },
        });
    } catch (error) {
        return errorResponse(error, { origin, env });
    }
}

export default {
    fetch: (request, env, ctx) => handleRequest(request, env, ctx),
};
