// Mobile menu: the checkbox drives the CSS; this keeps ARIA, Escape,
// outside clicks and scroll locking in sync.
export function initBurgerMenu() {
    const toggle = document.querySelector("#menu-toggle");
    const label = document.querySelector("#burgerLabel");
    const menu = document.querySelector(".menu__navigation");
    if (!toggle || !label || !menu) return;

    const sync = () => {
        const open = toggle.checked;
        label.setAttribute("aria-expanded", String(open));
        label.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.documentElement.classList.toggle("menu-open", open);
    };
    const close = () => {
        if (!toggle.checked) return;
        toggle.checked = false;
        sync();
    };

    toggle.addEventListener("change", sync);

    label.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle.checked = !toggle.checked;
            sync();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && toggle.checked) {
            close();
            label.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!toggle.checked) return;
        // A click on the <label> also dispatches a click on the hidden checkbox,
        // so the checkbox counts as "inside" too.
        const insideMenu =
            menu.contains(event.target) || label.contains(event.target) || event.target === toggle;
        if (!insideMenu || event.target.closest("a")) close();
    });

    // Leaving the mobile breakpoint must not leave the page scroll-locked.
    window.matchMedia("(min-width: 769px)").addEventListener("change", (event) => {
        if (event.matches) close();
    });
}
