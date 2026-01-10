import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        employees: [],
        ratings: [],
        categories: ['Teamwork', 'Communication', 'Quality of Work', 'Reliability']
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper to read data
const readData = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
        return { employees: [], ratings: [], categories: [] };
    } catch (err) {
        console.error('Error reading DB:', err);
        return { employees: [], ratings: [], categories: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing DB:', err);
        return false;
    }
};

// Get all data
app.get('/api/data', (req, res) => {
    console.log('GET /api/data');
    const data = readData();
    res.json(data);
});

// Save all data
app.post('/api/save', (req, res) => {
    console.log('POST /api/save');
    const { employees, ratings, categories } = req.body;
    const currentData = readData();

    const newData = {
        employees: employees || currentData.employees,
        ratings: ratings || currentData.ratings,
        categories: categories || currentData.categories
    };

    if (writeData(newData)) {
        res.json({ success: true, message: 'Data saved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
