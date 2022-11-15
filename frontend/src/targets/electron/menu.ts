import { app, Menu, shell } from "electron";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import { ServiceRegistry } from "./services/service-registry";

const { appUpdateService } = ServiceRegistry.getInstance();

const name = app.getName();

const template: MenuItemConstructorOptions[] = [
  {
    label: name,
    submenu: [
      {
        label: "About " + name,
        role: "about",
      },
      {
        label: "Check for updates",
        async click(menuItem) {
          menuItem.enabled = false;
          try {
            await appUpdateService.checkForUpdatesAndNotify({ silent: false });
          } finally {
            menuItem.enabled = true;
          }
        },
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Cut",
        accelerator: "Command+X",
        role: "cut",
      },
      {
        label: "Copy",
        accelerator: "Command+C",
        role: "copy",
      },
      {
        label: "Paste",
        accelerator: "Command+V",
        role: "paste",
      },
      {
        label: "Select All",
        accelerator: "Command+A",
        role: "selectAll",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://github.com/onflowser/flowser");
        },
      },
    ],
  },
];

export function setupMenu(): void {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
