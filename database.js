const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// List of Bulls provided by the user
const rawBulls = [
  "B5766", "B9819", "B10089", "B10088", "B10205", "B8839", "B6510", "B6511", 
  "B10087", "B6051", "B10204", "B8840", "B15230", "B10331", "B10450", "B5532", "B10449",
  "B15176", "B5955", "B9802", "B3002", "B4966", "B5954", "B5177", "B15084", "B3003"
];

// List of Shift Supervisors (Jefes de Turno) provided by the user
const shiftSupervisors = [
  "Victor Alday", 
  "Juan Cifuentes", 
  "David Henriquez", 
  "Juan Carrasco"
];

// Natural numerical sort function (B5532 -> 5532, B10087 -> 10087)
function naturalNumericalSort(arr) {
  return [...arr].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
}

// Database Initialization Flow (Safe creation, no forced drops, no event seeding)
function initDatabase(dbPath, callback) {
  const db = new sqlite3.Database(dbPath);

  // Helper functions to wrap sqlite3 methods in Promises
  const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

  const get = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  const all = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  async function runInit() {
    console.log(`⚡ Iniciando inicialización de base de datos segura y persistente en: ${dbPath}`);
    
    // 1. Create tables if they do not exist
    await run(`
      CREATE TABLE IF NOT EXISTS bulls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);
    
    await run(`
      CREATE TABLE IF NOT EXISTS jefes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);
    
    await run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY,
        machine TEXT NOT NULL,
        fecha TEXT NOT NULL,
        reporte TEXT NOT NULL,
        finalizacion TEXT NOT NULL,
        afectacion TEXT NOT NULL,
        estado TEXT NOT NULL,
        turno TEXT NOT NULL,
        jefe TEXT NOT NULL,
        canal_oficial TEXT NOT NULL,
        causa TEXT NOT NULL,
        categoria TEXT NOT NULL,
        creador TEXT DEFAULT 'Desconocido'
      )
    `);

    // 2. Check and alter table events if "creador" column is missing
    const columns = await all("PRAGMA table_info(events)");
    const hasCreador = columns.some(col => col.name === 'creador');
    if (!hasCreador) {
      await run("ALTER TABLE events ADD COLUMN creador TEXT DEFAULT 'Desconocido'");
      console.log('✅ Columna "creador" agregada exitosamente a la tabla "events".');
    }

    // 3. Check and Seed Bulls (only if the table is empty)
    const bullsCountRow = await get('SELECT COUNT(*) as count FROM bulls');
    const bullsCount = bullsCountRow ? bullsCountRow.count : 0;
    if (bullsCount === 0) {
      console.log('🌱 La tabla de bulls está vacía. Sembrando bulls ordenados...');
      const sortedBulls = naturalNumericalSort(rawBulls);
      for (const bull of sortedBulls) {
        await run('INSERT INTO bulls (name) VALUES (?)', [bull]);
      }
      console.log('✅ Bulls inicializados en base de datos.');
    } else {
      console.log('ℹ️ La tabla de bulls ya contiene registros. Manteniendo consistencia.');
    }

    // 4. Check and Seed Jefes de Turno (only if the table is empty)
    const jefesCountRow = await get('SELECT COUNT(*) as count FROM jefes');
    const jefesCount = jefesCountRow ? jefesCountRow.count : 0;
    if (jefesCount === 0) {
      console.log('🌱 La tabla de jefes de turno está vacía. Sembrando supervisores...');
      const sortedJefes = [...shiftSupervisors].sort((a, b) => a.localeCompare(b));
      for (const jefe of sortedJefes) {
        await run('INSERT INTO jefes (name) VALUES (?)', [jefe]);
      }
      console.log('✅ Jefes de Turno inicializados en base de datos.');
    } else {
      console.log('ℹ️ La tabla de jefes ya contiene registros. Manteniendo consistencia.');
    }
  }

  runInit()
    .then(() => {
      console.log('🎉 Verificación/Inicialización de la estructura de base de datos Groundster completa.');
      db.close((err) => {
        if (callback) callback(err);
      });
    })
    .catch((err) => {
      console.error('❌ Error al inicializar la base de datos:', err);
      db.close(() => {
        if (callback) callback(err);
      });
    });
}

// If run directly (e.g. node database.js)
if (require.main === module) {
  const defaultDbPath = path.join(__dirname, 'groundster.db');
  initDatabase(defaultDbPath, (err) => {
    if (err) {
      console.error('❌ Error al inicializar base de datos de manera directa:', err);
    } else {
      console.log('✅ Inicialización directa completa.');
    }
  });
}

module.exports = {
  initDatabase,
  naturalNumericalSort
};
