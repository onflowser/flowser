import { app, Menu } from "electron";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import { ServiceRegistry } from "./services/service-registry";

const { appUpdateService } = ServiceRegistry.getInstance();

const template: MenuItemConstructorOptions[] = [];
if (process.platform === "darwin") {
  const name = app.getName();
  template.unshift({
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
  });
}

export function setupMenu(): void {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
