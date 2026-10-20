// Favorites: saved movies with sorting, animated removal and an empty state.
import { fetchMovies } from "../modules/api.js";
import { html, mount } from "../utils/html.js";
import { getFavoriteIds, migrateFavorites, onFavoritesChange } from "../data/favorites.js";
import { setPageTitle } from "../utils/motion.js";
import { skeletonCards, showNotice, errorNotice, noticeHTML } from "../components/feedback.js";
import { appendTo, movieCardHTML } from "../components/movieCard.js";

const SORTS = {
    recent: { label: "Recently added", compare: null },
    title: { label: "Title A–Z", compare: (a, b) => a.title.localeCompare(b.title) },
    rating: { label: "Highest rated", compare: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) },
    year: { label: "Newest first", compare: (a, b) => (b.year ?? 0) - (a.year ?? 0) },
};

export async function init() {
    setPageTitle("Favorites");

    const title = document.querySelector("#favoritesTitle");
    const count = document.querySelector("#favoritesCount");
    const toolbar = document.querySelector("#favoritesToolbar");
    const sortSelect = document.querySelector("#favoritesSort");
    const grid = document.querySelector("#cardContainer");

    const movies = new Map(); // tmdb id -> summary
    let sort = "recent";

    mount(
        sortSelect,
        html`${Object.entries(SORTS).map(([value, { label }]) => html`<option value="${value}">${label}</option>`)}`
    );

    function renderEmpty() {
        title.textContent = "No movies saved";
        count.textContent = "";
        toolbar.hidden = true;
        grid.classList.remove("card-container");
        mount(
            grid,
            noticeHTML({
                title: "Your favorites list is empty",
                text: "Tap the heart on any movie to save it here.",
                iconName: "heart",
                action: { label: "Go find movies", href: "search.html" },
            })
        );
    }

    function ordered() {
        const ids = getFavoriteIds();
        const list = [...ids].reverse().flatMap((id) => (movies.has(id) ? [movies.get(id)] : []));
        const { compare } = SORTS[sort];
        return compare ? list.sort(compare) : list;
    }

    function render() {
        const list = ordered();
        if (!list.length) return renderEmpty();

        title.textContent = "Your favorites";
        count.textContent = `${list.length} ${list.length === 1 ? "movie" : "movies"}`;
        toolbar.hidden = false;
        grid.classList.add("card-container");
        grid.replaceChildren();
        appendTo(grid, html`${list.map((movie) => movieCardHTML(movie))}`);
    }

    async function load() {
        const ids = getFavoriteIds();
        if (!ids.length) return renderEmpty();

        grid.classList.add("card-container");
        mount(grid, skeletonCards(Math.min(ids.length, 12)));
        grid.setAttribute("aria-busy", "true");

        try {
            const found = await fetchMovies(ids);
            migrateFavorites(new Map(found.map((movie) => [movie.requestedId, movie.id])));
            movies.clear();
            found.forEach((movie) => movies.set(movie.id, movie));
            render();
        } catch (error) {
            console.error(error);
            grid.classList.remove("card-container");
            showNotice(grid, errorNotice(error, load));
        } finally {
            grid.removeAttribute("aria-busy");
        }
    }

    sortSelect.addEventListener("change", () => {
        sort = sortSelect.value;
        render();
    });

    // Removing a card animates it out; undoing (or another tab) re-renders the list.
    onFavoritesChange(async ({ id, active, ids, migrated }) => {
        if (migrated) return;
        if (active === false) {
            const card = grid.querySelector(`[data-movie-id="${CSS.escape(String(id))}"]`);
            if (card && ids.length) {
                card.classList.add("is-leaving");
                const finish = () => {
                    card.remove();
                    count.textContent = `${grid.children.length} ${grid.children.length === 1 ? "movie" : "movies"}`;
                };
                card.addEventListener("transitionend", finish, { once: true });
                setTimeout(finish, 600);
                return;
            }
        }
        const missing = getFavoriteIds().some((favorite) => !movies.has(favorite));
        if (missing) await load();
        else render();
    });

    await load();
}
