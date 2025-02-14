import { fetchMovieData } from "../modules/api.js";

// Skapar och renderar filmkortet
async function renderMovieCard(movie) {
    console.log("renderMovieCard()");

    let movieDone = await movie;

    const movieCard = document.createElement("a");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
        <figure class="movie-card__poster">
            <img src="${movieDone.Poster}" alt="${movieDone.Title}">
        </figure>
        <section class="movie-card__info">
            <a href="${movieDone}" class="movie-card__title">${
        movieDone.Title
    }</a>
            <p class="movie-card__rating"> ${
                movieDone.imdbRating !== "N/A"
                    ? `⭐ ${movieDone.imdbRating}`
                    : "No reviews"
            }</p>
            <button class="movie-card__favorite-btn">  <i class="fa-solid fa-plus"></i> Favorite</button>
        </section>
    `;

    document.querySelector("#cardContainer").appendChild(movieCard);
}

export { renderMovieCard };
