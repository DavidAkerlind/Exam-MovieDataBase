import { renderMovieCard } from "./components/movieCard.js";
import {
    fetchTopMovies,
    fetchMovieByImdbID,
    fetchMovieByTitle,
} from "./modules/api.js";
import { renderMoviePage } from "./components/fullMoviePage.js";
import { initializeFavoriteButtons } from "./events/favorites.js";
import { getFavoriteMovies, saveFavoriteMovies } from "./data/localStorage.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js loaded");

    if (
        window.location.pathname === "/" ||
        window.location.pathname === "/index.html"
    ) {
        console.log("index.html");
    } else if (window.location.pathname === "/favorites.html") {
        console.log("favorites.html");

        let favoriteMovies = getFavoriteMovies();
        console.log(favoriteMovies);

        if (favoriteMovies.length > 0) {
            favoriteMovies.forEach((movieTitle) => {
                fetchMovieByTitle(movieTitle).then((movieData) => {
                    if (movieData) {
                        renderMovieCard(movieData);
                    }
                });
            });
        } else {
            // Om det inte finns några favoriter, visa standardfilmer

            const defaultMovies = [
                "Inception",
                "The Dark Knight",
                "Interstellar",
                "The Matrix",
                "Pulp Fiction",
                "The Simpsons",
            ];
            saveFavoriteMovies(defaultMovies); // spara dem så de aldrig försvinner förutom om man tar bort alla dårå
            defaultMovies.forEach((movieTitle) => {
                fetchMovieByTitle(movieTitle).then((movieData) => {
                    if (movieData) {
                        renderMovieCard(movieData);
                    }
                });
            });
        }
    } else if (window.location.pathname === "/movie.html") {
        console.log("movie.html");
        const urlParams = new URLSearchParams(window.location.search);
        const imdbID = urlParams.get("id");
        renderMoviePage(fetchMovieByImdbID(imdbID));
    } else if (window.location.pathname === "/search.html") {
        console.log("search.html");
    }
});
// Anropa funktionen för att aktivera favoritknappar
initializeFavoriteButtons();
