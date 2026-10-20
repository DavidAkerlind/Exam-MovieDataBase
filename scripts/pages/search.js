// Search page: results update live while you type (no Enter needed). People strip +
// movie grid, "load more" / infinite scroll, URL kept in sync, race free.
import { searchAll, peekSearch } from "../modules/api.js";
import { html, mount } from "../utils/html.js";
import { profileImage } from "../utils/images.js";
import { setPageTitle, reveal, settleImages } from "../utils/motion.js";
import { skeletonCards, showNotice, errorNotice, noticeHTML } from "../components/feedback.js";
import { appendTo, movieCardHTML, personUrl } from "../components/movieCard.js";
import { searchFormHTML } from "../components/header.js";
import { initSearch, SEARCH_EVENT } from "../events/search.js";

const normalize = (text) => text.trim().replace(/\s+/g, " ");

function peopleHTML(people) {
    return html`${people.map(
        (person) => html`
            <li class="people-strip__item reveal">
                <a class="person-chip glass glass--flat" href="${personUrl(person.id)}">
                    <img class="person-chip__photo is-loading" src="${profileImage(person.profile, "w185")}" alt="" width="52" height="52" loading="lazy" data-fallback="./res/icons/missing-profile.svg" />
                    <span class="person-chip__text">
                        <span class="person-chip__name" data-zoom-name>${person.name}</span>
                        <span class="person-chip__meta">${[person.department, person.knownFor[0]].filter(Boolean).join(" · ")}</span>
                    </span>
                </a>
            </li>
        `
    )}`;
}

export async function init() {
    const heading = document.querySelector("#searchHeader");
    const summary = document.querySelector("#searchSummary");
    const grid = document.querySelector("#cardContainer");
    const peopleSection = document.querySelector("#peopleSection");
    const peopleStrip = document.querySelector("#peopleStrip");
    const loadMore = document.querySelector("#loadMore");
    const loadMoreButton = document.querySelector("#loadMoreBtn");
    const sentinel = document.querySelector("#loadSentinel");
    const pageSearch = document.querySelector(".search-container");

    const initial = normalize(new URLSearchParams(window.location.search).get("q") || "");

    // The on-page field (visible on small screens, where the header search lives in the menu).
    mount(pageSearch, searchFormHTML({ id: "searchInputOnPage", placeholder: "Search MMDb", value: initial }));
    initSearch(pageSearch);

    const state = { query: null, page: 0, totalPages: 1, seq: 0, loadingMore: false };
    let controller = null;
    let observer = null;

    const syncInputs = (value, except) =>
        document.querySelectorAll(".search__input").forEach((input) => {
            if (input !== except && input.value !== value) input.value = value;
        });

    // ---------------------------------------------------------------- rendering

    function renderHeading(query) {
        if (!query) {
            setPageTitle("Search");
            heading.textContent = "Search";
            return;
        }
        setPageTitle(`“${query}”`);
        heading.replaceChildren(document.createTextNode("Results for "));
        const term = document.createElement("span");
        term.className = "search-result";
        term.textContent = `“${query}”`;
        heading.append(term);
    }

    function renderIdle() {
        peopleSection.hidden = true;
        loadMore.hidden = true;
        summary.textContent = "Find any movie or person.";
        grid.classList.remove("card-container", "is-loading");
        mount(
            grid,
            noticeHTML({
                title: "What are you looking for?",
                text: "Start typing a title or a name: results appear instantly.",
                iconName: "search",
            })
        );
    }

    function watchSentinel() {
        if (observer || !("IntersectionObserver" in window)) return;
        observer = new IntersectionObserver(
            (entries) => entries.some((entry) => entry.isIntersecting) && loadNextPage(),
            { rootMargin: "500px" }
        );
        observer.observe(sentinel);
    }

    function renderFirstPage(query, data) {
        state.page = data.page;
        state.totalPages = data.totalPages;

        if (data.people.length) {
            mount(peopleStrip, peopleHTML(data.people));
            peopleSection.hidden = false;
            reveal(peopleStrip);
            settleImages(peopleStrip);
        } else {
            peopleSection.hidden = true;
        }

        summary.textContent = data.totalResults
            ? `${data.totalResults.toLocaleString("en")} ${data.totalResults === 1 ? "movie" : "movies"} found`
            : "";

        grid.classList.remove("is-loading");
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
            loadMore.hidden = true;
            return;
        }

        grid.classList.add("card-container");
        grid.replaceChildren();
        appendTo(grid, html`${data.movies.map((movie) => movieCardHTML(movie))}`);
        loadMore.hidden = state.page >= state.totalPages;
        watchSentinel();
    }

    // ------------------------------------------------------------------ searching

    async function run(raw, { push = false, history: touchHistory = true } = {}) {
        const query = normalize(raw);
        if (query === state.query) return;

        state.query = query;
        const mySeq = ++state.seq;
        controller?.abort();
        state.loadingMore = false;

        if (touchHistory) {
            const url = new URL(window.location.href);
            if (query) url.searchParams.set("q", query);
            else url.searchParams.delete("q");
            window.history[push ? "pushState" : "replaceState"](null, "", url);
        }

        renderHeading(query);
        if (!query) return renderIdle();

        // Exact cache hit: paint synchronously.
        const cached = peekSearch(query, 1);
        if (cached) return renderFirstPage(query, cached);

        // Otherwise keep the old results on screen (dimmed) so nothing jumps.
        const hasCards = grid.classList.contains("card-container") && grid.children.length > 0;
        if (hasCards) {
            grid.classList.add("is-loading");
        } else {
            grid.classList.add("card-container");
            mount(grid, skeletonCards(10));
        }
        grid.setAttribute("aria-busy", "true");

        controller = new AbortController();
        try {
            const data = await searchAll(query, { page: 1, signal: controller.signal });
            if (mySeq !== state.seq) return;
            renderFirstPage(query, data);
        } catch (error) {
            if (error.name === "AbortError" || mySeq !== state.seq) return;
            console.error(error);
            grid.classList.remove("card-container", "is-loading");
            showNotice(
                grid,
                errorNotice(error, () => {
                    const again = state.query;
                    state.query = null;
                    run(again, { history: false });
                })
            );
        } finally {
            if (mySeq === state.seq) grid.removeAttribute("aria-busy");
        }
    }

    async function loadNextPage() {
        if (state.loadingMore || !state.query || state.page >= state.totalPages) return;
        state.loadingMore = true;
        const mySeq = state.seq;
        loadMoreButton.disabled = true;

        try {
            const data = await searchAll(state.query, { page: state.page + 1 });
            if (mySeq !== state.seq) return;
            state.page = data.page;
            state.totalPages = data.totalPages;
            appendTo(grid, html`${data.movies.map((movie) => movieCardHTML(movie))}`);
            loadMore.hidden = state.page >= state.totalPages;
        } catch (error) {
            if (mySeq !== state.seq) return;
            console.error(error);
            loadMoreButton.textContent = "Couldn't load more. Try again";
        } finally {
            state.loadingMore = false;
            loadMoreButton.disabled = false;
        }
    }

    loadMoreButton.addEventListener("click", () => {
        loadMoreButton.textContent = "Load more";
        loadNextPage();
    });

    // Live search: every keystroke in any search field lands here.
    window.addEventListener(SEARCH_EVENT, (event) => {
        const { query, source, push } = event.detail;
        syncInputs(query, source);
        run(query, { push });
    });

    // Back / forward through earlier searches.
    window.addEventListener("popstate", () => {
        const q = normalize(new URLSearchParams(window.location.search).get("q") || "");
        syncInputs(q);
        run(q, { history: false });
    });

    if (!initial) document.querySelector("#searchInput")?.focus();
    await run(initial, { history: false });
}
