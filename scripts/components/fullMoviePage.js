import { checkImageExists } from "../utils/utils.js";

async function renderMoviePage(movie) {
    console.log("renderMoviePage()");

    let movieInfo = await movie;
    if (movieInfo === null || movieInfo === undefined) {
        return;
    }

    let movieType = movieInfo.Type; // Antingen "movie" eller "series"
    let movieTypeDisplay = "";

    if (movieType === "series") {
        movieTypeDisplay = `<p class="movie-info__list-item"><strong>Seasons:</strong> ${movieInfo.totalSeasons}</p>`;
    } else if (movieType === "movie") {
        movieTypeDisplay = `<p class="movie-info__list-item"><strong>Duration:</strong> ${movieInfo.Runtime}</p>`;
    } else {
        movieTypeDisplay = `<p class="movie-info__list-item"><strong>Type:</strong> ${movieType}</p>`;
    }
    const movieContainer = document.getElementById("movieInfo");

    let moviePosterUlr = await checkImageExists(movieInfo.Poster);

    const html = `
       
        
<section class="movie-info__poster">
    <h1 class="movie-info__title">${movieInfo.Title}</h1>
    <figure class="movie-info__poster-container">
    <img src="${moviePosterUlr}" alt="${movieInfo.Title} Poster">
    </figure>
    <button aria-label="Add ${
        movieInfo.Title
    } to favorites" id="movieCardBtn" class="movie-card__favorite-btn" data-imdbID="${
        movieInfo.imdbID
    }" data-title="${movieInfo.Title}">
    <i class="fa-solid fa-plus"></i> Favorite
    </button>
</section>

<section class="movie-info__details">
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

        <section class="movie-info__plot">
            <h2 class="movie-info__plot-title">Plot</h2>
            <p class="movie-info__plot-text">${movieInfo.Plot}</p>
        </section>

        <section class="movie-info__people">
            <article class="movie-info__directors">
    <h3 class="movie-info__persons-title">Director${
        movieInfo.Director && movieInfo.Director.includes(",") ? "s" : ""
    }:</h3>
    <p class="movie-info__directors-text">
        ${
            movieInfo.Director !== "N/A" && movieInfo.Director
                ? movieInfo.Director.split(", ")
                      .map(
                          (director) =>
                              `<a arial-label="go to ${director}s page" href="person.html?name=${encodeURIComponent(
                                  director
                              )}" class="movie-info__director-link movie-info__link">${director}</a>`
                      )
                      .join(" ")
                : ""
        }
    </p>
</article>

            <article class="movie-info__actors">
                <h3 class="movie-info__persons-title">Actor${
                    movieInfo.Actors.includes(",") ? "s" : ""
                }:</h3>
                <p class="movie-info__actors-text">
    ${
        movieInfo.Actors !== "N/A" && movieInfo.Actors
            ? movieInfo.Actors.split(", ")
                  .map(
                      (actor) =>
                          `<a arial-label="go to ${actor}s page" href="person.html?name=${encodeURIComponent(
                              actor
                          )}" class="movie-info__actor-link movie-info__link">${actor}</a>`
                  )
                  .join(" ")
            : ""
    }
</p>
            </article>
            <article class="movie-info__writers">
    <h3 class="movie-info__persons-title">Writer${
        movieInfo.Writer && movieInfo.Writer.includes(",") ? "s" : ""
    }:</h3>
    <p class="movie-info__writers-text">
        ${
            movieInfo.Writer !== "N/A" && movieInfo.Writer
                ? movieInfo.Writer.split(", ")
                      .map(
                          (writer) =>
                              `<a arial-label="go to ${writer}s page" href="person.html?name=${encodeURIComponent(
                                  writer
                              )}" class="movie-info__writer-link movie-info__link">${writer}</a>`
                      )
                      .join(" ")
                : ""
        }
    </p>
</article>
        </section>
</section>
        `;
    movieContainer.innerHTML = html;
}

export { renderMoviePage };
