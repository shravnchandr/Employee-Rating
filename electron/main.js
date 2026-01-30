const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { readData, writeData, ensureDataFile } = require('./dataManager');

let mainWindow = null;

// Security: Disable navigation to unknown protocols
app.on('web-contents-created', (event, contents) => {
    // Block navigation to external URLs
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        const allowedOrigins = ['http://localhost:5173']; // Dev server

        // In production, only allow file:// protocol (local files)
        if (process.env.ELECTRON_DEV) {
            if (!allowedOrigins.includes(parsedUrl.origin)) {
                event.preventDefault();
                console.warn('Blocked navigation to:', navigationUrl);
            }
        } else {
            if (parsedUrl.protocol !== 'file:') {
                event.preventDefault();
                console.warn('Blocked navigation to:', navigationUrl);
            }
        }
    });

    // Block new window creation (popups)
    contents.setWindowOpenHandler(({ url }) => {
        // Allow opening external links in default browser if needed
        if (url.startsWith('https://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    // Prevent webview creation
    contents.on('will-attach-webview', (event) => {
        event.preventDefault();
        console.warn('Blocked webview creation');
    });
});

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // Security settings
            contextIsolation: true,        // Isolate renderer from Node.js
            nodeIntegration: false,        // Disable Node.js in renderer
            sandbox: true,                 // Enable sandbox for additional isolation
            webSecurity: true,             // Enforce same-origin policy
            allowRunningInsecureContent: false,  // Block HTTP content on HTTPS
            experimentalFeatures: false,   // Disable experimental Chromium features
            enableBlinkFeatures: '',       // Disable all Blink features
            webviewTag: false,             // Disable webview tag
        },
        icon: path.join(__dirname, '..', 'public', 'janhavi-logo.jpg'),
        title: 'Employee Rating App'
    });

    // Set Content Security Policy
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    process.env.ELECTRON_DEV
                        // Development CSP (allows Vite HMR)
                        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://localhost:* http://localhost:*"
                        // Production CSP (strict)
                        : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'"
                ]
            }
        });
    });

    // Handle permission requests - deny all by default
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = []; // No permissions needed for this app

        if (allowedPermissions.includes(permission)) {
            callback(true);
        } else {
            console.warn('Denied permission request:', permission);
            callback(false);
        }
    });

    // Handle permission checks
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        return false; // Deny all permission checks
    });

    // In development, load from Vite dev server
    // In production, load from built files
    if (process.env.ELECTRON_DEV) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Input validation helper
function validateDataStructure(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }

    // Validate expected fields are arrays (if present)
    const arrayFields = [
        'employees', 'ratings', 'categories', 'taskTemplates',
        'dailyTasks', 'rules', 'violations', 'monthlyLeaves', 'taskIncompleteReports'
    ];

    for (const field of arrayFields) {
        if (data[field] !== undefined && !Array.isArray(data[field])) {
            console.warn(`Invalid data structure: ${field} is not an array`);
            return false;
        }
    }

    return true;
}

// IPC Handlers for data operations
ipcMain.handle('data:fetch', async () => {
    return readData();
});

ipcMain.handle('data:save', async (event, data) => {
    // Validate input data structure
    if (!validateDataStructure(data)) {
        return { success: false, message: 'Invalid data structure' };
    }
    return writeData(data);
});

// IPC Handlers for update operations
ipcMain.handle('updater:check', async () => {
    try {
        const result = await autoUpdater.checkForUpdates();
        return result;
    } catch (error) {
        console.error('Error checking for updates:', error);
        return null;
    }
});

ipcMain.handle('updater:download', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return true;
    } catch (error) {
        console.error('Error downloading update:', error);
        return false;
    }
});

ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall();
});

// Auto-updater events
autoUpdater.on('update-available', (info) => {
    if (mainWindow) {
        // Only send safe info to renderer
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseName: info.releaseName
        });
    }
});

autoUpdater.on('update-not-available', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update-not-available');
    }
});

autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
            percent: progress.percent,
            transferred: progress.transferred,
            total: progress.total,
            bytesPerSecond: progress.bytesPerSecond
        });
    }
});

autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseName: info.releaseName
        });
    }
});

autoUpdater.on('error', (error) => {
    if (mainWindow) {
        // Don't expose full error details to renderer
        mainWindow.webContents.send('update-error', 'Update failed. Please try again later.');
    }
});

// App lifecycle
app.whenReady().then(() => {
    ensureDataFile();
    createWindow();

    // Check for updates on startup (only in production)
    if (!process.env.ELECTRON_DEV) {
        // Delay initial check to let app fully load
        setTimeout(() => {
            autoUpdater.checkForUpdates().catch(console.error);
        }, 3000);

        // Check for updates every 24 hours
        setInterval(() => {
            autoUpdater.checkForUpdates().catch(console.error);
        }, 24 * 60 * 60 * 1000);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Focus existing window if user tries to open another instance
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}
