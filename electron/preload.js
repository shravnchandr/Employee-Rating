const { contextBridge, ipcRenderer } = require('electron');

// Security: Track registered listeners to prevent accumulation
const registeredListeners = new Map();

// Security: Safe wrapper for event listeners that prevents duplicates
function safeOn(channel, callback) {
    // Remove existing listener if any
    if (registeredListeners.has(channel)) {
        ipcRenderer.removeListener(channel, registeredListeners.get(channel));
    }

    // Wrap callback to prevent exposing event object
    const wrappedCallback = (event, ...args) => callback(...args);

    // Register new listener
    ipcRenderer.on(channel, wrappedCallback);
    registeredListeners.set(channel, wrappedCallback);
}

// Security: Validate channel names
const ALLOWED_CHANNELS = [
    'update-available',
    'update-not-available',
    'download-progress',
    'update-downloaded',
    'update-error'
];

function isValidChannel(channel) {
    return ALLOWED_CHANNELS.includes(channel);
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Data operations
    fetchData: () => ipcRenderer.invoke('data:fetch'),
    saveData: (data) => {
        // Basic validation before sending
        if (data === null || typeof data !== 'object') {
            return Promise.reject(new Error('Invalid data'));
        }
        return ipcRenderer.invoke('data:save', data);
    },

    // Update operations
    checkForUpdates: () => ipcRenderer.invoke('updater:check'),
    downloadUpdate: () => ipcRenderer.invoke('updater:download'),
    installUpdate: () => ipcRenderer.invoke('updater:install'),

    // Update event listeners (with security wrappers)
    onUpdateAvailable: (callback) => {
        if (typeof callback !== 'function') return;
        safeOn('update-available', callback);
    },
    onUpdateNotAvailable: (callback) => {
        if (typeof callback !== 'function') return;
        safeOn('update-not-available', callback);
    },
    onDownloadProgress: (callback) => {
        if (typeof callback !== 'function') return;
        safeOn('download-progress', callback);
    },
    onUpdateDownloaded: (callback) => {
        if (typeof callback !== 'function') return;
        safeOn('update-downloaded', callback);
    },
    onUpdateError: (callback) => {
        if (typeof callback !== 'function') return;
        safeOn('update-error', callback);
    },

    // Remove listeners (for cleanup)
    removeUpdateListeners: () => {
        for (const channel of ALLOWED_CHANNELS) {
            if (registeredListeners.has(channel)) {
                ipcRenderer.removeListener(channel, registeredListeners.get(channel));
                registeredListeners.delete(channel);
            }
        }
    }
});
