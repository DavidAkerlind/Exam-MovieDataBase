// The floating glass header: logo, search, navigation and the mobile menu.
import { html } from "../utils/html.js";
import { icon } from "../utils/icons.js";
import { countFavorites } from "../data/favorites.js";

const NAV = [
    { page: "home", href: "index.html", label: "Home" },
    { page: "search", href: "search.html", label: "Search" },
    { page: "favorites", href: "favorites.html", label: "Favorites" },
];

/** The search form used in the header, the mobile menu and on the search page. */
export function searchFormHTML({ id, className = "", placeholder = "Search movies & people", value = "" }) {
    return html`
        <form class="search header__form ${className}" data-search-form role="search" action="search.html" method="get">
            <label class="sr-only" for="${id}">Search MMDb</label>
            <span class="search__icon">${icon("search")}</span>
            <input
                id="${id}"
                class="search__input header__input"
                name="q"
                type="search"
                value="${value}"
                placeholder="${placeholder}"
                autocomplete="off"
                enterkeyhint="search"
                role="combobox"
                aria-expanded="false"
                aria-controls="${id}-panel"
                aria-autocomplete="list" />
            <button class="search__submit header__form-btn" type="submit" aria-label="Search">
                ${icon("arrowRight")}
            </button>
            <div class="search__panel glass glass--strong" id="${id}-panel" role="listbox" aria-label="Search suggestions" hidden></div>
        </form>
    `;
}

function navLink({ page, href, label }, active, className) {
    const current = page === active;
    const badge =
        page === "favorites"
            ? html`<span class="header__badge" data-favorites-count ${countFavorites() ? "" : "hidden"}>${countFavorites()}</span>`
            : "";

    return html`
        <a class="${className} ${current ? `${className}--active` : ""}" href="${href}" ${current ? html`aria-current="page"` : ""}>
            ${label}${badge}
        </a>
    `;
}

export function headerHTML(active) {
    return html`
        <header class="header" id="siteHeader">
            <div class="header__container">
                <a class="header__logo-link" href="index.html" aria-label="MMDb home">
                    <img class="header__logo" src="./res/logo.svg" alt="" width="34" height="34" />
                    <span class="header__brand">MMDb</span>
                </a>

                ${searchFormHTML({ id: "searchInput" })}

                <nav class="header__nav" aria-label="Main navigation">
                    <ul class="header__nav-list">
                        ${NAV.map(
                            (item) => html`<li class="header__nav-item">${navLink(item, active, "header__nav-link")}</li>`
                        )}
                    </ul>
                </nav>

                <div class="menu">
                    <input type="checkbox" class="menu__checkbox" id="menu-toggle" tabindex="-1" aria-hidden="true" />
                    <label id="burgerLabel" class="menu__button" for="menu-toggle" tabindex="0" role="button" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false">
                        <span class="menu__button-line"></span>
                    </label>

                    <nav id="mobileMenu" class="menu__navigation glass glass--strong" aria-label="Mobile navigation">
                        ${searchFormHTML({ id: "searchInputMobile", className: "header__form--mobile" })}
                        <ul class="menu__list">
                            ${NAV.map(
                                (item) => html`<li class="menu__item">${navLink(item, active, "menu__link")}</li>`
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    `;
}
