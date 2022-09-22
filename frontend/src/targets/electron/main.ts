import * as path from "path";
import { app, BrowserWindow, shell, dialog } from "electron";
import { ProcessManagerService } from "@flowser/backend";
import fixPath from "fix-path";
import * as worker from "./worker";

fixPath();

const minWidth = 1100;
const minHeight = 800;

async function createWindow() {
  const win = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    autoHideMenuBar: true,
  });

  // Open urls in the user's browser
  win.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url);
    return { action: "deny" };
  });

  win.webContents.on("did-fail-load", () => {
    console.log("did-fail-load");
    win.loadURL(getClientAppUrl());
  });

  win.loadURL(getClientAppUrl());

  async function handleStart() {
    try {
      const userDataPath = app.getPath("userData");
      await worker.start({
        userDataPath,
      });
    } catch (error) {
      await handleBackendError({
        error,
        window: win,
        onRestart: handleStart,
        onQuit: app.quit,
      });
    }
  }

  await handleStart();
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is core for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's core to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", async function (e) {
  if (!worker.backend) {
    console.error("worker.backend is not defined");
    return;
  }
  // Make sure to stop all child processes, so that they don't become orphans
  const processManagerService = worker.backend.get(ProcessManagerService);
  const isCleanupComplete = processManagerService.isStoppedAll();
  if (isCleanupComplete) {
    return;
  }
  console.log("Doing cleanup before exit");
  // Prevent app termination before cleanup is done
  e.preventDefault();
  try {
    await processManagerService.stopAll();
    // In case flowser project is currently open,
    // the close() function will not resolve.
    // This is probably due to the incoming polling requests.
    // TODO(milestone-6): Stop polling on the client
    await worker.backend.close();
  } catch (e) {
    dialog.showMessageBox({
      message: `Couldn't shutdown successfully. Some flow processes may be still running in the background.`,
      type: "error",
    });
  } finally {
    console.log("Cleanup complete");
    app.quit();
  }
});

type ErrorWithCode = { code: string };

function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return typeof error === "object" && error !== null && "code" in error;
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
  // This path is currently set to "react", because that's the folder used in @flowser/app package
  // Refer to the app/README for more info on the current build process.
  return isDev
    ? "http://localhost:6060"
    : `file://${path.join(__dirname, "../react/index.html")}`;
}
