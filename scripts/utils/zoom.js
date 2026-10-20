// "Zoom into the name": clicking a director / writer / actor dollies the whole
// page into the name you clicked, then the person's page emerges from that same
// name (hand-off through sessionStorage). Implemented with the Web Animations API.
//
//  departure:  page zooms about the name -> a veil fades in -> the name glides to
//              the centre -> navigate
//  arrival:    the veil (same name, same spot) waits for the data -> the name
//              settles into the page title while the page eases out of the zoom
import { prefersReducedMotion } from "./format.js";

const KEY = "mmdb:zoom";
const MAX_AGE = 6000;
const LINK = 'a[href^="person?"], a[href^="person.html?"]';

let departing = false;
let arrival = null;
let departureCleanup = null;

const supported = () => "animate" in Element.prototype && !prefersReducedMotion();

function readToken() {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        sessionStorage.removeItem(KEY);
        const token = JSON.parse(raw);
        return Date.now() - token.time < MAX_AGE ? token : null;
    } catch {
        return null;
    }
}

function createVeil(name) {
    const veil = document.createElement("div");
    veil.className = "zoom-veil";
    veil.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "zoom-veil__name";
    label.textContent = name;

    veil.append(label);
    document.body.append(veil);
    return { veil, label };
}

const px = (element) => parseFloat(getComputedStyle(element).fontSize);

/** The text box of an element (not its padding box), first line only. */
function textRect(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects()[0] || element.getBoundingClientRect();
}

// ---------------------------------------------------------------- departure

function depart(link, event) {
    const url = new URL(link.href, window.location.href);
    const source = link.querySelector("[data-zoom-name]") || link;
    const name = source.textContent.replace(/\s+/g, " ").trim();
    if (!name) return;

    event.preventDefault();
    departing = true;

    const box = textRect(source);
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;

    document.documentElement.classList.add("is-zooming");

    // 1. The page dollies into the name.
    const targets = [document.querySelector("main"), document.querySelector(".footer")].filter(Boolean);
    const zoomOut = targets.map((element) => {
        const rect = element.getBoundingClientRect();
        element.style.transformOrigin = `${cx - rect.left}px ${cy - rect.top}px`;
        return element.animate(
            [
                { transform: "scale(1)", opacity: 1 },
                { transform: "scale(1.6)", opacity: 0.85, offset: 0.35 },
                { transform: "scale(6)", opacity: 0 },
            ],
            { duration: 640, easing: "cubic-bezier(.55,0,.8,.35)", fill: "forwards" }
        );
    });

    // 2. A veil fades in and the name glides from the link to the centre.
    const { veil, label } = createVeil(name);
    const veilFade = veil.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 420,
        delay: 210,
        easing: "ease-out",
        fill: "both",
    });

    const final = label.getBoundingClientRect();
    const scale = px(source) / px(label);
    const dx = cx - (final.left + final.width / 2);
    const dy = cy - (final.top + final.height / 2);
    const glide = label.animate(
        [
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0 },
            { opacity: 1, offset: 0.22 },
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
        ],
        { duration: 640, easing: "cubic-bezier(.3,0,.15,1)", fill: "both" }
    );

    departureCleanup = () => {
        departing = false;
        document.documentElement.classList.remove("is-zooming");
        targets.forEach((element) => {
            element.getAnimations().forEach((animation) => animation.cancel());
            element.style.transformOrigin = "";
        });
        veil.remove();
        departureCleanup = null;
    };

    // 3. Navigate once the zoom has landed (with a safety net).
    let navigated = false;
    const go = () => {
        if (navigated) return;
        navigated = true;
        try {
            sessionStorage.setItem(KEY, JSON.stringify({ name, time: Date.now() }));
        } catch {
            /* the arrival animation is optional */
        }
        window.location.assign(url);
    };
    Promise.allSettled([...zoomOut, veilFade, glide].map((animation) => animation.finished)).then(go);
    setTimeout(go, 1500);
}

function onClick(event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest(LINK);
    if (!link || link.target === "_blank" || departing || !supported()) return;
    if (new URL(link.href, window.location.href).origin !== window.location.origin) return;

    depart(link, event);
}

// ------------------------------------------------------------------ arrival

function beginArrival(token) {
    document.documentElement.classList.add("zoom-arrival");
    const { veil, label } = createVeil(token.name);
    veil.classList.add("is-waiting");
    arrival = { veil, label };
    // If the data never arrives, never leave the visitor staring at a veil.
    setTimeout(() => finishZoomArrival(null), 7000);
}

/**
 * Called by the person page once its title is on screen: the veil's name glides
 * into the title while the page eases out of the zoom.
 */
export function finishZoomArrival(title) {
    if (!arrival) return;
    const { veil, label } = arrival;
    arrival = null;

    const root = document.documentElement;
    const targets = [document.querySelector("main"), document.querySelector(".footer")].filter(Boolean);
    const done = () => {
        veil.remove();
        root.classList.remove("zoom-arrival");
        targets.forEach((element) => {
            element.getAnimations().forEach((animation) => animation.cancel());
            element.style.transformOrigin = "";
        });
    };

    veil.classList.remove("is-waiting");

    if (!title || !supported()) {
        veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).finished.then(done, done);
        return;
    }

    const target = textRect(title);
    const from = label.getBoundingClientRect();
    const scale = px(title) / px(label);
    const dx = target.left - from.left;
    const dy = target.top - from.top;
    label.style.transformOrigin = "0 0";

    const ease = "cubic-bezier(.22,1,.36,1)";
    const animations = [
        label.animate(
            [
                { transform: "translate(0, 0) scale(1)", opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 1, offset: 0.82 },
                { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0 },
            ],
            { duration: 950, easing: ease, fill: "forwards" }
        ),
        veil.animate([{ opacity: 1 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], {
            duration: 900,
            easing: "ease-out",
            fill: "forwards",
        }),
    ];

    // The page emerges from the name: zoomed in and transparent -> settled.
    const originX = target.left + target.width / 2;
    const originY = target.top + target.height / 2;
    targets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        element.style.transformOrigin = `${originX - rect.left}px ${originY - rect.top}px`;
        animations.push(
            element.animate(
                [
                    { transform: "scale(2.4)", opacity: 0 },
                    { transform: "scale(1.5)", opacity: 0, offset: 0.2 },
                    { transform: "scale(1)", opacity: 1 },
                ],
                { duration: 950, easing: ease, fill: "both" }
            )
        );
    });
    // main was hidden via CSS while waiting; the animation now owns its opacity.
    root.classList.remove("zoom-arrival");
    root.classList.add("is-zooming");

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        root.classList.remove("is-zooming");
        done();
    });
}

// ---------------------------------------------------------------------- init

export function initZoomTransitions() {
    document.addEventListener("click", onClick);

    // The browser's own crossfade would fight with ours.
    window.addEventListener("pageswap", (event) => {
        if (departing) event.viewTransition?.skipTransition?.();
    });

    // Coming back with the Back button restores the page exactly as we left it
    // (zoomed out and invisible), so undo the departure.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) departureCleanup?.();
    });

    const token = readToken();
    if (!token) return;

    window.addEventListener("pagereveal", (event) => event.viewTransition?.skipTransition?.());

    if (document.body.dataset.page === "person" && supported()) beginArrival(token);
}
