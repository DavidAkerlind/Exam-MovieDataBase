// Delightful, dependency free micro-effects: particle bursts, ripples, a heart
// that flies to the header, bumps and number count-ups. Every effect is skipped
// when the visitor prefers reduced motion.
import { icons } from "./icons.js";
import { prefersReducedMotion } from "./format.js";

const PALETTE = ["#ff6b95", "#ff8fb0", "#ffc43d", "#ffe08a", "#c3b8ff"];

let layer;

function fxLayer() {
    if (!layer) {
        layer = document.createElement("div");
        layer.className = "fx-layer";
        layer.setAttribute("aria-hidden", "true");
        document.body.append(layer);
    }
    return layer;
}

function centerOf(element) {
    const box = element.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/** Hearts and sparks radiating from an element. */
export function burst(origin, { count = 12, spread = 74 } = {}) {
    if (prefersReducedMotion()) return;

    const { x, y } = centerOf(origin);
    const host = fxLayer();

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const distance = spread * (0.6 + Math.random() * 0.7);
        const dot = i % 3 === 0;

        const particle = document.createElement("span");
        particle.className = dot ? "fx-particle fx-particle--dot" : "fx-particle";
        particle.style.cssText = [
            `left:${x}px`,
            `top:${y}px`,
            `--dx:${(Math.cos(angle) * distance).toFixed(1)}px`,
            `--dy:${(Math.sin(angle) * distance - 14).toFixed(1)}px`,
            `--rot:${((Math.random() - 0.5) * 140).toFixed(0)}deg`,
            `--s:${(0.65 + Math.random() * 0.75).toFixed(2)}`,
            `--c:${PALETTE[i % PALETTE.length]}`,
            `animation-delay:${Math.floor(Math.random() * 70)}ms`,
        ].join(";");
        if (!dot) particle.innerHTML = icons.heartFilled;

        host.append(particle);
        particle.addEventListener("animationend", () => particle.remove(), { once: true });
    }
}

/** An expanding ring, like a drop in water. */
export function ripple(origin, { color = "#ff6b95", size = 64 } = {}) {
    if (prefersReducedMotion()) return;

    const { x, y } = centerOf(origin);
    const ring = document.createElement("span");
    ring.className = "fx-ripple";
    ring.style.cssText = `left:${x}px;top:${y}px;--c:${color};--size:${size}px`;
    fxLayer().append(ring);
    ring.addEventListener("animationend", () => ring.remove(), { once: true });
}

/** Restarts the little "bump" animation on an element (a badge, a nav item…). */
export function bump(element) {
    if (!element || prefersReducedMotion()) return;
    element.classList.remove("is-bump");
    void element.offsetWidth; // restart the animation
    element.classList.add("is-bump");
    element.addEventListener("animationend", () => element.classList.remove("is-bump"), {
        once: true,
    });
}

/**
 * Flies a heart along an arc from one element to another and resolves when it lands.
 */
export function flyHeart(from, to, { duration = 900 } = {}) {
    if (prefersReducedMotion() || !from || !to || !("animate" in Element.prototype)) {
        return Promise.resolve();
    }

    const start = centerOf(from);
    const end = centerOf(to);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lift = Math.min(190, 70 + Math.abs(dy) * 0.4 + Math.abs(dx) * 0.08);

    const flyer = document.createElement("span");
    flyer.className = "fx-flyer";
    flyer.style.cssText = `left:${start.x}px;top:${start.y}px`;
    flyer.innerHTML = icons.heartFilled;
    fxLayer().append(flyer);

    const at = (x, y, scale, rotate) =>
        `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;

    const animation = flyer.animate(
        [
            { transform: at(0, 0, 1, 0), opacity: 1, offset: 0, easing: "cubic-bezier(.2,.7,.3,1)" },
            {
                transform: at(dx * 0.5, dy * 0.5 - lift, 1.5, 14),
                opacity: 1,
                offset: 0.5,
                easing: "cubic-bezier(.6,0,.9,.5)",
            },
            { transform: at(dx, dy, 0.42, -8), opacity: 0.95, offset: 1 },
        ],
        { duration, fill: "forwards" }
    );

    return animation.finished.catch(() => {}).finally(() => flyer.remove());
}

/** Counts a number up from zero (used by the animated stats). */
export function countUp(element, to, { decimals = 0, duration = 1400, delay = 0 } = {}) {
    const format = (value) => value.toFixed(decimals);

    if (prefersReducedMotion() || !Number.isFinite(to)) {
        element.textContent = format(to);
        return;
    }

    element.textContent = format(0);
    const begin = performance.now() + delay;

    const tick = (now) => {
        const progress = Math.min(Math.max((now - begin) / duration, 0), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = format(to * eased);
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/** The full "added to favorites" celebration. */
export async function celebrateFavorite(button) {
    burst(button);
    ripple(button);

    const target = [...document.querySelectorAll('.header__nav-link[href="favorites.html"], #burgerLabel')].find(
        (element) => element.getClientRects().length > 0
    );
    if (!target) return;

    await flyHeart(button, target);
    bump(target);
    ripple(target, { color: "#ffc43d", size: 46 });
    document.querySelectorAll("[data-favorites-count]").forEach((badge) => bump(badge));
}
