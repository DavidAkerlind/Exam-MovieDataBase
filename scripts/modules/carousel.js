// 3D "coverflow" trailer carousel. Positions are driven by two CSS variables per
// slide (--o: signed offset from the centre, --abs: its absolute value), so all
// the motion lives in CSS and the script only decides who is where.
import { html, mount } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { backdropImage } from "../utils/images.js";
import { prefersReducedMotion } from "../utils/format.js";
import { openTrailer, isTrailerOpen } from "../components/trailerModal.js";
import { movieUrl } from "../components/movieCard.js";

const AUTOPLAY_MS = 6500;
const SWIPE_PX = 45;

export function initCarousel(root, slides) {
    const total = slides.length;
    if (total === 0) {
        root.hidden = true;
        return;
    }

    mount(
        root,
        html`
            <div class="trailers__stage" role="group" aria-roledescription="carousel" aria-label="Featured trailers" tabindex="0">
                <button class="trailers__arrow trailers__arrow--left btn btn--icon btn--glass" type="button" data-direction="left" aria-label="Previous trailer">
                    ${icon("chevronLeft")}
                </button>
                <div class="trailers__container">
                    ${slides.map(
                        (slide, i) => html`
                            <div class="trailers__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${total}" data-index="${i}">
                                <button class="trailers__video" type="button" aria-label="${i === 0 ? "Play trailer" : "Show"}: ${slide.title}">
                                    <img class="is-loading" src="${backdropImage(slide.backdrop, "w780")}" alt="" width="780" height="439" decoding="async" ${i === 0 ? "" : html`loading="lazy"`} data-fallback="./res/icons/missing-backdrop.svg" />
                                    <span class="trailers__play">${icon("play")}</span>
                                </button>
                            </div>
                        `
                    )}
                </div>
                <button class="trailers__arrow trailers__arrow--right btn btn--icon btn--glass" type="button" data-direction="right" aria-label="Next trailer">
                    ${icon("chevronRight")}
                </button>
            </div>
            <div class="trailers__caption">
                <div class="trailers__caption-text">
                    <h2 class="trailers__title"><a data-caption-title href="#"></a></h2>
                    <p class="trailers__meta" data-caption-meta></p>
                </div>
                <div class="trailers__actions">
                    <button class="btn btn--primary" type="button" data-play>${icon("play")} Watch trailer</button>
                    <a class="btn btn--glass" data-caption-link href="#">Details</a>
                </div>
            </div>
            <div class="trailers__dots">
                ${slides.map(
                    (slide, i) => html`<button class="trailers__dot" type="button" data-dot="${i}" aria-label="Show trailer ${i + 1}: ${slide.title}"></button>`
                )}
            </div>
        `
    );

    const stage = root.querySelector(".trailers__stage");
    const container = root.querySelector(".trailers__container");
    const slideEls = [...root.querySelectorAll(".trailers__slide")];
    const dots = [...root.querySelectorAll(".trailers__dot")];
    const captionTitle = root.querySelector("[data-caption-title]");
    const captionMeta = root.querySelector("[data-caption-meta]");
    const captionLink = root.querySelector("[data-caption-link]");

    const half = Math.floor(total / 2);
    let index = 0;
    let timer = null;
    let paused = false;
    let dragStart = null;
    let swiped = false;

    const offsetOf = (i) => {
        let offset = (((i - index) % total) + total) % total;
        if (offset > half) offset -= total;
        return offset;
    };

    function update() {
        slideEls.forEach((element, i) => {
            const offset = offsetOf(i);
            element.style.setProperty("--o", offset);
            element.style.setProperty("--abs", Math.abs(offset));
            element.dataset.position = offset === 0 ? "center" : Math.abs(offset) === 1 ? "near" : "far";
            const button = element.querySelector("button");
            button.tabIndex = offset === 0 ? 0 : -1;
            button.setAttribute(
                "aria-label",
                `${offset === 0 ? "Play trailer" : "Show"}: ${slides[i].title}`
            );
        });
        dots.forEach((dot, i) => {
            if (i === index) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });

        const slide = slides[index];
        captionTitle.textContent = slide.title;
        captionTitle.href = movieUrl(slide.id);
        captionLink.href = movieUrl(slide.id);
        captionMeta.textContent = [slide.year, slide.rating ? `★ ${slide.rating.toFixed(1)}` : null]
            .filter(Boolean)
            .join("  ·  ");
        root.querySelector(".trailers__caption").classList.remove("is-swapping");
        void root.offsetWidth;
        root.querySelector(".trailers__caption").classList.add("is-swapping");
    }

    function go(to) {
        index = ((to % total) + total) % total;
        update();
        restartAutoplay();
    }

    const play = () => openTrailer({ key: slides[index].trailer.key, title: slides[index].title });

    function restartAutoplay() {
        clearInterval(timer);
        if (prefersReducedMotion() || total < 2) return;
        timer = setInterval(() => {
            if (!paused && !document.hidden && !isTrailerOpen()) {
                index = (index + 1) % total;
                update();
            }
        }, AUTOPLAY_MS);
    }

    root.addEventListener("click", (event) => {
        if (swiped) {
            swiped = false;
            return;
        }
        const arrow = event.target.closest("[data-direction]");
        const dot = event.target.closest("[data-dot]");
        const slide = event.target.closest(".trailers__slide");

        if (arrow) go(index + (arrow.dataset.direction === "right" ? 1 : -1));
        else if (dot) go(Number(dot.dataset.dot));
        else if (slide) {
            const target = Number(slide.dataset.index);
            if (target === index) play();
            else go(target);
        } else if (event.target.closest("[data-play]")) play();
    });

    stage.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") go(index + 1);
        else if (event.key === "ArrowLeft") go(index - 1);
    });

    // Swipe on touch / drag with a pointer.
    container.addEventListener("pointerdown", (event) => {
        dragStart = event.clientX;
    });
    window.addEventListener("pointerup", (event) => {
        if (dragStart === null) return;
        const distance = event.clientX - dragStart;
        dragStart = null;
        if (Math.abs(distance) > SWIPE_PX) {
            swiped = true;
            go(index + (distance < 0 ? 1 : -1));
            setTimeout(() => (swiped = false), 50);
        }
    });

    root.addEventListener("pointerenter", () => (paused = true));
    root.addEventListener("pointerleave", () => (paused = false));
    root.addEventListener("focusin", () => (paused = true));
    root.addEventListener("focusout", () => (paused = false));

    update();
    restartAutoplay();
}
