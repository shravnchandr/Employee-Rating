export const API_URL = '/api';

// Type definitions for Electron API
interface UpdateInfo {
    version: string;
    releaseDate?: string;
    releaseName?: string;
}

interface DownloadProgress {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
}

interface ElectronAPI {
    fetchData: () => Promise<any>;
    saveData: (data: any) => Promise<{ success: boolean; message: string }>;
    checkForUpdates: () => Promise<any>;
    downloadUpdate: () => Promise<boolean>;
    installUpdate: () => void;
    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
    onUpdateNotAvailable: (callback: () => void) => void;
    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
    onUpdateError: (callback: (error: string) => void) => void;
    removeUpdateListeners: () => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

// Check if running in Electron
const isElectron = () => {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

export const api = {
    fetchData: async () => {
        if (isElectron()) {
            return window.electronAPI!.fetchData();
        }
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },

    saveData: async (data: any) => {
        if (isElectron()) {
            return window.electronAPI!.saveData(data);
        }
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to save data');
        return response.json();
    }
};

// Updater API for Electron auto-updates
export const updaterApi = {
    isElectron,

    checkForUpdates: async () => {
        if (!isElectron()) return null;
        return window.electronAPI!.checkForUpdates();
    },

    downloadUpdate: async () => {
        if (!isElectron()) return false;
        return window.electronAPI!.downloadUpdate();
    },

    installUpdate: () => {
        if (!isElectron()) return;
        window.electronAPI!.installUpdate();
    },

    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
        if (!isElectron()) return;
        window.electronAPI!.onUpdateAvailable(callback);
    },

    onUpdateNotAvailable: (callback: () => void) => {
        if (!isElectron()) return;
        window.electronAPI!.onUpdateNotAvailable(callback);
    },

    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
        if (!isElectron()) return;
        window.electronAPI!.onDownloadProgress(callback);
    },

    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
        if (!isElectron()) return;
        window.electronAPI!.onUpdateDownloaded(callback);
    },

    onUpdateError: (callback: (error: string) => void) => {
        if (!isElectron()) return;
        window.electronAPI!.onUpdateError(callback);
    },

    removeUpdateListeners: () => {
        if (!isElectron()) return;
        window.electronAPI!.removeUpdateListeners();
    }
};
