const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

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

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server listener
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
