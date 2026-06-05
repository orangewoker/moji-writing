import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("MOJI_DATA_DIR", "/data"))
PORT = int(os.environ.get("PORT", "8080"))
WORKSPACE_FILE = DATA_DIR / "moji-workspace.json"
AUTH_FILE = DATA_DIR / "moji-auth.json"
PASSWORD_ITERATIONS = 200_000


def read_workspace():
    try:
        return json.loads(WORKSPACE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return None


def write_workspace(payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    WORKSPACE_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def read_auth():
    try:
        return json.loads(AUTH_FILE.read_text(encoding="utf-8"))
    except Exception:
        return None


def write_auth(payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_file = AUTH_FILE.with_suffix(".json.tmp")
    temp_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_file.replace(AUTH_FILE)


def hash_password(password, salt_hex):
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        PASSWORD_ITERATIONS,
    )
    return digest.hex()


def hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(auth_data):
    token = secrets.token_urlsafe(36)
    auth_data.setdefault("sessions", {})[hash_token(token)] = {"createdAt": int(time.time())}
    write_auth(auth_data)
    return token


def get_bearer_token(headers):
    value = headers.get("authorization", "")
    if not value.lower().startswith("bearer "):
        return ""
    return value[7:].strip()


def is_authenticated(headers):
    auth_data = read_auth()
    token = get_bearer_token(headers)
    if not auth_data or not token:
        return False
    return hash_token(token) in auth_data.get("sessions", {})


def public_auth_status(headers):
    auth_data = read_auth()
    return {
        "configured": bool(auth_data),
        "authenticated": is_authenticated(headers),
        "username": auth_data.get("username", "") if auth_data else "",
    }


class MojiHandler(SimpleHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        length = int(self.headers.get("content-length", "0"))
        return json.loads(self.rfile.read(length).decode("utf-8") or "{}")

    def require_auth(self):
        if is_authenticated(self.headers):
            return True
        self.send_json(401, {"ok": False, "authRequired": True, "error": "请先登录"})
        return False

    def do_GET(self):
        pathname = urlparse(self.path).path
        if pathname == "/api/auth/status":
            self.send_json(200, public_auth_status(self.headers))
            return
        if pathname == "/api/storage/data-dir":
            if not self.require_auth():
                return
            self.send_json(200, {"dataDir": str(DATA_DIR)})
            return
        if pathname == "/api/storage/workspace":
            if not self.require_auth():
                return
            self.send_json(200, {"dataDir": str(DATA_DIR), "state": read_workspace()})
            return
        self.serve_static(pathname)

    def do_POST(self):
        pathname = urlparse(self.path).path
        if pathname == "/api/auth/setup":
            self.handle_setup()
            return
        if pathname == "/api/auth/login":
            self.handle_login()
            return
        if pathname == "/api/auth/logout":
            self.handle_logout()
            return
        if pathname == "/api/storage/workspace":
            if not self.require_auth():
                return
            try:
                payload = self.read_json_body()
                write_workspace(payload)
                self.send_json(200, {"ok": True, "dataDir": str(DATA_DIR), "file": str(WORKSPACE_FILE)})
            except Exception as error:
                self.send_json(500, {"ok": False, "error": str(error)})
            return
        self.send_json(404, {"ok": False, "error": "Not found"})

    def handle_setup(self):
        if read_auth():
            self.send_json(409, {"ok": False, "error": "账号已经设置，请直接登录"})
            return
        try:
            payload = self.read_json_body()
            username = str(payload.get("username", "")).strip() or "admin"
            password = str(payload.get("password", ""))
            if len(username) > 40:
                self.send_json(400, {"ok": False, "error": "账号名称太长"})
                return
            if len(password) < 6:
                self.send_json(400, {"ok": False, "error": "密码至少 6 位"})
                return
            salt = secrets.token_hex(16)
            auth_data = {
                "username": username,
                "passwordSalt": salt,
                "passwordHash": hash_password(password, salt),
                "sessions": {},
                "createdAt": int(time.time()),
            }
            token = create_session(auth_data)
            self.send_json(200, {"ok": True, "token": token, "username": username})
        except Exception as error:
            self.send_json(500, {"ok": False, "error": str(error)})

    def handle_login(self):
        auth_data = read_auth()
        if not auth_data:
            self.send_json(400, {"ok": False, "setupRequired": True, "error": "请先设置账号"})
            return
        try:
            payload = self.read_json_body()
            username = str(payload.get("username", "")).strip()
            password = str(payload.get("password", ""))
            expected_hash = auth_data.get("passwordHash", "")
            salt = auth_data.get("passwordSalt", "")
            username_ok = hmac.compare_digest(username, auth_data.get("username", ""))
            password_ok = hmac.compare_digest(hash_password(password, salt), expected_hash)
            if not username_ok or not password_ok:
                self.send_json(401, {"ok": False, "error": "账号或密码不正确"})
                return
            token = create_session(auth_data)
            self.send_json(200, {"ok": True, "token": token, "username": auth_data.get("username", "")})
        except Exception as error:
            self.send_json(500, {"ok": False, "error": str(error)})

    def handle_logout(self):
        auth_data = read_auth()
        token = get_bearer_token(self.headers)
        if auth_data and token:
            auth_data.get("sessions", {}).pop(hash_token(token), None)
            write_auth(auth_data)
        self.send_json(200, {"ok": True})

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
    print(f"Auth data file: {AUTH_FILE}")
    server.serve_forever()
