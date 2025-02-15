export function getFavoriteMovies() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavoriteMovies(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

export function addMovieToFavorites(movieTitle) {
    let favorites = getFavoriteMovies();

    if (!favorites.includes(movieTitle)) {
        favorites.push(movieTitle);
        saveFavoriteMovies(favorites);
    }
}

export function removeMovieFromFavorites(movieTitle) {
    let favorites = getFavoriteMovies();
    favorites = favorites.filter((title) => title !== movieTitle);
    saveFavoriteMovies(favorites);
}
