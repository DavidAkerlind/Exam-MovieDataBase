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

            const imdbID = button.getAttribute("data-imdbid");
            console.log("Clicked button, imdbID:", imdbID);

            if (!imdbID) return;

            if (
                window.location.pathname === "/favorites.html" ||
                window.location.pathname ===
                    "/Exam-MovieDataBase/favorites.html"
            ) {
                removeFromFavorites(imdbID, button);
            } else {
                addToFavorites(imdbID, button);
            }
        });

        updateFavoriteButtons();
    });
}

export function addToFavorites(imdbID, button) {
    console.log("addToFavorites()", imdbID);
    addMovieToFavorites(imdbID);

    button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
    button.classList.add("movie-card__favorite-btn--added");
}

export function removeFromFavorites(imdbID, button) {
    console.log("removeFromFavorites()", imdbID);
    removeMovieFromFavorites(imdbID);

    button.closest(".movie-card").remove();
}

export function updateFavoriteButtons() {
    console.log("updateFavoriteButtons()");

    if (
        window.location.pathname === "/Exam-MovieDataBase/favorites.html" ||
        window.location.pathname === "/favorites.html"
    )
        return;
    setTimeout(() => {
        let favorites = getFavoriteMovies();
        console.log(favorites);
        console.log(document.querySelector("#movieCardBtn"));
        document.querySelectorAll("#movieCardBtn").forEach((button) => {
            let imdbID = button.getAttribute("data-imdbid");
            if (favorites.includes(imdbID)) {
                button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
                button.classList.add("movie-card__favorite-btn--added");
            }
        });
    }, 2000);
}
