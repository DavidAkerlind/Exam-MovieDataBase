// Recent searches (kept in localStorage, newest first).
const KEY = "mmdb:recent";
const MAX = 6;

const clean = (text) => text.trim().replace(/\s+/g, " ");

export function getRecent() {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch {
        return [];
    }
}

function save(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    } catch {
        /* private mode / storage full: recents are a nicety */
    }
}

export function addRecent(query) {
    const text = clean(query || "");
    if (text.length < 2) return;
    const lower = text.toLowerCase();
    save([text, ...getRecent().filter((item) => item.toLowerCase() !== lower)]);
}

export function removeRecent(query) {
    const lower = clean(query).toLowerCase();
    save(getRecent().filter((item) => item.toLowerCase() !== lower));
}
