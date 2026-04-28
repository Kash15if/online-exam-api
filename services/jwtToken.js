const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || process.env.AUTHTOKEN;

const extractToken = (req) => {
  const authHeader = req.headers["authorization"] || req.headers["x-access-token"] || "";
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7).trim();
  const parts = authHeader.split(" ");
  return parts.length > 1 ? parts[parts.length - 1] : authHeader.trim();
};

const verifyToken = async (req, res, next) => {
  const token = extractToken(req);

  if (!token || token === "null") {
    return res.status(401).send({ auth: false, message: "Authentication required." });
  }

  if (!SECRET) {
    console.error("JWT secret not configured (JWT_SECRET or AUTHTOKEN)");
    return res.status(500).send({ auth: false, message: "Server misconfiguration." });
  }

  try {
    const decoded = await jwt.verify(token, SECRET);
    req.payLoad = decoded;
    req.user = decoded;
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).send({ auth: false, message: "Invalid or expired token." });
  }

  next();
};

const generateToken = (payload) => {
  if (!SECRET) throw new Error("JWT secret not configured (JWT_SECRET or AUTHTOKEN)");
  const token = jwt.sign({ ...payload }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "24h" });
  return token;
};

module.exports = { verifyToken, generateToken, extractToken };
