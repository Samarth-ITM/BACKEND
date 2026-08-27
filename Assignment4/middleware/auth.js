const jwt = require("jsonwebtoken");

function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const jwtToken = authHeader.split(" ")[1];

  try {
    const decodedUser = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = decodedUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyAuthToken;
