const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile('index.html');

  // Send saved times when the window loads
  mainWindow.webContents.once('did-finish-load', () => {
    sendSavedTimes();
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// File Path for Saved Times
const filePath = path.join(__dirname, 'times.json');

// Function to Read and Send Saved Times
function sendSavedTimes() {
  if (mainWindow) {
    let times = [];
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath);
      times = JSON.parse(rawData);
    }

    // Ensure name input is enabled even if times are cleared
    mainWindow.webContents.send('load-times', times);
  }
}

// Save Time Data and Update List
ipcMain.on('save-time', (event, timeData) => {
  let times = [];
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    times = JSON.parse(rawData);
  }

  times.push(timeData);
  fs.writeFileSync(filePath, JSON.stringify(times, null, 2));

  sendSavedTimes(); // Send the updated list back
});

ipcMain.on('clear-times', () => {
  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2)); // Overwrite with empty array
  }
  sendSavedTimes(); // Refresh the list in the UI
});

