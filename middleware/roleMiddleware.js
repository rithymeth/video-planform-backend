const jwt = require("jsonwebtoken");

// Middleware to check if the user has the required role(s)
const checkRole = (roles) => {
  return (req, res, next) => {
    // Check if user information is available on the request
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized, no user information found." });
    }

    // Ensure roles parameter is an array
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    // Check if the user's role is included in the required roles
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You do not have the required permissions.",
        });
    }

    next(); // If the user has the required role, proceed to the next middleware or route handler
  };
};

// Middleware to authenticate and set user information
const protect = (req, res, next) => {
  let token;

  // Check if the token is provided in the authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token and decode user information

      req.user = decoded; // Attach user information to the request
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Error verifying token:", error.message);
      return res
        .status(401)
        .json({ error: "Unauthorized, token verification failed." });
    }
  } else {
    // No token provided
    return res.status(401).json({ error: "Unauthorized, no token provided." });
  }
};

// Correctly export the middleware functions
module.exports = { checkRole, protect };
