const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const fs = require("fs/promises");
const path = require("path");

const settingsFile = () => path.join(app.getPath("userData"), "settings.json");
const workspaceFile = (dataDir) => path.join(dataDir, "moji-workspace.json");

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

async function getSettings() {
  return (await readJson(settingsFile(), {})) || {};
}

async function saveSettings(settings) {
  await writeJson(settingsFile(), settings);
}

async function getDataDir() {
  const settings = await getSettings();
  return settings.dataDir || "";
}

function registerStorageIpc() {
  ipcMain.handle("storage:get-data-dir", getDataDir);

  ipcMain.handle("storage:choose-data-dir", async () => {
    const result = await dialog.showOpenDialog({
      title: "选择墨迹写作台工作数据目录",
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true, dataDir: await getDataDir() };
    const settings = await getSettings();
    settings.dataDir = result.filePaths[0];
    await saveSettings(settings);
    return { canceled: false, dataDir: settings.dataDir };
  });

  ipcMain.handle("storage:read-workspace", async () => {
    const dataDir = await getDataDir();
    if (!dataDir) return { dataDir: "", state: null };
    return { dataDir, state: await readJson(workspaceFile(dataDir), null) };
  });

  ipcMain.handle("storage:save-workspace", async (_event, state) => {
    const dataDir = await getDataDir();
    if (!dataDir) return { ok: false, dataDir: "", error: "未设置工作数据目录" };
    await writeJson(workspaceFile(dataDir), state);
    return { ok: true, dataDir, file: workspaceFile(dataDir) };
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    title: "墨迹写作台",
    icon: path.join(__dirname, "assets", "app-icon.ico"),
    backgroundColor: "#f7f7f4",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerStorageIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
