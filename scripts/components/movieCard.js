// Skapar och renderar filmkortet
async function renderMovieCard(movie) {
    console.log("renderMovieCard()");

    let movieInfo = await movie;

    const movieCard = document.createElement("article");
    movieCard.classList.add("movie-card");

    let button = `<button class="movie-card__favorite-btn">  <i class="fa-solid fa-plus"></i> Favorite</button>`;
    if (window.location.pathname === "/favorites.html") {
        button = `
            <button class="movie-card__favorite-btn movie-card__favorite-btn--un">
                <i class="fa-solid fa-x"></i> 
            </button>
        `;
    }
    movieCard.innerHTML = `
        <figure href="../movie.html?id=${
            movieInfo.imdbID
        }" class="movie-card__poster">
            <img src="${movieInfo.Poster}" alt="${movieInfo.Title}">
        </figure>
        <section class="movie-card__info">
            <a href="../movie.html?id=${
                movieInfo.imdbID
            }" class="movie-card__title">
        ${movieInfo.Title}
    </a>
            <p class="movie-card__rating"> ${
                movieInfo.imdbRating !== "N/A"
                    ? `⭐ ${movieInfo.imdbRating}`
                    : "No reviews"
            }</p>
            
            ${button}
        </section>
    `;

    document.querySelector("#cardContainer").appendChild(movieCard);
}

export { renderMovieCard };
