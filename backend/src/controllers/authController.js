const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

/**
 * Genera un access token (15m) y un refresh token (7d).
 */
function generateTokens(userId, email, rol) {
  const accessToken = jwt.sign(
    { id: userId, email, rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, rol, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      // Mensaje genérico para evitar enumerar usuarios
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const isValid = await bcrypt.compare(password, usuario.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    await usuario.update({ last_login: new Date() });

    const { accessToken, refreshToken } = generateTokens(usuario.id, usuario.email, usuario.rol);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('[authController.login]', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token no proporcionado.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Sesión expirada. Por favor inicie sesión nuevamente.'
        : 'Refresh token inválido.';
      return res.status(401).json({ success: false, message: msg });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const tokens = generateTokens(usuario.id, usuario.email, usuario.rol);
    res.json({ success: true, ...tokens });
  } catch (error) {
    console.error('[authController.refreshToken]', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/auth/profile  (requiere authMiddleware)
 */
const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: ['id', 'email', 'rol', 'created_at', 'last_login']
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, user: usuario });
  } catch (error) {
    console.error('[authController.getProfile]', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

module.exports = { login, refreshTokenHandler, getProfile };
