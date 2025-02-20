import { getFavoriteMovies } from "../data/localStorage.js";
import { checkImageExists, adjustPath, getBasePath } from "../utils/utils.js";

// Initializes and renders the movie card
export async function renderMovieCard(movie, index) {
    console.log("renderMovieCard()");

    const movieInfo = await movie;
    const movieCard = createMovieCardElement();
    const favoriteMovies = getFavoriteMovies();
    const moviePosterUrl = await checkImageExists(movieInfo.Poster);
    const isFavorite = favoriteMovies.includes(movieInfo.Title);
    const basePath = getBasePath();
    const path = adjustPath(basePath);

    const buttonHTML = getButtonHTML(movieInfo, isFavorite, path);
    const posDiv =
        path === "/index.html"
            ? `<p class="movie-rank"># ${index + 1}</p>`
            : "";

    movieCard.innerHTML = generateMovieCardHTML(
        movieInfo,
        moviePosterUrl,
        buttonHTML,
        posDiv
    );
    document.querySelector("#cardContainer").appendChild(movieCard);
}

// Creates the movie card article element
function createMovieCardElement() {
    const movieCard = document.createElement("article");
    movieCard.classList.add("movie-card");
    return movieCard;
}

// Determines base path for GitHub Page

// Generates the appropriate button HTML based on page and favorite status
function getButtonHTML(movieInfo, isFavorite, path) {
    if (path === "/favorites.html") {
        return `
            <button aria-label="Remove ${movieInfo.Title} from favorites" id="movieCardBtn" 
                class="movie-card__favorite-btn movie-card__favorite-btn--un" 
                data-imdbID="${movieInfo.imdbID}" data-title="${movieInfo.Title}">
                <i class="fa-solid fa-x"></i> 
            </button>
        `;
    }

    if (isFavorite) {
        return `
            <button aria-label="Already added ${movieInfo.Title} to favorites" id="movieCardBtn" 
                class="movie-card__favorite-btn movie-card__favorite-btn--added" 
                data-imdbID="${movieInfo.imdbID}" data-title="${movieInfo.Title}">
                <i class="fa-solid fa-check"></i> Added
            </button>
        `;
    }

    return `
        <button aria-label="Add ${movieInfo.Title} to favorites" id="movieCardBtn" 
            class="movie-card__favorite-btn" 
            data-imdbID="${movieInfo.imdbID}" data-title="${movieInfo.Title}">
            <i class="fa-solid fa-plus"></i> Favorite
        </button>
    `;
}

// Generates the full HTML structure for the movie card
function generateMovieCardHTML(movieInfo, moviePosterUrl, buttonHTML, posDiv) {
    const moviePageURL = `${
        window.location.hostname.includes("github.io")
            ? "/Exam-MovieDataBase/"
            : "../"
    }movie.html?id=${movieInfo.imdbID}`;

    return `
        <figure class="movie-card__poster">
            <a aria-label="Go to ${
                movieInfo.Title
            } full page" href="${moviePageURL}">
                <img src="${moviePosterUrl}" alt="${movieInfo.Title}">
            </a>
        </figure>
        <section class="movie-card__info">
            <p class="movie-card__rating">
                ${
                    movieInfo.imdbRating && movieInfo.imdbRating !== "N/A"
                        ? `⭐ ${movieInfo.imdbRating}`
                        : ""
                }
            </p>
            <a aria-label="Go to ${
                movieInfo.Title
            } full page" href="${moviePageURL}" class="movie-card__title">
                ${
                    movieInfo.Title.length > 47
                        ? movieInfo.Title.substring(0, 40) + "..."
                        : movieInfo.Title
                }
            </a>
            <p class="movie-card__year">
                ${
                    movieInfo.Year && movieInfo.Year !== "N/A"
                        ? movieInfo.Year
                        : posDiv
                }
            </p>
            ${buttonHTML}
        </section>
    `;
}
