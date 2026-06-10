const { openDb } = require('../config/db');
const { naturalNumericalSort } = require('../utils/helpers');

exports.getAllBulls = (req, res, next) => {
  const db = openDb();
  db.all('SELECT name FROM bulls', (err, rows) => {
    db.close();
    if (err) return next(err);
    
    const bullNames = rows.map(r => r.name);
    const sorted = naturalNumericalSort(bullNames);
    res.json(sorted);
  });
};

exports.createBull = (req, res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Nombre de Bull inválido' });
  }

  const cleanName = name.trim().toUpperCase();
  const db = openDb();

  db.all('SELECT name FROM bulls', (err, rows) => {
    if (err) {
      db.close();
      return next(err);
    }

    const bullNames = rows.map(r => r.name);
    
    if (bullNames.includes(cleanName)) {
      db.close();
      return res.status(400).json({ error: `El Bull ${cleanName} ya existe en la base de datos` });
    }

    const updatedBullsList = [...bullNames, cleanName];
    const sortedBullsList = naturalNumericalSort(updatedBullsList);
    
    console.log('🔄 Insertando nuevo Bull. Arreglo ordenado antes de la inserción:', sortedBullsList);

    db.run('INSERT INTO bulls (name) VALUES (?)', [cleanName], function(insertErr) {
      db.close();
      if (insertErr) return next(insertErr);
      res.json({ success: true, name: cleanName, sortedList: sortedBullsList });
    });
  });
};
