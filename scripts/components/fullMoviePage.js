import { checkImageExists } from "../utils/utils.js";

async function renderMoviePage(movie) {
    console.log("renderMoviePage()");

    let movieInfo = await movie;
    if (!movieInfo) return;

    const movieContainer = document.getElementById("movieInfo");
    const moviePosterUrl = await checkImageExists(movieInfo.Poster);

    const html = `
        ${renderMoviePoster(movieInfo, moviePosterUrl)}
        <section class="movie-info__details">
            ${renderMovieDetails(movieInfo)}
            ${renderMoviePlot(movieInfo)}
            ${renderMoviePeople(movieInfo)}
        </section>
    `;

    movieContainer.innerHTML = html;
}

// **Renderar filmens poster och titel**
function renderMoviePoster(movieInfo, moviePosterUrl) {
    return `
        <section class="movie-info__poster">
            <h1 class="movie-info__title">${movieInfo.Title}</h1>
            <figure class="movie-info__poster-container">
                <img src="${moviePosterUrl}" alt="${movieInfo.Title} Poster">
            </figure>
            <button aria-label="Add ${movieInfo.Title} to favorites" id="movieCardBtn" 
                class="movie-card__favorite-btn" data-imdbID="${movieInfo.imdbID}" 
                data-title="${movieInfo.Title}">
                <i class="fa-solid fa-plus"></i> Favorite
            </button>
        </section>
    `;
}

// **Renderar filmens detaljer som genre, år, rating och typ**
function renderMovieDetails(movieInfo) {
    const movieTypeDisplay = getMovieTypeDisplay(movieInfo);

    return `
        <section class="movie-info__top">
            <p class="movie-info__list-item"><strong>Genre${
                movieInfo.Genre.includes(",") ? "s" : ""
            }:</strong> ${movieInfo.Genre}</p>
            <p class="movie-info__list-item"><strong>Released:</strong> ${movieInfo.Year.slice(
                0,
                4
            )}</p>
            ${movieTypeDisplay}
            <p class="movie-info__list-item"><strong>Rated:</strong> ${
                movieInfo.Rated
            }</p>
        </section>
    `;
}

// **Renderar plott-sektionen**
function renderMoviePlot(movieInfo) {
    return `
        <section class="movie-info__plot">
            <h2 class="movie-info__plot-title">Plot</h2>
            <p class="movie-info__plot-text">${movieInfo.Plot}</p>
        </section>
    `;
}

// **Renderar regissörer, skådespelare och manusförfattare**
function renderMoviePeople(movieInfo) {
    return `
        <section class="movie-info__people">
            ${renderPersonSection("Director", movieInfo.Director)}
            ${renderPersonSection("Actor", movieInfo.Actors)}
            ${renderPersonSection("Writer", movieInfo.Writer)}
        </section>
    `;
}

// **Renderar en enskild person-sektion med länkar**
function renderPersonSection(title, names) {
    if (!names || names === "N/A") return "";

    const plural = names.includes(",") ? "s" : "";
    return `
        <article class="movie-info__${title.toLowerCase()}s">
            <h3 class="movie-info__persons-title">${title}${plural}:</h3>
            <p class="movie-info__${title.toLowerCase()}s-text">
                ${createPersonLinks(names)}
            </p>
        </article>
    `;
}

// **Returnerar rätt beskrivning beroende på om det är en film eller serie**
function getMovieTypeDisplay(movieInfo) {
    if (movieInfo.Type === "series") {
        return `<p class="movie-info__list-item"><strong>Seasons:</strong> ${movieInfo.totalSeasons}</p>`;
    }
    if (movieInfo.Type === "movie") {
        return `<p class="movie-info__list-item"><strong>Duration:</strong> ${movieInfo.Runtime}</p>`;
    }
    return `<p class="movie-info__list-item"><strong>Type:</strong> ${movieInfo.Type}</p>`;
}

// **Skapar länkar för personer (lägg i `domUtils.js`)**
export function createPersonLinks(names) {
    return names
        .split(", ")
        .map(
            (name) =>
                `<a aria-label="Go to ${name}'s page" href="person.html?name=${encodeURIComponent(
                    name
                )}" class="movie-info__link">${name}</a>`
        )
        .join(" ");
}

export { renderMoviePage };
