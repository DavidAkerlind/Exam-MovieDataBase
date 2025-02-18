async function renderMoviePage(movie) {
    console.log("renderMoviePage()");

    let movieInfo = await movie;
    if (movieInfo === null || movieInfo === undefined) {
        return;
    }
    console.log(movieInfo);
    let poster = movieInfo.Poster;
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
    const html = `
       
        
<section class="movie-info__poster">
    <h1 class="movie-info__title">${movieInfo.Title}</h1>
    <figure class="movie-info__poster-container">
    <img src="${
        poster === "N/A" ? "./res/icons/missing-poster.svg" : poster
    }" alt="${movieInfo.Title} Poster">
    </figure>
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
     <p class="movie-info__list-item"><strong>Add to favorites:</strong> </p>
<button id="movieCardBtn" class="favorite-btn movie-card__favorite-btn" data-imdbid="${
        movieInfo.imdbID
    }">
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
    
</section>

        <section class="movie-info__plot">
            <h2 class="movie-info__plot-title">Plot</h2>
            <p class="movie-info__plot-text">${movieInfo.Plot}</p>
        </section>

        <section class="movie-info__people">
            <article class="movie-info__director">
                <h3 class="movie-info__director-title">Director${
                    movieInfo.Director.includes(",") ? "s" : ""
                }:</h3>
                <p class="movie-info__director-text">${
                    movieInfo.Director !== "N/A" ? movieInfo.Director : ""
                }</p>
            </article>

            <article class="movie-info__actors">
                <h3 class="movie-info__actors-title">Actor${
                    movieInfo.Actors.includes(",") ? "s" : ""
                }:</h3>
                <p class="movie-info__actors-text">
    ${
        movieInfo.Actors !== "N/A" && movieInfo.Actors
            ? movieInfo.Actors.split(", ")
                  .map(
                      (actor) =>
                          `<a href="actor.html?name=${encodeURIComponent(
                              actor
                          )}" class="movie-info__actor-link">${actor}</a>`
                  )
                  .join(", ")
            : ""
    }
</p>
            </article>
            <article class="movie-info__writer">
                <h3 class="movie-info__writer-title">Writer${
                    movieInfo.Writer.includes(",") ? "s" : ""
                }:</h3>
                <p class="movie-info__writer-text">${
                    movieInfo.Writer !== "N/A" && movieInfo.Writer
                        ? movieInfo.Writer
                        : ""
                }</p>
            </article>
        </section>
</section>
        `;
    movieContainer.innerHTML = html;
}

export { renderMoviePage };
