// An in-memory stand-in for TMDb and OMDb that mimics their documented
// response shapes. Used by the unit tests and by the key-less dev server.

const MOVIES = [
    [278, "The Shawshank Redemption", "1994-09-23", 8.7, 27000, "tt0111161", ["Drama", "Crime"], 142, 1, "Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden."],
    [238, "The Godfather", "1972-03-14", 8.7, 20500, "tt0068646", ["Drama", "Crime"], 175, 2, "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch Vito Corleone barely survives an attempt on his life, his youngest son Michael steps in to take care of the would-be killers."],
    [240, "The Godfather Part II", "1974-12-20", 8.6, 12400, "tt0071562", ["Drama", "Crime"], 202, 2, "In the continuing saga of the Corleone crime family, a young Vito Corleone grows up in Sicily and in 1910s New York. In the 1950s, Michael Corleone attempts to expand the family business into Las Vegas, Hollywood and Cuba."],
    [424, "Schindler's List", "1993-12-15", 8.6, 15000, "tt0108052", ["Drama", "History", "War"], 195, 3, "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slave labor in his factory during World War II."],
    [389, "12 Angry Men", "1957-04-10", 8.5, 8200, "tt0050083", ["Drama"], 96, 4, "The defense and the prosecution have rested and the jury is filing into the jury room to decide if a young Spanish-American is guilty or innocent of murdering his father."],
    [155, "The Dark Knight", "2008-07-16", 8.5, 32000, "tt0468569", ["Drama", "Action", "Crime", "Thriller"], 152, 5, "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets."],
    [129, "Spirited Away", "2001-07-20", 8.5, 16000, "tt0245429", ["Animation", "Family", "Fantasy"], 125, 6, "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family."],
    [680, "Pulp Fiction", "1994-09-10", 8.5, 28000, "tt0110912", ["Thriller", "Crime"], 154, 7, "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper."],
    [122, "The Lord of the Rings: The Return of the King", "2003-12-01", 8.5, 24000, "tt0167260", ["Adventure", "Fantasy", "Action"], 201, 8, "As armies mass for a final battle that will decide the fate of the world, Frodo and Sam approach the very heart of darkness in Mordor."],
    [13, "Forrest Gump", "1994-06-23", 8.5, 26000, "tt0109830", ["Comedy", "Drama", "Romance"], 142, 9, "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do."],
    [497, "The Green Mile", "1999-12-10", 8.5, 17000, "tt0120689", ["Fantasy", "Drama", "Crime"], 189, 10, "A supernatural tale set on death row in a Southern prison, where gentle giant John Coffey possesses the mysterious power to heal people's ailments."],
    [769, "GoodFellas", "1990-09-12", 8.5, 12600, "tt0099685", ["Drama", "Crime"], 145, 11, "The true story of Henry Hill, a half-Irish, half-Sicilian Brooklyn kid who is adopted by neighbourhood gangsters at an early age and climbs the ranks of a Mafia family."],
    [603, "The Matrix", "1999-03-30", 8.2, 24000, "tt0133093", ["Action", "Science Fiction"], 136, 12, "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth."],
    [157336, "Interstellar", "2014-11-05", 8.4, 35000, "tt0816692", ["Adventure", "Drama", "Science Fiction"], 169, 5, "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage."],
    [27205, "Inception", "2010-07-15", 8.4, 36000, "tt1375666", ["Action", "Science Fiction", "Adventure"], 148, 5, "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: inception."],
    [637, "Life Is Beautiful", "1997-12-20", 8.4, 12000, "tt0118799", ["Comedy", "Drama"], 116, 13, "A touching story of an Italian book seller of Jewish ancestry who lives in his own little fairy tale. His creative and happy life would come to an abrupt halt when his entire family is deported to a concentration camp."],
    [550, "Fight Club", "1999-10-15", 8.4, 30000, "tt0137523", ["Drama", "Thriller"], 139, 14, "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy."],
    [372058, "Your Name.", "2016-08-26", 8.5, 11000, "tt5311514", ["Romance", "Animation", "Drama"], 106, 15, "High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places."],
    [496243, "Parasite", "2019-05-30", 8.5, 17000, "tt6751668", ["Comedy", "Thriller", "Drama"], 133, 16, "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks as they ingratiate themselves into their lives and get entangled in an unexpected incident."],
    [346, "Seven Samurai", "1954-04-26", 8.5, 3500, "tt0047478", ["Action", "Drama"], 207, 17, "A samurai answers a village's request for protection after he falls on hard times. The town needs protection from bandits, so the samurai gathers six others to help him teach the people how to defend themselves."],
    [807, "Se7en", "1995-09-22", 8.4, 20000, "tt0114369", ["Crime", "Mystery", "Thriller"], 127, 18, "Two homicide detectives are on a desperate hunt for a serial killer whose crimes are based on the seven deadly sins in this dark and haunting film."],
    [872585, "Oppenheimer", "2023-07-19", 8.1, 9000, "tt15398776", ["Drama", "History"], 181, 5, "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II."],
];

const PEOPLE = [
    [1, "Tim Robbins", "Acting", "1958-10-16", null, "West Covina, California, USA"],
    [2, "Morgan Freeman", "Acting", "1937-06-01", null, "Memphis, Tennessee, USA"],
    [3, "Marlon Brando", "Acting", "1924-04-03", "2004-07-01", "Omaha, Nebraska, USA"],
    [4, "Al Pacino", "Acting", "1940-04-25", null, "Manhattan, New York City, USA"],
    [5, "Christian Bale", "Acting", "1974-01-30", null, "Haverfordwest, Wales, UK"],
    [6, "Heath Ledger", "Acting", "1979-04-04", "2008-01-22", "Perth, Western Australia, Australia"],
    [7, "Leonardo DiCaprio", "Acting", "1974-11-11", null, "Los Angeles, California, USA"],
    [8, "Christopher Nolan", "Directing", "1970-07-30", null, "London, England, UK"],
    [9, "Frank Darabont", "Directing", "1959-01-28", null, "Montbéliard, France"],
    [10, "Francis Ford Coppola", "Directing", "1939-04-07", null, "Detroit, Michigan, USA"],
];

const BIOGRAPHY =
    "An acclaimed figure of modern cinema whose career spans several decades and a wide range of celebrated films.\n\nKnown for a commitment to craft, they have earned numerous nominations and awards and remain a defining presence on screen.\n\nThis biography is placeholder text served by the local mock API.";

// movieId -> [personId, character][]
const CAST = {
    278: [[1, "Andy Dufresne"], [2, "Ellis Boyd 'Red' Redding"]],
    238: [[3, "Don Vito Corleone"], [4, "Michael Corleone"]],
    240: [[4, "Michael Corleone"]],
    155: [[5, "Bruce Wayne / Batman"], [6, "The Joker"], [2, "Lucius Fox"]],
    157336: [[5, "Cooper"]],
    27205: [[7, "Dom Cobb"]],
    550: [[7, "Narrator"]],
    872585: [[5, "Narrator"]],
    807: [[2, "Detective Somerset"]],
    603: [[2, "Morpheus"]],
};
const DIRECTORS = { 278: 9, 497: 9, 238: 10, 240: 10, 155: 8, 157336: 8, 27205: 8, 872585: 8 };

const releaseOf = (movie) => movie[2];

function movieRow([id, title, date, avg, votes, , , , , overview]) {
    return {
        id,
        title,
        release_date: date,
        vote_average: avg,
        vote_count: votes,
        poster_path: `/poster-${id}.jpg`,
        backdrop_path: `/backdrop-${id}.jpg`,
        overview,
        popularity: votes / 100,
        adult: false,
        genre_ids: [18],
    };
}

const person = (row) => ({
    id: row[0],
    name: row[1],
    known_for_department: row[2],
    profile_path: `/profile-${row[0]}.jpg`,
    known_for: MOVIES.filter((m) => (CAST[m[0]] || []).some(([pid]) => pid === row[0]))
        .slice(0, 3)
        .map((m) => ({ id: m[0], title: m[1] })),
});

function movieDetails(movie) {
    const [id, , , , , imdb, genres, runtime] = movie;
    const cast = (CAST[id] || []).map(([pid, character], order) => ({
        id: pid,
        name: PEOPLE.find((p) => p[0] === pid)[1],
        character,
        order,
        profile_path: `/profile-${pid}.jpg`,
    }));
    const crew = DIRECTORS[id]
        ? [
              {
                  id: DIRECTORS[id],
                  name: PEOPLE.find((p) => p[0] === DIRECTORS[id])[1],
                  job: "Director",
                  department: "Directing",
              },
              {
                  id: DIRECTORS[id],
                  name: PEOPLE.find((p) => p[0] === DIRECTORS[id])[1],
                  job: "Screenplay",
                  department: "Writing",
              },
          ]
        : [];

    return {
        ...movieRow(movie),
        genres: genres.map((name, index) => ({ id: index, name })),
        runtime,
        tagline: "Fear can hold you prisoner. Hope can set you free.",
        imdb_id: imdb,
        external_ids: { imdb_id: imdb },
        credits: { cast, crew },
        videos: {
            results: [
                { site: "YouTube", key: `yt${id}teaser`, type: "Teaser", official: true, name: "Teaser" },
                { site: "YouTube", key: `yt${id}`, type: "Trailer", official: true, name: "Official Trailer" },
            ],
        },
        recommendations: {
            results: MOVIES.filter((m) => m[0] !== id)
                .slice(0, 12)
                .map(movieRow),
        },
        release_dates: {
            results: [{ iso_3166_1: "US", release_dates: [{ certification: "R" }] }],
        },
    };
}

function omdbRecord(movie) {
    const [, title, , avg, , imdb, genres, runtime] = movie;
    return {
        Title: title,
        Year: releaseOf(movie).slice(0, 4),
        Rated: "R",
        Runtime: `${runtime} min`,
        Genre: genres.join(", "),
        Awards: "Nominated for 7 Oscars. 21 wins & 43 nominations total",
        Metascore: "82",
        imdbRating: String((avg + 0.4).toFixed(1)),
        imdbVotes: "2,900,000",
        imdbID: imdb,
        Ratings: [
            { Source: "Internet Movie Database", Value: `${(avg + 0.4).toFixed(1)}/10` },
            { Source: "Rotten Tomatoes", Value: "91%" },
            { Source: "Metacritic", Value: "82/100" },
        ],
        Response: "True",
    };
}

const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const page = (results, number = 1) => ({
    page: number,
    results,
    total_pages: 1,
    total_results: results.length,
});

/** Calls are recorded so tests can assert on them. */
export function createUpstream() {
    const calls = [];
    const fail = new Set();

    async function upstream(input) {
        const url = new URL(input.url ?? String(input));
        calls.push(url);
        const path = url.pathname;
        const q = (url.searchParams.get("query") || "").toLowerCase();

        if (url.hostname === "www.omdbapi.com" || url.pathname.startsWith("/omdb")) {
            if (fail.has("omdb")) return json({ Response: "False", Error: "Request limit reached!" }, 401);
            const movie = MOVIES.find((m) => m[5] === url.searchParams.get("i"));
            return movie ? json(omdbRecord(movie)) : json({ Response: "False", Error: "Incorrect IMDb ID." });
        }

        if (fail.has("tmdb")) return json({ status_message: "Invalid API key" }, 401);
        const route = path.replace(/^\/3/, "");
        let match;

        if (route === "/movie/top_rated") return json(page(MOVIES.slice(0, 20).map(movieRow)));
        if (route === "/trending/movie/week") return json(page([...MOVIES].reverse().slice(0, 20).map(movieRow)));
        if ((match = route.match(/^\/movie\/(\d+)\/videos$/))) {
            return json({ id: Number(match[1]), results: movieDetails(MOVIES.find((m) => m[0] === Number(match[1])) || MOVIES[0]).videos.results });
        }
        if ((match = route.match(/^\/movie\/(\d+)$/))) {
            const movie = MOVIES.find((m) => m[0] === Number(match[1]));
            return movie ? json(movieDetails(movie)) : json({ status_message: "not found" }, 404);
        }
        if (route === "/search/movie") {
            return json(page(MOVIES.filter((m) => m[1].toLowerCase().includes(q)).map(movieRow)));
        }
        if (route === "/search/person") {
            return json(page(PEOPLE.filter((p) => p[1].toLowerCase().includes(q)).map(person)));
        }
        if ((match = route.match(/^\/find\/(tt\d+)$/))) {
            const movie = MOVIES.find((m) => m[5] === match[1]);
            return json({ movie_results: movie ? [movieRow(movie)] : [] });
        }
        if ((match = route.match(/^\/person\/(\d+)$/))) {
            const row = PEOPLE.find((p) => p[0] === Number(match[1]));
            if (!row) return json({ status_message: "not found" }, 404);
            const acted = MOVIES.filter((m) => (CAST[m[0]] || []).some(([pid]) => pid === row[0]));
            const directed = MOVIES.filter((m) => DIRECTORS[m[0]] === row[0]);
            return json({
                id: row[0],
                name: row[1],
                known_for_department: row[2],
                birthday: row[3],
                deathday: row[4],
                place_of_birth: row[5],
                biography: BIOGRAPHY,
                profile_path: `/profile-${row[0]}.jpg`,
                movie_credits: {
                    cast: acted.map((m) => ({
                        ...movieRow(m),
                        character: (CAST[m[0]].find(([pid]) => pid === row[0]) || [])[1],
                    })),
                    crew: directed.map((m) => ({ ...movieRow(m), job: "Director" })),
                },
            });
        }

        return json({ status_message: "unknown route" }, 404);
    }

    return { fetch: upstream, calls, fail };
}

export const FIXTURE = { MOVIES, PEOPLE };
