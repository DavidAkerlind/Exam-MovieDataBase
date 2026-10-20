// Person detail: portrait, facts, expandable biography and filmography.
import { fetchPerson, fetchPersonByName } from "../modules/api.js";
import { html, mount } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { formatDate, ageFrom } from "../utils/format.js";
import { profileImage } from "../utils/images.js";
import { setPageTitle, reveal, settleImages } from "../utils/motion.js";
import { showNotice, errorNotice } from "../components/feedback.js";
import { movieUrl, posterImg } from "../components/movieCard.js";
import { finishZoomArrival } from "../utils/zoom.js";

const BIO_PREVIEW_LENGTH = 520;

function lifeFacts(person) {
    const age = ageFrom(person.birthday, person.deathday);
    const rows = [];

    if (person.birthday) {
        rows.push({
            label: "Born",
            value: `${formatDate(person.birthday)}${!person.deathday && age !== null ? ` (age ${age})` : ""}`,
        });
    }
    if (person.deathday) {
        rows.push({
            label: "Died",
            value: `${formatDate(person.deathday)}${age !== null ? ` (aged ${age})` : ""}`,
        });
    }
    if (person.placeOfBirth) rows.push({ label: "Place of birth", value: person.placeOfBirth });
    return rows;
}

function biographyHTML(person) {
    const paragraphs = (person.biography || "").split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);
    const long = person.biography.length > BIO_PREVIEW_LENGTH;

    return html`
        <section class="person-info__biography glass">
            <h2 class="person-info__bio-title">Biography</h2>
            ${paragraphs.length
                ? html`
                      <div class="person-info__bio-text ${long ? "is-clamped" : ""}" id="personBio">
                          ${paragraphs.map((text) => html`<p>${text}</p>`)}
                      </div>
                      ${long
                          ? html`<button class="btn btn--glass btn--sm" type="button" data-bio-toggle aria-expanded="false" aria-controls="personBio">Read more</button>`
                          : ""}
                  `
                : html`<p class="person-info__bio-text">No biography available.</p>`}
        </section>
    `;
}

function filmographyHTML(credits) {
    if (!credits.length) return "";

    return html`
        <section class="person-info__all-movies" aria-labelledby="filmographyTitle">
            <header class="section__head"><h2 class="person-info__movies-title" id="filmographyTitle">Filmography</h2></header>
            <div class="person-info__movies-grid">
                ${credits.map(
                    (credit) => html`
                        <a class="person-info__movie-link reveal" href="${movieUrl(credit.id)}">
                            <article class="person-info__movie glass glass--flat">
                                <figure class="person-info__movie-poster-container">
                                    ${posterImg(credit.poster, { sizes: "(max-width: 640px) 46vw, 200px" })}
                                    ${credit.rating
                                        ? html`<span class="movie-card__rating">${icon("star")}${credit.rating.toFixed(1)}</span>`
                                        : ""}
                                </figure>
                                <div class="person-info__movie-info">
                                    <p class="person-info__movie-title">${credit.title}</p>
                                    <p class="person-info__movie-character">${[credit.year, credit.role].filter(Boolean).join(" · ")}</p>
                                </div>
                            </article>
                        </a>
                    `
                )}
            </div>
        </section>
    `;
}

function personHTML(person) {
    return html`
        <div class="person-info__header">
            <figure class="person-info__poster glass">
                <img class="is-loading" src="${profileImage(person.profile, "w500")}" alt="${person.name}" width="300" height="450" decoding="async" data-fallback="./res/icons/missing-profile.svg" />
            </figure>
            <div class="person-info__basic-info">
                ${person.department ? html`<p class="eyebrow">${person.department}</p>` : ""}
                <h1 class="person-info__title">${person.name}</h1>
                <dl class="person-info__facts">
                    ${lifeFacts(person).map(
                        (row) => html`<div class="person-info__list-item"><dt>${row.label}</dt><dd>${row.value}</dd></div>`
                    )}
                </dl>
                ${person.knownFor.length
                    ? html`<p class="person-info__known"><span>Known for</span>${person.knownFor.map((title) => html`<span class="chip">${title}</span>`)}</p>`
                    : ""}
            </div>
        </div>
        ${biographyHTML(person)}
        ${filmographyHTML(person.credits)}
    `;
}

export async function init() {
    const root = document.querySelector("#personInfo");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const name = params.get("name");

    if (!id && !name) {
        finishZoomArrival(null);
        showNotice(root, {
            title: "Nobody selected",
            text: "Open a cast member from a movie page.",
            action: { label: "Browse movies", href: "index.html" },
        });
        return;
    }

    async function load() {
        root.setAttribute("aria-busy", "true");
        mount(
            root,
            html`
                <div class="person-info__header" aria-hidden="true">
                    <div class="person-info__poster skeleton"></div>
                    <div class="person-info__basic-info">
                        <span class="skeleton skeleton--title"></span>
                        <span class="skeleton skeleton--line"></span>
                        <span class="skeleton skeleton--line skeleton--short"></span>
                    </div>
                </div>
            `
        );

        let person;
        try {
            person = id ? await fetchPerson(id) : await fetchPersonByName(name);
        } catch (error) {
            console.error(error);
            root.removeAttribute("aria-busy");
            finishZoomArrival(null);
            showNotice(root, errorNotice(error, load));
            return;
        }

        setPageTitle(person.name);
        mount(root, personHTML(person));
        root.removeAttribute("aria-busy");
        // Hand the zoomed-in name from the previous page over to the real title.
        finishZoomArrival(root.querySelector(".person-info__title"));

        root.querySelector("[data-bio-toggle]")?.addEventListener("click", (event) => {
            const button = event.currentTarget;
            const bio = root.querySelector("#personBio");
            const expanded = bio.classList.toggle("is-expanded");
            button.setAttribute("aria-expanded", String(expanded));
            button.textContent = expanded ? "Show less" : "Read more";
        });

        reveal(root);
        settleImages(root);
    }

    await load();
}
