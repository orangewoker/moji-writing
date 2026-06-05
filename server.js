const fs = require("fs/promises");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const rootDir = __dirname;
const dataDir = process.env.MOJI_DATA_DIR || "/data";
const port = Number(process.env.PORT || 8080);
const workspaceFile = path.join(dataDir, "moji-workspace.json");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, payload) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf-8");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

async function serveApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/storage/data-dir") {
    sendJson(response, 200, { dataDir });
    return true;
  }
  if (request.method === "GET" && pathname === "/api/storage/workspace") {
    sendJson(response, 200, { dataDir, state: await readJson(workspaceFile, null) });
    return true;
  }
  if (request.method === "POST" && pathname === "/api/storage/workspace") {
    const state = JSON.parse(await readBody(request));
    await writeJson(workspaceFile, state);
    sendJson(response, 200, { ok: true, dataDir, file: workspaceFile });
    return true;
  }
  return false;
}

async function serveStatic(request, response, pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.resolve(rootDir, `.${cleanPath}`);
  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const content = await fs.readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (await serveApi(request, response, pathname)) return;
    await serveStatic(request, response, pathname);
  } catch (error) {
    sendJson(response, 500, { ok: false, error: error.message || String(error) });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Moji Writing Workbench listening on http://0.0.0.0:${port}`);
  console.log(`Workspace data file: ${workspaceFile}`);
});
