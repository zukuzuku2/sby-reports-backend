const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { dbPath } = require('../config/db');

router.get('/download', (req, res, next) => {
  try {
    // Check if SQLite database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: "Archivo de base de datos no encontrado." });
    }
    
    // Generate filename with current date (e.g., groundster_backup_2026-06-09.db)
    const dateStr = new Date().toISOString().split('T')[0];
    const backupFilename = `groundster_backup_${dateStr}.db`;
    
    // Set headers and trigger file download
    res.download(dbPath, backupFilename, (err) => {
      if (err) {
        console.error("❌ Error al descargar el backup de base de datos:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "No se pudo generar la descarga de la base de datos." });
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
