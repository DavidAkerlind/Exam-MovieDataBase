// Reusable movie UI pieces: grid cards, list rows, rail cards and the favorite button.
import { html, raw, escapeHTML } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { posterImage } from "../utils/images.js";
import { isFavorite } from "../data/favorites.js";
import { reveal, settleImages } from "../utils/motion.js";

export const movieUrl = (id) => `movie.html?id=${encodeURIComponent(id)}`;
export const personUrl = (id) => `person.html?id=${encodeURIComponent(id)}`;

/** srcset/sizes attribute string for a poster, safe to embed with raw(). */
function posterAttributes(path, sizes) {
    const { src, srcset } = posterImage(path);
    const attributes = [`src="${escapeHTML(src)}"`];
    if (srcset) {
        attributes.push(`srcset="${escapeHTML(srcset)}"`, `sizes="${escapeHTML(sizes)}"`);
    }
    return raw(attributes.join(" "));
}

export function posterImg(
    path,
    { sizes = "220px", alt = "", width = 342, height = 513, eager = false } = {}
) {
    const loading = eager ? raw('loading="eager" fetchpriority="high"') : raw('loading="lazy"');
    return html`<img ${posterAttributes(path, sizes)} alt="${alt}" width="${width}" height="${height}" ${loading} decoding="async" class="is-loading" />`;
}

/**
 * The heart toggle. `variant="label"` renders a wide button with text (movie page),
 * the default is a round icon button that sits on a poster.
 */
export function favoriteButton(movie, { variant = "icon", alias } = {}) {
    const active = isFavorite(movie.id, alias);
    const aliasAttr = alias ? raw(` data-fav-alias="${escapeHTML(alias)}"`) : "";

    if (variant === "label") {
        return html`
            <button type="button" class="btn btn--glass fav-btn ${active ? "is-active" : ""}" data-fav-id="${movie.id}" data-title="${movie.title}"${aliasAttr} aria-pressed="${active}">
                <span class="fav-btn__icon">${icon(active ? "heartFilled" : "heart")}</span>
                <span class="fav-btn__label">${active ? "In favorites" : "Add to favorites"}</span>
            </button>
        `;
    }

    return html`
        <button type="button" class="movie-card__favorite-btn fav-btn ${active ? "is-active" : ""}" data-fav-id="${movie.id}" data-title="${movie.title}"${aliasAttr} aria-pressed="${active}" aria-label="Favorite ${movie.title}">
            <span class="fav-btn__icon">${icon(active ? "heartFilled" : "heart")}</span>
        </button>
    `;
}

const ratingBadge = (movie) =>
    movie.rating
        ? html`<span class="movie-card__rating">${icon("star")}${movie.rating.toFixed(1)}</span>`
        : "";

/** The standard poster card used in grids. */
export function movieCardHTML(movie, { rank } = {}) {
    const url = movieUrl(movie.id);

    return html`
        <article class="movie-card glass glass--flat reveal" data-movie-id="${movie.id}">
            <figure class="movie-card__poster">
                <a href="${url}" tabindex="-1" aria-hidden="true">
                    ${posterImg(movie.poster, { sizes: "(max-width: 640px) 46vw, 230px" })}
                </a>
                ${rank ? html`<span class="movie-card__rank">#${rank}</span>` : ""}
                ${ratingBadge(movie)}
                ${favoriteButton(movie)}
            </figure>
            <div class="movie-card__info">
                <a class="movie-card__title" href="${url}">${movie.title}</a>
                <p class="movie-card__year">${movie.year ?? "Unknown year"}</p>
            </div>
        </article>
    `;
}

/** A compact poster card for horizontal rails. */
export function railCardHTML(movie) {
    const url = movieUrl(movie.id);

    return html`
        <li class="rail__item reveal">
            <a class="rail-card glass glass--flat" href="${url}">
                <span class="rail-card__poster">
                    ${posterImg(movie.poster, { sizes: "170px", alt: "" })}
                    ${ratingBadge(movie)}
                </span>
                <span class="rail-card__title">${movie.title}</span>
                <span class="rail-card__meta">${movie.year ?? ""}</span>
            </a>
        </li>
    `;
}

/** A row in the "rest of the top 20" list. */
export function movieRowHTML(movie, rank) {
    const url = movieUrl(movie.id);

    return html`
        <li class="movie-list-item glass glass--flat reveal" data-movie-id="${movie.id}">
            <span class="movie-list__rank">${rank}</span>
            <a class="movie-list__poster" href="${url}" tabindex="-1" aria-hidden="true">
                ${posterImg(movie.poster, { sizes: "56px", width: 56, height: 84 })}
            </a>
            <div class="movie-list__text">
                <a class="movie-card__title" href="${url}">${movie.title}</a>
                <span class="movie-list__meta">${movie.year ?? ""}</span>
            </div>
            ${movie.rating
                ? html`<span class="chip chip--gold">${icon("star")}${movie.rating.toFixed(1)}</span>`
                : ""}
            ${favoriteButton(movie)}
        </li>
    `;
}

/** Appends cards to a container and wires up the reveal + image fade-in. */
export function appendTo(container, template) {
    container.insertAdjacentHTML("beforeend", template.toString());
    reveal(container);
    settleImages(container);
}
