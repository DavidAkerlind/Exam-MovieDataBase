import { getCurrentPath } from "../utils/utils.js";

const TOKEN = "378ca18a"; // key for omdb-API

async function fetchCarouselMovies() {
    console.log("fetchCarouselMovies()");

    try {
        const response = await fetch(
            "https://santosnr6.github.io/Data/favoritemovies.json"
        );
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let movies = await response.json();
        if (movies.length < 1) {
            throw new Error(`Error, no movie found: ${movies} , ${response}`);
        }
        return movies;
    } catch (error) {
        console.log("Error fetching movie data:", error.message);
        return [];
    }
}

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
            return movie;
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

    const isSearchPage = getCurrentPath() === "/search.html";
    let searchHeader;
    if (isSearchPage) {
        searchHeader = document.querySelector("#searchHeader");
    }
    if (!query) return [];
    const url = `https://www.omdbapi.com/?apikey=${TOKEN}&s=${query}*`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! ${response.ok}`);
        }

        let data = await response.json();

        if (data.Response === "False") {
            console.log(`No movies found: ${data.Error}`);

            if (
                isSearchPage &&
                data.Error == "Too many results." &&
                searchHeader
            ) {
                searchHeader.textContent = data.Error;
            }
            return [];
        }

        if (isSearchPage && !searchHeader.textContent.includes("results")) {
            searchHeader.textContent = "Search MMDb";
        } else if (
            isSearchPage &&
            data.Search.length > 0 &&
            !searchHeader.textContent.includes("for") &&
            searchHeader
        ) {
            searchHeader.textContent = `Search MMDb `;
        }
        return data.Search.slice(0, 12) || [];
    } catch (error) {
        console.log(`Error fetching search results: ${error.message}`);
        return [];
    }
}

const TOKEN2 = "8ad0776a7a2b05bdcbba8ff0880953d1"; // key for TMBd

async function fetchPersonInfo(personName) {
    console.log("fetchPersonInfo()");
    try {
        // Justera sökningen baserat på typ (actor, director, writer, etc.)
        const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${TOKEN2}&query=${encodeURIComponent(
            personName
        )}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.results.length === 0) {
            console.log("Person was not found.");
            return;
        }

        const person = searchData.results[0];
        const personId = person.id;

        const detailsUrl = `https://api.themoviedb.org/3/person/${personId}?api_key=${TOKEN2}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

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

        return personInfo;
    } catch (error) {
        console.error("Error when fetching persondata:", error);
    }
}

export {
    fetchPersonInfo,
    fetchCarouselMovies,
    fetchMovieByTitle,
    fetchMovieByImdbID,
    fetchMovieSearch,
};
