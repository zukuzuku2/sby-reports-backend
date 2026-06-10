const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.IS_ELECTRON === 'true' && process.env.ELECTRON_USER_DATA_PATH
  ? path.join(process.env.ELECTRON_USER_DATA_PATH, 'groundster.db')
  : path.join(__dirname, '..', 'groundster.db');

function openDb() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  openDb,
  dbPath
};

