(function () {
  const TOKEN_KEY = "mojiWritingAuthToken";
  const USER_KEY = "mojiWritingAuthUser";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function saveToken(token, username) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username || "");
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function requestJson(url, options = {}) {
    const headers = { "content-type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.authorization = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `请求失败：${response.status}`);
    }
    return payload;
  }

  function buildGate(status) {
    const gate = document.createElement("div");
    gate.className = "auth-gate";
    gate.innerHTML = `
      <form class="auth-card" id="authForm">
        <div class="auth-brand">
          <span class="auth-mark">墨</span>
          <div>
            <h1>墨迹写作台</h1>
            <p>${status.configured ? "登录后继续写作" : "首次使用，请先设置本地账号"}</p>
          </div>
        </div>
        <label for="authUsername">账号</label>
        <input id="authUsername" name="username" autocomplete="username" required maxlength="40" />
        <label for="authPassword">密码</label>
        <input id="authPassword" name="password" type="password" autocomplete="${status.configured ? "current-password" : "new-password"}" required minlength="6" />
        <button class="primary" id="authSubmitBtn" type="submit">${status.configured ? "登录" : "设置并进入"}</button>
        <p class="auth-error" id="authError" role="alert"></p>
      </form>
    `;
    document.body.appendChild(gate);
    const form = gate.querySelector("#authForm");
    const usernameInput = gate.querySelector("#authUsername");
    const passwordInput = gate.querySelector("#authPassword");
    const errorBox = gate.querySelector("#authError");
    usernameInput.value = localStorage.getItem(USER_KEY) || status.username || "admin";
    setTimeout(() => (status.configured ? passwordInput : usernameInput).focus(), 0);

    return new Promise((resolve) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorBox.textContent = "";
        const submit = gate.querySelector("#authSubmitBtn");
        submit.disabled = true;
        submit.textContent = status.configured ? "登录中..." : "设置中...";
        try {
          const endpoint = status.configured ? "/api/auth/login" : "/api/auth/setup";
          const result = await requestJson(endpoint, {
            method: "POST",
            body: JSON.stringify({
              username: usernameInput.value.trim(),
              password: passwordInput.value,
            }),
          });
          saveToken(result.token, result.username || usernameInput.value.trim());
          gate.remove();
          showAuthBadge(result.username || usernameInput.value.trim());
          resolve(true);
        } catch (error) {
          errorBox.textContent = error.message || String(error);
          submit.disabled = false;
          submit.textContent = status.configured ? "登录" : "设置并进入";
        }
      });
    });
  }

  function showAuthBadge(username) {
    const old = document.querySelector(".auth-badge");
    if (old) old.remove();
    const badge = document.createElement("button");
    badge.className = "auth-badge";
    badge.type = "button";
    badge.title = "退出登录";
    badge.textContent = username ? `已登录：${username}` : "已登录";
    badge.addEventListener("click", async () => {
      try {
        await requestJson("/api/auth/logout", { method: "POST", body: "{}" });
      } catch (_) {
        // Local logout is enough to make this browser ask for login again.
      }
      clearToken();
      location.reload();
    });
    document.body.appendChild(badge);
  }

  async function ensureAuthenticated() {
    if (location.protocol === "file:") {
      return true;
    }
    const status = await requestJson("/api/auth/status").catch(() => ({
      configured: false,
      authenticated: false,
      username: "",
    }));
    if (status.authenticated) {
      showAuthBadge(status.username || localStorage.getItem(USER_KEY) || "");
      return true;
    }
    clearToken();
    return buildGate(status);
  }

  window.mojiAuth = {
    ensureAuthenticated,
    getToken,
    clearToken,
  };
})();
