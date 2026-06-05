import json
import mimetypes
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("MOJI_DATA_DIR", "/data"))
PORT = int(os.environ.get("PORT", "8080"))
WORKSPACE_FILE = DATA_DIR / "moji-workspace.json"


def read_workspace():
    try:
      return json.loads(WORKSPACE_FILE.read_text(encoding="utf-8"))
    except Exception:
      return None


def write_workspace(payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    WORKSPACE_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


class MojiHandler(SimpleHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        pathname = urlparse(self.path).path
        if pathname == "/api/storage/data-dir":
            self.send_json(200, {"dataDir": str(DATA_DIR)})
            return
        if pathname == "/api/storage/workspace":
            self.send_json(200, {"dataDir": str(DATA_DIR), "state": read_workspace()})
            return
        self.serve_static(pathname)

    def do_POST(self):
        pathname = urlparse(self.path).path
        if pathname != "/api/storage/workspace":
            self.send_json(404, {"ok": False, "error": "Not found"})
            return
        try:
            length = int(self.headers.get("content-length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            write_workspace(payload)
            self.send_json(200, {"ok": True, "dataDir": str(DATA_DIR), "file": str(WORKSPACE_FILE)})
        except Exception as error:
            self.send_json(500, {"ok": False, "error": str(error)})

    def serve_static(self, pathname):
        clean_path = "/index.html" if pathname == "/" else unquote(pathname)
        target = (ROOT_DIR / clean_path.lstrip("/")).resolve()
        if not str(target).startswith(str(ROOT_DIR)):
            self.send_error(403)
            return
        if not target.is_file():
            self.send_error(404)
            return
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or target.suffix in {".js", ".json", ".md"}:
            content_type += "; charset=utf-8"
        body = target.read_bytes()
        self.send_response(200)
        self.send_header("content-type", content_type)
        self.send_header("cache-control", "no-cache")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), MojiHandler)
    print(f"Moji Writing Workbench listening on http://0.0.0.0:{PORT}")
    print(f"Workspace data file: {WORKSPACE_FILE}")
    server.serve_forever()
