const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const db = new Database(process.env.DB_PATH || './history.db');

// Init table
db.exec(`
  CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_lang TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    char_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_created_at ON translations(created_at DESC);
`);

const save = (id, sourceText, translatedText, sourceLang, targetLang) => {
  const stmt = db.prepare(`
    INSERT INTO translations (id, source_text, translated_text, source_lang, target_lang, char_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, sourceText, translatedText, sourceLang, targetLang, sourceText.length);
};

const getRecent = (limit = 20) => {
  return db.prepare(`
    SELECT id, source_text, translated_text, source_lang, target_lang, char_count, created_at
    FROM translations
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
};

const deleteById = (id) => {
  return db.prepare('DELETE FROM translations WHERE id = ?').run(id);
};

const clearAll = () => {
  return db.prepare('DELETE FROM translations').run();
};

module.exports = { save, getRecent, deleteById, clearAll };
