import { fetchMovieByTitle } from "../modules/api.js";
async function renderActorPage(actor) {
    console.log("renderActorPage()");

    let actorInfo = await actor;
    console.log(actorInfo);

    const actorContainer = document.getElementById("actorInfo");
    const profilePicture =
        actorInfo.profilePicture !== "https://image.tmdb.org/t/p/w500null"
            ? actorInfo.profilePicture
            : "./res/icons/missing-profile.svg";

    // Function to fetch movie data
    async function fetchMovieData(title) {
        const movieData = await fetchMovieByTitle(title);
        return movieData ? movieData.imdbID : null;
    }

    const html = `
        <section class="actor-info">
            <!-- Profilsektion -->
            <div class="actor-info__header">
                <figure class="actor-info__poster">
                    <img src="${profilePicture}" alt="${
        actorInfo.name
    } Profile Picture">
                </figure>
                <div class="actor-info__basic-info">
                    <h1 class="actor-info__title">${actorInfo.name}</h1>
                    <p class="actor-info__list-item"><strong>Born:</strong> ${
                        actorInfo.birthday || "Unknown"
                    }</p>
                    ${
                        actorInfo.deathday
                            ? `<p class="actor-info__list-item"><strong>Died:</strong> ${actorInfo.deathday}</p>`
                            : ""
                    }
                    <p class="actor-info__list-item"><strong>Place of Birth:</strong> ${
                        actorInfo.placeOfBirth || "Unknown"
                    }</p>
                </div>
            </div>

            <!-- Biografi -->
            <section class="actor-info__biography">
                <h2 class="actor-info__bio-title">Biography</h2>
                <p class="actor-info__bio-text">
                    ${
                        actorInfo.biography
                            ? actorInfo.biography.length > 500
                                ? actorInfo.biography.slice(0, 500) + "..."
                                : actorInfo.biography
                            : "No biography available."
                    }
                </p>
            </section>

            <!-- Kända filmer -->
            <section class="actor-info__movies">
                <h2 class="actor-info__movies-title">Known for</h2>
                <div class="actor-info__movies-grid">
                    ${await renderMovies(actorInfo.movies)}
                </div>
            </section>
        </section>
    `;

    actorContainer.innerHTML = html;

    // Function to render the first 10 movies and their IMDb links
    async function renderMovies(movies) {
        const first10Movies = movies.slice(0, 20); // Take only the first 10 movies
        const movieHtml = await Promise.all(
            first10Movies.map(async (movie) => {
                const imdbID = await fetchMovieData(movie.title);
                return `
                    <article class="actor-info__movie">
                        <a href="${
                            window.location.hostname.includes("github.io")
                                ? "/Exam-MovieDataBase/"
                                : "../"
                        }movie.html?id=${imdbID}" class="actor-info__movie-link">
                            <figure class="actor-info__movie-poster-container">
                                <img src="${
                                    movie.poster !== "N/A"
                                        ? movie.poster
                                        : "./res/icons/missing-poster.svg"
                                }" 
                                    alt="${
                                        movie.title
                                    } Poster" class="actor-info__movie-poster">
                            </figure>
                            <div class="actor-info__movie-info">
                                <p class="actor-info__movie-title">${
                                    movie.title
                                } (${
                    movie.releaseDate ? movie.releaseDate.slice(0, 4) : "N/A"
                })</p>
                                <p class="actor-info__movie-character"><strong>Role:</strong> ${
                                    movie.character || "N/A"
                                }</p>
                            </div>
                        </a>
                    </article>
                `;
            })
        );
        return movieHtml.join("");
    }
}

export { renderActorPage };
