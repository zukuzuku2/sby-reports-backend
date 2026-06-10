const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'groundster.db');
const db = new sqlite3.Database(dbPath);

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
db.serialize(() => {
  console.log('⚡ Iniciando inicialización de base de datos segura y persistente...');
  
  // 1. Create tables if they do not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS bulls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS jefes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);
  
  db.run(`
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

  db.all("PRAGMA table_info(events)", (err, columns) => {
    if (err) {
      console.error('❌ Error al verificar info de tabla:', err.message);
      return;
    }
    const hasCreador = (columns || []).some(col => col.name === 'creador');
    if (!hasCreador) {
      db.run("ALTER TABLE events ADD COLUMN creador TEXT DEFAULT 'Desconocido'", (alterErr) => {
        if (alterErr) {
          console.error('❌ Error al agregar la columna creador:', alterErr.message);
        } else {
          console.log('✅ Columna "creador" agregada exitosamente a la tabla "events".');
        }
      });
    }
  });

  // 2. Check and Seed Bulls (only if the table is empty)
  db.get('SELECT count FROM (SELECT COUNT(*) as count FROM bulls)', (err, row) => {
    if (err) {
      console.error('❌ Error al verificar la tabla de bulls:', err.message);
      return;
    }
    
    const count = row ? row.count : 0;
    if (count === 0) {
      console.log('🌱 La tabla de bulls está vacía. Sembrando bulls ordenados...');
      const sortedBulls = naturalNumericalSort(rawBulls);
      const insertBullStmt = db.prepare('INSERT INTO bulls (name) VALUES (?)');
      sortedBulls.forEach(bull => {
        insertBullStmt.run(bull);
      });
      insertBullStmt.finalize();
      console.log('✅ Bulls inicializados en base de datos.');
    } else {
      console.log('ℹ️ La tabla de bulls ya contiene registros. Manteniendo consistencia.');
    }
  });

  // 3. Check and Seed Jefes de Turno (only if the table is empty)
  db.get('SELECT count FROM (SELECT COUNT(*) as count FROM jefes)', (err, row) => {
    if (err) {
      console.error('❌ Error al verificar la tabla de jefes:', err.message);
      return;
    }
    
    const count = row ? row.count : 0;
    if (count === 0) {
      console.log('🌱 La tabla de jefes de turno está vacía. Sembrando supervisores...');
      const sortedJefes = [...shiftSupervisors].sort((a, b) => a.localeCompare(b));
      const insertJefeStmt = db.prepare('INSERT INTO jefes (name) VALUES (?)');
      sortedJefes.forEach(jefe => {
        insertJefeStmt.run(jefe);
      });
      insertJefeStmt.finalize();
      console.log('✅ Jefes de Turno inicializados en base de datos.');
    } else {
      console.log('ℹ️ La tabla de jefes ya contiene registros. Manteniendo consistencia.');
    }
  });

  console.log('🎉 Verificación/Inicialización de la estructura de base de datos Groundster completa.');
});

db.close();

module.exports = {
  dbPath,
  naturalNumericalSort
};
