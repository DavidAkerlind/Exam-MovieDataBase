// A tiny tagged template that escapes every interpolated value by default.
// Use raw() / nested html`` results to embed trusted markup.

class SafeHTML {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
}

const ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export const raw = (value) => new SafeHTML(String(value ?? ""));

function render(value) {
    if (value === null || value === undefined || value === false) return "";
    if (value instanceof SafeHTML) return value.value;
    if (Array.isArray(value)) return value.map(render).join("");
    return escapeHTML(value);
}

export function html(strings, ...values) {
    let output = strings[0];
    values.forEach((value, index) => {
        output += render(value) + strings[index + 1];
    });
    return new SafeHTML(output);
}

/** Replaces the children of `element` with the given html`` result. */
export function mount(element, template) {
    element.innerHTML = template.toString();
    return element;
}
