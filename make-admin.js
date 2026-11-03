
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const username = process.argv[2];

if (!username) {
    console.error("Usage: node make-admin.js <username>");
    process.exit(1);
}

const db = new sqlite3.Database(path.join(__dirname, "Security"));

db.run(
    "UPDATE users SET role = 'admin' WHERE userid = ?",
    [username],
    function(err) {
        if (err) {
            console.error(err.message);
        } else if (this.changes === 0) {
            console.log("Account not found. Register first.");
        } else {
            console.log(`Admin role assigned to ${username} successfully.`);
        }

        db.close();
    }
);
