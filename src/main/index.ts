'use strict'

import { app, BrowserWindow, shell } from 'electron'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null

function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true}})

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  window.loadURL(`https://chat.google.com/`)

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault();
    if (url.startsWith('https://chat.google.com')) {
      mainWindow?.webContents.loadURL(url);
    } else {
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.on('page-favicon-updated', (event: Event, favicons: string[]) => {
    if (favicons.some(fv => fv.includes('chat-favicon-new-notif'))) {
      app.setBadgeCount(1);
    } else {
      app.setBadgeCount(0);
    }
  });
})
