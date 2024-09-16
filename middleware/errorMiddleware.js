const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorMiddleware;
