import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import { AppUpdateService } from '../services/app-update.service';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

// TODO(restructure-followup): Add option to open a file/project from menu
export default class MenuBuilder {
  mainWindow: BrowserWindow;
  private appUpdateService: AppUpdateService;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.appUpdateService = new AppUpdateService();
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Flowser',
      submenu: [
        {
          label: 'About Flowser',
          selector: 'orderFrontStandardAboutPanel:',
        },
        this.checkForUpdatesMenuItem(),
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      ],
    };
    const subMenuView: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };

    return [
      subMenuAbout,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      this.learnMoreMenuItem(),
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      this.learnMoreMenuItem(),
      {
        label: 'Updates',
        submenu: [this.checkForUpdatesMenuItem()],
      },
    ];

    return templateDefault;
  }

  learnMoreMenuItem(): MenuItemConstructorOptions {
    return {
      label: 'Help',
      submenu: [
        {
          label: 'Github',
          click: () =>
            shell.openExternal('https://github.com/onflowser/flowser'),
        },
        {
          label: 'Website',
          click: () => shell.openExternal('https://flowser.dev'),
        },
        {
          label: 'Discord',
          click: () => shell.openExternal('https://discord.gg/JAnzkV2J'),
        },
      ],
    };
  }

  checkForUpdatesMenuItem(): MenuItemConstructorOptions {
    return {
      label: 'Check for updates',
      click: async (menuItem) => {
        menuItem.enabled = false;
        try {
          await this.appUpdateService.checkForUpdatesAndNotify({
            silent: false,
            targetWindow: this.mainWindow,
          });
        } finally {
          menuItem.enabled = true;
        }
      },
    };
  }
}
