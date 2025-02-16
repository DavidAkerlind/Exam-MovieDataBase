function createHeader() {
    const headerHTML = `
        <header class="header header--flex">
            <div class="header__container">
                <a class="header__logo-link" href="index.html">
                    <img class="header__logo" src="./res/logo.png" alt="Website Logo" />
                </a>
                <form class="header__form" id="searchForm" role="search">
                    <label for="searchInput" class="header__form-label">Search MMDb:</label>
                    <input class="header__input" id="searchInput" type="text" placeholder="Search MMDb" aria-label="Search movies on IMDb" />
                    <button class="header__form-btn" id="searchBtn" aria-label="Search">
                        <img src="./res/icons/search-black.svg" alt="Search Icon" />
                    </button>
                </form>
                <nav class="header__nav" aria-label="Main Navigation">
                    <ul class="header__nav-list">
                        <li class="header__nav-item">
                            <a href="./search.html" class="header__nav-link" id="searchLink">Search</a>
                        </li>
                        <li class="header__nav-item">
                            <a href="./favorites.html" class="header__nav-link" id="favoritesLink">Favorites</a>
                        </li>
                    </ul>
                </nav>
          <!-- Accessible Hamburger Menu -->
<div class="menu">
    <input
        type="checkbox"
        class="menu__checkbox"
        id="menu-toggle"
        aria-hidden="true" />
    <label
        tabindex="0"
        class="menu__button"
        for="menu-toggle"
        aria-label="Toggle navigation menu">
        <span
            role="button"
            class="menu__button-line"
            aria-label="Open burger menu (mobile only)"></span>
    </label>

    <!-- Navigation Burger Menu -->
    <nav
        class="menu__navigation d-none"
        aria-label="Main Navigation on Mobile"
        aria-expanded="false">
        <ul class="menu__list">
            <!-- Logo -->
            <li class="menu__item">
                <a
                    aria-label="Back to home link"
                    class="menu__link"
                    href="index.html">
                    <img
                        aria-hidden="true"
                        class="menu__logo"
                        src="./res/logo.png"
                        alt="Website Logo"
                    />
                </a>
            </li>

            <!-- Search Form -->
            <li class="menu__item">
                <form class="header__form" id="searchForm" role="search">
                    <label for="searchInput" class="header__form-label">Search MMDb:</label>
                    <input
                        class="header__input"
                        id="searchInput"
                        type="text"
                        placeholder="Search MMDb"
                        aria-label="Search movies on IMDb" />
                    <button
                        class="header__form-btn"
                        id="searchBtn"
                        aria-label="Search">
                        <img
                            src="./res/icons/search-black.svg"
                            alt="Search Icon" />
                    </button>
                </form>
            </li>

            <!-- Navigation Links -->
            <li class="menu__item">
                <a
                    class="menu__link"
                    href="./search.html"
                    aria-label="Navigate to search page">
                    Search
                </a>
            </li>
            <li class="menu__item">
                <a
                    class="menu__link"
                    href="./favorites.html"
                    aria-label="Navigate to favorites page">
                    Favorites
                </a>
            </li>
        </ul>
    </nav>
</div>

            </div>
        </header>
    `;

    // Lägg till headern i början av <body>
    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    // Markera den aktiva länken
    highlightActiveLink();
}

function highlightActiveLink() {
    const path = window.location.pathname; // Hämtar nuvarande sidans URL-path

    if (path.includes("search.html")) {
        document
            .getElementById("searchLink")
            .classList.add("header__nav-link--active");
    } else if (path.includes("favorites.html")) {
        document
            .getElementById("favoritesLink")
            .classList.add("header__nav-link--active");
    }
}

// Kör funktionen för att skapa headern
export { createHeader };
