const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica el JWT en el header Authorization: Bearer <token>
 * Agrega req.user = { id, email, rol } si el token es válido.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token no proporcionado.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicie sesión nuevamente.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
      code: 'TOKEN_INVALID'
    });
  }
};

module.exports = authMiddleware;
