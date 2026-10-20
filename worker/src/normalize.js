// Turns raw TMDb / OMDb payloads into the small, stable shapes the UI uses.
// Image fields are TMDb file paths ("/abc.jpg"); the client picks the size.

const yearOf = (date) => (/^\d{4}/.test(date || "") ? Number(date.slice(0, 4)) : null);
const round1 = (n) => Math.round(n * 10) / 10;
const clip = (text, max) =>
    text && text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text || "";

export function movieSummary(movie) {
    const hasRating =
        movie.vote_count > 0 && typeof movie.vote_average === "number";

    return {
        id: movie.id,
        title: movie.title || movie.name || "Untitled",
        year: yearOf(movie.release_date),
        releaseDate: movie.release_date || null,
        rating: hasRating ? round1(movie.vote_average) : null,
        votes: movie.vote_count || 0,
        poster: movie.poster_path || null,
        backdrop: movie.backdrop_path || null,
        overview: clip(movie.overview, 220),
    };
}

export function personSummary(person) {
    return {
        id: person.id,
        name: person.name,
        profile: person.profile_path || null,
        department: person.known_for_department || null,
        knownFor: (person.known_for || [])
            .map((work) => work.title || work.name)
            .filter(Boolean)
            .slice(0, 3),
    };
}

const TRAILER_TYPES = ["Trailer", "Teaser"];

/** Picks the best YouTube trailer: official trailers first, then teasers. */
export function pickTrailer(videos) {
    const candidates = (videos?.results || []).filter(
        (video) =>
            video.site === "YouTube" &&
            video.key &&
            TRAILER_TYPES.includes(video.type)
    );
    const rank = (video) =>
        TRAILER_TYPES.indexOf(video.type) * 2 + (video.official ? 0 : 1);
    candidates.sort((a, b) => rank(a) - rank(b));

    const best = candidates[0];
    return best ? { key: best.key, name: best.name } : null;
}

export function trailerSlide(movie, videos) {
    const trailer = pickTrailer(videos);
    if (!trailer || !movie.backdrop_path) return null;
    return { ...movieSummary(movie), trailer };
}

export function omdbRatings(data) {
    if (!data || data.Response === "False") return null;

    const number = (value) => {
        const parsed = parseFloat(String(value ?? "").replace(/,/g, ""));
        return Number.isFinite(parsed) ? parsed : null;
    };
    const rating = (source) =>
        data.Ratings?.find((entry) => entry.Source === source)?.Value;
    const text = (value) => (value && value !== "N/A" ? value : null);

    return {
        imdb: number(data.imdbRating),
        imdbVotes: number(data.imdbVotes),
        rottenTomatoes: number(rating("Rotten Tomatoes")),
        metascore: number(data.Metascore),
        rated: text(data.Rated),
        awards: text(data.Awards),
    };
}

function usCertification(releaseDates) {
    const us = releaseDates?.results?.find((entry) => entry.iso_3166_1 === "US");
    return (
        us?.release_dates?.map((release) => release.certification).find(Boolean) ||
        null
    );
}

function uniqueBy(list, key) {
    const seen = new Set();
    return list.filter((item) => !seen.has(item[key]) && seen.add(item[key]));
}

const WRITER_JOBS = new Set(["Screenplay", "Writer", "Story", "Novel"]);

export function movieDetail(movie, omdbData) {
    const extra = omdbRatings(omdbData);
    const crew = movie.credits?.crew || [];
    const person = ({ id, name }) => ({ id, name });

    return {
        ...movieSummary(movie),
        overview: movie.overview || "",
        imdbId: movie.imdb_id || movie.external_ids?.imdb_id || null,
        tagline: movie.tagline || "",
        runtime: movie.runtime || null,
        genres: (movie.genres || []).map((genre) => genre.name),
        rated: extra?.rated || usCertification(movie.release_dates),
        awards: extra?.awards || null,
        ratings: {
            tmdb: movieSummary(movie).rating,
            imdb: extra?.imdb ?? null,
            imdbVotes: extra?.imdbVotes ?? null,
            rottenTomatoes: extra?.rottenTomatoes ?? null,
            metascore: extra?.metascore ?? null,
        },
        trailer: pickTrailer(movie.videos),
        directors: uniqueBy(
            crew.filter((member) => member.job === "Director"),
            "id"
        ).map(person),
        writers: uniqueBy(
            crew.filter((member) => WRITER_JOBS.has(member.job)),
            "id"
        )
            .slice(0, 4)
            .map(person),
        cast: (movie.credits?.cast || []).slice(0, 14).map((member) => ({
            id: member.id,
            name: member.name,
            character: member.character || "",
            profile: member.profile_path || null,
        })),
        similar: (movie.recommendations?.results || [])
            .filter((entry) => entry.poster_path)
            .slice(0, 12)
            .map(movieSummary),
    };
}

const DIRECTING_JOBS = new Set(["Director"]);

export function personDetail(person) {
    const cast = person.movie_credits?.cast || [];
    const crew = person.movie_credits?.crew || [];

    const asActor = cast.map((credit) => ({ credit, role: credit.character }));
    const asCrew = crew
        .filter((credit) => DIRECTING_JOBS.has(credit.job))
        .map((credit) => ({ credit, role: credit.job }));

    // Directors / writers are mostly "crew"; actors are mostly "cast".
    const preferCrew =
        person.known_for_department && person.known_for_department !== "Acting";
    const primary = preferCrew ? asCrew : asActor;
    const fallback = preferCrew ? asActor : asCrew;
    const source = primary.length ? primary : fallback;

    const credits = uniqueBy(
        source
            .filter(({ credit }) => credit.release_date && !credit.adult)
            .map(({ credit, role }) => ({
                id: credit.id,
                title: credit.title,
                year: yearOf(credit.release_date),
                role: role || "",
                poster: credit.poster_path || null,
                rating:
                    credit.vote_count > 0
                        ? round1(credit.vote_average)
                        : null,
                popularity: credit.popularity || 0,
            })),
        "id"
    )
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 40);

    return {
        id: person.id,
        name: person.name,
        biography: person.biography || "",
        birthday: person.birthday || null,
        deathday: person.deathday || null,
        placeOfBirth: person.place_of_birth || null,
        department: person.known_for_department || null,
        profile: person.profile_path || null,
        knownFor: credits.slice(0, 5).map((credit) => credit.title),
        credits: credits.map(({ popularity, ...credit }) => credit),
    };
}
