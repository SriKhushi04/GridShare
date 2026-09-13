function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack || err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

