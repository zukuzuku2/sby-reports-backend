function errorHandler(err, req, res, next) {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;
