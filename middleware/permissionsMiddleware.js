const User = require("../models/User");

const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate("roles");
      if (!user) return res.status(401).json({ error: "User not found" });

      const userPermissions = user.roles.flatMap((role) => role.permissions);
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ error: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkPermission;
