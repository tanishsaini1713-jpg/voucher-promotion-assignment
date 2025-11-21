const jwt = require("jsonwebtoken");

function validateEnvConfig() {
  const requiredVars = ["JWT_SECRET", "AUTH_USERNAME", "AUTH_PASSWORD"];
  const missing = requiredVars.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(
      `Auth configuration missing environment variables: ${missing.join(", ")}`
    );
  }
}

exports.login = async (req, res) => {
  try {
    validateEnvConfig();

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (
      username !== process.env.AUTH_USERNAME ||
      password !== process.env.AUTH_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      sub: username,
      role: "admin",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    return res.status(200).json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

