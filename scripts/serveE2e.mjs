import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PORT = 4173;
const HOST = "127.0.0.1";
const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, "../dist");
const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function resolveRequestPath(requestUrl) {
  const pathname = new URL(requestUrl ?? "/", `http://${HOST}:${PORT}`).pathname;
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(DIST_DIRECTORY, relativePath);
  return filePath.startsWith(`${DIST_DIRECTORY}${path.sep}`) ? filePath : undefined;
}

const server = http.createServer((request, response) => {
  const requestedFile = resolveRequestPath(request.url);
  const filePath =
    requestedFile !== undefined && fs.existsSync(requestedFile)
      ? requestedFile
      : path.join(DIST_DIRECTORY, "index.html");

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": CONTENT_TYPES.get(path.extname(filePath)) ?? "application/octet-stream",
  });
  fs.createReadStream(filePath).pipe(response);
});

function shutdown() {
  server.close(() => {
    process.exitCode = 0;
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(PORT, HOST, () => {
  console.log(`CanvasDoc E2E server listening on http://${HOST}:${PORT}`);
});
