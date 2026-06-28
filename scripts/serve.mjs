import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4177);

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"]
]);

function resolvePath(url) {
  const clean = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const requested = path.normalize(path.join(root, clean));
  if (!requested.startsWith(root)) return null;
  if (fs.existsSync(requested) && fs.statSync(requested).isDirectory()) {
    return path.join(requested, "index.html");
  }
  return requested;
}

const server = http.createServer((req, res) => {
  const file = resolvePath(req.url || "/");
  if (!file || !fs.existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(file);
  res.writeHead(200, { "content-type": types.get(ext) || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AIgent Design System running at http://127.0.0.1:${port}/`);
});
