export function getFavoriteMovies() {
    console.log("getFavoriteMovies()");

    return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavoriteMovies(favorites) {
    console.log("saveFavoriteMovies()");

    localStorage.setItem("favorites", JSON.stringify(favorites));
}

export function addMovieToFavorites(movieTitle) {
    console.log("addMovieToFavorites()");

    let favorites = getFavoriteMovies();

    if (!favorites.includes(movieTitle)) {
        favorites.push(movieTitle);
        saveFavoriteMovies(favorites);
    }
}

export function removeMovieFromFavorites(movieTitle) {
    console.log("removeMovieFromFavorites()");

    let favorites = getFavoriteMovies();
    favorites = favorites.filter((title) => title !== movieTitle);
    saveFavoriteMovies(favorites);
}
