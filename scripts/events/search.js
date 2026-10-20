// Instant search-as-you-type.
//
//  - paints immediately: exact cache hits render synchronously, otherwise results
//    are filtered from a local pool (trending + top rated + everything seen so far)
//    while the network request is in flight
//  - an empty, focused field shows Recent searches and Trending now
//  - rows are reconciled by key: they glide (FLIP), enter with a stagger and fade
//    out, so the list never flickers when results change
//  - race free (abort + sequence numbers), IME safe, fully keyboard operable
//  - on the search page it drives the results grid live instead of a dropdown
import {
    suggest,
    peekSuggest,
    fetchHome,
    prefetchMovie,
    prefetchPerson,
} from "../modules/api.js";
import { html, mount } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { debounce, prefersReducedMotion } from "../utils/format.js";
import { posterImage, profileImage } from "../utils/images.js";
import { getRecent, addRecent, removeRecent } from "../data/recent.js";
import { movieUrl, personUrl } from "../components/movieCard.js";

export const SEARCH_EVENT = "mmdb:search";

const MIN_NETWORK_LENGTH = 2;
const NETWORK_DELAY = 80; // ms of typing pause before hitting the network
const SKELETON_DELAY = 130; // only show skeleton rows if we're actually slow
const STALE_DELAY = 150;
const PREFETCH_DELAY = 140;
const EASE = "cubic-bezier(.22,1,.36,1)";

const fold = (text) =>
    String(text).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

// ------------------------------------------------------------ local result pool

const pool = {
    movies: new Map(),
    people: new Map(),
    trending: [],
    warmed: false,
};

function learn({ movies = [], people = [] }) {
    movies.forEach((movie) => pool.movies.set(movie.id, movie));
    people.forEach((person) => pool.people.set(person.id, person));
}

async function warmPool() {
    if (pool.warmed) return;
    pool.warmed = true;
    try {
        const home = await fetchHome();
        learn({ movies: [...home.top, ...home.trending] });
        pool.trending = home.trending.slice(0, 5);
        document.dispatchEvent(new CustomEvent("mmdb:pool-ready"));
    } catch {
        pool.warmed = false; // try again on the next focus
    }
}

/** Instant, offline matches: title prefix beats word prefix beats substring. */
function localMatches(query) {
    const needle = fold(query);
    const rank = (title) => {
        const folded = fold(title);
        if (folded.startsWith(needle)) return 0;
        if (folded.split(/[\s:\-–]+/).some((word) => word.startsWith(needle))) return 1;
        return folded.includes(needle) ? 2 : 9;
    };
    const find = (items, titleOf) =>
        [...items.values()]
            .map((item) => ({ item, score: rank(titleOf(item)) }))
            .filter(({ score }) => score < 9)
            .sort((a, b) => a.score - b.score || (b.item.votes ?? 0) - (a.item.votes ?? 0))
            .map(({ item }) => item);

    return {
        movies: find(pool.movies, (movie) => movie.title).slice(0, 6),
        people: find(pool.people, (person) => person.name).slice(0, 3),
    };
}

// ------------------------------------------------------------------- templating

/** Wraps the part of `text` that matches the query in <mark>. */
function highlight(text, query) {
    const tokens = fold(query).split(/\s+/).filter(Boolean);
    const folded = fold(text);
    if (!tokens.length || folded.length !== text.length) return html`${text}`;

    const marked = new Array(text.length).fill(false);
    for (const token of tokens) {
        let at = folded.indexOf(token);
        while (at !== -1) {
            marked.fill(true, at, at + token.length);
            at = folded.indexOf(token, at + token.length);
        }
    }

    const parts = [];
    let start = 0;
    for (let i = 1; i <= text.length; i++) {
        if (i === text.length || marked[i] !== marked[start]) {
            const chunk = text.slice(start, i);
            parts.push(marked[start] ? html`<mark class="search__match">${chunk}</mark>` : html`${chunk}`);
            start = i;
        }
    }
    return html`${parts}`;
}

const thumb = (src, round = false) => html`
    <span class="search__thumb ${round ? "search__thumb--round" : ""}">
        <img class="is-loading" src="${src}" alt="" width="${round ? 48 : 44}" height="${round ? 48 : 66}" decoding="async" data-fallback="${round ? "./res/icons/missing-profile.svg" : "./res/icons/missing-poster.svg"}" />
    </span>
`;

const arrow = html`<span class="search__option-go">${icon("arrowRight")}</span>`;

function metaLine(movie) {
    return html`${movie.year ?? "—"}${movie.rating ? html` <span class="search__dot">·</span> ${icon("star")} ${movie.rating.toFixed(1)}` : ""}`;
}

function entryGroup(key, label) {
    return { key: `g:${key}`, html: html`<p class="search__group" role="presentation">${label}</p>` };
}

function entryMovie(movie, query = "") {
    return {
        key: `m:${movie.id}`,
        option: { kind: "movie", id: movie.id },
        update(el) {
            el.querySelector(".search__option-title").innerHTML = highlight(movie.title, query).toString();
        },
        html: html`
            <a class="search__option" role="option" aria-selected="false" href="${movieUrl(movie.id)}">
                ${thumb(posterImage(movie.poster, { size: "w92" }).src)}
                <span class="search__option-text">
                    <span class="search__option-title">${highlight(movie.title, query)}</span>
                    <span class="search__option-meta">${metaLine(movie)}</span>
                </span>
                ${arrow}
            </a>
        `,
    };
}

function entryPerson(person, query = "") {
    return {
        key: `p:${person.id}`,
        option: { kind: "person", id: person.id },
        update(el) {
            el.querySelector(".search__option-title").innerHTML = highlight(person.name, query).toString();
        },
        html: html`
            <a class="search__option" role="option" aria-selected="false" href="${personUrl(person.id)}">
                ${thumb(profileImage(person.profile, "w92"), true)}
                <span class="search__option-text">
                    <span class="search__option-title" data-zoom-name>${highlight(person.name, query)}</span>
                    <span class="search__option-meta">${[person.department, person.knownFor?.[0]].filter(Boolean).join(" · ") || "Person"}</span>
                </span>
                ${arrow}
            </a>
        `,
    };
}

function entryRecent(text) {
    return {
        key: `r:${fold(text)}`,
        option: { kind: "recent", text },
        html: html`
            <a class="search__option search__option--recent" role="option" aria-selected="false" aria-label="${`Search for ${text}. Press Delete to remove from recent searches.`}" href="search?q=${encodeURIComponent(text)}">
                <span class="search__recent-icon">${icon("clock")}</span>
                <span class="search__option-text"><span class="search__option-title">${text}</span></span>
                <span class="search__remove" data-remove aria-hidden="true">${icon("x")}</span>
            </a>
        `,
    };
}

function entryAll(query) {
    return {
        key: "all",
        option: { kind: "all" },
        update(el) {
            el.href = `search?q=${encodeURIComponent(query)}`;
            el.querySelector("[data-all-query]").textContent = `“${query}”`;
        },
        html: html`
            <a class="search__option search__option--all" role="option" aria-selected="false" href="search?q=${encodeURIComponent(query)}">
                <span class="search__all-text">See all results for <strong data-all-query>“${query}”</strong></span>
                ${icon("chevronRight")}
            </a>
        `,
    };
}

const entryStatus = (key, text, extra = "") => ({
    key: `s:${key}`,
    html: html`<p class="search__status ${extra}" role="presentation">${text}</p>`,
});

const entrySkeleton = (index) => ({
    key: `k:${index}`,
    html: html`
        <div class="search__skeleton" role="presentation">
            <span class="search__thumb skeleton"></span>
            <span class="search__option-text"><span class="skeleton skeleton--line"></span><span class="skeleton skeleton--line skeleton--short"></span></span>
        </div>
    `,
});

// ----------------------------------------------------------------------- setup

let shortcutsBound = false;

/** Wires up every search form under `root` that hasn't been set up yet. */
export function initSearch(root = document) {
    root.querySelectorAll("[data-search-form]:not([data-search-ready])").forEach(setupSearch);
    if (!shortcutsBound) {
        shortcutsBound = true;
        bindShortcuts();
    }
}

/** "/" or Ctrl/Cmd+K jumps to the search field. */
function bindShortcuts() {
    document.addEventListener("keydown", (event) => {
        const typing = event.target.closest?.("input, textarea, select, [contenteditable]");
        const slash = event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !typing;
        const palette = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);
        if (!slash && !palette) return;

        const visible = [...document.querySelectorAll(".search__input")].find(
            (input) => input.getClientRects().length > 0
        );
        event.preventDefault();
        if (visible) {
            visible.focus();
            visible.select();
        } else {
            document.querySelector("#burgerLabel")?.click(); // mobile: open the menu first
            setTimeout(() => document.querySelector("#searchInputMobile")?.focus(), 120);
        }
    });
}

function setupSearch(form) {
    form.dataset.searchReady = "true";

    const input = form.querySelector(".search__input");
    const panel = form.querySelector(".search__panel");
    const status = form.querySelector("[data-search-status]");

    // Search page: drive the results grid live instead of showing a dropdown.
    if (document.body.dataset.page === "search") {
        setupLive(form, input);
        return;
    }

    mount(
        panel,
        html`
            <div class="search__progress" aria-hidden="true"></div>
            <div class="search__scroller">
                <div class="search__list">
                    <span class="search__highlight" aria-hidden="true"></span>
                </div>
            </div>
        `
    );
    const scroller = panel.querySelector(".search__scroller");
    const list = panel.querySelector(".search__list");
    const highlightEl = panel.querySelector(".search__highlight");

    let seq = 0;
    let controller = null;
    let netTimer = 0;
    let skeletonTimer = 0;
    let staleTimer = 0;
    let prefetchTimer = 0;
    let composing = false;
    let activeKey = null;

    const queryOf = () => input.value.trim().replace(/\s+/g, " ");
    const options = () => [...list.querySelectorAll('[role="option"]:not(.is-leaving)')];

    // ----------------------------------------------------------- panel mechanics

    const isOpen = () => panel.classList.contains("is-open");

    function fit() {
        const max = Math.min(window.innerHeight * 0.74, 580);
        scroller.style.maxHeight = `${max}px`;
        panel.style.height = `${Math.min(list.offsetHeight + 16, max + 16)}px`;
    }
    new ResizeObserver(fit).observe(list);

    function open() {
        if (isOpen()) return;
        panel.classList.add("is-open");
        input.setAttribute("aria-expanded", "true");
        fit();
    }

    function setLoading(loading) {
        clearTimeout(staleTimer);
        if (loading) {
            panel.dataset.loading = "true";
            staleTimer = setTimeout(() => list.classList.add("is-stale"), STALE_DELAY);
        } else {
            delete panel.dataset.loading;
            list.classList.remove("is-stale");
        }
    }

    function close() {
        clearTimeout(netTimer);
        clearTimeout(skeletonTimer);
        controller?.abort();
        seq++;
        setLoading(false);
        panel.classList.remove("is-open");
        input.setAttribute("aria-expanded", "false");
        setActive(null);
    }

    // ----------------------------------------------------------- active highlight

    function placeHighlight() {
        const active = list.querySelector(".search__option.is-active:not(.is-leaving)");
        if (!active) {
            highlightEl.classList.remove("is-visible");
            return;
        }
        highlightEl.style.setProperty("--y", `${active.offsetTop}px`);
        highlightEl.style.height = `${active.offsetHeight}px`;
        highlightEl.classList.add("is-visible");
    }

    function schedulePrefetch(element) {
        clearTimeout(prefetchTimer);
        const meta = element._option;
        if (!meta) return;
        prefetchTimer = setTimeout(() => {
            if (meta.kind === "movie") prefetchMovie(meta.id);
            else if (meta.kind === "person") prefetchPerson(meta.id);
        }, PREFETCH_DELAY);
    }

    function setActive(key, { scroll = false } = {}) {
        activeKey = key;
        let activeEl = null;
        options().forEach((element) => {
            const on = element.dataset.key === key;
            element.classList.toggle("is-active", on);
            element.setAttribute("aria-selected", String(on));
            if (on) activeEl = element;
        });

        if (activeEl) {
            input.setAttribute("aria-activedescendant", activeEl.id);
            if (scroll) activeEl.scrollIntoView({ block: "nearest" });
            schedulePrefetch(activeEl);
        } else {
            input.removeAttribute("aria-activedescendant");
        }
        placeHighlight();
    }

    function move(step) {
        const items = options();
        if (!items.length) return;
        const index = items.findIndex((element) => element.dataset.key === activeKey);
        const next = index === -1 ? (step > 0 ? 0 : items.length - 1) : (index + step + items.length) % items.length;
        setActive(items[next].dataset.key, { scroll: true });
    }

    // --------------------------------------------------------------- reconciling

    function createElement(entry, index) {
        const template = document.createElement("template");
        template.innerHTML = entry.html.toString().trim();
        const element = template.content.firstElementChild;
        element.dataset.key = entry.key;
        element.classList.add("search__item", "is-entering");
        element.style.setProperty("--i", String(Math.min(index, 9)));
        element.addEventListener("animationend", () => element.classList.remove("is-entering"), { once: true });
        if (element.getAttribute("role") === "option") {
            element.id = `${input.id}-${entry.key.replace(/[^a-z0-9]+/gi, "-")}`;
        }
        return element;
    }

    function render(entries) {
        const reduce = prefersReducedMotion();
        const existing = new Map();
        for (const child of list.children) {
            if (child.dataset.key && !child.classList.contains("is-leaving")) existing.set(child.dataset.key, child);
        }
        const wanted = new Set(entries.map((entry) => entry.key));

        // FIRST: where everything is now
        const before = new Map();
        existing.forEach((element, key) => before.set(key, element.getBoundingClientRect().top));

        // rows that are no longer wanted fade out without affecting layout
        existing.forEach((element, key) => {
            if (wanted.has(key)) return;
            element.style.top = `${element.offsetTop}px`;
            element.style.width = `${element.offsetWidth}px`;
            element.classList.add("is-leaving");
            element.classList.remove("is-active");
            setTimeout(() => element.remove(), reduce ? 0 : 200);
        });

        // wanted rows: reuse or create, then put them in order
        let previous = highlightEl;
        entries.forEach((entry, index) => {
            let element = existing.get(entry.key);
            if (element) entry.update?.(element);
            else element = createElement(entry, index);
            element._option = entry.option;
            if (previous.nextElementSibling !== element) previous.after(element);
            previous = element;
        });

        // LAST + INVERT + PLAY: rows that moved glide to their new slot
        if (!reduce) {
            existing.forEach((element, key) => {
                if (!wanted.has(key)) return;
                const delta = before.get(key) - element.getBoundingClientRect().top;
                if (Math.abs(delta) > 1) {
                    element.animate([{ transform: `translateY(${delta}px)` }, { transform: "none" }], {
                        duration: 340,
                        easing: EASE,
                    });
                }
            });
        }

        setActive(activeKey && wanted.has(activeKey) ? activeKey : null);
        open();
        fit();
    }

    const announce = (text) => {
        if (status) status.textContent = text;
    };

    // ------------------------------------------------------------------- states

    function showIdle() {
        const recent = getRecent();
        const entries = [
            ...(recent.length ? [entryGroup("recent", "Recent searches"), ...recent.map(entryRecent)] : []),
            ...(pool.trending.length
                ? [entryGroup("trending", "Trending now"), ...pool.trending.map((movie) => entryMovie(movie))]
                : []),
        ];
        // Nothing to show yet (first visit, trending still loading): skeleton rows.
        render(entries.length ? entries : [1, 2, 3].map(entrySkeleton));
    }

    function resultEntries(query, data, optimistic) {
        const movies = data.movies.slice(0, 6);
        const people = data.people.slice(0, 3);
        const entries = [];

        if (movies.length) entries.push(entryGroup("movies", "Movies"), ...movies.map((movie) => entryMovie(movie, query)));
        if (people.length) entries.push(entryGroup("people", "People"), ...people.map((person) => entryPerson(person, query)));

        if (entries.length) entries.push(entryAll(query));
        else if (!optimistic) entries.push(entryStatus(`empty:${query}`, `No matches for “${query}”`));
        return entries;
    }

    /** Returns true when something was rendered. */
    function showResults(query, data, optimistic = false) {
        learn(data);
        const entries = resultEntries(query, data, optimistic);
        if (!entries.length) return false;

        render(entries);
        if (!optimistic) {
            const count = data.movies.length + data.people.length;
            announce(count ? `${count} suggestions available` : `No matches for ${query}`);
        }
        return true;
    }

    async function fetchRemote(query, mySeq) {
        controller = new AbortController();
        try {
            const data = await suggest(query, { signal: controller.signal });
            if (mySeq !== seq) return;
            clearTimeout(skeletonTimer);
            showResults(query, data);
        } catch (error) {
            if (error.name === "AbortError" || mySeq !== seq) return;
            clearTimeout(skeletonTimer);
            render([entryStatus("error", "Search is unavailable right now. Check your connection.", "search__status--error")]);
        } finally {
            if (mySeq === seq) setLoading(false);
        }
    }

    function onInput() {
        if (composing) return;
        const query = queryOf();
        const mySeq = ++seq;
        clearTimeout(netTimer);
        clearTimeout(skeletonTimer);
        controller?.abort();
        setLoading(false);

        if (!query) {
            showIdle();
            return;
        }

        // 1. exact cache hit: the final answer, synchronously
        const cached = peekSuggest(query);
        if (cached) {
            showResults(query, cached);
            return;
        }

        // 2. optimistic: whatever we already know matches, right now
        const hadLocal = showResults(query, localMatches(query), true);
        if (!hadLocal) {
            skeletonTimer = setTimeout(
                () => mySeq === seq && render([1, 2, 3].map(entrySkeleton)),
                SKELETON_DELAY
            );
        }

        // 3. the real answer (debounced, cancellable)
        if (query.length >= MIN_NETWORK_LENGTH) {
            setLoading(true);
            netTimer = setTimeout(() => fetchRemote(query, mySeq), NETWORK_DELAY);
        } else {
            clearTimeout(skeletonTimer);
        }
    }

    // ------------------------------------------------------------------ events

    input.addEventListener("input", onInput);
    input.addEventListener("compositionstart", () => (composing = true));
    input.addEventListener("compositionend", () => {
        composing = false;
        onInput();
    });

    input.addEventListener("focus", () => {
        warmPool();
        onInput();
    });
    document.addEventListener("mmdb:pool-ready", () => {
        if (isOpen() && !queryOf()) showIdle();
    });

    const remember = () => addRecent(queryOf());

    function dropRecent(element) {
        const text = element?._option?.text;
        if (!text) return;
        removeRecent(text);
        showIdle();
    }

    input.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
                event.preventDefault();
                if (!isOpen()) onInput();
                else move(event.key === "ArrowDown" ? 1 : -1);
                break;
            case "Enter": {
                const active = list.querySelector(".search__option.is-active");
                if (isOpen() && active) {
                    event.preventDefault();
                    remember();
                    active.click();
                }
                break;
            }
            case "Delete": {
                const active = list.querySelector(".search__option--recent.is-active");
                if (active && isOpen()) {
                    event.preventDefault();
                    dropRecent(active);
                }
                break;
            }
            case "Escape":
                if (isOpen()) {
                    event.preventDefault();
                    event.stopPropagation();
                    close();
                } else if (input.value) {
                    input.value = "";
                }
                break;
            case "Tab":
                close();
                break;
        }
    });

    panel.addEventListener("click", (event) => {
        const remove = event.target.closest("[data-remove]");
        if (remove) {
            event.preventDefault();
            dropRecent(remove.closest(".search__option"));
            return;
        }
        if (event.target.closest(".search__option")) remember();
    });

    // Only a real pointer movement changes the active row (the list animates under a still cursor).
    panel.addEventListener("pointermove", (event) => {
        const item = event.target.closest(".search__option");
        if (item && item.dataset.key !== activeKey) setActive(item.dataset.key);
    });
    panel.addEventListener("pointerleave", () => setActive(null));
    // Keep focus in the input while interacting with the panel.
    panel.addEventListener("pointerdown", (event) => event.preventDefault());

    document.addEventListener("pointerdown", (event) => {
        if (!form.contains(event.target)) close();
    });

    form.addEventListener("submit", (event) => {
        if (!queryOf()) {
            event.preventDefault();
            input.focus();
            return;
        }
        remember();
    });
}

// ------------------------------------------------------------------ live mode

function setupLive(form, input) {
    const emit = (extra = {}) =>
        window.dispatchEvent(
            new CustomEvent(SEARCH_EVENT, { detail: { query: input.value, source: input, ...extra } })
        );
    const emitSoon = debounce(emit, 90);
    let composing = false;

    input.addEventListener("input", () => !composing && emitSoon());
    input.addEventListener("compositionstart", () => (composing = true));
    input.addEventListener("compositionend", () => {
        composing = false;
        emitSoon();
    });
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        emitSoon.cancel();
        addRecent(input.value);
        emit({ push: true });
    });
}
