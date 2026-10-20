import { test } from "node:test";
import assert from "node:assert/strict";

import { html, raw, escapeHTML } from "../scripts/utils/html.js";
import { formatRuntime, ageFrom, compactNumber } from "../scripts/utils/format.js";
import { buildScores, parseAwards, statsHTML } from "../scripts/components/stats.js";

// ---------------------------------------------------------------- html``

test("html`` escapes interpolated values but not trusted markup", () => {
    const evil = `<img src=x onerror="alert('x')">`;
    const out = html`<p title="${evil}">${evil}</p>`.toString();
    assert.ok(!out.includes("<img"));
    assert.match(out, /&lt;img src=x onerror=&quot;alert\(&#39;x&#39;\)&quot;&gt;/);

    assert.equal(html`<b>${html`<i>${"a&b"}</i>`}</b>`.toString(), "<b><i>a&amp;b</i></b>");
    assert.equal(html`${raw("<hr>")}`.toString(), "<hr>");
    assert.equal(html`${[1, 2, 3]}${null}${false}${undefined}`.toString(), "123");
    assert.equal(escapeHTML(null), "");
});

// ---------------------------------------------------------------- formatting

test("formatRuntime", () => {
    assert.equal(formatRuntime(142), "2h 22m");
    assert.equal(formatRuntime(120), "2h");
    assert.equal(formatRuntime(45), "45m");
    assert.equal(formatRuntime(null), "");
});

test("ageFrom handles birthdays that have not happened yet", () => {
    assert.equal(ageFrom("1937-06-01", "2020-05-31"), 82);
    assert.equal(ageFrom("1937-06-01", "2020-06-01"), 83);
    assert.equal(ageFrom(null, null), null);
});

test("compactNumber", () => {
    assert.equal(compactNumber(2900000), "2.9M");
    assert.equal(compactNumber(27000), "27K");
    assert.equal(compactNumber(null), "");
});

// --------------------------------------------------------------------- awards

test("parseAwards reads wins, nominations and Oscars", () => {
    assert.deepEqual(parseAwards("Nominated for 7 Oscars. 21 wins & 43 nominations total"), {
        wins: 21,
        nominations: 43,
        oscar: { kind: "Nominated for", count: 7 },
    });
    assert.deepEqual(parseAwards("Won 3 Oscars. 100 wins & 50 nominations total"), {
        wins: 100,
        nominations: 50,
        oscar: { kind: "Won", count: 3 },
    });
    assert.deepEqual(parseAwards("1 win & 2 nominations"), { wins: 1, nominations: 2, oscar: null });
    assert.equal(parseAwards("Won 1 Oscar.").oscar.count, 1);
});

test("parseAwards returns null when there is nothing to chart", () => {
    assert.equal(parseAwards(null), null);
    assert.equal(parseAwards(""), null);
    assert.equal(parseAwards("Some festival mention"), null);
});

// --------------------------------------------------------------------- scores

const movie = (ratings, extra = {}) => ({
    votes: 27000,
    runtime: 142,
    awards: null,
    ratings: { tmdb: null, imdb: null, imdbVotes: null, rottenTomatoes: null, metascore: null, ...ratings },
    ...extra,
});

test("buildScores normalises every source to 0..1", () => {
    const scores = buildScores(
        movie({ imdb: 9.1, imdbVotes: 2900000, rottenTomatoes: 91, metascore: 82, tmdb: 8.7 })
    );
    assert.deepEqual(
        scores.map((score) => [score.key, Number(score.pct.toFixed(2))]),
        [["imdb", 0.91], ["rt", 0.91], ["meta", 0.82], ["tmdb", 0.87]]
    );
    assert.equal(scores[0].sub, "2.9M votes");
});

test("buildScores skips missing sources and colours rotten scores red", () => {
    const scores = buildScores(movie({ tmdb: 7.2, rottenTomatoes: 40 }));
    assert.deepEqual(scores.map((score) => score.key), ["rt", "tmdb"]);
    assert.equal(scores[0].sub, "Rotten");
    assert.notEqual(scores[0].tone, buildScores(movie({ rottenTomatoes: 90 }))[0].tone);
});

test("buildScores caps values at 100%", () => {
    assert.equal(buildScores(movie({ imdb: 12 }))[0].pct, 1);
});

test("statsHTML renders an accessible summary and the overall average", () => {
    const out = statsHTML(
        movie({ imdb: 9.0, rottenTomatoes: 90, metascore: 80, tmdb: 8.0 }, { awards: "Won 2 Oscars. 10 wins & 5 nominations" })
    ).toString();
    assert.match(out, /role="img"/);
    assert.match(out, /Overall score 85 out of 100/);
    assert.match(out, /data-count-to="85"/);
    assert.match(out, /donut__slice--wins/);
    assert.match(out, /gauge__value/);
});

test("statsHTML renders nothing when there is nothing to show", () => {
    assert.equal(statsHTML(movie({}, { runtime: null })).toString(), "");
});
