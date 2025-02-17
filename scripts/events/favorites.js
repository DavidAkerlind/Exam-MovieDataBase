// events/favorites.js

import {
    getFavoriteMovies,
    addMovieToFavorites,
    removeMovieFromFavorites,
} from "../data/localStorage.js";

export function initializeFavoriteButtons() {
    console.log("initializeFavoriteButtons()");

    document.addEventListener("DOMContentLoaded", () => {
        document.addEventListener("click", (event) => {
            const button = event.target.closest(".movie-card__favorite-btn");
            if (!button) return;

            const movieTitle = button.getAttribute("data-title");
            console.log("Clicked button, movieTitle:", movieTitle);

            if (!movieTitle) return;

            if (window.location.pathname === "/favorites.html") {
                removeFromFavorites(movieTitle, button);
            } else {
                addToFavorites(movieTitle, button);
            }
        });

        updateFavoriteButtons();
    });
}

export function addToFavorites(movieTitle, button) {
    console.log("addToFavorites()", movieTitle);
    addMovieToFavorites(movieTitle);

    button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
    button.classList.add("movie-card__favorite-btn--added");
}

export function removeFromFavorites(movieTitle, button) {
    console.log("removeFromFavorites()", movieTitle);
    removeMovieFromFavorites(movieTitle);

    button.closest(".movie-card").remove();
}

export function updateFavoriteButtons() {
    console.log("updateFavoriteButtons()");
    let favorites = getFavoriteMovies();

    document.querySelectorAll(".movie-card__favorite-btn").forEach((button) => {
        const movieTitle = button.getAttribute("data-title");

        if (favorites.includes(movieTitle)) {
            button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
            button.classList.add("movie-card__favorite-btn--added");
        }
    });
}
