const { sendError } = require('../utils/response.utils');

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 400, 'File size too large.');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 400, 'Unexpected file field.');
  }
  if (err.message && err.message.includes('Only')) {
    return sendError(res, 400, err.message);
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return sendError(res, 400, 'Validation error', messages);
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'Resource already exists.');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired.');
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, statusCode, message);
};

module.exports = errorMiddleware;
