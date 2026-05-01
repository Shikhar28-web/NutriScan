import Database from 'better-sqlite3';
import path from 'path';

// Connect to the SQLite database (creating it if it doesn't exist)
// We place it in the root directory of the Next.js app (frontend/)
const dbPath = path.join(process.cwd(), 'nutriscan.db');

const db = new Database(dbPath, {
  // verbose: console.log // Optional: uncomment to log SQL queries
});

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize the database with the `users` table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

export default db;
