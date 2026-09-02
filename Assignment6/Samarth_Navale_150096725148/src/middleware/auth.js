const { verifyToken } = require('../utils/jwt');
const UserModel = require('../models/userModel');

const authenticateJWT = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization;
    if (!hdr || !hdr.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const tok = hdr.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(tok);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const usr = await UserModel.findById(decoded.userId);
    if (!usr) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const { password, ...safeUsr } = usr;
    req.user = safeUsr;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Auth error', error: e.message });
  }
};

module.exports = authenticateJWT;

