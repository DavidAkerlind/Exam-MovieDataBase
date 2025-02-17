import { getFavoriteMovies } from "../data/localStorage.js";

// Skapar och renderar filmkortet
async function renderMovieCard(movie) {
    console.log("renderMovieCard()");

    let movieInfo = await movie;

    const movieCard = document.createElement("article");
    movieCard.classList.add("movie-card");

    let buttonHTML = `<button class="movie-card__favorite-btn" data-title="${movieInfo.Title}">
    <i class="fa-solid fa-plus"></i> Favorite
    </button>`;

    let favoriteMovies = getFavoriteMovies();

    console.log();

    const isFavorite = favoriteMovies.some(
        (faMovie) => faMovie === movieInfo.Title
    );

    if (window.location.pathname === "/favorites.html") {
        buttonHTML = `
        <button class="movie-card__favorite-btn movie-card__favorite-btn--un" data-title="${movieInfo.Title}">
            <i class="fa-solid fa-x"></i> 
        </button>
    `;
    } else if (isFavorite) {
        buttonHTML = `<button class="movie-card__favorite-btn movie-card__favorite-btn--added" data-title="${movieInfo.Title}">
            <i class="fa-solid fa-check"></i> Added
        </button>`;
    }

    movieCard.innerHTML = `
        <figure class="movie-card__poster">
            <img href="../movie.html?id=${movieInfo.imdbID}" src="${
        movieInfo.Poster !== "N/A"
            ? movieInfo.Poster
            : "./res/icons/missing-poster.svg"
    }" alt="${movieInfo.Title}">
        </figure>
        <section class="movie-card__info">
        <p class="movie-card__rating"> ${
            movieInfo.imdbRating === "N/A" || movieInfo.imdbRating === undefined
                ? ""
                : `⭐ ${movieInfo.imdbRating}`
        }</p>
            <a href="../movie.html?id=${
                movieInfo.imdbID
            }" class="movie-card__title">
        ${movieInfo.Title}
    </a>
            
            <p class="movie-card__year"> ${
                movieInfo.Year !== "N/A" ? ` ${movieInfo.Year}` : ""
            }</p>
            
            
            ${buttonHTML}
        </section>
    `;

    document.querySelector("#cardContainer").appendChild(movieCard);
}

export { renderMovieCard };
