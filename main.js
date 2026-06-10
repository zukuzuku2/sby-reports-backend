const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Configure environment variables for Express and database configuration
process.env.IS_ELECTRON = 'true';
process.env.ELECTRON_USER_DATA_PATH = app.getPath('userData');

// Start Express server
require('./server.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    title: "Groundster Monitor",
  });

  // Remove the default menu bar
  mainWindow.removeMenu();

  if (isDev) {
    // Development mode: Point to Vite server
    mainWindow.loadURL('http://127.0.0.1:8081');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode: Load Express server
    mainWindow.loadURL('http://localhost:5000');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización disponible',
    message: 'Una nueva versión de Groundster Monitor ha sido descargada. ¿Deseas instalarla y reiniciar la aplicación ahora?',
    buttons: ['Sí, actualizar ahora', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
