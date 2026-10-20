// Search results: people strip + movie grid with "load more" / infinite scroll.
import { searchAll } from "../modules/api.js";
import { html, mount } from "../utils/html.js";
import { profileImage } from "../utils/images.js";
import { setPageTitle, reveal, settleImages } from "../utils/motion.js";
import { skeletonCards, showNotice, errorNotice, noticeHTML } from "../components/feedback.js";
import { appendTo, movieCardHTML, personUrl } from "../components/movieCard.js";
import { searchFormHTML } from "../components/header.js";
import { initSearch } from "../events/search.js";

function peopleHTML(people) {
    return html`${people.map(
        (person) => html`
            <li class="people-strip__item reveal">
                <a class="person-chip glass glass--flat" href="${personUrl(person.id)}">
                    <img class="person-chip__photo is-loading" src="${profileImage(person.profile, "w185")}" alt="" width="52" height="52" loading="lazy" data-fallback="./res/icons/missing-profile.svg" />
                    <span class="person-chip__text">
                        <span class="person-chip__name">${person.name}</span>
                        <span class="person-chip__meta">${[person.department, person.knownFor[0]].filter(Boolean).join(" · ")}</span>
                    </span>
                </a>
            </li>
        `
    )}`;
}

export async function init() {
    const query = (new URLSearchParams(window.location.search).get("q") || "").trim();

    const heading = document.querySelector("#searchHeader");
    const summary = document.querySelector("#searchSummary");
    const grid = document.querySelector("#cardContainer");
    const peopleSection = document.querySelector("#peopleSection");
    const peopleStrip = document.querySelector("#peopleStrip");
    const loadMore = document.querySelector("#loadMore");
    const loadMoreButton = document.querySelector("#loadMoreBtn");
    const sentinel = document.querySelector("#loadSentinel");

    // The on-page search field (shown on small screens where the header search is in the menu).
    const pageSearch = document.querySelector(".search-container");
    mount(pageSearch, searchFormHTML({ id: "searchInputOnPage", placeholder: "Search MMDb", value: query }));
    initSearch(pageSearch);

    if (!query) {
        setPageTitle("Search");
        heading.textContent = "Search";
        summary.textContent = "Find any movie or person.";
        grid.classList.remove("card-container");
        mount(
            grid,
            noticeHTML({
                title: "What are you looking for?",
                text: "Type a title or a name in the search bar to get started.",
                iconName: "search",
            })
        );
        document.querySelector("#searchInput")?.focus();
        return;
    }

    setPageTitle(`“${query}”`);
    heading.replaceChildren(document.createTextNode("Results for "));
    const term = document.createElement("span");
    term.className = "search-result";
    term.textContent = `“${query}”`;
    heading.append(term);

    let page = 0;
    let totalPages = 1;
    let loading = false;
    let observer = null;

    async function loadPage() {
        if (loading || page >= totalPages) return;
        loading = true;
        loadMoreButton.disabled = true;
        grid.setAttribute("aria-busy", "true");

        const next = page + 1;
        if (next === 1) mount(grid, skeletonCards(10));

        try {
            const data = await searchAll(query, { page: next });
            if (next === 1) {
                grid.replaceChildren();
                if (data.people.length) {
                    mount(peopleStrip, peopleHTML(data.people));
                    peopleSection.hidden = false;
                    reveal(peopleStrip);
                    settleImages(peopleStrip);
                }
                summary.textContent = data.totalResults
                    ? `${data.totalResults.toLocaleString("en")} ${data.totalResults === 1 ? "movie" : "movies"} found`
                    : "";

                if (!data.movies.length && !data.people.length) {
                    grid.classList.remove("card-container");
                    mount(
                        grid,
                        noticeHTML({
                            title: "No results found",
                            text: `Nothing matched “${query}”. Check the spelling or try a shorter search.`,
                            iconName: "search",
                        })
                    );
                    return;
                }
            }

            page = data.page;
            totalPages = data.totalPages;
            appendTo(grid, html`${data.movies.map((movie) => movieCardHTML(movie))}`);

            const more = page < totalPages;
            loadMore.hidden = !more;
            if (more && "IntersectionObserver" in window && !observer) {
                observer = new IntersectionObserver(
                    (entries) => entries.some((entry) => entry.isIntersecting) && loadPage(),
                    { rootMargin: "400px" }
                );
                observer.observe(sentinel);
            }
            if (!more) observer?.disconnect();
        } catch (error) {
            console.error(error);
            if (next === 1) {
                grid.classList.remove("card-container");
                showNotice(grid, errorNotice(error, () => {
                    grid.classList.add("card-container");
                    loadPage();
                }));
            } else {
                loadMore.hidden = false;
                loadMoreButton.textContent = "Couldn't load more. Try again";
            }
        } finally {
            loading = false;
            loadMoreButton.disabled = false;
            grid.removeAttribute("aria-busy");
        }
    }

    loadMoreButton.addEventListener("click", () => {
        loadMoreButton.textContent = "Load more";
        loadPage();
    });

    await loadPage();
}

