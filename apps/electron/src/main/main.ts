/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { IFlowserLogger } from '@onflowser/core';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { registerHandlers } from './ipc/handlers';
import { FlowserAppService } from '../services/flowser-app.service';
import { FlowserIpcEvent } from './ipc/events';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | undefined;
let appService: FlowserAppService | undefined;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  appService = new FlowserAppService(new ElectronLogger(), mainWindow);

  registerHandlers(appService);

  await appService.openTemporaryWorkspace();
};

class ElectronLogger implements IFlowserLogger {
  debug(message: any): void {
    console.debug(message);
    this.logToBrowserConsole(message, 'debug');
  }

  error(message: any, error?: unknown): void {
    console.error(message, error);
    this.logToBrowserConsole(message, 'error');
  }

  log(message: any): void {
    console.log(message);
    this.logToBrowserConsole(message, 'log');
  }

  verbose(message: any): void {
    console.debug(message);
    this.logToBrowserConsole(message, 'verbose');
  }

  warn(message: any): void {
    console.warn(message);
    this.logToBrowserConsole(message, 'warn');
  }

  private logToBrowserConsole(message: string, level: string) {
    mainWindow?.webContents?.send(FlowserIpcEvent.APP_LOG, message, level);
  }
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

app.on('before-quit', async (e) => {
  if (!appService) {
    throw new Error('App service instance not found');
  }

  // After we call app.quit(), before-quit is fired once more,
  // so we need to exit early if the cleanup already completed to avoid infinite recursion.
  if (appService.isCleanupComplete()) {
    return;
  }

  // Prevent app termination before cleanup is done
  e.preventDefault();
  try {
    // On macOS the user could first close the app by clicking on "X"
    // (which would destroy the window) and later quit the app from app bar.
    // If we trigger any method on destroyed window, electron throws an error.
    if (!mainWindow?.isDestroyed()) {
      // Notify renderer process
      mainWindow?.webContents.send(FlowserIpcEvent.APP_EXIT);
    }

    await appService.cleanup();
  } catch (error: unknown) {
    await dialog.showMessageBox({
      message: `Couldn't shutdown successfully: ${String(error)}`,
      type: 'error',
    });
  } finally {
    app.quit();
  }
});
