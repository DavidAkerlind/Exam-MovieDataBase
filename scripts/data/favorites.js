// Favorites live in localStorage as an array of movie ids (newest last).
// Ids are TMDb numbers; older versions of the app stored IMDb ids ("tt...").
const STORAGE_KEY = "favorites";
export const FAVORITES_EVENT = "favorites:change";

const normalize = (id) => (/^\d+$/.test(String(id)) ? Number(id) : String(id));

function read() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(parsed) ? parsed.map(normalize) : [];
    } catch {
        return [];
    }
}

function write(ids, detail) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        /* storage full or blocked: the in-memory event below still updates the UI */
    }
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { ids, ...detail } }));
}

export const getFavoriteIds = () => read();
export const countFavorites = () => read().length;

export function isFavorite(...candidates) {
    const ids = read();
    return candidates.some((id) => id != null && ids.includes(normalize(id)));
}

export function addFavorite(id) {
    const ids = read();
    const value = normalize(id);
    if (!ids.includes(value)) write([...ids, value], { id: value, active: true });
}

export function removeFavorite(...candidates) {
    const targets = candidates.filter((id) => id != null).map(normalize);
    const ids = read();
    const next = ids.filter((id) => !targets.includes(id));
    if (next.length !== ids.length) {
        write(next, { id: targets[0], active: false });
    }
}

/** Toggles and returns the new state (true = now a favorite). */
export function toggleFavorite(id, ...aliases) {
    if (isFavorite(id, ...aliases)) {
        removeFavorite(id, ...aliases);
        return false;
    }
    addFavorite(id);
    return true;
}

/** Swaps legacy IMDb ids for TMDb ids once the API has resolved them. */
export function migrateFavorites(mapping) {
    const ids = read();
    const next = [];
    for (const id of ids) {
        const mapped = mapping.get(String(id)) ?? id;
        if (!next.includes(mapped)) next.push(mapped);
    }
    if (JSON.stringify(next) !== JSON.stringify(ids)) write(next, { migrated: true });
}

export const legacyFavoriteIds = () => read().filter((id) => typeof id === "string");

/** Fires for changes in this tab and in other tabs. */
export function onFavoritesChange(callback) {
    const local = (event) => callback(event.detail);
    const remote = (event) => {
        if (event.key === STORAGE_KEY || event.key === null) {
            callback({ ids: read(), remote: true });
        }
    };
    window.addEventListener(FAVORITES_EVENT, local);
    window.addEventListener("storage", remote);
    return () => {
        window.removeEventListener(FAVORITES_EVENT, local);
        window.removeEventListener("storage", remote);
    };
}
