export function getFavoriteMovies() {
    console.log("getFavoriteMovies()");
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavoriteMovies(favorites) {
    console.log("saveFavoriteMovies()", favorites);
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

export function addMovieToFavorites(imdbID) {
    console.log("addMovieToFavorites()", imdbID);

    let favorites = getFavoriteMovies();

    if (!favorites.includes(imdbID)) {
        favorites.push(imdbID);
        saveFavoriteMovies(favorites);
    }
}

export function removeMovieFromFavorites(imdbID) {
    console.log("removeMovieFromFavorites()", imdbID);

    let favorites = getFavoriteMovies();
    favorites = favorites.filter((id) => id !== imdbID);
    saveFavoriteMovies(favorites);
}
