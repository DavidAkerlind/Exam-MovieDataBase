async function renderMoviePage(movie) {
    console.log("renderMoviePage()");

    let movieInfo = await movie;
    console.log(movieInfo);
    let poster = movieInfo.Poster;
    let writerArt = ``;
    let directorArt = ``;
    if (movieInfo.Type === "series") {
    }
    if (movieInfo.Poster !== "N/A") {
        poster = "./res/icons/missing-poster.svg";
    }
    if (movieInfo.Writer !== "N/A") {
        writerArt = `
        <article>
            <h2 class="movie-info__actors-title>Writer</h2>
            <p class="movie-info__actors-text>${movieInfo.Writer}</p>
        </article>`;
    }
    if (movieInfo.Director !== "N/A") {
        directorArt = `<article class="movie-info__director">
            <h2 class="movie-info__director-title>Director</h2>
            <p class="movie-info__director-text>${movieInfo.Director}</p>
        </article>`;
    }

    const movieContainer = document.getElementById("movieInfo");
    const html = `
       
        
        <section class="movie-info__poster" >
                    <h1 class="movie-info__title" >${movieInfo.Title}</h1>

            <img src="${poster}" alt="${movieInfo.Title} Poster">
        </section>
<section class="movie-info__details">
        <section class="movie-info__top">
    <p class="movie-info__list-item"><strong>Genre:</strong> ${
        movieInfo.Genre
    }</p>
    <p class="movie-info__list-item"><strong>Released:</strong> ${movieInfo.Year.slice(
        0,
        4
    )}</p>
    <p class="movie-info__list-item"><strong>Seasons:</strong> ${
        movieInfo.totalSeasons
    }</p>
    <p class="movie-info__list-item"><strong>Rated:</strong> ${
        movieInfo.Rated
    }</p>
</section>

        <section class="movie-info-plot">
            <h2 class="movie-info__plot-title">Plot</h2>
            <p class="movie-info__plot-text">${movieInfo.Plot}</p>
        </section>

        <section class="movie-info__people">
            <article class="movie-info__director">
                <h2 class="movie-info__director-title">Director</h2>
                <p class="movie-info__director-text">${
                    movieInfo.Director !== "N/A" ? movieInfo.Director : ""
                }</p>
            </article>

        <article>
            <h2 class="movie-info__actors-title">Actors</h2>
            <p class="movie-info__actors-text">${movieInfo.Actors}</p>
        </article>
        </section>
</section>
        `;
    movieContainer.innerHTML = html;
}

export { renderMoviePage };
