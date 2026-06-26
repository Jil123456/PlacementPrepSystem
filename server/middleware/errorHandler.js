const { errorResponse } = require('../utils/helpers');

const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json(errorResponse('Validation error', messages));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(409).json(errorResponse('Duplicate entry', messages));
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json(errorResponse('Database error occurred.'));
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token.'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token has expired.'));
  }

  if (err.array && typeof err.array === 'function') {
    return res.status(400).json(errorResponse('Validation failed', err.array()));
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json(errorResponse(message));
};

module.exports = errorHandler;
