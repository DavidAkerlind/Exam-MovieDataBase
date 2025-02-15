export const saveFavoriteMovie = (movieTitle) => {
    const favorites = getFavoriteMovies();
    if (!favorites.includes(movieTitle)) {
        favorites.push(movieTitle);
        localStorage.setItem("favoriteMovies", JSON.stringify(favorites));
    }
};

export const removeFavoriteMovie = (movieTitle) => {
    const favorites = getFavoriteMovies();
    const updatedFavorites = favorites.filter((title) => title !== movieTitle);
    localStorage.setItem("favoriteMovies", JSON.stringify(updatedFavorites));
};

export const getFavoriteMovies = () => {
    const favorites = localStorage.getItem("favoriteMovies");
    return favorites ? JSON.parse(favorites) : [];
};
