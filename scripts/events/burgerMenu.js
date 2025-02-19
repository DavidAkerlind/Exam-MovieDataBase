export function initCloseBurgerMenu() {
    console.log("initCloseBurgerMenu()");
    document.addEventListener("DOMContentLoaded", () => {
        let menuToggle = document.querySelector("#menu-toggle");
        let menu = document.querySelector(".menu__navigation");
        let burgerLabel = document.querySelector("#burgerLabel");

        document
            .querySelector("#menu-toggle")
            .addEventListener("click", (event) => {
                if (menuToggle.ariaLabel === "closed") {
                    menuToggle.ariaLabel = "open";
                } else {
                    menuToggle.ariaLabel = "closed";
                }
            });

        document.addEventListener("click", (event) => {
            if (
                !burgerLabel.contains(event.target) &&
                !menu.contains(event.target) &&
                !menuToggle.contains(event.target) &&
                menuToggle.ariaLabel === "open"
            ) {
                menuToggle.checked = false;

                menuToggle.ariaLabel = "closed";
            }
        });
    });
}
