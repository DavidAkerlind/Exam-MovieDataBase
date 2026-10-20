export function formatRuntime(minutes) {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest}m`;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

export function formatDate(iso) {
    if (!iso) return "";
    const date = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

/** Age at death, or current age for living people. */
export function ageFrom(birthday, deathday) {
    if (!birthday) return null;
    const born = new Date(`${birthday}T00:00:00Z`);
    const end = deathday ? new Date(`${deathday}T00:00:00Z`) : new Date();
    if (Number.isNaN(born.getTime()) || Number.isNaN(end.getTime())) return null;

    let age = end.getUTCFullYear() - born.getUTCFullYear();
    const hadBirthday =
        end.getUTCMonth() > born.getUTCMonth() ||
        (end.getUTCMonth() === born.getUTCMonth() &&
            end.getUTCDate() >= born.getUTCDate());
    if (!hadBirthday) age -= 1;
    return age;
}

export function compactNumber(value) {
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

export function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function debounce(fn, delay = 250) {
    let timer;
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

export const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
