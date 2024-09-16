const redis = require("redis");
const client = redis.createClient();

// Middleware to check cache
const checkCache = (req, res, next) => {
  const { id } = req.params;

  client.get(id, (err, data) => {
    if (err) {
      console.error("Redis error:", err);
      next();
    }
    if (data !== null) {
      res.json(JSON.parse(data));
    } else {
      next();
    }
  });
};

module.exports = checkCache;
