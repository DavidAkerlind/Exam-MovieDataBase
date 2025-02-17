import { renderMovieCard } from "./components/movieCard.js";
import {
    fetchCarouselMovies,
    fetchMovieSearch,
    fetchMovieByImdbID,
    fetchMovieByTitle,
} from "./modules/api.js";
import { renderMoviePage } from "./components/fullMoviePage.js";
import { initializeFavoriteButtons } from "./events/favorites.js";
import { getFavoriteMovies, saveFavoriteMovies } from "./data/localStorage.js";
import { initSearchFunc, loadSearchResults } from "./events/search.js";
import { createHeader } from "./components/header.js";
import { renderTrailers } from "./modules/caroussel.js";
import { randomize, getLimitedCount } from "./utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js loaded");

    // Kontrollera om vi är på GitHub Pages (bas-URL innehåller "/Exam-MovieDataBase/")
    const isGitHubPages =
        window.location.hostname === "davidakerlind.github.io";

    // Basvägen för GitHub Pages
    const basePath = isGitHubPages ? "/Exam-MovieDataBase" : "";

    // Justera sökvägen baserat på om vi är på GitHub Pages eller ej
    const path = window.location.pathname.replace(basePath, "");

    if (path === "/" || path === "/index.html") {
        console.log("index.html");
        createHeader();
        setupLandingPage();
    } else if (path === "/favorites.html") {
        console.log("favorites.html");
        createHeader();
        setupFavoritesPage();
    } else if (path === "/movie.html") {
        console.log("movie.html");
        createHeader();
        const urlParams = new URLSearchParams(window.location.search);
        const imdbID = urlParams.get("id");
        renderMoviePage(fetchMovieByImdbID(imdbID));
    } else if (path === "/search.html") {
        console.log("search.html");
        createHeader();
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("q");

        if (query) {
            loadSearchResults(query);
        }
    }
});
// Anropa funktionen för att aktivera favoritknappar
initializeFavoriteButtons();
initSearchFunc();

function setupLandingPage() {
    fetchCarouselMovies()
        .then((topMovies) => {
            const selectedIndexes = [];

            const uniqueMovieCount = getLimitedCount(5, topMovies.length);
            const moviesToRender = [];
            for (let i = 0; i < uniqueMovieCount; i++) {
                let randomIndex;

                do {
                    randomIndex = randomize(1, topMovies.length);
                } while (selectedIndexes.includes(randomIndex));

                selectedIndexes.push(randomIndex);

                moviesToRender.push(topMovies[randomIndex]);
            }

            while (moviesToRender.length < 5) {
                const randomIndex = randomize(0, moviesToRender.length - 1);
                moviesToRender.push(moviesToRender[randomIndex]);
            }

            moviesToRender.forEach((movie, index) => {
                renderTrailers(movie, index + 1);
            });
        })
        .catch((error) => {
            console.log("Error fetching topMovies", error);
        });
}

function setupFavoritesPage() {
    let favoriteMovies = getFavoriteMovies();

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
}
