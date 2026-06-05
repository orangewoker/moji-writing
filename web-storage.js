(function () {
  if (window.mojiStorage) return;

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      headers: { "content-type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const payload = await response.json().catch(() => ({}));
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
