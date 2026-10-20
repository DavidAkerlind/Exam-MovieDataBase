// Runs the real Worker code in Node against the in-memory TMDb/OMDb mock, so the
// front end can be developed without API keys:  npm run dev:mock
import http from "node:http";
import { handleRequest } from "../src/index.js";
import { createUpstream } from "./upstream-mock.js";

const port = Number(process.env.PORT || 8787);
const latency = Number(process.env.LATENCY_MS || 0);

const upstream = createUpstream();
globalThis.fetch = async (...args) => {
    if (latency) await new Promise((resolve) => setTimeout(resolve, latency));
    return upstream.fetch(...args);
};

const env = {
    TMDB_API_KEY: "mock-tmdb-key",
    OMDB_API_KEY: "mock-omdb-key",
    ALLOWED_ORIGINS: "",
    ALLOW_LOCALHOST: "true",
};

http.createServer(async (req, res) => {
    const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers.origin ? { Origin: req.headers.origin } : {},
    });
    const response = await handleRequest(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => {
    console.log(`Mock API (real Worker code) on http://localhost:${port}`);
});
