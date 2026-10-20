// Inline SVG icons (24x24, stroke based) so the UI never depends on an icon font.
import { raw } from "./html.js";

const stroke = (body) =>
    `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

const solid = (body) =>
    `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`;

const HEART =
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';

export const icons = {
    search: stroke('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    heart: stroke(HEART),
    heartFilled: `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false">${HEART}</svg>`,
    plus: stroke('<path d="M5 12h14M12 5v14"/>'),
    check: stroke('<path d="M20 6 9 17l-5-5"/>'),
    x: stroke('<path d="M18 6 6 18M6 6l12 12"/>'),
    play: solid('<path d="M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11.5-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7Z"/>'),
    star: solid('<path d="m12 2.8 2.78 5.86 6.42.84-4.7 4.46 1.18 6.38L12 17.2l-5.68 3.14 1.18-6.38-4.7-4.46 6.42-.84z"/>'),
    arrowRight: stroke('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chevronLeft: stroke('<path d="m15 18-6-6 6-6"/>'),
    chevronRight: stroke('<path d="m9 18 6-6-6-6"/>'),
    clock: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    calendar: stroke('<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>'),
    user: stroke('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    film: stroke('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>'),
    external: stroke('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
    alert: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/>'),
    github: stroke('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'),
    instagram: stroke('<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>'),
    facebook: stroke('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'),
    xSocial: stroke('<path d="M4 4l16 16M20 4 4 20"/>'),
    sparkle: solid('<path d="M12 2.5c.5 4.6 2.4 7 7 7.5-4.6.5-6.5 2.9-7 7.5-.5-4.6-2.4-7-7-7.5 4.6-.5 6.5-2.9 7-7.5Z"/>'),
};

/** Returns a SafeHTML icon so it can be dropped straight into html`` templates. */
export const icon = (name) => raw(icons[name] ?? "");
