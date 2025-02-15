import { oData } from "../data/data.js";

const apiKey = "d59607eb"; // key for omdb-API

async function fetchTopMovies() {
    console.log("fetchTopMovies()");
    const response = await fetch(
        "https://santosnr6.github.io/Data/favoritemovies.json"
    );
    let movies = await response.json();
    oData.topMovieList = movies;
}

// sätter oData.searchTitleMovieData till den data om den titel vi skickar in i funktionen och returnerar den också
async function fetchMovieByTitle(title) {
    console.log("fetchMovieByTitle()");

    const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${title}`;
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
        console.log(data);
        return data;
    } catch (error) {
        console.log("Error fetching movie data:", error.message);
        return null;
    }
}

async function fetchMovieByImdbID(imdbID) {
    console.log("fetchMovieByImdbID()");

    if (!imdbID) {
        console.error("No IMDb-ID found!");
        return null;
    }

    try {
        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full`
        );
        const movie = await response.json();

        if (movie.Response === "True") {
            return movie; // Returnera filmobjektet till den som kallar på funktionen
        } else {
            console.error("Could not fetch movie:", movie.Error);
            return null;
        }
    } catch (error) {
        console.error("Error when when fetching movie data:", error);
        return null;
    }
}

export { fetchTopMovies, fetchMovieByTitle, fetchMovieByImdbID };
