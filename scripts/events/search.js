import { fetchMovieSearch } from "../modules/api.js";
import { renderMovieCard } from "../components/movieCard.js";

export function initSearchFunc() {
    document.addEventListener("DOMContentLoaded", () => {
        console.log("initSearchFunc()");
        const searchInput = document.getElementById("searchInput");
        const searchResults = document.createElement("ul");
        searchResults.classList.add("search-results");
        searchInput.parentNode.appendChild(searchResults);

        searchInput.addEventListener("focus", () => {
            if (searchResults.innerHTML.trim() !== "") {
                searchResults.classList.remove("d-none");
            }
        });

        searchInput.addEventListener("input", async () => {
            const query = searchInput.value.trim();
            searchResults.innerHTML = "";

            if (query.length < 1) {
                searchResults.classList.remove("d-none");
                return;
            }

            const movies = await fetchMovieSearch(query);
            if (movies.length === 0) {
                console.log("in search.js no movies found");
                return;
            }
            console.log(movies);
            movies.forEach((movie) => {
                const li = document.createElement("li");
                li.classList.add("search-results__item");
                li.textContent = `${movie.Title} (${movie.Year})`;
                li.addEventListener("click", () => {
                    searchInput.value = movie.Title;
                    searchResults.innerHTML = "";
                });
                searchResults.appendChild(li);
            });
        });

        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const query = searchInput.value.trim();
            if (query.length > 0) {
                window.location.href = `/search.html?q=${query}`;
            }
        });

        // Döljer sökresultaten när man klickar utanför
        document.addEventListener("click", (event) => {
            if (
                !searchInput.contains(event.target) &&
                !searchResults.contains(event.target)
            ) {
                searchResults.classList.add("d-none");
            }
        });
    });
}

export async function loadSearchResults(query) {
    console.log("loadSearchResults()");

    document.querySelector(
        "#searchHeader"
    ).textContent = `Search results for: ${query}`;

    try {
        // Hämta sökresultaten från OMDB API
        const movies = await fetchMovieSearch(query);
        console.log(movies); // För felsökning, kan ta bort senare

        // Hämta referensen till container där vi ska visa filmerna
        const cardContainerRef = document.querySelector("#cardContainer");

        // Rensa tidigare sökresultat
        cardContainerRef.innerHTML = "";

        // Om inga filmer hittades
        if (movies.length === 0) {
            document.querySelector("#searchHeader").textContent =
                "No results found.";
        } else {
            // För varje film i resultatet, anropa renderMovie
            movies.forEach((movie) => {
                renderMovieCard(movie); // Rendera film
            });
        }
    } catch (error) {
        console.error("Error fetching search results:", error); // Hantera fel
    }
}
