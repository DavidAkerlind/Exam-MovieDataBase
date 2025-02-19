import { getFavoriteMovies } from "../data/localStorage.js";
import { checkImageExists } from "../utils/utils.js";

// Skapar och renderar filmkortet
async function renderMovieCard(movie, index) {
    console.log("renderMovieCard()");

    let movieInfo = await movie;

    const movieCard = document.createElement("article");
    movieCard.classList.add("movie-card");

    let buttonHTML = `<button aria-label="Add ${movieInfo.Title} to favorites" id="movieCardBtn" class="movie-card__favorite-btn" data-imdbID="${movieInfo.imdbID}" data-title="${movieInfo.Title}">
    <i class="fa-solid fa-plus"></i> Favorite
    </button>`;

    let favoriteMovies = getFavoriteMovies();

    let moviePosterUlr = await checkImageExists(movieInfo.Poster);

    const isFavorite = favoriteMovies.some(
        (faMovie) => faMovie === movieInfo.Title
    );

    const isGitHubPages =
        window.location.hostname === "davidakerlind.github.io";

    // Basvägen för GitHub Pages
    const basePath = isGitHubPages ? "/Exam-MovieDataBase" : "";

    // Justera sökvägen baserat på om vi är på GitHub Pages eller ej
    const path = window.location.pathname.replace(basePath, "");

    let posDiv = ``;
    if (path === "/index.html") {
        posDiv = `<p class="movie-rank" ># ${index + 1}</p>`;
    }

    if (path === "/favorites.html") {
        buttonHTML = `
        <button aria-label="Remove ${movieInfo.Title} from favorites" id="movieCardBtn" class="movie-card__favorite-btn movie-card__favorite-btn--un" data-imdbID="${movieInfo.imdbID}" data-title="${movieInfo.Title}">
            <i class="fa-solid fa-x"></i> 
        </button>
    `;
    } else if (isFavorite) {
        buttonHTML = `<button aria-label="Already added${movieInfo.Title} to favorites" id="movieCardBtn" class="movie-card__favorite-btn movie-card__favorite-btn--added" data-imdbID="${movieInfo.imdbID}" data-title="${movieInfo.Title}">
            <i class="fa-solid fa-check"></i> Added
        </button>`;
    }

    movieCard.innerHTML = `
        <figure class="movie-card__poster">
        <a alt="Go to ${movie.Title} full page" aria-label="Go to ${
        movie.Title
    } full page" href="${
        window.location.hostname.includes("github.io")
            ? "/Exam-MovieDataBase/"
            : "../"
    }movie.html?id=${movie.imdbID}">
            <img src="${moviePosterUlr}" alt="${movieInfo.Title}"></a>
        </figure>
        <section class="movie-card__info">
        <p class="movie-card__rating"> ${
            movieInfo.imdbRating === "N/A" || movieInfo.imdbRating === undefined
                ? ""
                : `⭐ ${movieInfo.imdbRating}`
        }</p>
            <a alt="Go to ${movie.Title} full page" href="${
        window.location.hostname.includes("github.io")
            ? "/Exam-MovieDataBase/"
            : "../"
    }movie.html?id=${movie.imdbID}" class="movie-card__title">
    ${
        movieInfo.Title.length > 47
            ? movieInfo.Title.substring(0, 40) + "..."
            : movieInfo.Title
    }
</a>

         <p class="movie-card__year"> 
    ${movieInfo.Year && movieInfo.Year !== "N/A" ? movieInfo.Year : posDiv}
</p>

            
            ${buttonHTML}
        </section>
    `;

    document.querySelector("#cardContainer").appendChild(movieCard);
}

export { renderMovieCard };
