// Small HTTP helpers: errors, CORS and JSON responses.

export class HttpError extends Error {
    constructor(status, code, message, headers = {}) {
        super(message);
        this.status = status;
        this.code = code;
        this.headers = headers;
    }
}

const SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Cross-Origin-Resource-Policy": "cross-origin",
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function matchesPattern(pattern, url) {
    if (pattern === url.origin) return true;
    // "https://*.example.com" matches any subdomain of example.com
    const wildcard = pattern.match(/^(https?):\/\/\*\.(.+)$/);
    return (
        !!wildcard &&
        url.protocol === `${wildcard[1]}:` &&
        url.hostname.endsWith(`.${wildcard[2]}`)
    );
}

export function isOriginAllowed(origin, env = {}) {
    if (!origin) return false;

    let url;
    try {
        url = new URL(origin);
    } catch {
        return false;
    }
    if (url.origin !== origin) return false;

    const allowLocalhost = String(env.ALLOW_LOCALHOST).toLowerCase() === "true";
    if (
        allowLocalhost &&
        url.protocol === "http:" &&
        LOCAL_HOSTS.has(url.hostname)
    ) {
        return true;
    }

    return String(env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .some((pattern) => matchesPattern(pattern, url));
}

export function corsHeaders(origin, env) {
    const headers = { Vary: "Origin" };
    if (isOriginAllowed(origin, env)) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS";
        headers["Access-Control-Allow-Headers"] = "Content-Type";
        headers["Access-Control-Max-Age"] = "86400";
    }
    return headers;
}

export function jsonResponse(
    data,
    { status = 200, origin, env, cacheControl = "no-store", extra = {} } = {}
) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": cacheControl,
            ...SECURITY_HEADERS,
            ...corsHeaders(origin, env),
            ...extra,
        },
    });
}

export function errorResponse(error, { origin, env } = {}) {
    const known = error instanceof HttpError;
    if (!known) console.error("Unhandled error:", error);

    const status = known ? error.status : 500;
    const code = known ? error.code : "internal_error";
    const message = known ? error.message : "Something went wrong.";

    return jsonResponse(
        { error: { code, message } },
        { status, origin, env, extra: known ? error.headers : {} }
    );
}
