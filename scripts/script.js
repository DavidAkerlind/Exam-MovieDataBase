// Entry point for every page. <body data-page="..."> decides which page module runs.
import { renderLayout } from "./components/layout.js";
import { initSearch } from "./events/search.js";
import { initBurgerMenu } from "./events/burgerMenu.js";
import { initFavorites } from "./events/favorites.js";
import { initNewsletter } from "./events/newsletter.js";
import { initPointerGlow, initImageLoading, initScrollState } from "./utils/motion.js";
import { fetchMovies } from "./modules/api.js";
import { legacyFavoriteIds, migrateFavorites } from "./data/favorites.js";

const PAGES = {
    home: () => import("./pages/home.js"),
    movie: () => import("./pages/movie.js"),
    person: () => import("./pages/person.js"),
    search: () => import("./pages/search.js"),
    favorites: () => import("./pages/favorites.js"),
};

/** Older versions saved IMDb ids; swap them for TMDb ids in the background. */
async function migrateLegacyFavorites() {
    const legacy = legacyFavoriteIds();
    if (!legacy.length) return;
    try {
        const movies = await fetchMovies(legacy);
        migrateFavorites(new Map(movies.map((movie) => [movie.requestedId, movie.id])));
    } catch {
        /* try again on the next page load */
    }
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    const secure = window.isSecureContext || window.location.hostname === "localhost";
    if (secure) navigator.serviceWorker.register("./sw.js").catch(() => {});
}

const page = document.body.dataset.page;

document.documentElement.classList.add("js");
initImageLoading();
renderLayout(page);
initSearch();
initBurgerMenu();
initFavorites();
initNewsletter();
initPointerGlow();
initScrollState();

PAGES[page]?.()
    .then((module) => module.init())
    .catch((error) => console.error(`Could not start the "${page}" page:`, error));

migrateLegacyFavorites();
registerServiceWorker();
