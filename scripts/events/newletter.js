export function initEmailForm() {
    document
        .querySelector("#newsletterForm")
        .addEventListener("submit", (event) => {
            event.preventDefault();
        });
}
