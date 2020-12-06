import { app, Tray, Menu, ipcMain, nativeImage, BrowserWindow } from 'electron';

import { getAppIcon, getCounterValue } from '../helpers/helpers';

export function createTrayIcon(
  nativefierOptions,
  mainWindow: BrowserWindow,
): Tray {
  const options = { ...nativefierOptions };

  if (options.tray) {
    const iconPath = getAppIcon();
    const nimage = nativeImage.createFromPath(iconPath);
    const appIcon = new Tray(nimage);

    const onClick = () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    };

    const contextMenu = Menu.buildFromTemplate([
      {
        label: options.name,
        click: onClick,
      },
      {
        label: 'Quit',
        click: app.exit.bind(this),
      },
    ]);

    appIcon.on('click', onClick);

    if (options.counter) {
      mainWindow.on('page-title-updated', (e, title) => {
        const counterValue = getCounterValue(title);
        if (counterValue) {
          appIcon.setToolTip(`(${counterValue})  ${options.name}`);

          let nimage = nativeImage.createFromPath(iconPath+"."+counterValue+".ico");

          if (Number(counterValue)  < 1000)
          {
            mainWindow.setIcon(iconPath+"."+counterValue+".ico");
            nimage = nativeImage.createFromPath(iconPath+"."+counterValue+".ico");
          }else
          {
            nimage = nativeImage.createFromPath(iconPath+"."+1000+".ico");
            mainWindow.setIcon(iconPath+"."+1000+".ico");
          }
          
          appIcon.setImage(nimage);
        } else {
          appIcon.setToolTip(options.name);
          const nimage = nativeImage.createFromPath(iconPath);
          appIcon.setImage(nimage);
          mainWindow.setIcon(iconPath);
        }
      });
    } else {
      let counterValue = 0;

      ipcMain.on('notification', () => {
        if (mainWindow.isFocused()) {
          return;
        }
        appIcon.setToolTip(`•  ${options.name}`);
        counterValue = Math.min(counterValue + 1, 1000);
        const nimage = nativeImage.createFromPath(iconPath+"."+counterValue+".ico");
        appIcon.setImage(nimage);
        mainWindow.setIcon(iconPath+"."+counterValue+".ico");
      });

      mainWindow.on('focus', () => {
        appIcon.setToolTip(options.name);
        counterValue = 0;
        const nimage = nativeImage.createFromPath(iconPath);
        appIcon.setImage(nimage);
        mainWindow.setIcon(iconPath);
      });
    }

    appIcon.setToolTip(options.name);
    appIcon.setContextMenu(contextMenu);

    return appIcon;
  }

  return null;
}