const electron = require('electron');
const {app, BrowserWindow} = electron;

let win;

const createWindow = () => {
  win = new BrowserWindow({
    title: 'Spider - SourcePawn Compiler',
    backgroundColor: '#272822',
    show: false
  });

  win.loadFile('index.html');

  let eventCount = 0;
  let processEvent = () => {
    if (++eventCount === 2) {
      win.maximize();
      win.show();
      win.focus();
    }
  };

  win.webContents.on('did-finish-load', processEvent);
  win.on('ready-to-show', processEvent);

  win.on('closed', () => {
    win = null;
  })
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});