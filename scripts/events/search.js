import { fetchMovieSearch } from "../modules/api.js";
import { renderMovieCard } from "../components/movieCard.js";

const hamburgerElemRef = `<nav class="menu__navigation d-none" aria-label="Main Navigation on Mobile" aria-expanded="false">
        <ul class="menu__list">
            <!-- Logo -->
            <li class="menu__item">
                <a aria-label="Back to home link" href="index.html">
                    <img aria-hidden="true" class="menu__logo" src="./res/logo.png" alt="Website Logo">
                </a>
            </li>

            

            <!-- Navigation Links -->
            <li class="menu__item">
                <a id="homeLink" class="menu__link" href="./index.html" aria-label="Navigate to home page">
                    Home
                </a>
            </li>
            <li class="menu__item">
                <a id="searchLink" class="menu__link" href="./search.html" aria-label="Navigate to search page">
                    Search
                </a>
            </li>
            <li class="menu__item">
                <a id="favoritesLink" class="menu__link" href="./favorites.html" aria-label="Navigate to favorites page">
                    Favorites
                </a>
            </li>
        </ul>
    </nav>`;

export function initSearchFunc() {
    document.addEventListener("DOMContentLoaded", () => {
        console.log("initSearchFunc()");

        const searchInputs = document.querySelectorAll("#searchInput");

        searchInputs.forEach((searchInput) => {
            const searchResults = document.createElement("ul");
            searchResults.classList.add("search-results");
            searchInput.parentNode.appendChild(searchResults);

            searchResults.classList.add("d-none");

            searchInput.addEventListener("focus", () => {
                if (searchResults.innerHTML.trim() !== "") {
                    searchResults.classList.remove("d-none");
                }
            });

            searchInput.addEventListener("input", async () => {
                const query = searchInput.value.trim();

                searchResults.innerHTML = "";

                if (query.length < 1) {
                    searchResults.classList.add("d-none");
                    return;
                }

                const movies = await fetchMovieSearch(query);
                if (movies.length === 0) {
                    console.log("No movies found");
                    return;
                }

                movies.forEach((movie) => {
                    const li = document.createElement("li");
                    li.classList.add("search-results__item");
                    li.textContent = `${movie.Title} (${movie.Year})`;
                    li.addEventListener("click", () => {
                        searchInput.value = movie.Title;
                        searchResults.innerHTML = "";
                        searchResults.classList.add("d-none");
                    });
                    searchResults.appendChild(li);
                });

                searchResults.classList.remove("d-none");
            });

            document.addEventListener("click", (event) => {
                let menuToggle = document.querySelector("#menu-toggle");
                let menu = document.querySelector(".menu__navigation");

                if (
                    !searchInput.contains(event.target) &&
                    !searchResults.contains(event.target)
                ) {
                    searchResults.classList.add("d-none");
                }
                if (
                    !menu.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {
                    menuToggle.checked = false;
                }
            });

            const searchForm = document.querySelectorAll("#searchForm");

            searchForm.forEach((elem) => {
                elem.addEventListener("submit", (event) => {
                    event.preventDefault();
                    let query = elem.querySelector("#searchInput").value;
                    console.log(query);

                    if (query.length > 0) {
                        window.location.href = `search.html?q=${encodeURIComponent(
                            query
                        )}`;
                        // Skicka användaren till search.html med sökfrågan som URL-parameter
                    }
                });
            });
        });
    });
}

export async function loadSearchResults(query) {
    console.log("loadSearchResults()");

    document.querySelector(
        "#searchHeader"
    ).innerHTML = `Search results for: <p class="search-result">${query}</p>`;

    try {
        const movies = await fetchMovieSearch(query);

        const cardContainerRef = document.querySelector("#cardContainer");

        cardContainerRef.innerHTML = "";

        if (movies.length === 0) {
            document.querySelector("#searchHeader").textContent =
                "No results found.";
        } else {
            movies.forEach((movie) => {
                renderMovieCard(movie);
            });
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
}
