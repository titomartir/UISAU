const express = require('express');
const { body } = require('express-validator');
const { login, refreshTokenHandler, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Email inválido.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('La contraseña es requerida.')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
  ],
  handleValidationErrors,
  login
);

// POST /api/auth/refresh
router.post('/refresh', refreshTokenHandler);

// GET /api/auth/profile  (protegida)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
