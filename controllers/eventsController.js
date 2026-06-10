const { openDb } = require('../config/db');
const { calculateSupervisor } = require('../utils/helpers');

exports.getAllEvents = (req, res, next) => {
  const db = openDb();
  db.all('SELECT * FROM events ORDER BY id DESC', (err, rows) => {
    db.close();
    if (err) return next(err);
    res.json(rows);
  });
};

exports.createEvent = (req, res, next) => {
  let { id, machine, fecha, reporte, finalizacion, afectacion, estado, turno, jefe, canal_oficial, causa, categoria, creador } = req.body;
  
  // Default Jefe de Turno based on Fecha and Reporte time if not set or set to "Sin asignar"
  if (!jefe || jefe === 'Sin asignar' || jefe.trim() === '') {
    jefe = calculateSupervisor(fecha, reporte);
  }

  if (!creador) {
    creador = 'Desconocido';
  }
  
  if (!id || !machine || !fecha || !reporte || !finalizacion || !afectacion || !estado || !turno || !jefe || !canal_oficial || !causa || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const db = openDb();
  
  db.get('SELECT id FROM events WHERE id = ?', [id], (err, row) => {
    if (err) {
      db.close();
      return next(err);
    }
    
    if (row) {
      db.close();
      return res.status(400).json({ error: `El Evento #${id} ya existe.` });
    }
    
    db.run(`
      INSERT INTO events (id, machine, fecha, reporte, finalizacion, afectacion, estado, turno, jefe, canal_oficial, causa, categoria, creador)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, machine, fecha, reporte, finalizacion, afectacion, estado, turno, jefe, canal_oficial, causa, categoria, creador], function(insertErr) {
      db.close();
      if (insertErr) return next(insertErr);
      
      res.status(201).json({ success: true, id });
    });
  });
};

exports.updateEvent = (req, res, next) => {
  const eventId = parseInt(req.params.id, 10);
  let { machine, fecha, reporte, finalizacion, afectacion, estado, turno, jefe, canal_oficial, causa, categoria, creador } = req.body;
  
  // Default Jefe de Turno based on Fecha and Reporte time if not set or set to "Sin asignar"
  if (!jefe || jefe === 'Sin asignar' || jefe.trim() === '') {
    jefe = calculateSupervisor(fecha, reporte);
  }

  if (!creador) {
    creador = 'Desconocido';
  }
  
  if (!machine || !fecha || !reporte || !finalizacion || !afectacion || !estado || !turno || !jefe || !canal_oficial || !causa || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const db = openDb();
  
  db.run(`
    UPDATE events 
    SET machine = ?, fecha = ?, reporte = ?, finalizacion = ?, afectacion = ?, estado = ?, turno = ?, jefe = ?, canal_oficial = ?, causa = ?, categoria = ?, creador = ?
    WHERE id = ?
  `, [machine, fecha, reporte, finalizacion, afectacion, estado, turno, jefe, canal_oficial, causa, categoria, creador, eventId], function(err) {
    db.close();
    if (err) return next(err);
    
    if (this.changes === 0) {
      return res.status(404).json({ error: `Evento #${eventId} no encontrado` });
    }
    
    res.json({ success: true, id: eventId });
  });
};

exports.deleteEvent = (req, res, next) => {
  const eventId = parseInt(req.params.id, 10);
  const db = openDb();
  
  db.run('DELETE FROM events WHERE id = ?', [eventId], function(err) {
    db.close();
    if (err) return next(err);
    
    if (this.changes === 0) {
      return res.status(404).json({ error: `Evento #${eventId} no encontrado` });
    }
    
    res.json({ success: true, id: eventId });
  });
};
