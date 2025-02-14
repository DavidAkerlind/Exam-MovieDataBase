async function renderMoviePage(movie) {
    console.log("renderMoviePage()");

    let movieInfo = await movie;
    console.log(movieInfo);

    const movieContainer = document.getElementById("movieInformation");
    const html = `
    <div class="movie-info">
      <img src="${movieInfo.Poster}" alt="${movieInfo.Title}">
      <h1>${movieInfo.Title}</h1>
      <p><strong>Rated:</strong> ${movieInfo.Rated}</p>
      <p><strong>Runtime:</strong> ${movieInfo.Runtime}</p>
      <p><strong>Genre:</strong> ${movieInfo.Genre}</p>
      <p><strong>Release Date:</strong> ${movieInfo.ReleaseDate}</p>
      <p><strong>Awards:</strong> ${movieInfo.Awards}</p>
      <p><strong>Ratings:</strong>
        <ul>
          ${movieInfo.Ratings.map(
              (rating) => `<li>${rating.Source}: ${rating.Value}</li>`
          ).join("")}
        </ul>
      </p>
      <p><strong>Metascore:</strong> ${movieInfo.Metascore}</p>
      <p><strong>Director:</strong> ${movieInfo.Director}</p>
      <p><strong>Writer:</strong> ${movieInfo.Writer}</p>
      <p><strong>Actors:</strong> ${movieInfo.Actors}</p>
      <p><strong>Plot:</strong> ${movieInfo.Plot}</p>
      <p><strong>Country:</strong> ${movieInfo.Country}</p>
      <p><strong>Language:</strong> ${movieInfo.Language}</p>
      <p><strong>Year:</strong> ${movieInfo.Year}</p>
      <p><strong>Total Seasons:</strong> ${movieInfo.TotalSeasons}</p>
      <p><strong>IMDB ID:</strong> ${movieInfo.ImdbID}</p>
      <p><strong>IMDB Rating:</strong> ${movieInfo.ImdbRating}</p>
      <p><strong>IMDB Votes:</strong> ${movieInfo.ImdbVotes}</p>
    </div>
  `;
    movieContainer.innerHTML = html;
}

export { renderMoviePage };
