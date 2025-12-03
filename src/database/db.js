const fs = require('fs/promises');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DATABASE_FILE = process.env.SQLITE_DB_FILE || '/app/data/database.sqlite';
const SCHEMA_PATH = path.join(__dirname, 'init.sql');

let dbInstance;

async function ensureStoragePath() {
  await fs.mkdir(path.dirname(DATABASE_FILE), { recursive: true });
}

function openDatabase(filePath) {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(filePath, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(database);
    });
  });
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function runStatement(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onComplete(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getStatement(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function allStatement(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function applySchema(db) {
  try {
    const schema = await fs.readFile(SCHEMA_PATH, 'utf-8');

    if (!schema.trim()) {
      return;
    }

    await exec(db, schema);
  } catch (error) {
    console.error('Failed to load database schema.', error.message);
    throw error;
  }
}

async function initialize() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    await ensureStoragePath();
    dbInstance = await openDatabase(DATABASE_FILE);
    await applySchema(dbInstance);
    return dbInstance;
  } catch (error) {
    dbInstance = undefined;
    throw error;
  }
}

async function run(sql, params = []) {
  try {
    const db = await initialize();
    return await runStatement(db, sql, params);
  } catch (error) {
    console.error('Failed to run statement.', error.message);
    throw error;
  }
}

async function get(sql, params = []) {
  try {
    const db = await initialize();
    return await getStatement(db, sql, params);
  } catch (error) {
    console.error('Failed to fetch record.', error.message);
    throw error;
  }
}

async function all(sql, params = []) {
  try {
    const db = await initialize();
    return await allStatement(db, sql, params);
  } catch (error) {
    console.error('Failed to fetch records.', error.message);
    throw error;
  }
}

module.exports = {
  initialize,
  run,
  get,
  all
};
