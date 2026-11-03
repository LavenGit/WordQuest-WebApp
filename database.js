
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
    path.join(__dirname, "Security")
);

db.serialize(() => {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            userid TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
        )
    `);

    // Create leaderboard table
    db.run(`
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userid TEXT NOT NULL,
            level INTEGER NOT NULL CHECK (level IN (1, 2)),
            completion_time INTEGER NOT NULL CHECK (completion_time > 0),
            completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(userid, level)
        )
    `);
});

db.close((err) => {
    if (err) {
        console.error("Database error:", err.message);
        process.exitCode = 1;
    } else {
        console.log("Database initialized successfully!");
    }
});
