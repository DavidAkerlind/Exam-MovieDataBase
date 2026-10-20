// Search-as-you-type for every [data-search-form]: a combobox with movie and
// people suggestions, full keyboard support and cancellable requests.
import { suggest } from "../modules/api.js";
import { html, mount } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { debounce } from "../utils/format.js";
import { posterImage, profileImage } from "../utils/images.js";
import { movieUrl, personUrl } from "../components/movieCard.js";

const MIN_LENGTH = 2;

/** Wires up every search form under `root` that hasn't been set up yet. */
export function initSearch(root = document) {
    root.querySelectorAll("[data-search-form]:not([data-search-ready])").forEach(setupSearch);
}

function setupSearch(form) {
    form.dataset.searchReady = "true";
    const input = form.querySelector(".search__input");
    const panel = form.querySelector(".search__panel");
    let controller = null;
    let activeIndex = -1;

    const options = () => [...panel.querySelectorAll("[role=option]")];

    function setOpen(open) {
        panel.hidden = !open;
        input.setAttribute("aria-expanded", String(open));
        if (!open) clearActive();
    }

    function clearActive() {
        activeIndex = -1;
        options().forEach((item) => {
            item.classList.remove("is-active");
            item.setAttribute("aria-selected", "false");
        });
        input.removeAttribute("aria-activedescendant");
    }

    function setActive(index) {
        const items = options();
        if (!items.length) return clearActive();

        activeIndex = (index + items.length) % items.length;
        items.forEach((item, i) => {
            const active = i === activeIndex;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", String(active));
            if (active) item.scrollIntoView({ block: "nearest" });
        });
        input.setAttribute("aria-activedescendant", items[activeIndex].id);
    }

    function renderStatus(text) {
        mount(panel, html`<p class="search__status">${text}</p>`);
        setOpen(true);
    }

    function renderResults(query, data) {
        const optionId = (kind, id) => `${input.id}-${kind}-${id}`;

        const movies = data.movies.map(
            (movie) => html`
                <a class="search__option" role="option" id="${optionId("m", movie.id)}" href="${movieUrl(movie.id)}" aria-selected="false">
                    <img class="search__thumb is-loaded" src="${posterImage(movie.poster, { size: "w92" }).src}" alt="" width="40" height="60" loading="lazy" />
                    <span class="search__option-text">
                        <span class="search__option-title">${movie.title}</span>
                        <span class="search__option-meta">
                            ${movie.year ?? "—"}${movie.rating ? html` · ${icon("star")} ${movie.rating.toFixed(1)}` : ""}
                        </span>
                    </span>
                </a>
            `
        );
        const people = data.people.map(
            (person) => html`
                <a class="search__option" role="option" id="${optionId("p", person.id)}" href="${personUrl(person.id)}" aria-selected="false">
                    <img class="search__thumb search__thumb--round is-loaded" src="${profileImage(person.profile, "w92")}" alt="" width="40" height="40" loading="lazy" />
                    <span class="search__option-text">
                        <span class="search__option-title">${person.name}</span>
                        <span class="search__option-meta">${person.department ?? "Person"}</span>
                    </span>
                </a>
            `
        );

        if (!movies.length && !people.length) {
            renderStatus(`No matches for “${query}”.`);
            return;
        }

        mount(
            panel,
            html`
                ${movies.length ? html`<p class="search__group" role="presentation">Movies</p>${movies}` : ""}
                ${people.length ? html`<p class="search__group" role="presentation">People</p>${people}` : ""}
                <a class="search__option search__option--all" role="option" id="${input.id}-all" href="search.html?q=${encodeURIComponent(query)}" aria-selected="false">
                    See all results for “${query}” ${icon("chevronRight")}
                </a>
            `
        );
        setOpen(true);
        clearActive();
    }

    const run = debounce(async () => {
        const query = input.value.trim();
        controller?.abort();

        if (query.length < MIN_LENGTH) {
            setOpen(false);
            return;
        }

        controller = new AbortController();
        renderStatus("Searching…");
        try {
            renderResults(query, await suggest(query, { signal: controller.signal }));
        } catch (error) {
            if (error.name === "AbortError") return;
            renderStatus("Search is unavailable right now.");
        }
    }, 260);

    input.addEventListener("input", run);
    input.addEventListener("focus", () => {
        if (panel.innerHTML.trim() && input.value.trim().length >= MIN_LENGTH) setOpen(true);
    });

    input.addEventListener("keydown", (event) => {
        const items = options();
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (panel.hidden || !items.length) return;
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive(activeIndex === -1 && step === -1 ? items.length - 1 : activeIndex + step);
        } else if (event.key === "Enter" && activeIndex >= 0 && !panel.hidden) {
            event.preventDefault();
            items[activeIndex].click();
        } else if (event.key === "Escape" && !panel.hidden) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
        }
    });

    panel.addEventListener("pointermove", (event) => {
        const item = event.target.closest("[role=option]");
        if (item) setActive(options().indexOf(item));
    });
    // Keep the input focused when pressing inside the panel so blur doesn't fire first.
    panel.addEventListener("pointerdown", (event) => event.preventDefault());

    document.addEventListener("click", (event) => {
        if (!form.contains(event.target)) setOpen(false);
    });

    form.addEventListener("submit", (event) => {
        if (!input.value.trim()) {
            event.preventDefault();
            input.focus();
        }
    });
}
