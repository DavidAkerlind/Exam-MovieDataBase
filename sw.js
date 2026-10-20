// Service worker: makes MMDb installable and lets pages you've already visited
// open offline. Strategy is "network first" so a fresh deploy is never hidden
// behind a stale cache; the cache is only a fallback.
const VERSION = "mmdb-v1";
const CACHES = {
    pages: `${VERSION}-pages`,
    images: `${VERSION}-images`,
    api: `${VERSION}-api`,
};
const MAX_IMAGES = 250;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keep = new Set(Object.values(CACHES));
            for (const key of await caches.keys()) {
                if (!keep.has(key)) await caches.delete(key);
            }
            await self.clients.claim();
        })()
    );
});

const cacheable = (response) =>
    response && (response.ok || response.type === "opaque");

async function networkFirst(cacheName, request) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        if (cacheable(response)) cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cache.match(request, { ignoreSearch: false });
        if (cached) return cached;
        throw error;
    }
}

async function staleWhileRevalidate(cacheName, request, limit) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const refresh = fetch(request)
        .then(async (response) => {
            if (cacheable(response)) {
                await cache.put(request, response.clone());
                if (limit) trim(cache, limit);
            }
            return response;
        })
        .catch(() => cached);
    return cached || refresh;
}

async function trim(cache, limit) {
    const keys = await cache.keys();
    for (const key of keys.slice(0, Math.max(0, keys.length - limit))) {
        await cache.delete(key);
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.hostname === "image.tmdb.org") {
        event.respondWith(staleWhileRevalidate(CACHES.images, request, MAX_IMAGES));
    } else if (url.pathname.startsWith("/api/") && url.origin !== self.location.origin) {
        event.respondWith(networkFirst(CACHES.api, request));
    } else if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(CACHES.pages, request));
    }
});
