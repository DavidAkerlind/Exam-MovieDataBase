import { renderMovieCard } from "./components/movieCard.js";
import {
    fetchActorInfo,
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
import { randomize, getLimitedCount, shuffleArray } from "./utils/utils.js";
import { renderRecommendations } from "./components/recommendations.js";
import { renderActorPage } from "./components/actorPage.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js loaded");

    // Kontrollera om vi är på GitHub Pages (bas-URL innehåller "/Exam-MovieDataBase/")
    const isGitHubPages =
        window.location.hostname === "davidakerlind.github.io";

    // Detta är basvägen för GitHub Pages
    const basePath = isGitHubPages ? "/Exam-MovieDataBase" : "";

    // Justera sökvägen baserat på om vi är på GitHub Pages eller ej
    const path = window.location.pathname.replace(basePath, "");

    if (path === "/" || path === "/index.html") {
        console.log("index.html");
        createHeader();
        setupCarousel();
        renderRecommendations();
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
        setupSearchPage();
    } else if (path === "/actor.html") {
        createHeader();
        setupActorPage();
    }
});
// Anropa funktionen för att aktivera favoritknappar
initializeFavoriteButtons();
initSearchFunc();

function setupCarousel() {
    console.log("setupCarousel()");

    fetchCarouselMovies().then((topMovies) => {
        if (topMovies.length < 5) {
            console.log("Not enough movies to display (trailer)");
            return;
        }
        let shuffledMovies = shuffleArray(topMovies);
        for (let i = 1; i <= 5; i++) {
            renderTrailers(shuffledMovies[i], i);
        }
    });
}

function setupFavoritesPage() {
    console.log("setupFavoritesPage()");

    let favoriteMovies = getFavoriteMovies();

    if (favoriteMovies.length > 0) {
        console.log(favoriteMovies);
        favoriteMovies.forEach((movie) => {
            fetchMovieByImdbID(movie).then((movieData) => {
                if (movieData) {
                    renderMovieCard(movieData);
                }
            });
        });
    } else {
        // No favorites?
        document.querySelector(
            "#favoritesTitle"
        ).textContent = `No movies saved`;
        let divRef = document.createElement("div");
        divRef.innerHTML = `<a href="./search.html" class="search-link" id="searchLink">Go find movies</a>
`;
        document.querySelector(".content-wrapper").appendChild(divRef);
    }
}

function setupSearchPage() {
    console.log("setupSearchPage");

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");

    if (query) {
        loadSearchResults(query);
    }
}

function setupActorPage() {
    console.log("setupActorPage()");
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("name");

    if (query) {
        renderActorPage(fetchActorInfo(query));
    }
}
