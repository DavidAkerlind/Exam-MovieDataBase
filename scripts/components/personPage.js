import { fetchMovieByTitle } from "../modules/api.js";

// Function to generate the profile section
function generateProfileSection(personInfo) {
    const profilePicture =
        personInfo.profilePicture &&
        personInfo.profilePicture !== "https://image.tmdb.org/t/p/w500null"
            ? personInfo.profilePicture
            : "./res/icons/missing-profile.svg";

    return `
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
    `;
}

// Function to generate biography section
function generateBiographySection(personInfo) {
    return `
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
    `;
}

// Function to generate movie list
async function generateMovieList(movies) {
    const first40Movies = movies.slice(0, 40); // Limit to 40 movies
    const movieHtml = await Promise.all(
        first40Movies.map(async (movie) => {
            let movieByTitle = await fetchMovieByTitle(movie.title);

            if (!movieByTitle) return;

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
                        <p class="person-info__movie-title">${movie.title} (${
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

// Main function to render the person page
async function renderPersonPage(person) {
    console.log("renderPersonPage()");

    let personInfo = await person;
    const personContainer = document.querySelector(".content-wrapper");

    const profileSection = generateProfileSection(personInfo);
    const biographySection = generateBiographySection(personInfo);
    const movieSection =
        personInfo.credits && personInfo.credits.length > 0
            ? `<section class="person-info__all-movies">
                <h2 class="person-info__movies-title">Filmography</h2>
                <div class="person-info__movies-grid">
                    ${await generateMovieList(personInfo.credits)}
                </div>
            </section>`
            : "";

    const html = `
        <section class="person-info">
            ${profileSection}
            ${biographySection}
            ${movieSection}
        </section>
    `;

    personContainer.innerHTML = html;
}

export { renderPersonPage };
