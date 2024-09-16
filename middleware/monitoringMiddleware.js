const client = require("prom-client");

// Collect default metrics
client.collectDefaultMetrics();

const monitoringMiddleware = (req, res, next) => {
  res.set("Content-Type", client.register.contentType);
  res.end(client.register.metrics());
};

module.exports = monitoringMiddleware;
