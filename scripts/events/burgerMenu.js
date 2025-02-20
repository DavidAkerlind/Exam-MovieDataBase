import { toggleAriaLabel } from "../utils/domUtils.js";

export function initBurgerMenu() {
    console.log("initBurgerMenu()");
    document.addEventListener("DOMContentLoaded", setupBurgerMenu);
}

function setupBurgerMenu() {
    const menuToggle = document.querySelector("#menu-toggle");
    const menu = document.querySelector(".menu__navigation");
    const burgerLabel = document.querySelector("#burgerLabel");

    if (!menuToggle || !menu || !burgerLabel) return;

    menuToggle.addEventListener("click", toggleAriaLabel);
    document.addEventListener("click", (event) =>
        closeMenuOnClickOutside(event, menuToggle, menu, burgerLabel)
    );
    burgerLabel.addEventListener("keydown", handleKeyboardToggle);
}

function closeMenuOnClickOutside(event, menuToggle, menu, burgerLabel) {
    if (
        !burgerLabel.contains(event.target) &&
        !menu.contains(event.target) &&
        !menuToggle.contains(event.target) &&
        menuToggle.ariaLabel === "open"
    ) {
        menuToggle.checked = false;
        menuToggle.ariaLabel = "closed";
    }
}

function handleKeyboardToggle(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const menuToggle = document.getElementById("menu-toggle");
        if (menuToggle) {
            menuToggle.checked = !menuToggle.checked;
        }
    }
}
