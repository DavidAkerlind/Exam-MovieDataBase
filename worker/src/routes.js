// Route handlers. Each receives { env, query, params } and returns plain JSON data.

import { HttpError } from "./http.js";
import { tmdb, omdb } from "./upstream.js";
import {
    movieSummary,
    personSummary,
    trailerSlide,
    movieDetail,
    personDetail,
} from "./normalize.js";

const HOUR = 3600;
const MOVIE_ID = /^(\d{1,9}|tt\d{6,10})$/;
const PERSON_ID = /^\d{1,9}$/;
const MAX_BATCH = 24;

function requireText(query, name, max = 100) {
    const value = (query.get(name) || "").trim();
    if (!value) {
        throw new HttpError(400, "bad_request", `Missing "${name}" parameter.`);
    }
    if (value.length > max) {
        throw new HttpError(400, "bad_request", `"${name}" is too long.`);
    }
    return value;
}

function pageNumber(query) {
    const page = Number(query.get("page") || 1);
    if (!Number.isInteger(page) || page < 1 || page > 50) {
        throw new HttpError(400, "bad_request", `"page" must be 1-50.`);
    }
    return page;
}

/** Accepts a TMDb id or a legacy IMDb id ("tt0111161") and returns the TMDb id. */
async function resolveMovieId(env, id) {
    if (!MOVIE_ID.test(id)) {
        throw new HttpError(400, "bad_request", "Invalid movie id.");
    }
    if (!id.startsWith("tt")) return Number(id);

    const found = await tmdb(env, `/find/${id}`, { external_source: "imdb_id" });
    const hit = found.movie_results?.[0];
    if (!hit) throw new HttpError(404, "not_found", "No movie matches that IMDb id.");
    return hit.id;
}

async function health({ env }) {
    return {
        ok: true,
        services: { tmdb: Boolean(env.TMDB_API_KEY), omdb: Boolean(env.OMDB_API_KEY) },
    };
}

async function home({ env }) {
    const [top, trending] = await Promise.all([
        tmdb(env, "/movie/top_rated", { page: 1 }),
        tmdb(env, "/trending/movie/week"),
    ]);

    // Trailers come from the top-rated list first, trending fills any gaps.
    const candidates = [
        ...top.results.slice(0, 10),
        ...trending.results.slice(0, 4),
    ];
    const withVideos = await Promise.all(
        candidates.map(async (movie) => {
            try {
                return trailerSlide(movie, await tmdb(env, `/movie/${movie.id}/videos`));
            } catch {
                return null;
            }
        })
    );
    const seen = new Set();
    const trailers = withVideos
        .filter((slide) => slide && !seen.has(slide.id) && seen.add(slide.id))
        .slice(0, 8);

    return {
        trailers,
        top: top.results.slice(0, 20).map(movieSummary),
        trending: trending.results.slice(0, 20).map(movieSummary),
    };
}

async function search({ env, query }) {
    const q = requireText(query, "q");
    const suggest = query.get("mode") === "suggest";
    const page = suggest ? 1 : pageNumber(query);

    const [movies, people] = await Promise.all([
        tmdb(env, "/search/movie", { query: q, page, include_adult: false }),
        page === 1
            ? tmdb(env, "/search/person", { query: q, include_adult: false })
            : { results: [] },
    ]);

    const movieLimit = suggest ? 6 : movies.results.length;
    const peopleLimit = suggest ? 3 : 8;

    return {
        query: q,
        page,
        totalPages: Math.min(movies.total_pages || 0, 50),
        totalResults: movies.total_results || 0,
        movies: movies.results.slice(0, movieLimit).map(movieSummary),
        people: people.results.slice(0, peopleLimit).map(personSummary),
    };
}

const MOVIE_APPENDS = "videos,credits,external_ids,recommendations,release_dates";

async function movie({ env, params }) {
    const id = await resolveMovieId(env, params[0]);
    const details = await tmdb(env, `/movie/${id}`, {
        append_to_response: MOVIE_APPENDS,
    });

    const imdbId = details.imdb_id || details.external_ids?.imdb_id;
    const extra = imdbId ? await omdb(env, { i: imdbId }) : null;

    return movieDetail(details, extra);
}

async function movies({ env, query }) {
    const requested = [
        ...new Set(
            (query.get("ids") || "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
        ),
    ];
    if (requested.length === 0) {
        throw new HttpError(400, "bad_request", `Missing "ids" parameter.`);
    }
    if (requested.length > MAX_BATCH) {
        throw new HttpError(400, "bad_request", `At most ${MAX_BATCH} ids per request.`);
    }
    if (!requested.every((id) => MOVIE_ID.test(id))) {
        throw new HttpError(400, "bad_request", "Invalid movie id.");
    }

    const settled = await Promise.allSettled(
        requested.map(async (requestedId) => {
            const id = await resolveMovieId(env, requestedId);
            const details = await tmdb(env, `/movie/${id}`);
            return {
                ...movieSummary(details),
                requestedId,
                runtime: details.runtime || null,
                genres: (details.genres || []).map((genre) => genre.name),
            };
        })
    );

    return {
        movies: settled
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value),
    };
}

async function loadPerson(env, id) {
    const details = await tmdb(env, `/person/${id}`, {
        append_to_response: "movie_credits",
    });
    return personDetail(details);
}

async function person({ env, query, params }) {
    if (params[0] !== undefined) {
        if (!PERSON_ID.test(params[0])) {
            throw new HttpError(400, "bad_request", "Invalid person id.");
        }
        return loadPerson(env, params[0]);
    }

    // Legacy lookup by name (old links used ?name=).
    const name = requireText(query, "name");
    const found = await tmdb(env, "/search/person", { query: name });
    const match = found.results?.[0];
    if (!match) throw new HttpError(404, "not_found", "Nobody by that name was found.");
    return loadPerson(env, match.id);
}

export const routes = [
    { pattern: /^\/api\/health$/, ttl: 0, handler: health },
    { pattern: /^\/api\/home$/, ttl: 6 * HOUR, handler: home },
    { pattern: /^\/api\/search$/, ttl: HOUR, handler: search },
    { pattern: /^\/api\/movies$/, ttl: 12 * HOUR, handler: movies },
    { pattern: /^\/api\/movie\/([^/]+)$/, ttl: 12 * HOUR, handler: movie },
    { pattern: /^\/api\/person$/, ttl: 24 * HOUR, handler: person },
    { pattern: /^\/api\/person\/([^/]+)$/, ttl: 24 * HOUR, handler: person },
];
