import { IMAGE_BASE_URL } from "../config.js";

export const MISSING_POSTER = "./res/icons/missing-poster.svg";
export const MISSING_PROFILE = "./res/icons/missing-profile.svg";

export function tmdbImage(path, size = "w500") {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

/** srcset for posters (2:3). Returns { src, srcset }. */
export function posterImage(path, { size = "w342" } = {}) {
    if (!path) return { src: MISSING_POSTER, srcset: "" };
    return {
        src: tmdbImage(path, size),
        srcset: [
            `${tmdbImage(path, "w185")} 185w`,
            `${tmdbImage(path, "w342")} 342w`,
            `${tmdbImage(path, "w500")} 500w`,
            `${tmdbImage(path, "w780")} 780w`,
        ].join(", "),
    };
}

export function profileImage(path, size = "w185") {
    return path ? tmdbImage(path, size) : MISSING_PROFILE;
}

export function backdropImage(path, size = "w780") {
    return path ? tmdbImage(path, size) : null;
}
