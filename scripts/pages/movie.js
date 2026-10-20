// Movie detail: backdrop hero, poster, ratings, plot, people, cast and similar movies.
import { fetchMovie } from "../modules/api.js";
import { html, mount, raw } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { formatRuntime, compactNumber } from "../utils/format.js";
import { backdropImage, profileImage } from "../utils/images.js";
import { setPageTitle, reveal, settleImages } from "../utils/motion.js";
import { showNotice, errorNotice } from "../components/feedback.js";
import { openTrailer } from "../components/trailerModal.js";
import { favoriteButton, personUrl, posterImg, railCardHTML } from "../components/movieCard.js";

function ratingTiles(movie) {
    const { ratings } = movie;
    const tiles = [
        ratings.imdb && {
            value: ratings.imdb.toFixed(1),
            unit: "/10",
            label: "IMDb",
            sub: ratings.imdbVotes ? `${compactNumber(ratings.imdbVotes)} votes` : "",
            tone: "gold",
        },
        ratings.rottenTomatoes && {
            value: ratings.rottenTomatoes,
            unit: "%",
            label: "Rotten Tomatoes",
            sub: ratings.rottenTomatoes >= 60 ? "Fresh" : "Rotten",
            tone: ratings.rottenTomatoes >= 60 ? "good" : "bad",
        },
        ratings.metascore && {
            value: ratings.metascore,
            unit: "/100",
            label: "Metascore",
            sub: "",
            tone: "violet",
        },
        ratings.tmdb && {
            value: ratings.tmdb.toFixed(1),
            unit: "/10",
            label: "TMDB",
            sub: "User score",
            tone: "cyan",
        },
    ].filter(Boolean);

    if (!tiles.length) return "";
    return html`
        <ul class="ratings" aria-label="Ratings">
            ${tiles.map(
                (tile) => html`
                    <li class="rating-tile rating-tile--${tile.tone}">
                        <span class="rating-tile__value">${tile.value}<small>${tile.unit}</small></span>
                        <span class="rating-tile__label">${tile.label}</span>
                        ${tile.sub ? html`<span class="rating-tile__sub">${tile.sub}</span>` : ""}
                    </li>
                `
            )}
        </ul>
    `;
}

function peopleSection(title, people) {
    if (!people.length) return "";
    return html`
        <article class="movie-info__${title.toLowerCase()}s">
            <h3 class="movie-info__persons-title">${title}${people.length > 1 ? "s" : ""}</h3>
            <p class="movie-info__people-list">
                ${people.map((person) => html`<a class="movie-info__link chip chip--link" href="${personUrl(person.id)}">${person.name}</a>`)}
            </p>
        </article>
    `;
}

function castRail(cast) {
    return html`
        <ul class="rail rail--people">
            ${cast.map(
                (member) => html`
                    <li class="rail__item reveal">
                        <a class="person-card glass glass--flat" href="${personUrl(member.id)}">
                            <img class="person-card__photo is-loading" src="${profileImage(member.profile, "w185")}" alt="" width="185" height="278" loading="lazy" decoding="async" data-fallback="./res/icons/missing-profile.svg" />
                            <span class="person-card__name">${member.name}</span>
                            <span class="person-card__role">${member.character}</span>
                        </a>
                    </li>
                `
            )}
        </ul>
    `;
}

function movieHTML(movie) {
    const facts = [
        movie.year && html`<span class="chip">${icon("calendar")}${movie.year}</span>`,
        movie.runtime && html`<span class="chip">${icon("clock")}${formatRuntime(movie.runtime)}</span>`,
        movie.rated && html`<span class="chip chip--outline" title="Age rating">${movie.rated}</span>`,
    ].filter(Boolean);

    return html`
        <div class="movie-info__poster">
            <figure class="movie-info__poster-container glass">
                ${posterImg(movie.poster, {
                    sizes: "(max-width: 768px) 70vw, 380px",
                    alt: `${movie.title} poster`,
                    width: 500,
                    height: 750,
                    eager: true,
                })}
            </figure>
        </div>

        <div class="movie-info__details">
            <div class="movie-info__heading">
                <h1 class="movie-info__title">${movie.title}</h1>
                ${movie.tagline ? html`<p class="movie-info__tagline">${movie.tagline}</p>` : ""}
            </div>

            <div class="movie-info__top">
                ${facts}
                ${movie.genres.map((genre) => html`<span class="chip chip--genre">${genre}</span>`)}
            </div>

            ${ratingTiles(movie)}

            <div class="movie-info__actions">
                ${movie.trailer
                    ? html`<button class="btn btn--primary" type="button" data-trailer>${icon("play")} Watch trailer</button>`
                    : ""}
                ${favoriteButton(movie, { variant: "label", alias: movie.imdbId })}
                ${movie.imdbId
                    ? html`<a class="btn btn--glass" href="https://www.imdb.com/title/${movie.imdbId}/" target="_blank" rel="noopener noreferrer">IMDb ${icon("external")}</a>`
                    : ""}
            </div>

            <section class="movie-info__plot glass">
                <h2 class="movie-info__plot-title">Plot</h2>
                <p class="movie-info__plot-text">${movie.overview || "No plot available."}</p>
                ${movie.awards ? html`<p class="movie-info__awards">${icon("sparkle")} ${movie.awards}</p>` : ""}
            </section>

            ${movie.directors.length || movie.writers.length
                ? html`
                      <section class="movie-info__people glass">
                          ${peopleSection("Director", movie.directors)}
                          ${peopleSection("Writer", movie.writers)}
                      </section>
                  `
                : ""}
        </div>
    `;
}

function showBackdrop(path) {
    const element = document.querySelector("#movieBackdrop");
    const url = backdropImage(path, "w1280");
    if (!element || !url) return;

    const image = new Image();
    image.onload = () => {
        element.style.setProperty("--backdrop-image", `url("${url}")`);
        element.classList.add("is-ready");
    };
    image.src = url;
}

export async function init() {
    const root = document.querySelector("#movieInfo");
    const extras = document.querySelector("#movieExtras");
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
        showNotice(root, {
            title: "No movie selected",
            text: "Pick a movie from the home page or search for one.",
            action: { label: "Browse movies", href: "index.html" },
        });
        return;
    }

    async function load() {
        root.setAttribute("aria-busy", "true");
        mount(
            root,
            html`
                <div class="movie-info__poster"><div class="movie-info__poster-container skeleton"></div></div>
                <div class="movie-info__details" aria-hidden="true">
                    <span class="skeleton skeleton--title"></span>
                    <span class="skeleton skeleton--line"></span>
                    <span class="skeleton skeleton--block"></span>
                </div>
            `
        );

        let movie;
        try {
            movie = await fetchMovie(id);
        } catch (error) {
            console.error(error);
            root.removeAttribute("aria-busy");
            showNotice(root, errorNotice(error, load));
            return;
        }

        setPageTitle(movie.title);
        mount(root, movieHTML(movie));
        root.removeAttribute("aria-busy");
        showBackdrop(movie.backdrop);

        root.querySelector("[data-trailer]")?.addEventListener("click", () =>
            openTrailer({ key: movie.trailer.key, title: movie.title })
        );

        mount(
            extras,
            html`
                ${movie.cast.length
                    ? html`<section class="section" aria-labelledby="castTitle">
                          <header class="section__head"><h2 id="castTitle">Cast</h2></header>
                          ${castRail(movie.cast)}
                      </section>`
                    : ""}
                ${movie.similar.length
                    ? html`<section class="section" aria-labelledby="similarTitle">
                          <header class="section__head"><h2 id="similarTitle">More like this</h2></header>
                          <ul class="rail">${movie.similar.map(railCardHTML)}</ul>
                      </section>`
                    : ""}
            `
        );
        reveal(document);
        settleImages(document);
    }

    await load();
}
