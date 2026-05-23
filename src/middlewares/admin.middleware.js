const { sendError } = require('../utils/response.utils');

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
};

module.exports = adminMiddleware;
