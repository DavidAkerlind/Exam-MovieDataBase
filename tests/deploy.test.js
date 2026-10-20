// The Cloudflare deployment publishes the repository root through an allow-list
// (.assetsignore). These tests make sure the list covers everything the site needs
// and never exposes the Worker source, tests, package files or secrets.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

const PAGES = ["index.html", "movie.html", "person.html", "search.html", "favorites.html"];

const rules = read(".assetsignore")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

const published = new Set(
    rules.filter((rule) => rule.startsWith("!/")).map((rule) => rule.slice(2).replace(/\/$/, ""))
);

test(".assetsignore is an allow-list: everything is private unless re-included", () => {
    assert.equal(rules[0], "/*");
    assert.ok(rules.slice(1).every((rule) => rule.startsWith("!/")), "only re-includes after /*");
});

test("every page, the service worker and the manifest are published", () => {
    for (const file of [...PAGES, "sw.js", "manifest.webmanifest", "scripts", "styles", "res"]) {
        assert.ok(published.has(file), `${file} must be published`);
        assert.ok(existsSync(path.join(root, file)), `${file} must exist`);
    }
});

test("private files and folders are never published", () => {
    const PRIVATE = [
        "worker",
        "tests",
        "node_modules",
        ".git",
        ".github",
        ".vscode",
        ".dev.vars",
        ".assetsignore",
        "package.json",
        "package-lock.json",
        "wrangler.toml",
        "README.md",
        "DEPLOY.md",
    ];
    for (const name of PRIVATE) assert.ok(!published.has(name), `${name} must stay private`);
});

test("everything the pages and the manifest point at is published", () => {
    const topLevel = (ref) => ref.split(/[?#]/)[0].replace(/^\.\//, "").split("/")[0];

    for (const page of PAGES) {
        const refs = [...read(page).matchAll(/\b(?:href|src)="(\.\/[^"]+)"/g)].map((match) => match[1]);
        assert.ok(refs.length > 0, `${page} should reference its assets`);
        for (const ref of refs) {
            assert.ok(published.has(topLevel(ref)), `${page} references ${ref}, which is not published`);
        }
    }

    const manifest = JSON.parse(read("manifest.webmanifest"));
    for (const icon of manifest.icons) {
        assert.ok(published.has(topLevel(icon.src)), `manifest icon ${icon.src} is not published`);
    }
});

test("the single Worker serves the site and answers /api/*", () => {
    const config = read("wrangler.toml");
    assert.match(config, /^name = "mmdb"$/m);
    assert.match(config, /^main = "worker\/src\/index\.js"$/m);
    assert.ok(existsSync(path.join(root, "worker/src/index.js")));
    assert.match(config, /^directory = "\.\/"$/m);
    assert.match(config, /^run_worker_first = \["\/api\/\*"\]$/m);
    // No secret may ever be written into the config file.
    assert.doesNotMatch(config, /(TMDB|OMDB)_API_KEY\s*=/);
});

test("the site calls the API on its own address by default", () => {
    assert.match(read("scripts/config.js"), /export const API_BASE_URL = "";/);
});
