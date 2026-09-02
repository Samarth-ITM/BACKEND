const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secretkey';
const EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
};

const verifyToken = (tok) => {
  return jwt.verify(tok, SECRET);
};

module.exports = { generateToken, verifyToken };

