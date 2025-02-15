import { renderMovieCard } from "./components/movieCard.js";
import {
    fetchTopMovies,
    fetchMovieByImdbID,
    fetchMovieByTitle,
} from "./modules/api.js";
import { renderMoviePage } from "./components/fullMoviePage.js";
import { getFavoriteMovies } from "./data/localStorage.js";

if (
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html"
) {
    console.log("index.html");
} else if (window.location.pathname === "/favorites.html") {
    console.log("favorites.html");

    const favoriteMovies = getFavoriteMovies();
    if (favoriteMovies.length > 0) {
        favoriteMovies.forEach((movieTitle) => {
            renderMovieCard(fetchMovieByTitle(movieTitle));
        });
    } else {
        // For testing purposes, show some random movies
        const defaultMovies = [
            "Inception",
            "The Dark Knight",
            "Interstellar",
            "The Matrix",
            "Pulp Fiction",
            "Simpsons",
        ];
        defaultMovies.forEach((movieTitle) => {
            renderMovieCard(fetchMovieByTitle(movieTitle));
        });
    }
    //
} else if (window.location.pathname === "/movie.html") {
    console.log("movie.html");
    const urlParams = new URLSearchParams(window.location.search);
    const imdbID = urlParams.get("id");
    renderMoviePage(fetchMovieByImdbID(imdbID));
} else if (window.location.pathname === "/search.html") {
    console.log("search.html");
}
