import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('holiday.db');
db.pragma('journal_mode = WAL');


db.exec(`CREATE TABLE IF NOT EXISTS holiday_lookups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    holiday_name TEXT NOT NULL,
    holiday_date TEXT NOT NULL,
    days_until INTEGER NOT NULL,
    looked_up_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

app.get ('/api/holidays', async (req, res) => {
    try {
        const response = await fetch("https://date.nager.at/api/v3/publicholidays/2026/US");
        const holidays = await response.json();
        res.json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

app.post('/api/holiday-lookups', (req, res) => {
    const { holiday_name, holiday_date, days_until } = req.body;
    const stmt = db.prepare('INSERT INTO holiday_lookups (holiday_name, holiday_date, days_until) VALUES (?, ?, ?)');
    const info = stmt.run(holiday_name, holiday_date, days_until);
    res.json({ id: info.lastInsertRowid, holiday_name, holiday_date, days_until });
});

app.get('/api/holiday-lookups', (req, res) => {
    const stmt = db.prepare('SELECT * FROM holiday_lookups ORDER BY looked_up_at DESC');
    const lookups = stmt.all();
    res.json(lookups);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
