// Skeleton placeholders, empty/error notices and toasts.
import { html, mount } from "../utils/html.js";
import { icon } from "../utils/icons.js";

export function skeletonCards(count = 8) {
    return html`${Array.from(
        { length: count },
        () => html`
            <article class="movie-card movie-card--skeleton" aria-hidden="true">
                <div class="movie-card__poster skeleton"></div>
                <div class="movie-card__info">
                    <span class="skeleton skeleton--line"></span>
                    <span class="skeleton skeleton--line skeleton--short"></span>
                </div>
            </article>
        `
    )}`;
}

/** A glass notice card for empty states and errors. */
export function noticeHTML({
    title,
    text = "",
    tone = "info",
    action,
    iconName = tone === "error" ? "alert" : "film",
}) {
    return html`
        <div class="notice glass ${`notice--${tone}`}" role="${tone === "error" ? "alert" : "status"}">
            <span class="notice__icon">${icon(iconName)}</span>
            <h2 class="notice__title">${title}</h2>
            ${text ? html`<p class="notice__text">${text}</p>` : ""}
            ${action
                ? action.href
                    ? html`<a class="btn btn--primary" href="${action.href}">${action.label}</a>`
                    : html`<button class="btn btn--primary" type="button" data-notice-action>${action.label}</button>`
                : ""}
        </div>
    `;
}

export function showNotice(container, options) {
    mount(container, noticeHTML(options));
    const button = container.querySelector("[data-notice-action]");
    if (button && options.action?.onClick) {
        button.addEventListener("click", options.action.onClick, { once: true });
    }
}

/** Friendly copy for the different ways a request can fail. */
export function errorNotice(error, retry) {
    const code = error?.code;
    const options = {
        tone: "error",
        title: "Something went wrong",
        text: error?.message || "Please try again in a moment.",
        action: retry ? { label: "Try again", onClick: retry } : undefined,
    };

    if (code === "not_configured") {
        options.title = "Almost there: connect the API";
        options.iconName = "sparkle";
        options.action = undefined;
    } else if (code === "network_error") {
        options.title = "Can't reach the movie service";
    } else if (code === "not_found") {
        options.title = "We couldn't find that";
        options.action = { label: "Back to home", href: "index.html" };
    }
    return options;
}

// ---------------------------------------------------------------- toasts

let region;

function getRegion() {
    if (!region) {
        region = document.createElement("div");
        region.className = "toasts";
        region.setAttribute("role", "status");
        region.setAttribute("aria-live", "polite");
        document.body.append(region);
    }
    return region;
}

export function toast(message, { actionLabel, onAction, href, duration = 4200 } = {}) {
    const item = document.createElement("div");
    item.className = "toast glass glass--strong";

    const text = document.createElement("span");
    text.className = "toast__text";
    text.textContent = message;
    item.append(text);

    if (actionLabel) {
        const action = href ? document.createElement("a") : document.createElement("button");
        action.className = "toast__action";
        action.textContent = actionLabel;
        if (href) action.href = href;
        else action.type = "button";
        action.addEventListener("click", () => {
            onAction?.();
            dismiss();
        });
        item.append(action);
    }

    function dismiss() {
        if (!item.isConnected) return;
        item.classList.add("is-leaving");
        item.addEventListener("animationend", () => item.remove(), { once: true });
        setTimeout(() => item.remove(), 600);
    }

    const container = getRegion();
    while (container.children.length >= 3) container.firstElementChild.remove();
    container.append(item);
    setTimeout(dismiss, duration);
    return dismiss;
}

