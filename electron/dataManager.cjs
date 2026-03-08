const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Get the user data directory for storing app data
const getDataDir = () => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'data');
};

const getDbPath = () => {
    return path.join(getDataDir(), 'db.json');
};

const initialData = {
    employees: [],
    ratings: [],
    categories: ['Teamwork', 'Communication', 'Quality of Work', 'Reliability'],
    taskTemplates: [],
    dailyTasks: [],
    rules: [],
    violations: [],
    monthlyLeaves: [],
    taskIncompleteReports: [],
    adminPassword: 'admin123',
    settings: { attendanceExcellentThreshold: 90, attendanceGoodThreshold: 70 }
};

// Security: Sanitize string values to prevent injection
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    // Remove null bytes and control characters (except newlines/tabs)
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// Security: Deep sanitize object
function sanitizeObject(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // Sanitize key as well
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
}

// Security: Validate file path is within expected directory
function isPathSafe(filePath) {
    const dataDir = getDataDir();
    const resolvedPath = path.resolve(filePath);
    return resolvedPath.startsWith(dataDir);
}

// Ensure data directory and file exist
const ensureDataFile = () => {
    const dataDir = getDataDir();
    const dbPath = getDbPath();

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), { encoding: 'utf8' });
    }
};

// Read data from db.json
const readData = () => {
    try {
        ensureDataFile();
        const dbPath = getDbPath();

        // Security: Verify path is safe
        if (!isPathSafe(dbPath)) {
            console.error('Security: Attempted to read from unsafe path');
            return { ...initialData };
        }

        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');

            // Security: Limit file size to prevent DoS (50MB max)
            if (data.length > 50 * 1024 * 1024) {
                console.error('Security: Data file too large');
                return { ...initialData };
            }

            const parsed = JSON.parse(data);

            // Ensure all fields exist for backwards compatibility
            return {
                employees: Array.isArray(parsed.employees) ? parsed.employees : [],
                ratings: Array.isArray(parsed.ratings) ? parsed.ratings : [],
                categories: Array.isArray(parsed.categories) ? parsed.categories : [],
                taskTemplates: Array.isArray(parsed.taskTemplates) ? parsed.taskTemplates : [],
                dailyTasks: Array.isArray(parsed.dailyTasks) ? parsed.dailyTasks : [],
                rules: Array.isArray(parsed.rules) ? parsed.rules : [],
                violations: Array.isArray(parsed.violations) ? parsed.violations : [],
                monthlyLeaves: Array.isArray(parsed.monthlyLeaves) ? parsed.monthlyLeaves : [],
                taskIncompleteReports: Array.isArray(parsed.taskIncompleteReports) ? parsed.taskIncompleteReports : [],
                adminPassword: typeof parsed.adminPassword === 'string' ? parsed.adminPassword : 'admin123',
                settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : { attendanceExcellentThreshold: 90, attendanceGoodThreshold: 70 }
            };
        }
        return { ...initialData };
    } catch (err) {
        console.error('Error reading DB:', err);
        return { ...initialData };
    }
};

// Write data to db.json
const writeData = (data) => {
    try {
        ensureDataFile();
        const dbPath = getDbPath();

        // Security: Verify path is safe
        if (!isPathSafe(dbPath)) {
            console.error('Security: Attempted to write to unsafe path');
            return { success: false, message: 'Security error' };
        }

        const currentData = readData();

        // Sanitize all input data
        const sanitizedData = sanitizeObject(data);

        const newData = {
            employees: Array.isArray(sanitizedData.employees) ? sanitizedData.employees : currentData.employees,
            ratings: Array.isArray(sanitizedData.ratings) ? sanitizedData.ratings : currentData.ratings,
            categories: Array.isArray(sanitizedData.categories) ? sanitizedData.categories : currentData.categories,
            taskTemplates: Array.isArray(sanitizedData.taskTemplates) ? sanitizedData.taskTemplates : currentData.taskTemplates,
            dailyTasks: Array.isArray(sanitizedData.dailyTasks) ? sanitizedData.dailyTasks : currentData.dailyTasks,
            rules: Array.isArray(sanitizedData.rules) ? sanitizedData.rules : currentData.rules,
            violations: Array.isArray(sanitizedData.violations) ? sanitizedData.violations : currentData.violations,
            monthlyLeaves: Array.isArray(sanitizedData.monthlyLeaves) ? sanitizedData.monthlyLeaves : currentData.monthlyLeaves,
            taskIncompleteReports: Array.isArray(sanitizedData.taskIncompleteReports) ? sanitizedData.taskIncompleteReports : currentData.taskIncompleteReports,
            adminPassword: typeof sanitizedData.adminPassword === 'string' ? sanitizedData.adminPassword : currentData.adminPassword,
            settings: sanitizedData.settings && typeof sanitizedData.settings === 'object' ? sanitizedData.settings : currentData.settings
        };

        const jsonString = JSON.stringify(newData, null, 2);

        // Security: Limit write size
        if (jsonString.length > 50 * 1024 * 1024) {
            console.error('Security: Data too large to write');
            return { success: false, message: 'Data too large' };
        }

        // Write atomically using a temp file
        const tempPath = dbPath + '.tmp';
        fs.writeFileSync(tempPath, jsonString, { encoding: 'utf8' });
        fs.renameSync(tempPath, dbPath);

        return { success: true, message: 'Data saved successfully' };
    } catch (err) {
        console.error('Error writing DB:', err);
        return { success: false, message: 'Failed to save data' };
    }
};

const getBackupDir = () => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'backups');
};

// Create a timestamped backup of db.json. Keeps only the 10 most recent.
// Skips silently if the database has no employees or ratings yet.
const backupData = () => {
    try {
        const dbPath = getDbPath();
        if (!fs.existsSync(dbPath)) return { success: false, reason: 'no-data' };

        const raw = fs.readFileSync(dbPath, 'utf8');
        let parsed;
        try { parsed = JSON.parse(raw); } catch { return { success: false, reason: 'parse-error' }; }

        // Skip if nothing meaningful has been saved yet
        const hasEmployees = Array.isArray(parsed.employees) && parsed.employees.length > 0;
        const hasRatings = Array.isArray(parsed.ratings) && parsed.ratings.length > 0;
        if (!hasEmployees && !hasRatings) return { success: false, reason: 'empty' };

        const backupDir = getBackupDir();
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const now = new Date();
        const ts = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0')
        ].join('-');

        fs.writeFileSync(path.join(backupDir, `backup-${ts}.json`), raw, { encoding: 'utf8' });

        // Prune: keep only the 10 most recent backup files
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
            .sort(); // lexicographic sort == chronological since format is YYYY-MM-DD-HH-MM
        if (files.length > 10) {
            files.slice(0, files.length - 10).forEach(f => {
                try { fs.unlinkSync(path.join(backupDir, f)); } catch (_) {}
            });
        }

        console.log(`[Backup] Saved backup-${ts}.json`);
        return { success: true };
    } catch (err) {
        console.error('[Backup] Failed:', err);
        return { success: false, reason: 'error' };
    }
};

module.exports = {
    readData,
    writeData,
    ensureDataFile,
    backupData,
    getDataDir,
    getDbPath,
    getBackupDir
};
