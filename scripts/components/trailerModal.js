// A glass modal that plays a YouTube trailer. Uses the native <dialog> element,
// which gives us focus trapping, Escape-to-close and focus restoration for free.
import { icon } from "../utils/icons.js";
import { html } from "../utils/html.js";

let dialog;

function ensureDialog() {
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.className = "modal glass glass--strong";
    dialog.setAttribute("aria-labelledby", "trailerTitle");
    dialog.innerHTML = html`
        <div class="modal__bar">
            <h2 class="modal__title" id="trailerTitle"></h2>
            <button class="btn btn--icon" type="button" data-modal-close aria-label="Close trailer">
                ${icon("x")}
            </button>
        </div>
        <div class="modal__frame"></div>
    `.toString();

    dialog.addEventListener("click", (event) => {
        // A click on the dialog box itself (not its content) is a click on the backdrop.
        if (event.target === dialog || event.target.closest("[data-modal-close]")) {
            dialog.close();
        }
    });
    dialog.addEventListener("close", () => {
        dialog.querySelector(".modal__frame").replaceChildren(); // stops playback
    });

    document.body.append(dialog);
    return dialog;
}

export function openTrailer({ key, title }) {
    if (!key) return;

    const modal = ensureDialog();
    modal.querySelector(".modal__title").textContent = `${title} · Trailer`;

    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        key
    )}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    frame.title = `${title} trailer`;
    frame.allow =
        "autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    modal.querySelector(".modal__frame").replaceChildren(frame);

    if (!modal.open) modal.showModal();
}

export const isTrailerOpen = () => Boolean(dialog?.open);
