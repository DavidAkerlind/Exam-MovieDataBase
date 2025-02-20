function toggleAriaLabel(event) {
    const menuToggle = event.target;
    menuToggle.ariaLabel =
        menuToggle.ariaLabel === "closed" ? "open" : "closed";
}

function highlightActiveLink() {
    console.log("highlightActiveLink()");

    const path = window.location.pathname;

    if (path.includes("search.html")) {
        document
            .querySelectorAll("#searchLink")
            .forEach((el) => el.classList.add("header__nav-link--active"));
    } else if (path.includes("favorites.html")) {
        document
            .querySelectorAll("#favoritesLink")
            .forEach((el) => el.classList.add("header__nav-link--active"));
    } else if (
        path === "/index.html" ||
        path === "/" ||
        path === "/Exam-MovieDataBase/" ||
        path === "/Exam-MovieDataBase/index.html"
    ) {
        document
            .querySelectorAll("#homeLink")
            .forEach((el) => el.classList.add("header__nav-link--active"));
    }
}

export { toggleAriaLabel, highlightActiveLink };
