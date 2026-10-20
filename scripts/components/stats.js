// The "scores at a glance" dashboard on the movie page:
//  - a concentric ring chart (Apple-activity style "filled wheels")
//  - animated horizontal score bars
//  - a runtime gauge and a wins-vs-nominations pie
// Charts are plain SVG + CSS; the script only supplies numbers and triggers the
// draw-in animation when the panel scrolls into view.
import { html, raw } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { compactNumber, formatRuntime, prefersReducedMotion } from "../utils/format.js";
import { countUp } from "../utils/effects.js";

const TAU = Math.PI * 2;
const RING_RADII = [90, 75, 60, 45];
const MAX_RUNTIME = 240; // minutes that fill the gauge

const TONES = {
    imdb: "#ffc43d",
    rt: "#4ade80",
    rtRotten: "#ff6b7d",
    meta: "#a99dff",
    tmdb: "#44d9ff",
};

/** Normalises the available ratings to 0..1 so they can share one chart. */
export function buildScores(movie) {
    const { ratings } = movie;
    const scores = [];

    if (ratings.imdb) {
        scores.push({
            key: "imdb",
            label: "IMDb",
            value: ratings.imdb,
            max: 10,
            unit: "/10",
            decimals: 1,
            tone: TONES.imdb,
            sub: ratings.imdbVotes ? `${compactNumber(ratings.imdbVotes)} votes` : "",
        });
    }
    if (ratings.rottenTomatoes) {
        const fresh = ratings.rottenTomatoes >= 60;
        scores.push({
            key: "rt",
            label: "Rotten Tomatoes",
            value: ratings.rottenTomatoes,
            max: 100,
            unit: "%",
            decimals: 0,
            tone: fresh ? TONES.rt : TONES.rtRotten,
            sub: fresh ? "Fresh" : "Rotten",
        });
    }
    if (ratings.metascore) {
        scores.push({
            key: "meta",
            label: "Metascore",
            value: ratings.metascore,
            max: 100,
            unit: "/100",
            decimals: 0,
            tone: TONES.meta,
            sub: "Critics",
        });
    }
    if (ratings.tmdb) {
        scores.push({
            key: "tmdb",
            label: "TMDB",
            value: ratings.tmdb,
            max: 10,
            unit: "/10",
            decimals: 1,
            tone: TONES.tmdb,
            sub: movie.votes ? `${compactNumber(movie.votes)} votes` : "Users",
        });
    }

    return scores.map((score) => ({ ...score, pct: Math.min(score.value / score.max, 1) }));
}

/** "Won 3 Oscars. 21 wins & 43 nominations total" -> { wins, nominations, oscar } */
export function parseAwards(text) {
    if (!text) return null;

    const wins = Number(text.match(/(\d+)\s+wins?/i)?.[1]) || 0;
    const nominations = Number(text.match(/(\d+)\s+nominations?/i)?.[1]) || 0;
    const oscar = text.match(/(won|nominated for)\s+(\d+)\s+oscars?/i);

    if (!wins && !nominations && !oscar) return null;
    return {
        wins,
        nominations,
        oscar: oscar
            ? { kind: oscar[1].toLowerCase() === "won" ? "Won" : "Nominated for", count: Number(oscar[2]) }
            : null,
    };
}

function ringChart(scores) {
    const rings = scores
        .map((score, i) => {
            const radius = RING_RADII[i];
            const circumference = TAU * radius;
            return `
                <g class="ring" data-source="${score.key}" style="--tone:${score.tone};--c:${circumference.toFixed(2)};--pct:${score.pct.toFixed(4)};--i:${i}">
                    <circle class="ring__track" cx="100" cy="100" r="${radius}" />
                    <circle class="ring__value" cx="100" cy="100" r="${radius}" />
                </g>`;
        })
        .join("");

    const overall = Math.round(
        (scores.reduce((sum, score) => sum + score.pct, 0) / scores.length) * 100
    );
    const summary = scores
        .map((score) => `${score.label} ${score.value}${score.unit.replace("/", " out of ")}`)
        .join(", ");

    return html`
        <div class="ring-chart" role="img" aria-label="${`Overall score ${overall} out of 100. ${summary}.`}">
            <svg class="ring-chart__svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
                <g transform="rotate(-90 100 100)">${raw(rings)}</g>
            </svg>
            <div class="ring-chart__center">
                <span class="ring-chart__number" data-count-to="${overall}" data-decimals="0">${overall}</span>
                <span class="ring-chart__label">Overall</span>
            </div>
        </div>
    `;
}

function scoreList(scores) {
    return html`
        <ul class="score-list" aria-label="Scores">
            ${scores.map(
                (score, i) => html`
                    <li class="score-row" data-source="${score.key}" style="--tone:${score.tone};--pct:${score.pct.toFixed(4)};--i:${i}">
                        <span class="score-row__label"><i class="score-row__dot"></i>${score.label}</span>
                        <span class="score-row__value">
                            <span data-count-to="${score.value}" data-decimals="${score.decimals}">${score.value}</span><small>${score.unit}</small>
                        </span>
                        <span class="score-row__bar" aria-hidden="true"><i></i></span>
                        ${score.sub ? html`<span class="score-row__sub">${score.sub}</span>` : ""}
                    </li>
                `
            )}
        </ul>
    `;
}

/** Half-circle gauge: how long is this movie compared to a 4 hour epic? */
function runtimeGauge(runtime) {
    if (!runtime) return "";

    const radius = 52;
    const length = Math.PI * radius;
    const pct = Math.min(runtime / MAX_RUNTIME, 1);
    const d = `M ${60 - radius} 62 A ${radius} ${radius} 0 0 1 ${60 + radius} 62`;

    return html`
        <div class="mini mini--gauge" style="--c:${length.toFixed(2)};--pct:${pct.toFixed(4)}">
            <div class="mini__visual">
                <svg class="mini__svg" viewBox="0 0 120 72" aria-hidden="true" focusable="false">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stop-color="#ffe08a" />
                            <stop offset="1" stop-color="#ff9d1a" />
                        </linearGradient>
                    </defs>
                    <path class="gauge__track" d="${d}" />
                    <path class="gauge__value" d="${d}" />
                </svg>
                <div class="mini__center mini__center--gauge">
                    <span class="mini__value">${formatRuntime(runtime)}</span>
                </div>
            </div>
            <p class="mini__label">Runtime</p>
            <p class="mini__sub">${Math.round(pct * 100)}% of a 4 hour epic</p>
        </div>
    `;
}

/** Pie / donut of wins versus nominations. */
function awardsPie(awards) {
    if (!awards || !(awards.wins + awards.nominations)) return "";

    const radius = 42;
    const circumference = TAU * radius;
    const total = awards.wins + awards.nominations;
    const winLength = (awards.wins / total) * circumference;
    const nomLength = (awards.nominations / total) * circumference;
    const gap = awards.wins && awards.nominations ? 3 : 0;

    const slice = (cls, length, offset, tone) =>
        `<circle class="donut__slice ${cls}" cx="60" cy="60" r="${radius}" style="--c:${circumference.toFixed(2)};--len:${Math.max(length - gap, 0).toFixed(2)};--off:${(-offset).toFixed(2)};--tone:${tone}" />`;

    return html`
        <div class="mini mini--donut">
            <div class="mini__visual">
                <svg class="mini__svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                    <g transform="rotate(-90 60 60)">
                        <circle class="donut__track" cx="60" cy="60" r="${radius}" />
                        ${raw(slice("donut__slice--wins", winLength, 0, "#ffc43d"))}
                        ${raw(slice("donut__slice--noms", nomLength, winLength, "#8b7bff"))}
                    </g>
                </svg>
                <div class="mini__center mini__center--donut">
                    <span class="mini__value"><span data-count-to="${awards.wins}" data-decimals="0">${awards.wins}</span></span>
                    <span class="mini__unit">wins</span>
                </div>
            </div>
            <p class="mini__label">Awards</p>
            <ul class="legend">
                <li><i style="--tone:#ffc43d"></i>${awards.wins} wins</li>
                <li><i style="--tone:#8b7bff"></i>${awards.nominations} nominations</li>
            </ul>
            ${awards.oscar
                ? html`<p class="mini__sub">${icon("sparkle")} ${awards.oscar.kind} ${awards.oscar.count} ${awards.oscar.count === 1 ? "Oscar" : "Oscars"}</p>`
                : ""}
        </div>
    `;
}

export function statsHTML(movie) {
    const scores = buildScores(movie);
    const awards = parseAwards(movie.awards);
    const gauge = runtimeGauge(movie.runtime);
    const pie = awardsPie(awards);

    if (!scores.length && !gauge && !pie) return "";

    return html`
        <section class="stats glass" aria-labelledby="statsTitle">
            <h2 class="stats__title" id="statsTitle">Scores at a glance</h2>
            ${scores.length
                ? html`<div class="stats__main">${ringChart(scores)}${scoreList(scores)}</div>`
                : ""}
            ${gauge || pie ? html`<div class="stats__minis">${gauge}${pie}</div>` : ""}
        </section>
    `;
}

/** Wires the draw-in animation and the ring <-> row hover link. */
export function initStats(root) {
    const stats = root.querySelector(".stats");
    if (!stats) return;

    // Start numbers at zero so they can count up when the panel scrolls into view.
    const counters = [...stats.querySelectorAll("[data-count-to]")];
    if (!prefersReducedMotion()) {
        counters.forEach((element) => {
            element.textContent = Number(0).toFixed(Number(element.dataset.decimals || 0));
        });
    }

    const play = () => {
        stats.classList.add("is-in");
        stats.querySelectorAll("[data-count-to]").forEach((element, index) =>
            countUp(element, Number(element.dataset.countTo), {
                decimals: Number(element.dataset.decimals || 0),
                delay: Math.min(index * 90, 500),
                duration: 1500,
            })
        );
    };

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
        play();
    } else {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    observer.disconnect();
                    play();
                }
            },
            { threshold: 0.35 }
        );
        observer.observe(stats);
    }

    // Hovering a row (or a ring) spotlights that score and dims the others.
    const spotlight = (source) => {
        stats.querySelectorAll("[data-source]").forEach((element) => {
            element.classList.toggle("is-dim", Boolean(source) && element.dataset.source !== source);
        });
    };
    stats.addEventListener("pointerover", (event) => {
        const target = event.target.closest("[data-source]");
        if (target) spotlight(target.dataset.source);
    });
    stats.addEventListener("pointerleave", () => spotlight(null));
    stats.addEventListener("focusin", (event) => {
        const target = event.target.closest("[data-source]");
        if (target) spotlight(target.dataset.source);
    });
    stats.addEventListener("focusout", () => spotlight(null));
}
