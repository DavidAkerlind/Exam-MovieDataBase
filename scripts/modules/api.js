import { oData } from "../data/data.js";

const TOKEN = "d59607eb"; // key for omdb-API

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

    const url = `http://www.omdbapi.com/?apikey=${TOKEN}&t=${title}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.Response === "False") {
            throw new Error(data.Error);
        }

        oData.searchTitleMovieData = data;
        return data;
    } catch (error) {
        console.log("Error fetching movie data:", error.message);
        return null;
    }
}

async function fetchMovieByImdbID(imdbID) {
    console.log("fetchMovieByImdbID()");
    console.log(imdbID);

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

    if (!query) return [];
    const url = `https://www.omdbapi.com/?apikey=${TOKEN}&s=${query}&type=movie`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! ${response.ok}`);
        }

        let data = await response.json();

        if (data.Response === "False") {
            console.log(`No movies found: ${data.Error}`);
            return [];
        }
        // console.log(data);
        return data.Search.slice(0, 12) || [];
    } catch (error) {
        console.log(`Error fetching search results: ${error.message}`);
        return [];
    }
}

export {
    fetchCarouselMovies,
    fetchMovieByTitle,
    fetchMovieByImdbID,
    fetchMovieSearch,
};
