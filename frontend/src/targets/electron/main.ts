import * as path from "path";
import { app, BrowserWindow } from "electron";
import * as isDev from "electron-is-dev";
import { createApp } from "@flowser/backend";

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      // enableRemoteModule: true,
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:6060"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  try {
    const app = await createApp();
    app.enableCors();
    app.listen(6061);
  } catch (e) {
    console.error("Failed to start @flowser/backend", e);
  }
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
