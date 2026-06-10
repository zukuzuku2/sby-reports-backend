const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'groundster.db');
const db = new sqlite3.Database(dbPath);

const markdownPath = path.join(__dirname, '../reportes_groundster.md');
const mdContent = fs.readFileSync(markdownPath, 'utf8');

const mapping = {
  "Soporte Groundster Dia": "Julio Ávalos",
  "Groundster Soporte SBY": "Jose Santos",
  "Soporte Geosupport Noche Luis": "Liliana Cruz",
  "Groundster Soporte Noche Yoandri SBY": "Yoandri Escalona"
};

const regex = /## Reporte #[0-9]+.*?\n\n\| Campo \| Detalle \|\n\|---\|---\|\n(.*?)(?=\n\n---|\n*$)/gs;
let match;
let count = 0;

db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  while ((match = regex.exec(mdContent)) !== null) {
    const tableRows = match[1].trim().split('\n');
    let data = {};
    for (const row of tableRows) {
      const cols = row.split('|').map(c => c.trim());
      if (cols.length >= 3) {
        const key = cols[1].replace(/\*/g, '').replace(/📅|🕐|👤|🕣|🏁|⌛|📋|⛳/g, '').trim();
        const value = cols[2];
        data[key] = value;
      }
    }
    
    // We only care about matching and updating DB
    const fechaRaw = data["Fecha"];
    const hora = data["Hora de reporte"];
    const causa = data["Causa"];
    const enviadoPorRaw = data["Enviado por"];
    
    if (fechaRaw && enviadoPorRaw) {
      // Fix backticks if any
      const fechaParts = fechaRaw.replace(/`/g, '').split('-');
      const fecha = `20${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`; // YYYY-MM-DD
      const enviadoPor = enviadoPorRaw.trim();
      const realName = mapping[enviadoPor] || enviadoPor;
      
      db.run(`UPDATE events SET creador = ? WHERE fecha = ? AND causa = ?`, [realName, fecha, causa], function(err) {
        if (err) {
          console.error("Error updating:", err);
        } else if (this.changes > 0) {
          console.log(`Updated event on ${fecha} with creador ${realName}`);
        } else {
          console.log(`No match for ${fecha} with causa ${causa.substring(0, 20)}`);
        }
      });
      count++;
    }
  }
  db.run("COMMIT", () => {
    console.log(`Finished processing ${count} records from markdown.`);
    
    // Select a few to verify
    db.all("SELECT fecha, creador, causa FROM events LIMIT 10", [], (err, rows) => {
       console.log("Sample rows:");
       console.log(rows);
       db.close();
    });
  });
});
