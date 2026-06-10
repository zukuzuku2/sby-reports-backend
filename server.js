const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const { initDatabase } = require('./database');
const { dbPath } = require('./config/db');

const bullsRoutes = require('./routes/bullsRoutes');
const jefesRoutes = require('./routes/jefesRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const backupRoutes = require('./routes/backupRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API Route mounts
app.use('/api/bulls', bullsRoutes);
app.use('/api/jefes', jefesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/backup', backupRoutes);

// Serve static frontend files (React SPA)
const path = require('path');
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA catch-all handler: redirect non-API requests to index.html
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('El frontend no ha sido compilado en la carpeta public.');
      }
    });
  } else {
    next();
  }
});

// Centralized Error Handling Middleware
app.use(errorHandler);


// Initialize database before starting the listener
const fs = require('fs');
const localDbPath = path.join(__dirname, '..', 'groundster.db');

if (dbPath !== localDbPath && !fs.existsSync(dbPath) && fs.existsSync(localDbPath)) {
  try {
    fs.copyFileSync(localDbPath, dbPath);
    console.log('📦 Base de datos local migrada exitosamente a la carpeta de datos de usuario.');
  } catch (copyErr) {
    console.error('❌ Error al migrar la base de datos local:', copyErr);
  }
}

initDatabase(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al inicializar la base de datos en el arranque:', err);
    process.exit(1);
  }
  console.log('✅ Base de datos verificada e inicializada con éxito.');

  // Start Server listener
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  });
});


