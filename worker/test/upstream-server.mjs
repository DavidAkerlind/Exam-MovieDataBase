// Serves the TMDb/OMDb mock over HTTP so `wrangler dev` (workerd) can be pointed at it:
//   node test/upstream-server.mjs
//   wrangler dev --var TMDB_API_KEY:x --var OMDB_API_KEY:y \
//     --var TMDB_BASE:http://127.0.0.1:8790/3 --var OMDB_BASE:http://127.0.0.1:8790/omdb
import http from "node:http";
import { createUpstream } from "./upstream-mock.js";

const upstream = createUpstream();
http.createServer(async (req, res) => {
    const response = await upstream.fetch(`http://${req.headers.host}${req.url}`);
    res.writeHead(response.status, { "Content-Type": "application/json" });
    res.end(await response.text());
}).listen(Number(process.env.PORT || 8790), () => console.log("mock upstream on :8790"));
