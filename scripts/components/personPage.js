import { fetchMovieByTitle } from "../modules/api.js";

async function renderPersonPage(person) {
    console.log("renderPersonPage()");

    let personInfo = await person;

    const personContainer = document.querySelector(".content-wrapper");
    const profilePicture =
        personInfo.profilePicture &&
        personInfo.profilePicture !== "https://image.tmdb.org/t/p/w500null"
            ? personInfo.profilePicture
            : "./res/icons/missing-profile.svg";

    const html = `
        <section class="person-info">
            <!-- Profilsektion -->
            <div class="person-info__header">
                <figure class="person-info__poster">
                    <img src="${profilePicture}" alt="${
        personInfo.name
    } Profile Picture">
                </figure>
                <div class="person-info__basic-info">
                    <h1 class="person-info__title">${personInfo.name}</h1>
                    <p class="person-info__list-item"><strong>Born:</strong> ${
                        personInfo.birthday || "Unknown"
                    }</p>
                    ${
                        personInfo.deathday
                            ? `<p class="person-info__list-item"><strong>Died:</strong> ${personInfo.deathday}</p>`
                            : ""
                    }
                    <p class="person-info__list-item"><strong>Place of Birth:</strong> ${
                        personInfo.placeOfBirth || "Unknown"
                    }</p>
                    ${
                        personInfo.knownFor && personInfo.knownFor.length > 0
                            ? `<p class="person-info__list-item"><strong>Known for:</strong> ${personInfo.knownFor.join(
                                  ", "
                              )}</p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Biography
 -->
            <section class="person-info__biography">
                <h2 class="person-info__bio-title">Biography</h2>
                <p class="person-info__bio-text">
                    ${
                        personInfo.biography
                            ? personInfo.biography
                            : "No biography available."
                    }
                </p>
            </section>

            <!-- 20 movies known for -->
            ${
                personInfo.credits && personInfo.credits.length > 0
                    ? `<section class="person-info__all-movies">
                        <h2 class="person-info__movies-title">Filmography</h2>
                        <div class="person-info__movies-grid">
                            ${await renderMovies(personInfo.credits)}
                        </div>
                    </section>`
                    : ""
            }
        </section>
    `;

    personContainer.innerHTML = html;

    // Funktion för att rendera filmer
    async function renderMovies(movies) {
        const first10Movies = movies.slice(0, 20); // Begränsa till 20 filmer
        const movieHtml = await Promise.all(
            first10Movies.map(async (movie) => {
                console.log(movie);

                let movieByTitle = await fetchMovieByTitle(movie.title);
                if (!movieByTitle) {
                    return;
                }
                console.log(movieByTitle.imdbID);

                return `
                <a href="${
                    window.location.hostname.includes("github.io")
                        ? "/Exam-MovieDataBase/"
                        : "/"
                }movie.html?id=${
                    movieByTitle.imdbID
                }" class="person-info__movie-link">
                    <article class="person-info__movie">
                        <figure class="person-info__movie-poster-container">
                            <img src="${
                                movie.poster === "N/A" ||
                                movie.poster ===
                                    "https://image.tmdb.org/t/p/w500null"
                                    ? "./res/icons/missing-poster.svg"
                                    : movie.poster
                            }" 
                            alt="${
                                movie.title
                            } Poster" class="person-info__movie-poster">
                        </figure>
                        <div class="person-info__movie-info">
                            <p class="person-info__movie-title">${
                                movie.title
                            } (${
                    movie.releaseDate ? movie.releaseDate.slice(0, 4) : "N/A"
                })</p>
                            <p class="person-info__movie-character"><strong>Role:</strong> ${
                                movie.character || "N/A"
                            }</p>
                        </div>
                    </article>
                </a>
            `;
            })
        );
        return movieHtml.join("");
    }
}

export { renderPersonPage };
