const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'groundster.db');

function openDb() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  openDb,
  dbPath
};
