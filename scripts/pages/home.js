// Home: trailer carousel, top-3 podium, ranks 4-15 as cards, 16-20 as a list
// and a "trending" rail.
import { fetchHome } from "../modules/api.js";
import { initCarousel } from "../modules/carousel.js";
import { html, mount } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { shuffle } from "../utils/format.js";
import { setPageTitle, reveal, settleImages } from "../utils/motion.js";
import { skeletonCards, showNotice, errorNotice } from "../components/feedback.js";
import {
    appendTo,
    favoriteButton,
    movieCardHTML,
    movieRowHTML,
    movieUrl,
    posterImg,
    railCardHTML,
} from "../components/movieCard.js";

const PODIUM = [
    { index: 1, place: 2, className: "second-place" }, // left
    { index: 0, place: 1, className: "first-place" }, // centre
    { index: 2, place: 3, className: "third-place" }, // right
];

function podiumHTML(top) {
    return html`${PODIUM.map(({ index, place, className }) => {
        const movie = top[index];
        const url = movieUrl(movie.id);
        return html`
            <article class="podium ${className} glass reveal" data-movie-id="${movie.id}">
                <span class="podium-rank">#${place}</span>
                <figure class="podium__poster">
                    <a href="${url}" tabindex="-1" aria-hidden="true">
                        ${posterImg(movie.poster, { sizes: "(max-width: 768px) 30vw, 300px", width: 500, height: 750 })}
                    </a>
                    ${favoriteButton(movie)}
                </figure>
                <div class="podium__info">
                    <a class="movie-card__title movie-card__title--podium" href="${url}">${movie.title}</a>
                    <p class="podium__meta">
                        ${movie.rating ? html`<span class="chip chip--gold">${icon("star")}${movie.rating.toFixed(1)}</span>` : ""}
                        <span>${movie.year ?? ""}</span>
                    </p>
                </div>
            </article>
        `;
    })}`;
}

function showSkeletons(refs) {
    mount(
        refs.podium,
        html`${[0, 1, 2].map(() => html`<div class="podium podium--skeleton skeleton" aria-hidden="true"></div>`)}`
    );
    mount(refs.cards, skeletonCards(12));
    mount(
        refs.list,
        html`${[0, 1, 2, 3, 4].map(() => html`<li class="movie-list-item skeleton skeleton--row" aria-hidden="true"></li>`)}`
    );
    mount(
        refs.trending,
        html`${Array.from({ length: 8 }, () => html`<li class="rail__item"><span class="rail-card skeleton skeleton--rail" aria-hidden="true"></span></li>`)}`
    );
}

function render(refs, data) {
    const { top, trending, trailers } = data;

    initCarousel(refs.trailers, shuffle(trailers).slice(0, 5));

    mount(refs.podium, podiumHTML(top));
    mount(refs.cards, html``);
    appendTo(refs.cards, html`${top.slice(3, 15).map((movie, i) => movieCardHTML(movie, { rank: i + 4 }))}`);
    mount(refs.list, html``);
    appendTo(refs.list, html`${top.slice(15, 20).map((movie, i) => movieRowHTML(movie, i + 16))}`);
    mount(refs.trending, html``);
    appendTo(refs.trending, html`${trending.map(railCardHTML)}`);

    reveal(refs.podium);
    settleImages(refs.podium);
}

export async function init() {
    setPageTitle("");

    const refs = {
        trailers: document.querySelector("#trailers"),
        podium: document.querySelector("#podiumContainer"),
        cards: document.querySelector("#cardContainer"),
        list: document.querySelector("#movieList"),
        trending: document.querySelector("#trendingRail"),
    };

    async function load() {
        showSkeletons(refs);
        try {
            const data = await fetchHome();
            if (data.top.length < 20) throw new Error("The movie service returned too few movies.");
            render(refs, data);
        } catch (error) {
            console.error(error);
            refs.trailers.hidden = true;
            document.querySelector("#trendingSection").hidden = true;
            refs.list.replaceChildren();
            refs.cards.replaceChildren();
            const notice = document.createElement("div");
            notice.className = "notice-wrap";
            refs.podium.replaceChildren(notice);
            showNotice(notice, errorNotice(error, () => {
                refs.trailers.hidden = false;
                document.querySelector("#trendingSection").hidden = false;
                load();
            }));
        }
    }

    await load();
}
