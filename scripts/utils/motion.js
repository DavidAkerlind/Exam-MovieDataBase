// Small, dependency free helpers behind the motion design:
// scroll reveals, the pointer-following glass sheen and image fade-ins.
import { prefersReducedMotion } from "./format.js";

let revealObserver;

function getRevealObserver() {
    if (!revealObserver) {
        revealObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.classList.add("is-in");
                    revealObserver.unobserve(entry.target);
                }
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
        );
    }
    return revealObserver;
}

/** Fades/slides in every `.reveal` element under `root` once it scrolls into view. */
export function reveal(root = document) {
    const items = [...root.querySelectorAll(".reveal:not(.is-in)")];
    const instant = !("IntersectionObserver" in window) || prefersReducedMotion();

    items.forEach((element, index) => {
        element.style.setProperty("--d", `${(index % 8) * 55}ms`);
        if (instant) element.classList.add("is-in");
        else getRevealObserver().observe(element);
    });
}

/** Makes the light sheen on `.glass` surfaces follow the pointer. */
export function initPointerGlow() {
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    document.addEventListener(
        "pointermove",
        (event) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const surface = event.target.closest?.(".glass");
                if (!surface) return;
                const box = surface.getBoundingClientRect();
                surface.style.setProperty("--mx", `${event.clientX - box.left}px`);
                surface.style.setProperty("--my", `${event.clientY - box.top}px`);
            });
        },
        { passive: true }
    );
}

/** Fades images in once loaded and swaps broken ones for a placeholder. */
export function initImageLoading() {
    document.addEventListener(
        "load",
        (event) => {
            if (event.target instanceof HTMLImageElement) {
                event.target.classList.add("is-loaded");
            }
        },
        true
    );
    document.addEventListener(
        "error",
        (event) => {
            const image = event.target;
            if (!(image instanceof HTMLImageElement) || image.dataset.failed) return;
            image.dataset.failed = "1";
            image.removeAttribute("srcset");
            image.src = image.dataset.fallback || "./res/icons/missing-poster.svg";
            image.classList.add("is-loaded");
        },
        true
    );
}

/** Marks images that finished loading before the listeners could see them. */
export function settleImages(root = document) {
    root.querySelectorAll("img.is-loading").forEach((image) => {
        if (image.complete && image.naturalWidth > 0) image.classList.add("is-loaded");
    });
}

/** Adds a state class to the header once the page is scrolled. */
export function initScrollState() {
    const update = () =>
        document.documentElement.classList.toggle("is-scrolled", window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
}

export function setPageTitle(title) {
    document.title = title ? `${title} · MMDb` : "MMDb · My Movie Database";
}
