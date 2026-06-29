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
  [".md", "text/markdown; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"]
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
  const contentType = types.get(ext) || "application/octet-stream";
  const stat = fs.statSync(file);
  const range = req.headers.range;

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;
      const safeEnd = Math.min(end, stat.size - 1);

      if (start <= safeEnd) {
        res.writeHead(206, {
          "content-type": contentType,
          "accept-ranges": "bytes",
          "content-range": `bytes ${start}-${safeEnd}/${stat.size}`,
          "content-length": safeEnd - start + 1
        });
        fs.createReadStream(file, { start, end: safeEnd }).pipe(res);
        return;
      }
    }
  }

  res.writeHead(200, {
    "content-type": contentType,
    "accept-ranges": "bytes",
    "content-length": stat.size
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  fs.createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AIgent Design System running at http://127.0.0.1:${port}/`);
});
