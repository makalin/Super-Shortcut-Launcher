const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

let mainWindow;
let tray;

// Initialize theme
const defaultTheme = {
  background: 'rgba(40, 44, 52, 0.9)',
  buttonBackground: 'rgba(255, 255, 255, 0.1)',
  buttonHover: 'rgba(255, 255, 255, 0.2)',
  textColor: '#FFFFFF'
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: store.get('alwaysOnTop', true),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setPosition(
    store.get('windowPosition.x', 100),
    store.get('windowPosition.y', 100)
  );

  // Create tray icon
  createTray();
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icons', 'tray.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide', click: () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show() },
    { label: 'Always on Top', type: 'checkbox', checked: store.get('alwaysOnTop', true), 
      click: (menuItem) => {
        store.set('alwaysOnTop', menuItem.checked);
        mainWindow.setAlwaysOnTop(menuItem.checked);
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Super Shortcut Launcher');
  tray.setContextMenu(contextMenu);
}

// Create application menu
const template = [
  {
    label: 'File',
    submenu: [
      { label: 'Add Shortcut', click: () => mainWindow.webContents.send('trigger-add-shortcut') },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      {
        label: 'Preferences',
        click: () => mainWindow.webContents.send('open-preferences')
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'toggleDevTools' },
      { type: 'separator' },
      {
        label: 'Toggle Theme',
        click: () => mainWindow.webContents.send('toggle-theme')
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle shortcut selection
ipcMain.handle('select-shortcut', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });
  return result.filePaths[0];
});

// Handle icon selection
ipcMain.handle('select-icon', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'ico'] }],
    properties: ['openFile']
  });
  return result.filePaths[0];
});

// Save window position
ipcMain.on('save-position', (_, position) => {
  store.set('windowPosition', position);
});

// Handle shortcut launch
ipcMain.on('launch-shortcut', (_, path) => {
  require('child_process').exec(`"${path}"`, (error) => {
    if (error) {
      console.error('Error launching shortcut:', error);
    }
  });
});

// Handle clipboard operations
ipcMain.on('copy-path', (_, path) => {
  clipboard.writeText(path);
});