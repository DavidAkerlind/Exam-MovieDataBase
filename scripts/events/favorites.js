// One delegated click handler for every favorite button on any page, plus
// keeping all buttons and the header badge in sync (also across tabs).
import { toggleFavorite, isFavorite, onFavoritesChange, countFavorites } from "../data/favorites.js";
import { icons } from "../utils/icons.js";
import { toast } from "../components/feedback.js";
import { celebrateFavorite } from "../utils/effects.js";

export function syncFavoriteButton(button, active) {
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));

    const iconSlot = button.querySelector(".fav-btn__icon");
    if (iconSlot) iconSlot.innerHTML = active ? icons.heartFilled : icons.heart;

    const label = button.querySelector(".fav-btn__label");
    if (label) label.textContent = active ? "In favorites" : "Add to favorites";
}

function syncAll() {
    document.querySelectorAll("[data-fav-id]").forEach((button) => {
        syncFavoriteButton(button, isFavorite(button.dataset.favId, button.dataset.favAlias));
    });

    const count = countFavorites();
    document.querySelectorAll("[data-favorites-count]").forEach((badge) => {
        badge.textContent = count;
        badge.hidden = count === 0;
    });
}

export function initFavorites() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-fav-id]");
        if (!button) return;
        event.preventDefault();

        const { favId, favAlias, title } = button.dataset;
        const nowFavorite = toggleFavorite(favId, favAlias);

        button.classList.remove("is-pop");
        void button.offsetWidth; // restart the animation
        button.classList.add("is-pop");
        button.addEventListener("animationend", () => button.classList.remove("is-pop"), {
            once: true,
        });

        if (nowFavorite) {
            celebrateFavorite(button);
            toast(`Added “${title}” to favorites`, { actionLabel: "View", href: "favorites" });
        } else {
            toast(`Removed “${title}”`, {
                actionLabel: "Undo",
                onAction: () => toggleFavorite(favId, favAlias),
            });
        }
    });

    onFavoritesChange(syncAll);
    syncAll();
}
