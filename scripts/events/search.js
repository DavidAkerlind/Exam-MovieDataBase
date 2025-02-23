import { fetchMovieSearch } from "../modules/api.js";
import { extractTitle } from "../utils/utils.js";
import { renderMovieCard } from "../components/movieCard.js";

let selectedIndex = -1;

export function initSearchFunc() {
    document.addEventListener("DOMContentLoaded", () => {
        console.log("initSearchFunc()");

        const searchInputs = getSearchInputs();
        searchInputs.forEach(setupSearchInput);
    });
}

function getSearchInputs() {
    const searchInputHeader = document.querySelector("#searchInput");
    const searchInputPage = document.querySelector("#searchInputOnPage");
    return searchInputPage
        ? [searchInputHeader, searchInputPage]
        : [searchInputHeader];
}

function setupSearchInput(searchInput) {
    const searchResults = createSearchResultsElement();

    searchInput.parentNode.appendChild(searchResults);

    searchInput.addEventListener("focus", () =>
        toggleSearchResults(searchResults)
    );
    searchInput.addEventListener("input", async () =>
        handleSearchInput(searchInput, searchResults)
    );
    searchInput.addEventListener("keydown", (event) =>
        handleKeyboardNavigation(event, searchInput, searchResults)
    );
    document.addEventListener("click", (event) =>
        closeSearchOnClickOutside(event, searchInput, searchResults)
    );
    setupFormSubmission();
}

function createSearchResultsElement() {
    const searchResults = document.createElement("ul");
    searchResults.classList.add("search-results", "d-none");
    searchResults.setAttribute("role", "listbox");
    return searchResults;
}

async function handleSearchInput(searchInput, searchResults) {
    const query = searchInput.value.trim();
    searchResults.innerHTML = "";
    if (query.length < 1) return searchResults.classList.add("d-none");

    const movies = await fetchMovieSearch(query);
    console.log(movies);
    if (movies.length === 0) return console.log("No movies found");

    movies.forEach((movie) => {
        const li = document.createElement("li");
        li.classList.add("search-results__item");
        li.setAttribute("role", "option");
        li.textContent = `${movie.Title} - (${movie.Year})`;

        li.addEventListener("click", () => {
            searchInput.value = movie.Title;
            clearSearchResults(searchResults);
        });

        searchResults.appendChild(li);
    });

    searchResults.classList.remove("d-none");
}

function handleKeyboardNavigation(event, searchInput, searchResults) {
    const results = Array.from(
        searchResults.querySelectorAll(".search-results__item")
    );
    if (results.length === 0) return;

    switch (event.key) {
        case "Tab":
            event.preventDefault();
            updateSelection(
                results,
                event.shiftKey ? selectedIndex - 1 : selectedIndex + 1
            );
            break;
        case "Enter":
            event.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                searchInput.value = extractTitle(
                    results[selectedIndex].textContent.trim()
                );
                clearSearchResults(searchResults);
            }
            break;
    }
}

function updateSelection(items, newIndex) {
    if (selectedIndex >= 0) items[selectedIndex].classList.remove("selected");
    selectedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    if (selectedIndex >= 0) items[selectedIndex].classList.add("selected");
}

function closeSearchOnClickOutside(event, searchInput, searchResults) {
    if (
        !searchInput.contains(event.target) &&
        !searchResults.contains(event.target)
    ) {
        searchResults.classList.add("d-none");
    }
}

function clearSearchResults(searchResults) {
    searchResults.innerHTML = "";
    searchResults.classList.add("d-none");
}

function toggleSearchResults(searchResults) {
    if (searchResults.innerHTML.trim() !== "") {
        searchResults.classList.remove("d-none");
    }
}

function setupFormSubmission() {
    document.querySelectorAll("#searchForm").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = getSearchQuery();
            if (query)
                window.location.href = `search.html?q=${encodeURIComponent(
                    query
                )}`;
        });
    });
}

function getSearchQuery() {
    const searchInput = document.querySelector("#searchInput");
    const searchInputOnPage = document.querySelector("#searchInputOnPage");
    return searchInput?.value.trim() || searchInputOnPage?.value.trim() || "";
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
