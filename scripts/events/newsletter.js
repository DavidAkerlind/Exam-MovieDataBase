// The newsletter form is a front-end only demo: it validates the address and
// confirms, but nothing is sent or stored anywhere.
export function initNewsletter() {
    const form = document.querySelector("#newsletterForm");
    if (!form) return;

    const message = form.querySelector("[data-newsletter-message]");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.elements.email;

        if (!input.value.trim() || !input.validity.valid) {
            message.textContent = "Please enter a valid email address.";
            message.dataset.tone = "error";
            input.focus();
            return;
        }

        message.textContent = "Thanks for subscribing!";
        message.dataset.tone = "success";
        form.reset();
    });
}
