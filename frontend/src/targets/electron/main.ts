import * as path from "path";
import { app, BrowserWindow, shell, dialog, ipcMain } from "electron";
import fixPath from "fix-path";
import { SentryMainService } from "../../../../apps/electron/src/services/sentry-main.service";
import { FlowserBackend } from "./backend";
import { ProjectEntity } from "@flowser/backend";

fixPath();

const minWidth = 1100;
const minHeight = 800;

let win: BrowserWindow;

const { appUpdateService } = ServiceRegistry.getInstance();
const sentryService = new SentryMainService();
sentryService.init();

ipcMain.handle("showDirectoryPicker", showDirectoryPicker);

async function createWindow() {
  win = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Open urls in the user's browser
  win.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url);
    return { action: "deny" };
  });

  win.webContents.on("did-fail-load", () => {
    win.loadURL(getClientAppUrl());
  });

  win.loadURL(getClientAppUrl());

  await startBackend();

  const temporaryProject = await maybeStartTemporaryProject();

  if (temporaryProject !== undefined) {
    // Our react-router instance is configured to use hash-based navigation:
    // https://reactrouter.com/en/main/routers/create-hash-router.
    win.loadURL(`${getClientAppUrl()}#/projects/${temporaryProject.id}`);
  }
}

app.on("ready", () => {
  // setupMenu(win);
  createWindow();
  appUpdateService.checkForUpdatesAndNotify({
    silent: true,
    targetWindow: win,
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is core for applications and their menu bar
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

app.on("before-quit", async function (e) {
  const backend = FlowserBackend.getInstance();
  if (!backend.app) {
    console.error("backend.app is not defined");
    return;
  }
  if (backend.isCleanupComplete()) {
    return;
  }
  console.log("Doing cleanup before exit");
  // Prevent app termination before cleanup is done
  e.preventDefault();
  try {
    // On macOS the user could first close the app by clicking on "X"
    // (which would destroy the window) and later quit the app from app bar.
    // If we trigger any method on destroyed window, electron throws an error.
    if (!win.isDestroyed()) {
      // Notify renderer process
      win.webContents.send("exit");
    }

    await backend.cleanupAndStop();
  } catch (e) {
    dialog.showMessageBox({
      message: `Couldn't shutdown successfully: ${String(e)}`,
      type: "error",
    });
  } finally {
    console.log("Cleanup complete");
    app.quit();
  }
});

async function startBackend() {
  const backend = FlowserBackend.getInstance();

  try {
    const userDataPath = app.getPath("userData");
    await backend.start({
      userDataPath,
    });
  } catch (error) {
    await handleBackendError({
      error,
      window: win,
      onRestart: startBackend,
      onQuit: app.quit,
    });
  }
}

async function maybeStartTemporaryProject(): Promise<
  ProjectEntity | undefined
> {
  const backend = FlowserBackend.getInstance();

  try {
    const { hasSwitch, getSwitchValue } = app.commandLine;

    const temporaryProjectPathFlag = "project-path";

    const shouldStartTemporaryProject = hasSwitch(temporaryProjectPathFlag);

    if (shouldStartTemporaryProject) {
      return backend.startTemporaryProject({
        filesystemPath: getSwitchValue(temporaryProjectPathFlag),
      });
    }
  } catch (e: unknown) {
    const result = await dialog.showMessageBox(win, {
      message: `Failed to start project`,
      detail: isErrorWithMessage(e) ? e.message : undefined,
      type: "error",
      buttons: ["Quit"],
    });
    const quitClicked = result.response == 0;
    if (quitClicked) {
      app.exit(1);
    }
  }

  return undefined;
}

async function showDirectoryPicker() {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled) {
    return undefined;
  }
  return result.filePaths[0];
}

async function handleBackendError({
  error,
  window,
  onRestart,
  onQuit,
}: {
  error: unknown;
  window: BrowserWindow;
  onRestart: () => void;
  onQuit: () => void;
}) {
  console.error("Error when starting backend:", error);
  if (isErrorWithCode(error)) {
    const isAddressInUse = error.code === "EADDRINUSE";
    if (isAddressInUse) {
      const result = await dialog.showMessageBox(window, {
        message: `Failed to start Flowser server on port 6061. Please make sure no other processes are running on that port and click restart.`,
        buttons: ["Restart", "Quit"],
        type: "error",
      });
      const restartClicked = 0;
      const quitClicked = 1;
      switch (result.response) {
        case restartClicked:
          return onRestart();
        case quitClicked:
          return onQuit();
      }
    } else {
      dialog.showMessageBox(window, {
        message: `Error occurred when starting Flowser app: ${String(error)}`,
        type: "error",
      });
    }
  } else {
    dialog.showMessageBox(window, {
      message: `Unknown error occurred. Try to restart Flowser app.`,
      type: "error",
    });
  }
}

function getClientAppUrl() {
  const isDev = !app.isPackaged;
  // This path is currently set to "react", because that's the folder used in the app package
  // Refer to the app/README for more info on the current build process.
  return isDev
    ? "http://localhost:6060"
    : `file://${path.join(__dirname, "../../../react/index.html")}`;
}

type ErrorWithCode = { code: string };

function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return typeof error === "object" && error !== null && "code" in error;
}

type ErrorWithMessage = { message: string };

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === "object" && error !== null && "message" in error;
}
