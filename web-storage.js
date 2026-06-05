(function () {
  if (window.mojiStorage) return;

  async function requestJson(url, options = {}) {
    const token = window.mojiAuth?.getToken?.() || localStorage.getItem("mojiWritingAuthToken") || "";
    const headers = { "content-type": "application/json", ...(options.headers || {}) };
    if (token) headers.authorization = `Bearer ${token}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 && payload.authRequired) {
      window.mojiAuth?.clearToken?.();
      location.reload();
      throw new Error("请先登录");
    }
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `请求失败：${response.status}`);
    }
    return payload;
  }

  async function getDataDir() {
    const result = await requestJson("/api/storage/data-dir");
    return result.dataDir || "/data";
  }

  window.mojiStorage = {
    getDataDir,
    chooseDataDir: async () => ({ canceled: false, dataDir: await getDataDir() }),
    readWorkspace: () => requestJson("/api/storage/workspace"),
    saveWorkspace: (state) => requestJson("/api/storage/workspace", {
      method: "POST",
      body: JSON.stringify(state),
    }),
  };
})();
