const redis = require('redis');

// Create a Redis client instance with proper configuration
const client = redis.createClient({
  socket: {
    host: '127.0.0.1', // Update to your Redis server's host
    port: 6379         // Update to your Redis server's port
  }
});

// Handling Redis client errors
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to the Redis server
client.connect().catch(err => {
  console.error('Could not connect to Redis:', err);
});

// Middleware to cache API responses
const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl || req.url; // Cache key based on request URL

  try {
    // Attempt to retrieve cached data from Redis
    const data = await client.get(key);

    if (data) {
      // If data is found in the cache, send it as the response
      res.send(JSON.parse(data));
    } else {
      // If no data in the cache, proceed to the next middleware or route handler
      // Override the res.send method to cache the response
      res.sendResponse = res.send;
      res.send = (body) => {
        client.setEx(key, 3600, JSON.stringify(body)) // Cache the response for 1 hour
          .catch(err => console.error('Redis setEx error:', err)); // Handle setEx errors
        res.sendResponse(body);
      };
      next();
    }
  } catch (err) {
    console.error('Error during Redis cache operation:', err);
    next(); // Proceed without caching if there's an error
  }
};

module.exports = cacheMiddleware;
