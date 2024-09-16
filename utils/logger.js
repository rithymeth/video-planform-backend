// utils/logger.js

const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info", // Adjust log level as needed
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    // You can add file transports or other transports here
    // new transports.File({ filename: 'combined.log' })
  ],
});

module.exports = logger;
