const client = require("prom-client");

client.collectDefaultMetrics();

module.exports = (req, res, next) => {
  res.set("Content-Type", client.register.contentType);
  res.end(client.register.metrics());
};
