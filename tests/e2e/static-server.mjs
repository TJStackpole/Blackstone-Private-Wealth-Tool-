// Tiny static server for the exported site in ./out, used by the Playwright smoke test.
// Mirrors how Netlify serves it: /toolkit -> toolkit.html, unknown paths -> 404.html.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") || "/";
  const candidates = clean === "/" ? ["index.html"] : [clean, `${clean}.html`, path.join(clean, "index.html")];
  for (const c of candidates) {
    const file = path.join(root, c);
    if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isFile()) return { file, status: 200 };
  }
  return { file: path.join(root, "404.html"), status: 404 };
}

http
  .createServer((req, res) => {
    const { file, status } = resolve(req.url || "/");
    res.writeHead(status, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`serving ./out on http://localhost:${port}`));
