const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'F:/Trabajo/Mios Propios/sby-msgs-reports/backend/groundster.db';
const db = new sqlite3.Database(dbPath);

const rawBulls = [
  "B5766", "B9819", "B10089", "B10088", "B10205", "B8839", "B6510", "B6511", 
  "B10087", "B6051", "B10204", "B8840", "B15230", "B10331", "B10450", "B5532", "B10449",
  "B15176", "B5955", "B9802", "B3002", "B4966", "B5954", "B5177", "B15084", "B3003"
];

// Special mapping for ambiguous cases if any
const explicitMapping = {
  "B02": "B9802", // Often referred to 9802 in reports
  "B10": "B6510",
  "B11": "B6511",
  "B19": "B9819",
  "B39": "B8839",
  "B51": "B6051",
  "B55": "B5955",
  "B66": "B5766", // User said 66, let's assume 5766
  "B76": "B15176",
  "B87": "B10087",
  "B88": "B10088",
  "B89": "B10089",
  "B204": "B10204",
  "B205": "B10205",
  "B331": "B10331",
  "B3001": "B3002" // Probably a typo, map to nearest
};

db.serialize(() => {
  db.all('SELECT id, machine FROM events', [], (err, rows) => {
    if (err) throw err;
    
    db.run("BEGIN TRANSACTION");
    let count = 0;
    
    rows.forEach(row => {
      const currentMachine = row.machine.trim();
      let newMachine = currentMachine;
      
      // If already an official bull, skip
      if (rawBulls.includes(currentMachine)) return;
      
      if (explicitMapping[currentMachine]) {
        newMachine = explicitMapping[currentMachine];
      } else {
        // Try suffix matching
        const numericPart = currentMachine.replace(/\D/g, '');
        if (numericPart) {
          const matches = rawBulls.filter(b => b.endsWith(numericPart));
          if (matches.length === 1) {
            newMachine = matches[0];
          }
        }
      }
      
      if (newMachine !== currentMachine) {
        db.run('UPDATE events SET machine = ? WHERE id = ?', [newMachine, row.id], function(updateErr) {
          if (updateErr) console.error("Error updating ID", row.id, updateErr);
        });
        count++;
        console.log(`Mapped ${currentMachine} -> ${newMachine}`);
      }
    });
    
    db.run("COMMIT", () => {
      console.log(`Updated ${count} records with official bull names.`);
      db.close();
    });
  });
});
