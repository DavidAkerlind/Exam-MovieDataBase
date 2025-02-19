import { fetchCarouselMovies } from "../modules/api.js";
import { renderMovieCard } from "./movieCard.js";

export async function renderRecommendations() {
    let topMovieList = await fetchCarouselMovies();

    if (topMovieList.length < 10) {
        console.log("Not enough movies to display recommendations");
        return;
    }

    let podiumPositions = [
        { place: 2, className: "second-place" }, // Index 1 (till höger)
        { place: 1, className: "first-place" }, // Index 0 (i mitten)
        { place: 3, className: "third-place" }, // Index 2 (till vänster)
    ];

    podiumPositions.forEach((pos, index) => {
        let movie = topMovieList[index];
        let podiumDiv = document.createElement("div");
        podiumDiv.classList.add("podium", pos.className);
        podiumDiv.innerHTML = `
            <div class="podium-rank">#${pos.place}</div>
             <a alt="Go to ${movie.Title} full page" href="${
            window.location.hostname.includes("github.io")
                ? "/Exam-MovieDataBase/"
                : "../"
        }movie.html?id=${movie.imdbID}">
            <img src="${movie.Poster}" alt="${movie.Title}">
            </a>
           <a alt="Go to ${movie.Title} full page" href="${
            window.location.hostname.includes("github.io")
                ? "/Exam-MovieDataBase/"
                : "../"
        }movie.html?id=${
            movie.imdbID
        }" class="movie-card__title movie-card__title--podium">
    ${
        movie.Title.length > 60
            ? movie.Title.substring(0, 57) + "…"
            : movie.Title
    }
</a>

        `;
        podiumContainer.appendChild(podiumDiv);
    });
    // Rendera resterande filmer som kort
    for (let i = 3; i < 15; i++) {
        let movie = topMovieList[i];
        renderMovieCard(movie, i);
    }
    for (let i = 15; i < topMovieList.length; i++) {
        let movie = topMovieList[i];

        let listItem = document.createElement("li");
        listItem.classList.add("movie-list-item");
        listItem.innerHTML = `
        <span class="movie-list__rank">#${i + 1}</span>
        <a alt="Go to ${movie.Title} full page" href="${
            window.location.hostname.includes("github.io")
                ? "/Exam-MovieDataBase/"
                : "../"
        }movie.html?id=${movie.imdbID}" class="movie-card__title">${
            movie.Title
        }</a>
        <a alt="Go to ${movie.Title} full page" href="${
            movie.Trailer_link
        }" target="_blank" class="trailer-link">Watch Trailer</a>
        <button aria-label="Add ${
            movie.Title
        } to favorites" id="movieCardBtn" class="favorite-btn movie-card__favorite-btn" data-imdbid="${
            movie.imdbID
        }">
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
    `;
        document.querySelector(".movie-list").appendChild(listItem);
    }
}
