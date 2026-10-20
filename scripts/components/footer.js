import { html } from "../utils/html.js";
import { icon } from "../utils/icons.js";

const SOCIAL = [
    { label: "Visit our Facebook page", href: "https://facebook.com", icon: "facebook" },
    { label: "Visit our X page", href: "https://x.com", icon: "xSocial" },
    { label: "Visit our Instagram page", href: "https://instagram.com", icon: "instagram" },
    {
        label: "View the source code on GitHub",
        href: "https://github.com/DavidAkerlind/Exam-MovieDataBase",
        icon: "github",
    },
];

export function footerHTML() {
    return html`
        <footer class="footer">
            <div class="footer__grid glass">
                <!-- Contact Info Section -->
                <section class="footer__contact-info">
                    <h2 class="footer__title">Get in touch</h2>
                    <ul class="footer__contact-list">
                        <li class="footer__contact-item">MMDb Inc</li>
                        <li class="footer__contact-item">Lorem, ipsum.</li>
                        <li class="footer__contact-item">654 60 Karlstad</li>
                        <li class="footer__contact-item">Org.nr 123412-1232</li>
                        <li class="footer__contact-item">
                            Phone: <a href="tel:+1234567890" class="footer__contact-link">+1234567890</a>
                        </li>
                        <li class="footer__contact-item">
                            Email: <a href="mailto:contact@mmdb.com" class="footer__contact-link">contact@mmdb.com</a>
                        </li>
                    </ul>
                </section>

                <!-- Newsletter Section -->
                <section class="footer__newsletter">
                    <h2 class="footer__title">Stay updated</h2>
                    <p class="footer__newsletter-description">
                        Sign up to receive the latest movie news and updates.
                    </p>
                    <form id="newsletterForm" class="footer__newsletter-form" novalidate>
                        <label class="sr-only" for="email">Enter your email</label>
                        <input class="footer__newsletter-input" type="email" id="email" name="email" placeholder="your.email@example.com" autocomplete="email" required />
                        <button class="btn btn--primary" type="submit">Subscribe</button>
                        <p class="footer__form-message" data-newsletter-message role="status"></p>
                    </form>
                </section>

                <!-- Follow Section -->
                <section class="footer__follow">
                    <h2 class="footer__title">Follow us</h2>
                    <ul class="footer__social">
                        ${SOCIAL.map(
                            (item) => html`
                                <li>
                                    <a class="footer__social-link btn btn--icon btn--glass" href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
                                        ${icon(item.icon)}
                                    </a>
                                </li>
                            `
                        )}
                    </ul>
                </section>
            </div>

            <p class="footer__legal">
                © ${new Date().getFullYear()} MMDb. Movie data and images by
                <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>, ratings by
                <a href="https://www.omdbapi.com" target="_blank" rel="noopener noreferrer">OMDb</a>.
                This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
        </footer>
    `;
}
