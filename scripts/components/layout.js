// Renders the chrome shared by every page: ambient background, skip link,
// header and footer.
import { headerHTML } from "./header.js";
import { footerHTML } from "./footer.js";

const AMBIENT = `
    <div class="ambient" aria-hidden="true">
        <span class="ambient__orb ambient__orb--violet"></span>
        <span class="ambient__orb ambient__orb--cyan"></span>
        <span class="ambient__orb ambient__orb--pink"></span>
        <span class="ambient__orb ambient__orb--gold"></span>
    </div>
`;

export function renderLayout(page) {
    document.body.insertAdjacentHTML(
        "afterbegin",
        `<a class="skip-link" href="#main">Skip to content</a>${AMBIENT}${headerHTML(page)}`
    );
    document.body.insertAdjacentHTML("beforeend", footerHTML().toString());
}
