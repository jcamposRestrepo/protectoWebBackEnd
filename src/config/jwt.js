const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_por_defecto';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Decodificar token sin verificar (para obtener información)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};

