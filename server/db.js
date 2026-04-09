const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./resume.db", (err) => {
  if (err) {
    console.error("DB ERROR:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  score TEXT,
  skills_missing TEXT,
  suggestions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

module.exports = db;
