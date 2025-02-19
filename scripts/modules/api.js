import { oData } from "../data/data.js";

const TOKEN = "378ca18a"; // key for omdb-API

async function fetchCarouselMovies() {
    console.log("fetchCarouselMovies()");
    const response = await fetch(
        "https://santosnr6.github.io/Data/favoritemovies.json"
    );
    let movies = await response.json();
    oData.topMovieList = movies;
    return movies;
}

// sätter oData.searchTitleMovieData till den data om den titel vi skickar in i funktionen och returnerar den också
async function fetchMovieByTitle(title) {
    console.log("fetchMovieByTitle()");

    const url = `https://www.omdbapi.com/?apikey=${TOKEN}&t=${encodeURIComponent(
        title
    )}`;
    try {
        const response = await fetch(url);
        console.log("Response status:", response.status);
        console.log("Response URL:", response.url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.Response === "False") {
            throw new Error(data.Error);
        }
        return data;
    } catch (error) {
        console.log("Error fetching movie data:", error.message);
        return null;
    }
}

async function fetchMovieByImdbID(imdbID) {
    console.log("fetchMovieByImdbID()");

    if (!imdbID) {
        console.log("No IMDb-ID found!");
        return null;
    }

    try {
        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${TOKEN}&i=${imdbID}&plot=full`
        );
        const movie = await response.json();

        if (movie.Response === "True") {
            return movie; // Returnera filmobjektet till den som kallar på funktionen
        } else {
            console.log("Could not fetch movie:", movie.Error);
            return null;
        }
    } catch (error) {
        console.log("Error when when fetching movie data:", error);
        return null;
    }
}

async function fetchMovieSearch(query) {
    console.log("fetchMovieSearch()");
    console.log(`Searching for: ${query}`);

    let searchHeader = document.querySelector("#searchHeader");

    if (!query) return [];
    const url = `https://www.omdbapi.com/?apikey=${TOKEN}&s=${query}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! ${response.ok}`);
        }

        let data = await response.json();

        if (data.Response === "False") {
            console.log(`No movies found: ${data.Error}`);

            if (data.Error == "Too many results." && searchHeader) {
                searchHeader.textContent = data.Error;
            }
            return [];
        }
        if (searchHeader && !searchHeader.textContent.includes("results")) {
            searchHeader.textContent = "Search MMDb";
        }
        return data.Search.slice(0, 12) || [];
    } catch (error) {
        console.log(`Error fetching search results: ${error.message}`);
        return [];
    }
}

const TOKEN2 = "8ad0776a7a2b05bdcbba8ff0880953d1";
async function fetchPersonInfo(personName, type = "actor") {
    console.log("fetchPersonInfo()");
    try {
        // Justera sökningen baserat på typ (actor, director, writer, etc.)
        const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${TOKEN2}&query=${encodeURIComponent(
            personName
        )}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.results.length === 0) {
            console.log("Personen hittades inte.");
            return;
        }

        const person = searchData.results[0]; // Ta den första träffen
        const personId = person.id;

        // Hämta detaljer om personen
        const detailsUrl = `https://api.themoviedb.org/3/person/${personId}?api_key=${TOKEN2}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        // Hämta filmer eller projekt beroende på personens roll
        const creditsUrl = `https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${TOKEN2}`;
        const creditsResponse = await fetch(creditsUrl);
        const creditsData = await creditsResponse.json();

        // Skapa ett objekt med personens information
        const personInfo = {
            name: detailsData.name,
            biography: detailsData.biography,
            birthday: detailsData.birthday,
            deathday: detailsData.deathday,
            placeOfBirth: detailsData.place_of_birth,
            profilePicture: `https://image.tmdb.org/t/p/w500${detailsData.profile_path}`,
            knownFor: person.known_for.map(
                (movie) => movie.title || movie.name
            ),
            credits: creditsData.cast.map((movie) => ({
                title: movie.title,
                releaseDate: movie.release_date,
                character: movie.character,
                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })),
        };

        console.log(personInfo);
        return personInfo;
    } catch (error) {
        console.error("Fel vid hämtning av persondata:", error);
    }
}

export {
    fetchPersonInfo,
    fetchCarouselMovies,
    fetchMovieByTitle,
    fetchMovieByImdbID,
    fetchMovieSearch,
};
