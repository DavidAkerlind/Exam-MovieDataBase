import { oData } from "../data/data.js";

async function fetchTopMovies() {
    const response = await fetch(
        "https://santosnr6.github.io/Data/favoritemovies.json"
    );
    let movies = await response.json();
    oData.topMovieList = movies;
}

// sätter oData.searchTitleMovieData till den data om den titel vi skickar in i funktionen och returnerar den också
async function fetchMovieData(title) {
    const apiKey = "d59607eb";
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

export { fetchTopMovies, fetchMovieData };
