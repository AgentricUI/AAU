const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;
let adminWindow;

// Enable live reload for Electron in development
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function createMainWindow() {
  // Create the main window (Student Interface - AAC Optimized)
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'AgentricAI University - Student Interface',
    icon: path.join(__dirname, '../../assets/icons/student-icon.png'),
    show: false, // Don't show until ready-to-show
    titleBarStyle: 'default',
    fullscreenable: true,
    // AAC device optimizations
    thickFrame: true, // Better for touch devices
    webSecurity: true
  });

  // Load the student interface
  const startUrl = isDev 
    ? 'http://localhost:3000/student' 
    : `file://${path.join(__dirname, '../ui/student/index.html')}`;
    
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus for accessibility
    mainWindow.focus();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createAdminWindow() {
  // Create admin window (Parent/Teacher Interface)
  adminWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    parent: mainWindow,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'AgentricAI University - Admin Interface',
    icon: path.join(__dirname, '../../assets/icons/admin-icon.png'),
    show: false
  });

  const adminUrl = isDev 
    ? 'http://localhost:3000/admin' 
    : `file://${path.join(__dirname, '../ui/admin/index.html')}`;
    
  adminWindow.loadURL(adminUrl);

  adminWindow.once('ready-to-show', () => {
    adminWindow.show();
  });

  adminWindow.on('closed', () => {
    adminWindow = null;
  });
}

function startBackendServer() {
  if (isDev) {
    // In development, assume server is running separately
    return;
  }

  // Start the Node.js backend server
  const serverPath = path.join(__dirname, '../main.js');
  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
    dialog.showErrorBox('Server Error', 
      'Failed to start the AgentricAI University server. Please check the logs.');
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: 'AgentricAI University',
      submenu: [
        {
          label: 'About AgentricAI University',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'AgentricAI University',
              detail: 'Emotionally intelligent educational platform for neurodiverse learners.\n\nVersion 1.0.0\nBuilt with ❤️ for every unique mind.'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Open preferences window
            ipcMain.emit('open-preferences');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Student',
      submenu: [
        {
          label: 'Focus Mode',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        },
        {
          label: 'Calm Colors',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => {
            mainWindow.webContents.send('toggle-calm-colors', menuItem.checked);
          }
        },
        {
          label: 'Large Text',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            mainWindow.webContents.send('toggle-large-text', menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'Emergency Contact',
          accelerator: 'Ctrl+E',
          click: () => {
            mainWindow.webContents.send('emergency-contact');
          }
        }
      ]
    },
    {
      label: 'Admin',
      submenu: [
        {
          label: 'Open Admin Panel',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            if (!adminWindow) {
              createAdminWindow();
            } else {
              adminWindow.focus();
            }
          }
        },
        {
          label: 'Agent Status',
          click: () => {
            if (adminWindow) {
              adminWindow.webContents.send('show-agent-status');
            } else {
              createAdminWindow();
              adminWindow.once('ready-to-show', () => {
                adminWindow.webContents.send('show-agent-status');
              });
            }
          }
        },
        {
          label: 'Export Data',
          click: async () => {
            const { filePath } = await dialog.showSaveDialog(adminWindow || mainWindow, {
              title: 'Export Student Data',
              defaultPath: `agentricai-data-${new Date().toISOString().split('T')[0]}.json`,
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (filePath) {
              ipcMain.emit('export-data', filePath);
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/AgentricUI/AgentricAI_University_Ecosystem/wiki');
          }
        },
        {
          label: 'AAC Device Setup',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'AAC Device Setup',
              message: 'Setting up AgentricAI University on AAC Devices',
              detail: 'This application is optimized for:\n• Touch-based interaction\n• Large, clear buttons\n• Symbol-based communication\n• Offline functionality\n• Calm, sensory-friendly design\n\nFor specific device configuration, please refer to the user guide.'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Contact Support',
          click: () => {
            shell.openExternal('mailto:support@agentricai.com?subject=AgentricAI University Support');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for communication with renderer processes
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(options);
  return result;
});

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    electron: process.versions.electron
  };
});

// App event handlers
app.whenReady().then(() => {
  console.log('🎓 Starting AgentricAI University Desktop Application');
  
  // Start backend server
  startBackendServer();
  
  // Create main window
  createMainWindow();
  
  // Create application menu
  createApplicationMenu();
  
  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // On macOS, apps stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up server process
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, url) => {
    navigationEvent.preventDefault();
    shell.openExternal(url);
  });
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});