import { fetchMovieByTitle } from "../modules/api.js";

async function renderActorPage(person) {
    console.log("renderPersonPage()");

    let personInfo = await person;
    console.log(personInfo);

    const personContainer = document.getElementById("actorInfo");
    const profilePicture =
        personInfo.profilePicture !== "https://image.tmdb.org/t/p/w500null"
            ? personInfo.profilePicture
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
        personInfo.name
    } Profile Picture">
                </figure>
                <div class="actor-info__basic-info">
                    <h1 class="actor-info__title">${personInfo.name}</h1>
                    <p class="actor-info__list-item"><strong>Born:</strong> ${
                        personInfo.birthday || "Unknown"
                    }</p>
                    ${
                        personInfo.deathday
                            ? `<p class="actor-info__list-item"><strong>Died:</strong> ${personInfo.deathday}</p>`
                            : ""
                    }
                    <p class="actor-info__list-item"><strong>Place of Birth:</strong> ${
                        personInfo.placeOfBirth || "Unknown"
                    }</p>
                    ${
                        personInfo.knownForDepartment
                            ? `<p class="actor-info__list-item"><strong>Profession:</strong> ${personInfo.knownForDepartment}</p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Biografi -->
            <section class="actor-info__biography">
                <h2 class="actor-info__bio-title">Biography</h2>
                <p class="actor-info__bio-text">
                    ${
                        personInfo.biography
                            ? personInfo.biography.length > 500
                                ? personInfo.biography.slice(0, 500) + "..."
                                : personInfo.biography
                            : "No biography available."
                    }
                </p>
            </section>

            <!-- Kända verk -->
            <section class="actor-info__movies">
                <h2 class="actor-info__movies-title">Known for</h2>
                <div class="actor-info__movies-grid">
                    ${await renderMovies(personInfo)}
                </div>
            </section>
        </section>
    `;

    personContainer.innerHTML = html;

    // Function to render movies/works
    async function renderMovies(person) {
        let movies = person.movies || person.knownFor || []; // Hanterar olika roller (skådespelare, regissör, etc.)

        if (!Array.isArray(movies) || movies.length === 0) {
            return "<p>No known works found.</p>";
        }

        const first10Movies = movies.slice(0, 10);
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
                                    movie.poster === "N/A" ||
                                    movie.poster ===
                                        "https://image.tmdb.org/t/p/w500null"
                                        ? "./res/icons/missing-poster.svg"
                                        : movie.poster
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
