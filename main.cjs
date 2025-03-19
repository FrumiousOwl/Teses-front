const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const indexPath = path.join(__dirname, "dist", "index.html");

  win.loadFile(indexPath).catch((err) => {
    console.error("Failed to load index.html:", err);
  });

  win.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    win.loadFile(indexPath);
  });
}

app.whenReady().then(createWindow);
