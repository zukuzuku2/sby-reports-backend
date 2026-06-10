const { openDb } = require('../config/db');

exports.getAllJefes = (req, res, next) => {
  const db = openDb();
  db.all('SELECT name FROM jefes ORDER BY name ASC', (err, rows) => {
    db.close();
    if (err) return next(err);
    const names = rows.map(r => r.name);
    res.json(names);
  });
};
