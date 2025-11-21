const jwt = require("jsonwebtoken");

function authenticate(options = {}) {
  const headerName = options.headerName || "authorization";

  return function jwtGuard(req, res, next) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res
        .status(500)
        .json({ message: "JWT secret not configured on the server" });
    }

    const authHeader = req.headers[headerName];

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = authenticate;

